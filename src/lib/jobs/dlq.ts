/**
 * Dead Letter Queue (DLQ) Implementation
 * 
 * Handles failed jobs that cannot be processed after multiple retries.
 * Provides manual recovery, analysis, and monitoring capabilities.
 */

import { Queue, Job, Worker } from 'bullmq';
import { Redis } from 'ioredis';

export interface DLQEntry {
  id: string;
  originalQueue: string;
  jobData: any;
  error: {
    message: string;
    stack?: string;
    timestamp: Date;
  };
  attempts: number;
  firstFailedAt: Date;
  lastFailedAt: Date;
  canRetry: boolean;
  metadata: {
    userId?: string;
    ruleId?: string;
    executionId?: string;
    priority?: number;
  };
}

export interface DLQStats {
  totalEntries: number;
  entriesByQueue: Record<string, number>;
  entriesByError: Record<string, number>;
  oldestEntry?: Date;
  newestEntry?: Date;
  retryableEntries: number;
}

export interface RetryOptions {
  delay?: number;
  priority?: number;
  removeFromDLQ?: boolean;
}

class DeadLetterQueueImpl {
  private dlqQueue: Queue;
  private redis: Redis;
  private dlqWorker: Worker;

  constructor(redis: Redis) {
    this.redis = redis;
    this.dlqQueue = new Queue('dlq', { 
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: 50, // Keep last 50 completed DLQ jobs
        removeOnFail: 100     // Keep last 100 failed DLQ jobs
      }
    });

