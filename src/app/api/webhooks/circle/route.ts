import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyHmac } from '@/lib/webhooks/verify';
import { getFeatureFlags } from '@/lib/featureFlags';

const CircleWebhookEventSchema = z.object({
  type: z.string(),
  data: z.object({
    id: z.string(),
    type: z.string(),
    status: z.string(),
    amount: z.object({
      amount: z.string(),
      currency: z.string()
    }).optional(),
    source: z.object({
      id: z.string(),
      type: z.string()
    }).optional(),
    destination: z.object({
      id: z.string(),
      type: z.string(),
      address: z.string().optional()
    }).optional(),
    fees: z.array(z.object({
      type: z.string(),
      amount: z.string(),
      currency: z.string()
    })).optional(),
    createDate: z.string(),
    updateDate: z.string()
  }),
  subscriptionId: z.string(),
  notificationId: z.string(),
  version: z.number(),
  customAttributes: z.object({
    clientId: z.string().optional(),
    ruleId: z.string().optional(),
    executionId: z.string().optional()
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('circle-signature') || '';
    const timestamp = request.headers.get('circle-timestamp') || '';
    
    const flags = getFeatureFlags();
    
    // In demo mode, use mock secret for webhook verification
    const webhookSecret = flags.USE_MOCKS 
      ? 'mock-secret' 
      : process.env.CIRCLE_WEBHOOK_SECRET || '';
    
    if (!webhookSecret) {
      console.error('Circle webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }
    
    // Verify webhook signature
    if (!verifyHmac(body, signature, timestamp, webhookSecret)) {
      console.warn('Invalid Circle webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // Parse webhook payload
    const event = CircleWebhookEventSchema.parse(JSON.parse(body));
    
    // Log webhook event for demo visibility
    console.log('Circle webhook received:', {
      type: event.type,
      id: event.data.id,
      status: event.data.status,
      customAttributes: event.customAttributes
    });
    
    // Process different event types
    switch (event.type) {
      case 'transfers':
        await handleTransferEvent(event);
        break;
      case 'payments':
        await handlePaymentEvent(event);
        break;
      case 'payouts':
        await handlePayoutEvent(event);
        break;
      default:
        console.log(`Unhandled Circle webhook type: ${event.type}`);
    }
    
    // Respond with success
    return NextResponse.json({
      success: true,
      received: true,
      eventType: event.type,
      eventId: event.data.id
    });
    
  } catch (error) {
    console.error('Circle webhook error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid webhook payload', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleTransferEvent(event: z.infer<typeof CircleWebhookEventSchema>) {
  const { data, customAttributes } = event;
  
  console.log('Processing transfer event:', {
    transferId: data.id,
    status: data.status,
    amount: data.amount,
    ruleId: customAttributes?.ruleId,
    executionId: customAttributes?.executionId
  });
  
  // In a real implementation, you would:
  // 1. Update execution status in database
  // 2. Send notifications to users
  // 3. Update rule state if needed
  // 4. Trigger follow-up actions
  
  if (data.status === 'complete') {
    console.log(`Transfer ${data.id} completed successfully`);
  } else if (data.status === 'failed') {
    console.log(`Transfer ${data.id} failed`);
  }
}

async function handlePaymentEvent(event: z.infer<typeof CircleWebhookEventSchema>) {
  const { data, customAttributes } = event;
  
  console.log('Processing payment event:', {
    paymentId: data.id,
    status: data.status,
    amount: data.amount,
    ruleId: customAttributes?.ruleId
  });
}

async function handlePayoutEvent(event: z.infer<typeof CircleWebhookEventSchema>) {
  const { data, customAttributes } = event;
  
  console.log('Processing payout event:', {
    payoutId: data.id,
    status: data.status,
    amount: data.amount,
    ruleId: customAttributes?.ruleId
  });
}

export async function GET() {
  return NextResponse.json({
    service: 'Circle Webhook Handler',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
}