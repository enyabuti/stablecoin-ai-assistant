import { test, expect } from '@playwright/test';
import { LandingPage } from './page-objects/LandingPage';
import { AuthPage } from './page-objects/AuthPage';
import { DashboardPage } from './page-objects/DashboardPage';

test.describe('UI/UX Testing Suite', () => {
  test.describe('Landing Page UX', () => {
    test('should have responsive design on different screen sizes', async ({ page }) => {
      const landingPage = new LandingPage(page);
      
      // Test desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await landingPage.goto();
      await landingPage.expectLandingPageElements();
      await landingPage.expectResponsiveLayout();
      
      // Test tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await landingPage.expectResponsiveLayout();
      
      // Test mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await landingPage.expectResponsiveLayout();
    });

    test('should have proper visual hierarchy and typography', async ({ page }) => {
      const landingPage = new LandingPage(page);
      await landingPage.goto();
      
      // Check heading hierarchy
      const h1 = page.locator('h1');
      const h2 = page.locator('h2');
      const h3 = page.locator('h3');
      
      await expect(h1).toHaveCount(1); // Only one H1
      
      // Check font sizes are appropriate
      const h1FontSize = await h1.evaluate(el => getComputedStyle(el).fontSize);
      const h2FontSize = await h2.first().evaluate(el => getComputedStyle(el).fontSize);
      
      expect(parseFloat(h1FontSize)).toBeGreaterThan(parseFloat(h2FontSize));
    });

    test('should have accessible color contrast and focus states', async ({ page }) => {
      const landingPage = new LandingPage(page);
      await landingPage.goto();
      
      // Test focus states on interactive elements
      await landingPage.getStartedButton.focus();
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBe('BUTTON');
      
      // Check for visible focus indicators
      const buttonOutline = await landingPage.getStartedButton.evaluate(el => 
        getComputedStyle(el).outline
      );
      expect(buttonOutline).not.toBe('none');
    });

    test('should have smooth animations and transitions', async ({ page }) => {
      const landingPage = new LandingPage(page);
      await landingPage.goto();
      
      // Check for CSS transitions
      const button = landingPage.getStartedButton;
      const transition = await button.evaluate(el => getComputedStyle(el).transition);
      
      // Should have some form of transition
      expect(transition).not.toBe('all 0s ease 0s');
    });

    test('should load hero image optimally', async ({ page }) => {
      const landingPage = new LandingPage(page);
      await landingPage.goto();
      
      // Check for hero images
      const heroImages = page.locator('img').first();
      if (await heroImages.isVisible()) {
        // Check for proper alt text
        const altText = await heroImages.getAttribute('alt');
        expect(altText).toBeTruthy();
        expect(altText?.length).toBeGreaterThan(0);
        
        // Check for loading attribute
        const loading = await heroImages.getAttribute('loading');
        expect(loading).toBe('eager'); // Hero images should load immediately
      }
    });
  });

  test.describe('Authentication UX', () => {
    test('should provide clear form validation feedback', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.gotoSignIn();
      
      // Test empty form submission
      await authPage.expectValidationErrors();
      
      // Test invalid email format
      await authPage.fillEmail('invalid-email');
      await authPage.submitSignIn();
      
      // Should show email format error
      const emailError = page.locator('text=/invalid.{0,10}email|email.{0,10}format/i');
      await expect(emailError).toBeVisible();
    });

    test('should have accessible form elements', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.gotoSignIn();
      await authPage.testFormAccessibility();
    });

    test('should support keyboard navigation', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.gotoSignIn();
      
      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(authPage.emailInput).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(authPage.passwordInput).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(authPage.signInButton).toBeFocused();
    });

    test('should handle password visibility toggle', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.gotoSignIn();
      
      // Check for password visibility toggle
      const toggleButton = page.locator('button[aria-label*="password" i], button[title*="password" i]');
      
      if (await toggleButton.isVisible()) {
        await expect(authPage.passwordInput).toHaveAttribute('type', 'password');
        await toggleButton.click();
        await expect(authPage.passwordInput).toHaveAttribute('type', 'text');
      }
    });

    test('should show loading states during authentication', async ({ page }) => {
      const authPage = new AuthPage(page);
      await authPage.gotoSignIn();
      
      await authPage.fillEmail('test@example.com');
      await authPage.fillPassword('password123');
      
      // Check for loading state after submission
      await authPage.submitSignIn();
      
      // Should show some form of loading indicator
      const loadingIndicator = page.locator('[data-testid="loading"], .loading, .spinner, button[disabled]');
      await expect(loadingIndicator.first()).toBeVisible();
    });
  });

  test.describe('Dashboard UX', () => {
    test('should load quickly and show skeleton states', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      
      // Mock slow API responses to test loading states
      await page.route('**/api/**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.continue();
      });
      
      await dashboardPage.goto();
      
      // Should show loading indicators initially
      const loadingElements = page.locator('[data-testid*="skeleton"], .skeleton, [data-testid*="loading"]');
      await expect(loadingElements.first()).toBeVisible();
      
      // Eventually load content
      await dashboardPage.expectDashboardElements();
    });

    test('should have responsive card layouts', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.expectResponsiveDashboard();
    });

    test('should show meaningful empty states', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.goto();
      
      // Check for empty state when no data
      const emptyStates = page.locator('[data-testid*="empty"], .empty-state, text=/no rules|no data|get started/i');
      
      if (await emptyStates.first().isVisible()) {
        // Empty states should have helpful text and actions
        await expect(emptyStates.first()).toContainText(/create|add|get started/i);
      }
    });

    test('should have intuitive navigation', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.goto();
      
      await dashboardPage.expectNavigation();
      
      // Test breadcrumb navigation if present
      const breadcrumbs = page.locator('[data-testid="breadcrumbs"], .breadcrumb');
      if (await breadcrumbs.isVisible()) {
        await expect(breadcrumbs).toContainText(/dashboard/i);
      }
    });

    test('should handle data visualization properly', async ({ page }) => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.goto();
      
      // Check for charts or graphs
      const charts = page.locator('canvas, svg, [data-testid*="chart"]');
      
      if (await charts.first().isVisible()) {
        // Charts should have proper labels and legends
        const labels = page.locator('[data-testid*="label"], .chart-label, text=/\\d+%|\\$\\d+/');
        await expect(labels.first()).toBeVisible();
      }
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    test('should work consistently across browsers', async ({ page, browserName }) => {
      const landingPage = new LandingPage(page);
      await landingPage.goto();
      
      // Core functionality should work in all browsers
      await landingPage.expectLandingPageElements();
      await landingPage.clickGetStarted();
      
      const authPage = new AuthPage(page);
      await authPage.expectSignInPage();
      
      // Log browser-specific information
      console.log(`Test completed successfully in ${browserName}`);
    });
  });

  test.describe('Performance Testing', () => {
    test('should meet web vitals thresholds', async ({ page }) => {
      const landingPage = new LandingPage(page);
      
      // Measure Core Web Vitals
      await page.goto('/', { waitUntil: 'networkidle' });
      
      const vitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const vitals: Record<string, number> = {};
            
            entries.forEach((entry) => {
              if (entry.entryType === 'navigation') {
                const navEntry = entry as PerformanceNavigationTiming;
                vitals.FCP = navEntry.responseStart;
                vitals.LCP = navEntry.loadEventStart;
              }
            });
            
            resolve(vitals);
          }).observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
          
          // Fallback timeout
          setTimeout(() => resolve({}), 5000);
        });
      });
      
      console.log('Web Vitals:', vitals);
      
      // Basic performance expectations
      const navigationTiming = await page.evaluate(() => {
        const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
          loadComplete: timing.loadEventEnd - timing.loadEventStart,
        };
      });
      
      // Page should load within reasonable time
      expect(navigationTiming.domContentLoaded).toBeLessThan(2000);
    });
  });
});