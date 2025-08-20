// Completely disabled middleware for Render.com troubleshooting
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Completely bypass all middleware logic for deployment troubleshooting
  return NextResponse.next();
}

export const config = {
  matcher: []  // Empty matcher = no routes processed
};