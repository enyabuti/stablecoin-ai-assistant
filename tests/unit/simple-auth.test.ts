import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the dependencies before importing
vi.mock('@/lib/db', () => ({
  db: {}
}));

vi.mock('@/lib/email', () => ({
  sendVerificationRequest: vi.fn()
}));

describe('Simple Auth Tests', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have working vi mock', () => {
    const mockFn = vi.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
  });
});