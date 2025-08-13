import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendVerificationRequest } from '@/lib/email';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    
    console.log(`🔐 Registration attempt for: ${email}`);
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (existingUser) {
      console.log(`👤 User already exists: ${email}`);
      return NextResponse.json({ 
        message: 'User already exists. Please sign in instead.',
        userExists: true 
      }, { status: 200 });
    }
    
    // Create new user
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        emailVerified: null, // Will be set when they click the magic link
      }
    });
    
    console.log(`✅ Created new user: ${user.id} for ${email}`);
    
    // Generate a verification token
    const token = nanoid(32);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Create verification token
    await db.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires,
      }
    });
    
    // Create the magic link URL
    const baseUrl = process.env.NEXTAUTH_URL || 'https://stablecoin-ai.vercel.app';
    const magicLinkUrl = `${baseUrl}/api/auth/callback/email?callbackUrl=${encodeURIComponent(`${baseUrl}/dashboard`)}&token=${token}&email=${encodeURIComponent(email)}`;
    
    // Send the verification email
    await sendVerificationRequest({
      identifier: email.toLowerCase(),
      url: magicLinkUrl,
      provider: {}
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Registration successful! Check your email for the magic link.',
      user: { id: user.id, email: user.email }
    });
    
  } catch (error) {
    console.error('❌ Registration failed:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json({ 
      error: 'Registration failed. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : typeof error
    }, { status: 500 });
  }
}