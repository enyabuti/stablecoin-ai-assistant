import { expect, Page } from '@playwright/test';

// Helper functions for common test operations
export class TestHelpers {
  
  // Wait for API calls to complete
  static async waitForApiCalls(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle');
  }

  // Mock API responses
  static async mockApiResponse(page: Page, endpoint: string, response: any): Promise<void> {
    await page.route(`**/api/${endpoint}**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  // Mock API error responses
  static async mockApiError(page: Page, endpoint: string, status: number = 500): Promise<void> {
    await page.route(`**/api/${endpoint}**`, async (route) => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'API Error' }),
      });
    });
  }

  // Check for loading states
  static async expectLoadingState(page: Page, shouldBeVisible: boolean = true): Promise<void> {
    const loadingSelectors = [
      '[data-testid="loading"]',
      '[data-testid="loading-spinner"]',
      '.loading',
      '.spinner',
      'button[disabled]'
    ];

    for (const selector of loadingSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        if (shouldBeVisible) {
          await expect(elements.first()).toBeVisible();
        } else {
          await expect(elements.first()).toBeHidden();
        }
        break;
      }
    }
  }

  // Check for error messages
  static async expectErrorMessage(page: Page, message?: string): Promise<void> {
    const errorSelectors = [
      '[data-testid="error"]',
      '[data-testid="error-message"]',
      '.error',
      '[role="alert"]'
    ];

    let errorFound = false;
    for (const selector of errorSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        await expect(elements.first()).toBeVisible();
        if (message) {
          await expect(elements.first()).toContainText(message);
        }
        errorFound = true;
        break;
      }
    }

    if (!errorFound && message) {
      // Fallback: look for text containing the message
      await expect(page.getByText(message)).toBeVisible();
    }
  }

  // Check for success messages
  static async expectSuccessMessage(page: Page, message?: string): Promise<void> {
    const successSelectors = [
      '[data-testid="success"]',
      '[data-testid="success-message"]',
      '.success',
      '.toast-success'
    ];

    let successFound = false;
    for (const selector of successSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        await expect(elements.first()).toBeVisible();
        if (message) {
          await expect(elements.first()).toContainText(message);
        }
        successFound = true;
        break;
      }
    }

    if (!successFound && message) {
      // Fallback: look for text containing the message
      await expect(page.getByText(message)).toBeVisible();
    }
  }

  // Fill form fields
  static async fillForm(page: Page, formData: Record<string, string>): Promise<void> {
    for (const [field, value] of Object.entries(formData)) {
      const input = page.getByLabel(field).or(page.getByPlaceholder(field));
      await input.fill(value);
    }
  }

  // Check form validation
  static async expectFormValidation(page: Page, field: string, errorMessage?: string): Promise<void> {
    // Look for validation errors near the field
    const fieldInput = page.getByLabel(field).or(page.getByPlaceholder(field));
    const fieldContainer = fieldInput.locator('..').locator('..');
    
    const errorElement = fieldContainer.locator('[data-testid*="error"], .error, .text-red');
    await expect(errorElement.first()).toBeVisible();
    
    if (errorMessage) {
      await expect(errorElement.first()).toContainText(errorMessage);
    }
  }

  // Screenshot for debugging
  static async takeDebugScreenshot(page: Page, name: string): Promise<void> {
    await page.screenshot({
      path: `test-results/debug-${name}-${Date.now()}.png`,
      fullPage: true
    });
  }

  // Check accessibility
  static async checkBasicAccessibility(page: Page): Promise<void> {
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeLessThanOrEqual(1);

    // Check for alt text on images
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (!alt || alt.trim() === '') {
        const src = await img.getAttribute('src');
        console.warn(`Image missing alt text: ${src}`);
      }
    }

    // Check for form labels
    const inputs = await page.locator('input[type="text"], input[type="email"], input[type="password"]').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');
      
      if (!id && !ariaLabel && !placeholder) {
        console.warn('Input missing accessibility attributes');
      }
    }
  }

  // Wait for animations to complete
  static async waitForAnimations(page: Page): Promise<void> {
    await page.waitForFunction(() => {
      const animations = document.getAnimations();
      return animations.length === 0 || animations.every(anim => anim.playState === 'finished');
    });
  }

  // Check for responsive design
  static async testResponsiveBreakpoints(page: Page): Promise<void> {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await page.waitForTimeout(100); // Allow layout to settle
      
      // Take screenshot for visual comparison
      await page.screenshot({
        path: `test-results/responsive-${breakpoint.name}-${Date.now()}.png`,
        fullPage: true
      });
    }
  }

  // Performance measurement
  static async measurePagePerformance(page: Page): Promise<Record<string, number>> {
    const metrics = await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
        loadComplete: timing.loadEventEnd - timing.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });

    console.log('Performance metrics:', metrics);
    return metrics;
  }
}

// Custom expect matchers for better test assertions
export const customExpect = {
  async toBeWithinRange(actual: number, min: number, max: number): Promise<void> {
    expect(actual).toBeGreaterThanOrEqual(min);
    expect(actual).toBeLessThanOrEqual(max);
  },

  async toHaveGoodPerformance(metrics: Record<string, number>): Promise<void> {
    expect(metrics.domContentLoaded).toBeLessThan(2000); // 2 seconds
    expect(metrics.loadComplete).toBeLessThan(3000); // 3 seconds
    if (metrics.firstContentfulPaint > 0) {
      expect(metrics.firstContentfulPaint).toBeLessThan(1800); // 1.8 seconds
    }
  }
};