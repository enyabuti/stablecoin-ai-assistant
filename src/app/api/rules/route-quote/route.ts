import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { RuleJSONSchema } from '@/lib/llm/schema';
import { quoteCheapest } from '@/lib/routing/router';
import { getFeatureFlags } from '@/lib/featureFlags';

const RouteQuoteSchema = z.object({
  ruleId: z.string().optional(),
  ruleJSON: RuleJSONSchema.optional()
}).refine(data => data.ruleId || data.ruleJSON, {
  message: "Either ruleId or ruleJSON must be provided"
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ruleId, ruleJSON } = RouteQuoteSchema.parse(body);
    
    const flags = getFeatureFlags();
    
    let rule;
    if (ruleJSON) {
      rule = ruleJSON;
    } else if (ruleId) {
      // In demo mode, generate a mock rule based on ruleId
      rule = {
        type: 'schedule' as const,
        asset: 'USDC' as const,
        amount: '100.00',
        fromChain: 'ethereum',
        toChain: 'polygon',
        destination: '0x742d35Cc6634C0532925a3b8D4034DfC037D7d6d',
        schedule: {
          frequency: 'weekly',
          startDate: new Date().toISOString(),
          dayOfWeek: 1
        },
        description: `Mock rule for ID: ${ruleId}`
      };
    } else {
      throw new Error('Either ruleId or ruleJSON must be provided');
    }
    
    const quote = quoteCheapest(rule, flags);
    
    // Add mock execution time estimate
    const executionEstimate = {
      estimatedDuration: '2-5 minutes',
      nextExecutionTime: rule.type === 'schedule' && rule.schedule 
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Next week for weekly
        : null
    };
    
    return NextResponse.json({
      success: true,
      quote: {
        ...quote,
        ...executionEstimate,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min expiry
      }
    });
    
  } catch (error) {
    console.error('Route quote error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate quote' },
      { status: 500 }
    );
  }
}