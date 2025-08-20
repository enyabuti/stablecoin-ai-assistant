import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LandingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors
  get heroTitle(): Locator {
    return this.page.getByRole('heading', { name: 'Ferrow' });
  }

  get heroSubtitle(): Locator {
    return this.page.getByText('Ferry funds across chains, automatically.');
  }

  get getStartedButton(): Locator {
    return this.page.getByRole('button', { name: 'Get Started Free' });
  }

  get featuresSection(): Locator {
    return this.page.locator('[data-testid="features-section"]');
  }

  get navigationMenu(): Locator {
    return this.page.locator('nav');
  }

  get signInLink(): Locator {
    return this.page.getByRole('link', { name: 'Sign In' });
  }

  get logoLink(): Locator {
    return this.page.getByRole('link', { name: 'Ferrow' });
  }

  // Actions
  async goto(): Promise<void> {
    await this.navigateTo('/');
  }

  async clickGetStarted(): Promise<void> {
    await this.getStartedButton.click();
    await this.page.waitForURL('/auth/signin');
  }

  async clickSignIn(): Promise<void> {
    await this.signInLink.click();
    await this.page.waitForURL('/auth/signin');
  }

  // Assertions
  async expectLandingPageElements(): Promise<void> {
    await expect(this.page).toHaveTitle(/Ferrow/);
    await expect(this.heroTitle).toBeVisible();
    await expect(this.heroSubtitle).toBeVisible();
    await expect(this.getStartedButton).toBeVisible();
  }

  async expectResponsiveLayout(): Promise<void> {
    // Check if navigation is responsive
    const viewport = this.page.viewportSize();
    if (viewport && viewport.width < 768) {
      // Mobile view - check for hamburger menu or simplified nav
      const mobileNav = this.page.locator('[data-testid="mobile-nav"]');
      await expect(mobileNav).toBeVisible();
    } else {
      // Desktop view - check for full navigation
      await expect(this.navigationMenu).toBeVisible();
    }
  }

  async expectFeatureHighlights(): Promise<void> {
    // Check for key feature cards
    const featureCards = this.page.locator('[data-testid="feature-card"]');
    const count = await featureCards.count();
    expect(count).toBeGreaterThan(0);

    // Check for key selling points
    await expect(this.page.getByText(/automat/i)).toBeVisible();
    await expect(this.page.getByText(/cross.{0,10}chain/i)).toBeVisible();
  }
}