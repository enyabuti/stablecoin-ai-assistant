import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withIdempotency, generateIdempotencyKey } from '@/lib/idempotency';
import { getFeatureFlags } from '@/lib/featureFlags';

const ExecuteNowSchema = z.object({
  ruleId: z.string()
});

export async function POST(request: NextRequest) {
  return withIdempotency(request, async () => {
    try {
      const body = await request.json();
      const { ruleId } = ExecuteNowSchema.parse(body);
      
      const flags = getFeatureFlags();
      
      // Generate execution ID for tracking
      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      // In demo mode, simulate execution
      if (flags.USE_MOCKS) {
        // Simulate processing delay
        const processingDelay = Math.random() * 2000 + 1000; // 1-3 seconds
        
        // Mock execution status based on random chance
        const isSuccess = Math.random() > 0.1; // 90% success rate for demo
        
        const execution = {
          executionId,
          ruleId,
          status: isSuccess ? 'SUCCESS' : 'PENDING' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          estimatedDuration: '2-5 minutes',
          progress: isSuccess ? 100 : 25,
          steps: [
            { name: 'Validation', status: 'completed', timestamp: new Date().toISOString() },
            { name: 'Quote Generation', status: 'completed', timestamp: new Date().toISOString() },
            { name: 'Transaction Preparation', status: isSuccess ? 'completed' : 'in_progress', timestamp: isSuccess ? new Date().toISOString() : undefined },
            { name: 'Execution', status: isSuccess ? 'completed' : 'pending', timestamp: isSuccess ? new Date().toISOString() : undefined }
          ]
        };
        
        if (isSuccess) {
          // Mock successful transaction
          execution.steps.push({
            name: 'Confirmation',
            status: 'completed',
            timestamp: new Date().toISOString()
          });
        }
        
        return new Response(JSON.stringify({
          success: true,
          executionId,
          status: execution.status,
          execution,
          message: isSuccess 
            ? 'Rule executed successfully' 
            : 'Execution started, check status for updates'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Non-mock mode (would integrate with actual services)
      return new Response(JSON.stringify({
        success: true,
        executionId,
        status: 'PENDING' as const,
        message: 'Execution initiated'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Execute now error:', error);
      
      if (error instanceof z.ZodError) {
        return new Response(JSON.stringify({
          error: 'Invalid request body',
          details: error.errors
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({
        error: 'Failed to execute rule'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
}