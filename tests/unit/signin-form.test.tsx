import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import SignIn from '@/app/auth/signin/page';

// Mock the modules
vi.mock('next-auth/react');
vi.mock('next/navigation');

const mockSignIn = vi.mocked(signIn);
const mockUseSearchParams = vi.mocked(useSearchParams);

describe('SignIn Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockSignIn.mockResolvedValue({
      ok: true,
      error: null,
      status: 200,
      url: null
    });
    
    mockUseSearchParams.mockReturnValue({
      get: vi.fn().mockReturnValue(null)
    } as any);
  });

  it('renders sign in form by default', () => {
    render(<SignIn />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Enter your email to sign in to your account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders sign up form when mode=signup in URL', () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn().mockImplementation((param) => param === 'mode' ? 'signup' : null)
    } as any);
    
    render(<SignIn />);
    
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Enter your email to create a new account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('toggles between sign in and sign up modes', async () => {
    const user = userEvent.setup();
    render(<SignIn />);
    
    // Initially in sign in mode
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    
    // Click to switch to sign up
    const toggleButton = screen.getByText('Create account');
    await user.click(toggleButton);
    
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    
    // Click to switch back to sign in
    const backToggleButton = screen.getByText('Sign in instead');
    await user.click(backToggleButton);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  it('validates email input is required', async () => {
    const user = userEvent.setup();
    render(<SignIn />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Submit button should be disabled when no email
    expect(submitButton).toBeDisabled();
    
    // Enter email to enable button
    const emailInput = screen.getByPlaceholderText('Enter your email');
    await user.type(emailInput, 'test@example.com');
    
    expect(submitButton).not.toBeDisabled();
  });

  it('submits form with email and calls signIn', async () => {
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

  it('shows loading state during form submission', async () => {
    const user = userEvent.setup();
    
    // Mock signIn to take some time
    mockSignIn.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({ ok: true, error: null, status: 200, url: null }), 100)
    ));
    
    render(<SignIn />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    // Should show loading state
    expect(screen.getByText('Sending...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Sending...')).not.toBeInTheDocument();
    });
  });

  it('shows success screen after successful submission', async () => {
    const user = userEvent.setup();
    render(<SignIn />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Check your email')).toBeInTheDocument();
      expect(screen.getByText(/We've sent a magic link to test@example.com/)).toBeInTheDocument();
    });
  });

  it('shows error message when signIn fails', async () => {
    const user = userEvent.setup();
    
    mockSignIn.mockResolvedValue({
      ok: false,
      error: 'Configuration error',
      status: 500,
      url: null
    });
    
    render(<SignIn />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Authentication failed: Configuration error')).toBeInTheDocument();
    });
  });

  it('shows generic error message when signIn returns unknown error', async () => {
    const user = userEvent.setup();
    
    mockSignIn.mockResolvedValue({
      ok: false,
      error: null,
      status: 500,
      url: null
    });
    
    render(<SignIn />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });
  });

  it('handles signIn promise rejection', async () => {
    const user = userEvent.setup();
    
    mockSignIn.mockRejectedValue(new Error('Network error'));
    
    render(<SignIn />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to process request. Please try again.')).toBeInTheDocument();
    });
  });

  it('allows user to return to form from success screen', async () => {
    const user = userEvent.setup();
    render(<SignIn />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Check your email')).toBeInTheDocument();
    });
    
    // Click "Use different email" button
    const differentEmailButton = screen.getByText('Use different email');
    await user.click(differentEmailButton);
    
    // Should return to form
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  });

  it('clears error when switching between modes', async () => {
    const user = userEvent.setup();
    
    // First cause an error
    mockSignIn.mockResolvedValue({
      ok: false,
      error: 'Test error',
      status: 500,
      url: null
    });
    
    render(<SignIn />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Authentication failed: Test error')).toBeInTheDocument();
    });
    
    // Switch to sign up mode
    const toggleButton = screen.getByText('Create account');
    await user.click(toggleButton);
    
    // Error should be cleared
    expect(screen.queryByText('Authentication failed: Test error')).not.toBeInTheDocument();
  });

  it('shows correct button text for sign up mode', async () => {
    const user = userEvent.setup();
    
    mockUseSearchParams.mockReturnValue({
      get: vi.fn().mockImplementation((param) => param === 'mode' ? 'signup' : null)
    } as any);
    
    render(<SignIn />);
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    await user.type(emailInput, 'test@example.com');
    
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    
    // Click submit
    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);
    
    // Should still call signIn (same underlying functionality)
    expect(mockSignIn).toHaveBeenCalledWith('email', {
      email: 'test@example.com',
      redirect: false,
      callbackUrl: '/dashboard'
    });
  });

  it('includes proper accessibility attributes', () => {
    render(<SignIn />);
    
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
    
    const form = emailInput.closest('form');
    expect(form).toBeInTheDocument();
  });

  it('links to terms and privacy policy', () => {
    render(<SignIn />);
    
    expect(screen.getByRole('link', { name: /terms of service/i })).toHaveAttribute('href', '/terms');
    expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveAttribute('href', '/privacy');
  });

  it('includes back to home link', () => {
    render(<SignIn />);
    
    expect(screen.getByRole('link', { name: /back to ferrow/i })).toHaveAttribute('href', '/');
  });
});