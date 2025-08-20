import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors
  get pageTitle(): Locator {
    return this.page.getByRole('heading', { name: 'Dashboard' });
  }

  get newRuleButton(): Locator {
    return this.page.getByRole('button', { name: 'New Rule' });
  }

  get activeRulesCard(): Locator {
    return this.page.locator('[data-testid="active-rules-card"]');
  }

  get executionsCard(): Locator {
    return this.page.locator('[data-testid="executions-card"]');
  }

  get volumeCard(): Locator {
    return this.page.locator('[data-testid="volume-card"]');
  }

  get performanceCard(): Locator {
    return this.page.locator('[data-testid="performance-card"]');
  }

  get recentRulesList(): Locator {
    return this.page.locator('[data-testid="recent-rules-list"]');
  }

  get recentExecutionsList(): Locator {
    return this.page.locator('[data-testid="recent-executions-list"]');
  }

  get demoModeBanner(): Locator {
    return this.page.locator('[data-testid="demo-mode-banner"]');
  }

  get navigationSidebar(): Locator {
    return this.page.locator('[data-testid="navigation-sidebar"]');
  }

  get userProfileDropdown(): Locator {
    return this.page.locator('[data-testid="user-profile-dropdown"]');
  }

  // Actions
  async goto(): Promise<void> {
    await this.navigateTo('/dashboard');
  }

  async clickNewRule(): Promise<void> {
    await this.newRuleButton.click();
    await this.page.waitForURL('/rules/new');
  }

  async viewAllRules(): Promise<void> {
    const viewAllLink = this.page.getByRole('link', { name: 'View all rules' });
    await viewAllLink.click();
    await this.page.waitForURL('/rules');
  }

  async viewAllTransfers(): Promise<void> {
    const viewAllLink = this.page.getByRole('link', { name: 'View all transfers' });
    await viewAllLink.click();
    await this.page.waitForURL('/transfers');
  }

  async openUserProfile(): Promise<void> {
    await this.userProfileDropdown.click();
  }

  // Assertions
  async expectDashboardElements(): Promise<void> {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.newRuleButton).toBeVisible();
    
    // Check for stat cards
    const statCards = this.page.locator('.grid .card, [data-testid*="card"]');
    const cardCount = await statCards.count();
    expect(cardCount).toBeGreaterThan(2); // At least 3 stat cards
  }

  async expectDemoMode(): Promise<void> {
    await expect(this.demoModeBanner).toBeVisible();
    await expect(this.page.getByText(/demo mode/i)).toBeVisible();
  }

  async expectStatsCards(): Promise<void> {
    // Check for key metrics
    await expect(this.page.getByText(/active rules/i)).toBeVisible();
    await expect(this.page.getByText(/executions/i)).toBeVisible();
    
    // Check for numeric values
    const numbers = this.page.locator('text=/\\d+/');
    const numberCount = await numbers.count();
    expect(numberCount).toBeGreaterThan(0);
  }

  async expectRecentActivity(): Promise<void> {
    // Check for recent rules section
    const rulesSection = this.page.locator('text=/recent rules/i').or(this.page.locator('text=/rules/i'));
    await expect(rulesSection).toBeVisible();
    
    // Check for recent executions or transfers
    const activitySection = this.page.locator('text=/recent/i');
    const activityCount = await activitySection.count();
    expect(activityCount).toBeGreaterThan(0);
  }

  async expectNavigation(): Promise<void> {
    // Check for main navigation items
    await expect(this.page.getByRole('link', { name: /rules/i })).toBeVisible();
    await expect(this.page.getByRole('link', { name: /transfers/i })).toBeVisible();
    await expect(this.page.getByRole('link', { name: /settings/i })).toBeVisible();
  }

  async expectResponsiveDashboard(): Promise<void> {
    const viewport = this.page.viewportSize();
    if (viewport && viewport.width < 768) {
      // Mobile: cards should stack vertically
      const cards = this.page.locator('[data-testid*="card"], .card');
      const firstCard = cards.first();
      const secondCard = cards.nth(1);
      
      if (await firstCard.isVisible() && await secondCard.isVisible()) {
        const firstBox = await firstCard.boundingBox();
        const secondBox = await secondCard.boundingBox();
        
        if (firstBox && secondBox) {
          // On mobile, second card should be below first card
          expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height / 2);
        }
      }
    }
  }

  async checkDashboardPerformance(): Promise<void> {
    // Measure page load time
    const startTime = Date.now();
    await this.page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Dashboard should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check for loading states
    const loadingElements = this.page.locator('[data-testid*="loading"], .loading, .spinner');
    await expect(loadingElements.first()).toBeHidden();
  }
}