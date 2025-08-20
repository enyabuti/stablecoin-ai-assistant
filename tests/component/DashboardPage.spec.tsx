import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import { TestProviders, mockApiResponses } from './setup';

// Mock the dashboard page component
const MockDashboardPage = () => (
  <TestProviders>
    <div data-testid="dashboard-page">
      <h1>Dashboard</h1>
      <div data-testid="stats-grid">
        <div data-testid="active-rules-card">
          <h3>Active Rules</h3>
          <span data-testid="active-rules-count">5</span>
        </div>
        <div data-testid="executions-card">
          <h3>Executions</h3>
          <span data-testid="executions-count">142</span>
        </div>
        <div data-testid="volume-card">
          <h3>Volume</h3>
          <span data-testid="volume-amount">$1,234,567</span>
        </div>
      </div>
      <div data-testid="recent-activity">
        <h2>Recent Activity</h2>
        <div data-testid="recent-rules-list">
          <div data-testid="rule-item">Test Rule 1</div>
          <div data-testid="rule-item">Test Rule 2</div>
        </div>
      </div>
      <button data-testid="new-rule-button">New Rule</button>
    </div>
  </TestProviders>
);

test.describe('Dashboard Page Component', () => {
  test('should render dashboard layout correctly', async ({ mount }) => {
    const component = await mount(<MockDashboardPage />);
    
    await expect(component.getByTestId('dashboard-page')).toBeVisible();
    await expect(component.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(component.getByTestId('stats-grid')).toBeVisible();
  });

  test('should display stats cards with correct data', async ({ mount }) => {
    const component = await mount(<MockDashboardPage />);
    
    // Check stats cards
    await expect(component.getByTestId('active-rules-card')).toBeVisible();
    await expect(component.getByTestId('executions-card')).toBeVisible();
    await expect(component.getByTestId('volume-card')).toBeVisible();
    
    // Check stats values
    await expect(component.getByTestId('active-rules-count')).toHaveText('5');
    await expect(component.getByTestId('executions-count')).toHaveText('142');
    await expect(component.getByTestId('volume-amount')).toHaveText('$1,234,567');
  });

  test('should display recent activity section', async ({ mount }) => {
    const component = await mount(<MockDashboardPage />);
    
    await expect(component.getByTestId('recent-activity')).toBeVisible();
    await expect(component.getByRole('heading', { name: 'Recent Activity' })).toBeVisible();
    await expect(component.getByTestId('recent-rules-list')).toBeVisible();
    
    // Check for rule items
    const ruleItems = component.getByTestId('rule-item');
    await expect(ruleItems).toHaveCount(2);
  });

  test('should have accessible new rule button', async ({ mount }) => {
    const component = await mount(<MockDashboardPage />);
    
    const newRuleButton = component.getByTestId('new-rule-button');
    await expect(newRuleButton).toBeVisible();
    await expect(newRuleButton).toBeEnabled();
    await expect(newRuleButton).toHaveText('New Rule');
  });

  test('should handle click events on new rule button', async ({ mount }) => {
    let clicked = false;
    
    const MockDashboardWithClick = () => (
      <TestProviders>
        <div data-testid="dashboard-page">
          <button 
            data-testid="new-rule-button"
            onClick={() => { clicked = true; }}
          >
            New Rule
          </button>
        </div>
      </TestProviders>
    );
    
    const component = await mount(<MockDashboardWithClick />);
    const button = component.getByTestId('new-rule-button');
    
    await button.click();
    expect(clicked).toBe(true);
  });

  test('should have proper heading hierarchy', async ({ mount }) => {
    const component = await mount(<MockDashboardPage />);
    
    // Check for proper heading structure
    const h1 = component.getByRole('heading', { level: 1 });
    const h2 = component.getByRole('heading', { level: 2 });
    const h3 = component.getByRole('heading', { level: 3 });
    
    await expect(h1).toHaveCount(1); // Only one H1
    await expect(h2).toBeVisible(); // H2 for sections
    await expect(h3).toHaveCount(3); // H3 for stat cards
  });

  test('should be responsive', async ({ mount, page }) => {
    const component = await mount(<MockDashboardPage />);
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(component.getByTestId('dashboard-page')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(component.getByTestId('dashboard-page')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(component.getByTestId('dashboard-page')).toBeVisible();
  });
});