import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AuthPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors
  get emailInput(): Locator {
    return this.page.getByPlaceholder('Enter your email');
  }

  get passwordInput(): Locator {
    return this.page.getByPlaceholder('Enter your password');
  }

  get signInButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign In' });
  }

  get signUpButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign Up' });
  }

  get signUpLink(): Locator {
    return this.page.getByRole('link', { name: 'Sign up' });
  }

  get signInLink(): Locator {
    return this.page.getByRole('link', { name: 'Sign in' });
  }

  get forgotPasswordLink(): Locator {
    return this.page.getByRole('link', { name: 'Forgot password?' });
  }

  get pageTitle(): Locator {
    return this.page.getByRole('heading', { name: /Sign (in|up) to Ferrow/ });
  }

  get emailError(): Locator {
    return this.page.locator('[data-testid="email-error"]');
  }

  get passwordError(): Locator {
    return this.page.locator('[data-testid="password-error"]');
  }

  get socialSignInGoogle(): Locator {
    return this.page.getByRole('button', { name: /Continue with Google/i });
  }

  get socialSignInGithub(): Locator {
    return this.page.getByRole('button', { name: /Continue with GitHub/i });
  }

  // Actions
  async gotoSignIn(): Promise<void> {
    await this.navigateTo('/auth/signin');
  }

  async gotoSignUp(): Promise<void> {
    await this.navigateTo('/auth/signup');
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async submitSignIn(): Promise<void> {
    await this.signInButton.click();
  }

  async submitSignUp(): Promise<void> {
    await this.signUpButton.click();
  }

  async signInWithCredentials(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submitSignIn();
  }

  async signUpWithCredentials(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submitSignUp();
  }

  async switchToSignUp(): Promise<void> {
    await this.signUpLink.click();
    await this.page.waitForURL('/auth/signup');
  }

  async switchToSignIn(): Promise<void> {
    await this.signInLink.click();
    await this.page.waitForURL('/auth/signin');
  }

  // Assertions
  async expectSignInPage(): Promise<void> {
    await expect(this.page).toHaveURL('/auth/signin');
    await expect(this.pageTitle).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.signInButton).toBeVisible();
  }

  async expectSignUpPage(): Promise<void> {
    await expect(this.page).toHaveURL('/auth/signup');
    await expect(this.pageTitle).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.signUpButton).toBeVisible();
  }

  async expectValidationErrors(): Promise<void> {
    // Check for form validation
    await this.submitSignIn();
    
    // Should show validation errors for empty fields
    await expect(this.emailError.or(this.page.getByText(/email.{0,10}required/i))).toBeVisible();
    await expect(this.passwordError.or(this.page.getByText(/password.{0,10}required/i))).toBeVisible();
  }

  async expectSocialSignInOptions(): Promise<void> {
    // Check for social sign-in options
    const socialButtons = this.page.locator('button[type="button"]').filter({ hasText: /Continue with|Sign in with/ });
    const count = await socialButtons.count();
    expect(count).toBeGreaterThan(0);
  }

  async testFormAccessibility(): Promise<void> {
    // Check form accessibility
    await expect(this.emailInput).toHaveAttribute('type', 'email');
    await expect(this.passwordInput).toHaveAttribute('type', 'password');
    
    // Check for proper labels
    const emailLabel = this.page.locator('label').filter({ hasText: /email/i });
    const passwordLabel = this.page.locator('label').filter({ hasText: /password/i });
    
    await expect(emailLabel).toBeVisible();
    await expect(passwordLabel).toBeVisible();
  }
}