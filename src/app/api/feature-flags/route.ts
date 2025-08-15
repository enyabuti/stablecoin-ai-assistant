import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFeatureFlags, updateFeatureFlag, FeatureFlags } from '@/lib/featureFlags';

const UpdateFlagSchema = z.object({
  flag: z.enum(['USE_MOCKS', 'ENABLE_CCTP', 'ENABLE_NOTIFICATIONS']),
  value: z.boolean()
});

export async function GET() {
  try {
    const flags = getFeatureFlags();
    
    return NextResponse.json({
      success: true,
      flags
    });
  } catch (error) {
    console.error('Feature flags GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature flags' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flag, value } = UpdateFlagSchema.parse(body);
    
    const updatedFlags = updateFeatureFlag(flag, value);
    
    // Log flag changes for demo visibility
    console.log(`Feature flag updated: ${flag} = ${value}`);
    
    return NextResponse.json({
      success: true,
      flags: updatedFlags,
      message: `${flag} ${value ? 'enabled' : 'disabled'}`
    });
  } catch (error) {
    console.error('Feature flags POST error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update feature flag' },
      { status: 500 }
    );
  }
}