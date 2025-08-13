import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationRequest } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    console.log(`🧪 Testing email sending to: ${email}`);
    
    // Test the email sending
    await sendVerificationRequest({
      identifier: email,
      url: 'https://stablecoin-ai.vercel.app/auth/signin?test=true',
      provider: {}
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      email: email
    });
    
  } catch (error) {
    console.error('❌ Test email failed:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Email test endpoint. POST with {"email": "test@example.com"}',
    hasApiKey: !!process.env.RESEND_API_KEY,
    apiKeyPreview: process.env.RESEND_API_KEY ? 
      `${process.env.RESEND_API_KEY.substring(0, 8)}...` : 
      'Not set',
    environment: process.env.NODE_ENV
  });
}