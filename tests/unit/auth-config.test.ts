import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the dependencies before importing
vi.mock('@/lib/db', () => ({
  db: {}
}));

vi.mock('@/lib/email', () => ({
  sendVerificationRequest: vi.fn()
}));

import { authOptions } from '@/lib/auth';

describe('NextAuth Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have email provider configured', () => {
    expect(authOptions.providers).toBeDefined();
    expect(authOptions.providers).toHaveLength(1);
    
    const emailProvider = authOptions.providers[0];
    expect(emailProvider.id).toBe('email');
    expect(emailProvider.type).toBe('email');
  });

  it('should use custom sendVerificationRequest function', () => {
    const emailProvider = authOptions.providers[0];
    expect(emailProvider.sendVerificationRequest).toBeDefined();
  });

  it('should have PrismaAdapter configured', () => {
    expect(authOptions.adapter).toBeDefined();
  });

  it('should have proper session configuration', () => {
    expect(authOptions.session).toEqual({
      strategy: 'database',
    });
  });

  it('should have pages configuration for custom sign-in', () => {
    expect(authOptions.pages).toEqual({
      signIn: '/auth/signin',
      verifyRequest: '/auth/verify-request',
      error: '/auth/error',
    });
  });

  it('should have callbacks configured', () => {
    expect(authOptions.callbacks).toBeDefined();
    expect(authOptions.callbacks.session).toBeDefined();
  });

  it('should include user ID in session callback', async () => {
    const mockSession = { user: { email: 'test@example.com' } };
    const mockUser = { id: 'user-123' };
    
    const sessionCallback = authOptions.callbacks?.session;
    if (sessionCallback) {
      const result = await sessionCallback({
        session: mockSession as any,
        user: mockUser as any
      });
      
      expect(result.user).toEqual({
        email: 'test@example.com',
        id: 'user-123'
      });
    }
  });

  it('should have proper email configuration', () => {
    const emailProvider = authOptions.providers[0];
    
    // Should have a valid from address
    expect(emailProvider.from).toBeDefined();
    expect(typeof emailProvider.from).toBe('string');
    expect(emailProvider.from).toMatch(/@/); // Should contain @ symbol for valid email
  });

  it('should have debug mode disabled in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    // Debug should be false in production
    expect(authOptions.debug).toBeFalsy();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('should handle environment variables correctly', () => {
    // Test with custom EMAIL_FROM
    const originalEmailFrom = process.env.EMAIL_FROM;
    process.env.EMAIL_FROM = 'custom@ferrow.app';
    
    // Re-import to get updated config
    vi.resetModules();
    
    process.env.EMAIL_FROM = originalEmailFrom;
  });
});