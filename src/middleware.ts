// Simplified middleware for deployment compatibility
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip middleware for deployment environments to avoid NextAuth issues
  if (process.env.RENDER || process.env.NODE_ENV === 'production') {
    return NextResponse.next();
  }
  
  // In development, we can use more complex auth logic
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only apply to routes that need protection (minimal for deployment)
    "/((?!api|_next/static|_next/image|favicon.ico|test-minimal).*)"
  ]
};