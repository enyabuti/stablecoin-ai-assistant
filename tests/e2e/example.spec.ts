import { test, expect } from '@playwright/test';

test.describe('Ferrow App', () => {
  test('should load landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check for landing page elements
    await expect(page).toHaveTitle(/Ferrow/);
    await expect(page.getByRole('main').getByRole('heading', { name: 'Ferrow' })).toBeVisible();
    await expect(page.getByText('Ferry funds across chains, automatically.')).toBeVisible();
    await expect(page.getByText('Get Started Free')).toBeVisible();
  });

  test('should navigate to sign in from landing page', async ({ page }) => {
    await page.goto('/');
    
    // Click sign in button
    await page.click('text=Get Started Free');
    await page.waitForURL('/auth/signin');
    
    await expect(page.getByRole('heading', { name: /Sign in to Ferrow/ })).toBeVisible();
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
  });

  test('should redirect to sign in for protected rule creation page', async ({ page }) => {
    await page.goto('/rules/new');
    
    // Should redirect to sign in since it requires authentication
    await page.waitForURL(/\/auth\/signin/);
    await expect(page.getByRole('heading', { name: /Sign in to Ferrow/ })).toBeVisible();
  });

  test('should redirect to sign in for protected transfers page', async ({ page }) => {
    await page.goto('/transfers');
    
    // Should redirect to sign in since it requires authentication
    // Wait for either the exact path or with query params
    await page.waitForURL(/\/auth\/signin/);
    await expect(page.getByRole('heading', { name: /Sign in to Ferrow/ })).toBeVisible();
  });

  test('should redirect to sign in for protected settings page', async ({ page }) => {
    await page.goto('/settings');
    
    // Should redirect to sign in since it requires authentication
    await page.waitForURL(/\/auth\/signin/);
    await expect(page.getByRole('heading', { name: /Sign in to Ferrow/ })).toBeVisible();
  });

  test('should redirect to sign in for protected dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to sign in since it requires authentication
    await page.waitForURL(/\/auth\/signin/);
    await expect(page.getByRole('heading', { name: /Sign in to Ferrow/ })).toBeVisible();
  });
});