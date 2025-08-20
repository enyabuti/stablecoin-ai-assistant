/**
 * Dead Letter Queue (DLQ) Admin API
 * 
 * Provides DLQ management capabilities for the admin dashboard.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDLQInstance } from '@/lib/jobs/dlq';

export async function GET(request: NextRequest) {
  try {
    const dlq = getDLQInstance();
    if (!dlq) {
      return NextResponse.json(
        { error: 'DLQ not available' },
        { status: 503 }
      );
    }

    const url = new URL(request.url);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const queue = url.searchParams.get('queue') || undefined;
    const canRetry = url.searchParams.get('canRetry');
    const userId = url.searchParams.get('userId') || undefined;

    const filter: any = {};
    if (queue) filter.queue = queue;
    if (canRetry !== null) filter.canRetry = canRetry === 'true';
    if (userId) filter.userId = userId;

    const { entries, total } = await dlq.getDLQEntries(offset, limit, filter);
    const stats = await dlq.getDLQStats();

    return NextResponse.json({
      entries,
      pagination: {
        offset,
        limit,
        total,
        hasMore: offset + limit < total
      },
      stats
    });
  } catch (error) {
    console.error('DLQ API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch DLQ data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const dlq = getDLQInstance();
    if (!dlq) {
      return NextResponse.json(
        { error: 'DLQ not available' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'retry-job':
        const retryResult = await dlq.retryJob(params.dlqId, {
          delay: params.delay,
          priority: params.priority,
          removeFromDLQ: params.removeFromDLQ !== false
        });
        return NextResponse.json(retryResult);

      case 'remove-job':
        const removed = await dlq.removeFromDLQ(params.dlqId);
        return NextResponse.json({ success: removed });

      case 'batch-retry':
        const batchResult = await dlq.batchRetry(
          {
            queue: params.queue,
            errorPattern: params.errorPattern ? new RegExp(params.errorPattern) : undefined,
            maxAge: params.maxAgeHours ? params.maxAgeHours * 60 * 60 * 1000 : undefined
          },
          params.limit || 10
        );
        return NextResponse.json(batchResult);

      case 'cleanup':
        const cleanupResult = await dlq.cleanupOldEntries(params.olderThanDays || 30);
        return NextResponse.json({ 
          success: true, 
          removedCount: cleanupResult 
        });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('DLQ API POST error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to process DLQ action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}