    // Worker to process DLQ cleanup and monitoring
    this.dlqWorker = new Worker('dlq', this.processDLQJob.bind(this), {
      connection: redis,
      concurrency: 1
    });
  }

  /**
   * Add a failed job to the DLQ
   */
  async addToDLQ(
    originalQueue: string,
    jobData: any,
    error: Error,
    attempts: number,
    metadata: DLQEntry['metadata'] = {}
  ): Promise<void> {
    const now = new Date();
    const dlqEntry: DLQEntry = {
      id: `dlq_${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`,
      originalQueue,
      jobData,
      error: {
        message: error.message,
        stack: error.stack,
        timestamp: now
      },
      attempts,
      firstFailedAt: now,
      lastFailedAt: now,
      canRetry: this.canRetryJob(error, attempts),
      metadata
    };

    // Store in Redis with expiration (30 days)
    const key = `dlq:${dlqEntry.id}`;
    await this.redis.setex(key, 30 * 24 * 60 * 60, JSON.stringify(dlqEntry));

    // Add to sorted set for efficient querying
    await this.redis.zadd('dlq:entries', now.getTime(), dlqEntry.id);

    // Update stats
    await this.updateDLQStats(dlqEntry);

    console.log(`Added job to DLQ: ${dlqEntry.id} from queue ${originalQueue}`);
  }

  /**
   * Get DLQ entries with pagination
   */
  async getDLQEntries(
    offset: number = 0,
    limit: number = 50,
    filter?: {
      queue?: string;
      canRetry?: boolean;
      userId?: string;
    }
  ): Promise<{ entries: DLQEntry[]; total: number }> {
    // Get entry IDs sorted by timestamp (newest first)
    const entryIds = await this.redis.zrevrange('dlq:entries', offset, offset + limit - 1);
    
    const entries: DLQEntry[] = [];
    for (const entryId of entryIds) {
      const entryData = await this.redis.get(`dlq:${entryId}`);
      if (entryData) {
        const entry: DLQEntry = JSON.parse(entryData);
        
        // Apply filters
        if (filter?.queue && entry.originalQueue !== filter.queue) continue;
        if (filter?.canRetry !== undefined && entry.canRetry !== filter.canRetry) continue;
        if (filter?.userId && entry.metadata.userId !== filter.userId) continue;
        
        entries.push(entry);
      }
    }

    const total = await this.redis.zcard('dlq:entries');
    return { entries, total };
  }

  /**
   * Retry a job from the DLQ
   */
  async retryJob(
    dlqId: string,
    options: RetryOptions = {}
  ): Promise<{ success: boolean; jobId?: string; error?: string }> {
    const entryData = await this.redis.get(`dlq:${dlqId}`);
    if (!entryData) {
      return { success: false, error: 'DLQ entry not found' };
    }

    const entry: DLQEntry = JSON.parse(entryData);
    
    if (!entry.canRetry) {
      return { success: false, error: 'Job is not retryable' };
    }

    try {
      // Create new job in original queue
      const originalQueue = new Queue(entry.originalQueue, { 
        connection: this.redis 
      });

      const job = await originalQueue.add(
        entry.originalQueue,
        entry.jobData,
        {
          delay: options.delay,
          priority: options.priority || entry.metadata.priority,
          attempts: 3, // Reset attempts
          backoff: {
            type: 'exponential',
            delay: 2000
          }
        }
      );

      // Remove from DLQ if requested
      if (options.removeFromDLQ) {
        await this.removeFromDLQ(dlqId);
      }

      return { success: true, jobId: job.id };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Remove entry from DLQ
   */
  async removeFromDLQ(dlqId: string): Promise<boolean> {
    const pipeline = this.redis.pipeline();
    pipeline.del(`dlq:${dlqId}`);
    pipeline.zrem('dlq:entries', dlqId);
    
    const results = await pipeline.exec();
    return results?.[0]?.[1] === 1; // Check if key was deleted
  }

  /**
   * Get DLQ statistics
   */
  async getDLQStats(): Promise<DLQStats> {
    const totalEntries = await this.redis.zcard('dlq:entries');
    
    if (totalEntries === 0) {
      return {
        totalEntries: 0,
        entriesByQueue: {},
        entriesByError: {},
        retryableEntries: 0
      };
    }

    // Get oldest and newest timestamps
    const oldestScore = await this.redis.zrange('dlq:entries', 0, 0, 'WITHSCORES');
    const newestScore = await this.redis.zrevrange('dlq:entries', 0, 0, 'WITHSCORES');
    
    const oldestEntry = oldestScore.length > 1 ? new Date(parseFloat(oldestScore[1])) : undefined;
    const newestEntry = newestScore.length > 1 ? new Date(parseFloat(newestScore[1])) : undefined;

    // Sample entries to build stats (get first 100)
    const sampleIds = await this.redis.zrevrange('dlq:entries', 0, 99);
    const entriesByQueue: Record<string, number> = {};
    const entriesByError: Record<string, number> = {};
    let retryableEntries = 0;

    for (const entryId of sampleIds) {
      const entryData = await this.redis.get(`dlq:${entryId}`);
      if (entryData) {
        const entry: DLQEntry = JSON.parse(entryData);
        entriesByQueue[entry.originalQueue] = (entriesByQueue[entry.originalQueue] || 0) + 1;
        
        const errorType = entry.error.message.split(':')[0] || 'Unknown';
        entriesByError[errorType] = (entriesByError[errorType] || 0) + 1;
        
        if (entry.canRetry) retryableEntries++;
      }
    }

    return {
      totalEntries,
      entriesByQueue,
      entriesByError,
      oldestEntry,
      newestEntry,
      retryableEntries
    };
  }

  /**
   * Clean up old DLQ entries
   */
  async cleanupOldEntries(olderThanDays: number = 30): Promise<number> {
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    
    // Get old entry IDs
    const oldEntryIds = await this.redis.zrangebyscore('dlq:entries', 0, cutoffTime);
    
    if (oldEntryIds.length === 0) return 0;

    // Remove entries
    const pipeline = this.redis.pipeline();
    for (const entryId of oldEntryIds) {
      pipeline.del(`dlq:${entryId}`);
    }
    pipeline.zremrangebyscore('dlq:entries', 0, cutoffTime);
    
    await pipeline.exec();
    
    console.log(`Cleaned up ${oldEntryIds.length} old DLQ entries`);
    return oldEntryIds.length;
  }

  /**
   * Batch retry jobs by criteria
   */
  async batchRetry(criteria: {
    queue?: string;
    errorPattern?: RegExp;
    maxAge?: number; // in milliseconds
  }, limit: number = 10): Promise<{ retried: number; failed: number }> {
    const { entries } = await this.getDLQEntries(0, limit * 2); // Get more than needed
    
    let retried = 0;
    let failed = 0;

    for (const entry of entries) {
      if (retried >= limit) break;
      
      if (!entry.canRetry) continue;
      
      // Apply criteria
      if (criteria.queue && entry.originalQueue !== criteria.queue) continue;
      if (criteria.errorPattern && !criteria.errorPattern.test(entry.error.message)) continue;
      if (criteria.maxAge && (Date.now() - entry.lastFailedAt.getTime()) > criteria.maxAge) continue;

      const result = await this.retryJob(entry.id, { removeFromDLQ: true });
      if (result.success) {
        retried++;
      } else {
        failed++;
      }
    }

    return { retried, failed };
  }

  private async processDLQJob(job: Job): Promise<void> {
    // This worker handles DLQ maintenance tasks
    switch (job.name) {
      case 'cleanup-old-entries':
        await this.cleanupOldEntries(job.data.olderThanDays);
        break;
      case 'generate-report':
        // Could generate DLQ reports here
        break;
    }
  }

  private async updateDLQStats(entry: DLQEntry): Promise<void> {
    // Update Redis counters for quick stats
    await this.redis.hincrby('dlq:stats:queues', entry.originalQueue, 1);
    await this.redis.hincrby('dlq:stats:errors', entry.error.message.split(':')[0] || 'Unknown', 1);
    
    if (entry.canRetry) {
      await this.redis.incr('dlq:stats:retryable');
    }
  }

  private canRetryJob(error: Error, attempts: number): boolean {
    // Don't retry if too many attempts
    if (attempts >= 5) return false;

    // Don't retry certain types of errors
    const nonRetryableErrors = [
      'ValidationError',
      'AuthenticationError',
      'PermissionDenied',
      'InvalidInput'
    ];

    return !nonRetryableErrors.some(errorType => 
      error.message.includes(errorType) || error.name === errorType
    );
  }

  /**
   * Schedule periodic cleanup
   */
  async scheduleCleanup(): Promise<void> {
    // Clean up old entries every day
    await this.dlqQueue.add('cleanup-old-entries', 
      { olderThanDays: 30 }, 
      { 
        repeat: { 
          pattern: '0 2 * * *' // 2 AM daily
        } 
      }
    );
  }

  async close(): Promise<void> {
    await this.dlqWorker.close();
    await this.dlqQueue.close();
  }
}

// Export singleton instance
let dlqInstance: DeadLetterQueueImpl | null = null;

export function createDLQ(redis: Redis): DeadLetterQueueImpl {
  if (!dlqInstance) {
    dlqInstance = new DeadLetterQueueImpl(redis);
  }
  return dlqInstance;
}

export function getDLQ(): DeadLetterQueueImpl {
  if (!dlqInstance) {
    throw new Error('DLQ not initialized. Call createDLQ first.');
  }
  return dlqInstance;
}

export function getDLQInstance(): DeadLetterQueueImpl | null {
  return dlqInstance;
}

export type { DeadLetterQueueImpl as DeadLetterQueue };