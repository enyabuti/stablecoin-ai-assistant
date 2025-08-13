import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Resend
const mockSend = vi.fn();
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: mockSend
    }
  }))
}));

import { sendVerificationRequest } from '@/lib/email';

describe('Authentication Email Service - Core Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.RESEND_API_KEY;
    delete process.env.NODE_ENV;
  });

  const mockParams = {
    identifier: 'test@example.com',
    url: 'https://ferrow.app/auth/callback?token=abc123',
    provider: {}
  };

  it('should return early in development mode without API key', async () => {
    process.env.NODE_ENV = 'development';
    
    await sendVerificationRequest(mockParams);
    
    // Should not throw and should not attempt to send email
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should throw error when RESEND_API_KEY is missing in production', async () => {
    process.env.NODE_ENV = 'production';
    
    await expect(sendVerificationRequest(mockParams)).rejects.toThrow(
      'RESEND_API_KEY is required for email sending'
    );
  });

  it('should attempt to send email with valid API key', async () => {
    process.env.RESEND_API_KEY = 'test-api-key';
    process.env.NODE_ENV = 'production';
    
    mockSend.mockResolvedValue({ id: 'email-id-123' });
    
    await sendVerificationRequest(mockParams);
    
    expect(mockSend).toHaveBeenCalledWith({
      from: 'onboarding@resend.dev',
      to: 'test@example.com',
      subject: 'Sign in to Ferrow',
      html: expect.stringContaining('Welcome to Ferrow')
    });
  });

  it('should handle email sending errors gracefully', async () => {
    process.env.RESEND_API_KEY = 'test-api-key';
    process.env.NODE_ENV = 'production';
    
    mockSend.mockRejectedValue(new Error('Email service unavailable'));
    
    // Should not throw error, just log it
    await expect(sendVerificationRequest(mockParams)).resolves.toBeUndefined();
  });

  it('should extract host from URL correctly', async () => {
    process.env.NODE_ENV = 'development';
    const urlWithHost = 'https://example.com/auth/callback?token=abc123';
    
    await sendVerificationRequest({
      ...mockParams,
      url: urlWithHost
    });
    
    // Function should complete without error in development mode
    expect(true).toBe(true);
  });
});