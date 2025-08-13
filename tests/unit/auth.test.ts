import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendVerificationRequest } from '@/lib/email';

// Mock Resend
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn()
    }
  }))
}));

// Mock console methods
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Authentication Email Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    delete process.env.RESEND_API_KEY;
    delete process.env.NODE_ENV;
  });

  describe('sendVerificationRequest', () => {
    const mockParams = {
      identifier: 'test@example.com',
      url: 'https://ferrow.app/auth/callback?token=abc123',
      provider: {}
    };

    it('should log development mode info when NODE_ENV is development', async () => {
      process.env.NODE_ENV = 'development';
      
      await sendVerificationRequest(mockParams);
      
      expect(mockConsoleLog).toHaveBeenCalledWith('\n🔗 MAGIC LINK (Development Mode):');
      expect(mockConsoleLog).toHaveBeenCalledWith('📧 To: test@example.com');
      expect(mockConsoleLog).toHaveBeenCalledWith('🔗 Link: https://ferrow.app/auth/callback?token=abc123');
    });

    it('should return early in development mode without API key', async () => {
      process.env.NODE_ENV = 'development';
      // No RESEND_API_KEY set
      
      await sendVerificationRequest(mockParams);
      
      expect(mockConsoleLog).toHaveBeenCalledWith('⚠️ No RESEND_API_KEY - using console logging only');
    });

    it('should throw error when RESEND_API_KEY is missing in production', async () => {
      process.env.NODE_ENV = 'production';
      // No RESEND_API_KEY set
      
      await expect(sendVerificationRequest(mockParams)).rejects.toThrow(
        'RESEND_API_KEY is required for email sending'
      );
    });

    it('should send email successfully with valid API key', async () => {
      process.env.RESEND_API_KEY = 'test-api-key';
      process.env.NODE_ENV = 'production';
      
      const { Resend } = await import('resend');
      const mockResend = new (Resend as any)();
      mockResend.emails.send.mockResolvedValue({ id: 'email-id-123', message: 'success' });
      
      await sendVerificationRequest(mockParams);
      
      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'onboarding@resend.dev',
        to: 'test@example.com',
        subject: 'Sign in to Ferrow',
        html: expect.stringContaining('Welcome to Ferrow')
      });
      
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Email sent successfully:', { id: 'email-id-123', message: 'success' });
    });

    it('should handle email sending errors gracefully', async () => {
      process.env.RESEND_API_KEY = 'test-api-key';
      process.env.NODE_ENV = 'production';
      
      const { Resend } = await import('resend');
      const mockResend = new (Resend as any)();
      const mockError = new Error('Email service unavailable');
      mockResend.emails.send.mockRejectedValue(mockError);
      
      // Should not throw error, just log it
      await expect(sendVerificationRequest(mockParams)).resolves.toBeUndefined();
      
      expect(mockConsoleError).toHaveBeenCalledWith('❌ Failed to send verification email:', mockError);
      expect(mockConsoleLog).toHaveBeenCalledWith('⚠️ Email failed but continuing...');
    });

    it('should include proper HTML email template', async () => {
      process.env.RESEND_API_KEY = 'test-api-key';
      process.env.NODE_ENV = 'production';
      
      const { Resend } = await import('resend');
      const mockResend = new (Resend as any)();
      mockResend.emails.send.mockResolvedValue({ id: 'email-id-123' });
      
      await sendVerificationRequest(mockParams);
      
      const emailCall = mockResend.emails.send.mock.calls[0][0];
      expect(emailCall.html).toContain('Welcome to Ferrow');
      expect(emailCall.html).toContain('Sign in to your account');
      expect(emailCall.html).toContain(mockParams.url);
      expect(emailCall.html).toContain('Continue to Ferrow');
      expect(emailCall.html).toContain('Security tip');
    });

    it('should extract and log host from URL', async () => {
      const urlWithHost = 'https://example.com/auth/callback?token=abc123';
      
      await sendVerificationRequest({
        ...mockParams,
        url: urlWithHost
      });
      
      expect(mockConsoleLog).toHaveBeenCalledWith('🌐 Host: example.com');
    });

    it('should log API key presence without exposing value', async () => {
      process.env.RESEND_API_KEY = 'secret-key-123';
      
      await sendVerificationRequest(mockParams);
      
      expect(mockConsoleLog).toHaveBeenCalledWith('🔑 Has API Key: true');
      // Should not log the actual API key value
      expect(mockConsoleLog).not.toHaveBeenCalledWith(expect.stringContaining('secret-key-123'));
    });
  });
});