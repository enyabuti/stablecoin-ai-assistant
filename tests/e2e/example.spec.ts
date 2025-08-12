import { test, expect } from '@playwright/test';

test.describe('Stablecoin AI Assistant', () => {
  test('should load dashboard page', async ({ page }) => {
    await page.goto('/');
    
    // Check for dashboard elements
    await expect(page).toHaveTitle(/Stablecoin AI Assistant/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Total Balance')).toBeVisible();
    await expect(page.getByText('Recent Activity')).toBeVisible();
  });

  test('should navigate to rules page', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to rules
    await page.click('text=Rules');
    await page.waitForURL('/rules');
    
    await expect(page.getByRole('heading', { name: 'Rules' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New Rule' })).toBeVisible();
  });

  test('should create a new rule via chat', async ({ page }) => {
    await page.goto('/rules/new');
    
    // Check page loads
    await expect(page.getByRole('heading', { name: 'Create New Rule' })).toBeVisible();
    await expect(page.getByText('Describe Your Rule')).toBeVisible();
    
    // Type a rule description
    const chatInput = page.getByPlaceholder('Describe your automation rule...');
    await chatInput.fill('Send $50 USDC to John every Friday at 8am');
    await page.keyboard.press('Enter');
    
    // Wait for processing
    await page.waitForSelector('[data-testid="parsed-rule"]', { timeout: 10000 });
    
    // Check that rule was parsed
    await expect(page.getByText('Parsed Rule')).toBeVisible();
    await expect(page.getByText('Route Options')).toBeVisible();
  });

  test('should display transfers page', async ({ page }) => {
    await page.goto('/transfers');
    
    await expect(page.getByRole('heading', { name: 'Transfers' })).toBeVisible();
    await expect(page.getByText('Total Transfers')).toBeVisible();
  });

  test('should display settings page', async ({ page }) => {
    await page.goto('/settings');
    
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(page.getByText('Feature Flags')).toBeVisible();
    await expect(page.getByText('API Keys')).toBeVisible();
  });
});