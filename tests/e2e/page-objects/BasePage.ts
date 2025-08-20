import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Common selectors
  get loadingSpinner(): Locator {
    return this.page.locator('[data-testid="loading-spinner"]');
  }

  get errorMessage(): Locator {
    return this.page.locator('[data-testid="error-message"]');
  }

  get successMessage(): Locator {
    return this.page.locator('[data-testid="success-message"]');
  }

  // Common actions
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForSpinnerToDisappear(): Promise<void> {
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
  }

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessage).toContainText(message);
  }

  async expectSuccessMessage(message: string): Promise<void> {
    await expect(this.successMessage).toContainText(message);
  }

  // Navigation helpers
  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  // Screenshot helper for debugging
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  // Check if element is visible in viewport
  async isElementInViewport(locator: Locator): Promise<boolean> {
    return await locator.isInViewport();
  }

  // Accessibility helpers
  async checkPageAccessibility(): Promise<void> {
    // Check for proper heading hierarchy
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);

    // Check for alt text on images
    const images = await this.page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (alt === null || alt === '') {
        console.warn('Image missing alt text:', await img.getAttribute('src'));
      }
    }

    // Check for form labels
    const inputs = await this.page.locator('input[type="text"], input[type="email"], input[type="password"], textarea').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      if (id) {
        const label = await this.page.locator(`label[for="${id}"]`).count();
        if (label === 0) {
          console.warn('Input missing label:', id);
        }
      }
    }
  }
}