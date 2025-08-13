import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the modules before importing
vi.mock('next-auth/react', () => ({
  signIn: vi.fn()
}));

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => 
    React.createElement('a', { href, ...props }, children)
}));

import SignIn from '@/app/auth/signin/page';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

const mockSignIn = vi.mocked(signIn);
const mockUseSearchParams = vi.mocked(useSearchParams);

describe('SignIn Component - Core Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSignIn.mockResolvedValue({
      ok: true,
      error: null,
      status: 200,
      url: null
    });
    
    mockUseSearchParams.mockReturnValue({
      get: vi.fn().mockReturnValue(null)
    });
  });

  it('renders without crashing', () => {
    render(<SignIn />);
    
    // Should render the main form
    expect(screen.getByText('Welcome Back')).toBeDefined();
  });

  it('shows sign up form when mode=signup in URL', () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn().mockImplementation((param) => param === 'mode' ? 'signup' : null)
    });
    
    render(<SignIn />);
    
    expect(screen.getByText('Create Account')).toBeDefined();
  });

  it('allows email input', async () => {
    const user = userEvent.setup();
    render(<SignIn />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    await user.type(emailInput, 'test@example.com');
    
    expect((emailInput as HTMLInputElement).value).toBe('test@example.com');
  });

  it('calls signIn when form is submitted', async () => {
    const user = userEvent.setup();
    render(<SignIn />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    expect(mockSignIn).toHaveBeenCalledWith('email', {
      email: 'test@example.com',
      redirect: false,
      callbackUrl: '/dashboard'
    });
  });

  it('toggles between sign in and sign up modes', async () => {
    const user = userEvent.setup();
    render(<SignIn />);
    
    // Initially in sign in mode
    expect(screen.getByText('Welcome Back')).toBeDefined();
    
    // Click to switch to sign up
    const toggleButton = screen.getByText('Create account');
    await user.click(toggleButton);
    
    expect(screen.getByText('Create Account')).toBeDefined();
  });

  it('shows success screen after form submission', async () => {
    const user = userEvent.setup();
    render(<SignIn />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    // Wait for success screen
    await vi.waitFor(() => {
      expect(screen.getByText('Check your email')).toBeDefined();
    });
  });
});