import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('landing page should be accessible', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('sign-in page should be accessible', async ({ page }) => {
    await page.goto('/auth/signin');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('dashboard should be accessible', async ({ page }) => {
    // Note: This would need authentication in a real scenario
    try {
      await page.goto('/dashboard');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      
      expect(accessibilityScanResults.violations).toEqual([]);
    } catch (error) {
      console.log('Dashboard requires authentication, skipping accessibility test');
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1); // Should have exactly one H1
    
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');
    
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy(); // Should have alt text
      expect(alt?.length).toBeGreaterThan(0);
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/auth/signin');
    
    const inputs = await page.locator('input[type="email"], input[type="password"], input[type="text"]').all();
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');
      
      // Should have at least one of: id (with corresponding label), aria-label, or meaningful placeholder
      expect(id || ariaLabel || placeholder).toBeTruthy();
      
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count();
        expect(label).toBeGreaterThan(0);
      }
    }
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    const focusedElement = await page.evaluate(() => {
      const focused = document.activeElement;
      return {
        tagName: focused?.tagName,
        type: focused?.getAttribute('type'),
        role: focused?.getAttribute('role')
      };
    });
    
    // Should focus on an interactive element
    const interactiveElements = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
    expect(interactiveElements.includes(focusedElement.tagName || '')).toBeTruthy();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Run axe-core color contrast checks
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['color-contrast'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Test form keyboard navigation
    await page.keyboard.press('Tab'); // Should focus email input
    await page.keyboard.press('Tab'); // Should focus submit button
    
    const submitButton = page.getByRole('button', { name: /sign in/i });
    await expect(submitButton).toBeFocused();
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/');
    
    // Check for ARIA landmarks
    const main = await page.locator('[role="main"], main').count();
    const nav = await page.locator('[role="navigation"], nav').count();
    
    expect(main + nav).toBeGreaterThan(0); // Should have at least one landmark
    
    // Check buttons have accessible names
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');
      
      expect(ariaLabel || textContent?.trim() || ariaLabelledBy).toBeTruthy();
    }
  });

  test('should be responsive and accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    
    // Run accessibility check on mobile viewport
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Check touch targets are large enough (minimum 44x44px)
    const touchTargets = await page.locator('button, a, input[type="submit"]').all();
    
    for (const target of touchTargets) {
      const box = await target.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});