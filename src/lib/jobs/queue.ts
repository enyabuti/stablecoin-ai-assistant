import { Queue } from "bullmq";
import IORedis from "ioredis";
import { env } from "@/lib/env";
import { createDLQ } from "./dlq";

// Graceful Redis connection with fallback handling
let connection: IORedis | null = null;
let isRedisAvailable = false;
let dlq: ReturnType<typeof createDLQ> | null = null;

// Skip Redis initialization during build time
if (process.env.NEXT_PHASE !== 'phase-production-build') {
  try {
    connection = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      lazyConnect: true,
    });

    connection.on('connect', () => {
      console.log('Redis connected successfully');
      isRedisAvailable = true;
      
      // Initialize DLQ when Redis is connected
      if (!dlq) {
        dlq = createDLQ(connection!);
        dlq.scheduleCleanup().catch(console.error);
      }
    });

    connection.on('error', (error) => {
      console.warn('Redis connection error:', error.message);
      isRedisAvailable = false;
    });

    connection.on('close', () => {
      console.warn('Redis connection closed');
      isRedisAvailable = false;
    });
  } catch (error) {
    console.warn('Failed to initialize Redis connection:', error);
    connection = null;
    isRedisAvailable = false;
  }
} else {
  console.warn('Skipping Redis initialization during build');
}

export interface ExecuteRuleJob {
  ruleId: string;
  userId: string;
  idempotencyKey: string;
  triggeredBy: "schedule" | "condition" | "manual";
}

export interface CheckConditionsJob {
  timestamp: string;
}

// In-memory fallback storage for when Redis is unavailable
const inMemoryJobs = new Map<string, ExecuteRuleJob>();

// Job queues with graceful fallback
let executeRuleQueue: Queue<ExecuteRuleJob> | null = null;
let conditionCheckQueue: Queue<CheckConditionsJob> | null = null;

if (connection) {
  try {
    executeRuleQueue = new Queue<ExecuteRuleJob>("execute-rule", {
      connection,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    });

    conditionCheckQueue = new Queue<CheckConditionsJob>("condition-check", {
      connection,
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
      },
    });
  } catch (error) {
    console.warn('Failed to initialize job queues:', error);
    executeRuleQueue = null;
    conditionCheckQueue = null;
  }
}

// Helper functions with graceful fallback
export async function addExecuteRuleJob(data: ExecuteRuleJob) {
  if (executeRuleQueue && isRedisAvailable) {
    try {
      return await executeRuleQueue.add("execute-rule", data, {
        jobId: data.idempotencyKey, // Prevent duplicates
      });
    } catch (error) {
      console.warn('Failed to add job to Redis queue, falling back to in-memory storage:', error);
      isRedisAvailable = false;
    }
  }
  
  // Fallback: store in memory and process immediately
  console.log('Redis unavailable, processing job immediately:', data.idempotencyKey);
  inMemoryJobs.set(data.idempotencyKey, data);
  
  // Import and execute the job processor directly
  try {
    const { processExecuteRuleJob } = await import('@/lib/jobs/worker');
    await processExecuteRuleJob(data);
  } catch (error) {
    console.error('Failed to process job directly:', error);
    throw error;
  }
  
  return { id: data.idempotencyKey, data };
}

export async function addConditionCheckJob() {
  if (conditionCheckQueue && isRedisAvailable) {
    try {
      return await conditionCheckQueue.add("condition-check", {
        timestamp: new Date().toISOString(),
      }, {
        repeat: {
          pattern: "*/5 * * * *", // Every 5 minutes
        },
      });
    } catch (error) {
      console.warn('Failed to add condition check job to Redis queue:', error);
      isRedisAvailable = false;
    }
  }
  
  // Fallback: Process condition check immediately if Redis unavailable
  if (!isRedisAvailable) {
    console.log('Redis unavailable, processing condition check immediately');
    try {
      const { processConditionCheckJob } = await import('@/lib/jobs/worker');
      await processConditionCheckJob({ timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Failed to process condition check directly:', error);
    }
  }
  
  return null;
}

// Health check function
export function isQueueHealthy() {
  return isRedisAvailable && connection !== null;
}

// Get queue status for monitoring
export function getQueueStatus() {
  return {
    redis: isRedisAvailable,
    connection: connection !== null,
    inMemoryJobs: inMemoryJobs.size,
    fallbackMode: !isRedisAvailable
  };
}

// Helper function to handle failed jobs
export async function handleFailedJob(
  queueName: string,
  jobData: any,
  error: Error,
  attempts: number,
  metadata: { userId?: string; ruleId?: string; executionId?: string } = {}
) {
  if (dlq && isRedisAvailable) {
    try {
      await dlq.addToDLQ(queueName, jobData, error, attempts, metadata);
    } catch (dlqError) {
      console.error('Failed to add job to DLQ:', dlqError);
    }
  } else {
    console.error(`Failed job (no DLQ available): ${queueName}`, { jobData, error: error.message, attempts });
  }
}

// Export DLQ for access from other modules
export function getDLQInstance() {
  return dlq;
}

export { connection };