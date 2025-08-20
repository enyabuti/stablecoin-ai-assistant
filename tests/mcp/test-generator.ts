import { test, expect, Page } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

/**
 * MCP (Model Context Protocol) Test Generator
 * Automatically generates test cases based on UI patterns and user interactions
 */
export class MCPTestGenerator {
  private page: Page;
  private testCases: TestCase[] = [];
  private uiPatterns: UIPattern[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  // Analyze UI patterns and generate test cases
  async analyzeAndGenerateTests(url: string): Promise<TestCase[]> {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');

    // Discover UI patterns
    this.uiPatterns = await this.discoverUIPatterns();
    
    // Generate test cases based on patterns
    this.testCases = await this.generateTestCases();
    
    return this.testCases;
  }

  // Discover common UI patterns on the page
  private async discoverUIPatterns(): Promise<UIPattern[]> {
    const patterns: UIPattern[] = [];

    // Discover forms
    const forms = await this.page.locator('form').all();
    for (const form of forms) {
      const formPattern = await this.analyzeFormPattern(form);
      if (formPattern) patterns.push(formPattern);
    }

    // Discover navigation
    const navElements = await this.page.locator('nav, [role="navigation"]').all();
    for (const nav of navElements) {
      const navPattern = await this.analyzeNavigationPattern(nav);
      if (navPattern) patterns.push(navPattern);
    }

    // Discover interactive elements
    const buttons = await this.page.locator('button, [role="button"]').all();
    for (const button of buttons) {
      const buttonPattern = await this.analyzeButtonPattern(button);
      if (buttonPattern) patterns.push(buttonPattern);
    }

    // Discover data displays
    const cards = await this.page.locator('[data-testid*="card"], .card').all();
    for (const card of cards) {
      const cardPattern = await this.analyzeCardPattern(card);
      if (cardPattern) patterns.push(cardPattern);
    }

    return patterns;
  }

  // Analyze form patterns
  private async analyzeFormPattern(form: any): Promise<UIPattern | null> {
    try {
      const inputs = await form.locator('input, textarea, select').all();
      const submitButton = await form.locator('[type="submit"], button[type="submit"]').first();
      
      if (inputs.length === 0) return null;

      const fields: FormField[] = [];
      for (const input of inputs) {
        const type = await input.getAttribute('type') || 'text';
        const name = await input.getAttribute('name') || '';
        const placeholder = await input.getAttribute('placeholder') || '';
        const required = await input.getAttribute('required') !== null;
        
        fields.push({ type, name, placeholder, required });
      }

      return {
        type: 'form',
        selector: await this.getUniqueSelector(form),
        fields,
        hasSubmit: await submitButton.isVisible(),
      };
    } catch {
      return null;
    }
  }

  // Analyze navigation patterns
  private async analyzeNavigationPattern(nav: any): Promise<UIPattern | null> {
    try {
      const links = await nav.locator('a, [role="menuitem"]').all();
      const navItems: NavItem[] = [];

      for (const link of links) {
        const text = await link.textContent() || '';
        const href = await link.getAttribute('href') || '';
        navItems.push({ text: text.trim(), href });
      }

      return {
        type: 'navigation',
        selector: await this.getUniqueSelector(nav),
        items: navItems,
      };
    } catch {
      return null;
    }
  }

  // Analyze button patterns
  private async analyzeButtonPattern(button: any): Promise<UIPattern | null> {
    try {
      const text = await button.textContent() || '';
      const type = await button.getAttribute('type') || 'button';
      const disabled = await button.getAttribute('disabled') !== null;
      
      return {
        type: 'button',
        selector: await this.getUniqueSelector(button),
        text: text.trim(),
        buttonType: type,
        disabled,
      };
    } catch {
      return null;
    }
  }

  // Analyze card/data display patterns
  private async analyzeCardPattern(card: any): Promise<UIPattern | null> {
    try {
      const headings = await card.locator('h1, h2, h3, h4, h5, h6').all();
      const numbers = await card.locator('text=/\\d+/').all();
      
      const hasHeading = headings.length > 0;
      const hasNumbers = numbers.length > 0;
      
      if (!hasHeading && !hasNumbers) return null;

      return {
        type: 'card',
        selector: await this.getUniqueSelector(card),
        hasHeading,
        hasNumbers,
      };
    } catch {
      return null;
    }
  }

  // Generate test cases based on discovered patterns
  private async generateTestCases(): Promise<TestCase[]> {
    const testCases: TestCase[] = [];

    for (const pattern of this.uiPatterns) {
      switch (pattern.type) {
        case 'form':
          testCases.push(...this.generateFormTests(pattern));
          break;
        case 'navigation':
          testCases.push(...this.generateNavigationTests(pattern));
          break;
        case 'button':
          testCases.push(...this.generateButtonTests(pattern));
          break;
        case 'card':
          testCases.push(...this.generateCardTests(pattern));
          break;
      }
    }

    return testCases;
  }

  // Generate form-specific tests
  private generateFormTests(pattern: UIPattern): TestCase[] {
    const tests: TestCase[] = [];

    tests.push({
      name: `should validate ${pattern.selector} form fields`,
      description: 'Test form validation for required fields',
      code: `
        test('should validate ${pattern.selector} form fields', async ({ page }) => {
          await page.goto('/');
          const form = page.locator('${pattern.selector}');
          
          // Test empty form submission
          if (await form.locator('[type="submit"]').isVisible()) {
            await form.locator('[type="submit"]').click();
            
            // Check for validation errors
            const errors = page.locator('.error, [data-testid*="error"]');
            await expect(errors.first()).toBeVisible();
          }
        });
      `,
    });

    if (pattern.fields && pattern.fields.length > 0) {
      tests.push({
        name: `should fill and submit ${pattern.selector} form`,
        description: 'Test successful form submission',
        code: `
          test('should fill and submit ${pattern.selector} form', async ({ page }) => {
            await page.goto('/');
            const form = page.locator('${pattern.selector}');
            
            ${pattern.fields.map(field => 
              `await form.locator('[name="${field.name}"]').fill('test-${field.type}');`
            ).join('\n            ')}
            
            if (await form.locator('[type="submit"]').isVisible()) {
              await form.locator('[type="submit"]').click();
              await page.waitForLoadState('networkidle');
            }
          });
        `,
      });
    }

    return tests;
  }

  // Generate navigation-specific tests
  private generateNavigationTests(pattern: UIPattern): TestCase[] {
    const tests: TestCase[] = [];

    tests.push({
      name: `should navigate through ${pattern.selector} menu`,
      description: 'Test navigation functionality',
      code: `
        test('should navigate through ${pattern.selector} menu', async ({ page }) => {
          await page.goto('/');
          const nav = page.locator('${pattern.selector}');
          
          ${pattern.items?.map(item => `
          const link${item.text.replace(/\s+/g, '')} = nav.getByText('${item.text}');
          if (await link${item.text.replace(/\s+/g, '')}.isVisible()) {
            await expect(link${item.text.replace(/\s+/g, '')}).toBeVisible();
          }
          `).join('')}
        });
      `,
    });

    return tests;
  }

  // Generate button-specific tests
  private generateButtonTests(pattern: UIPattern): TestCase[] {
    const tests: TestCase[] = [];

    tests.push({
      name: `should interact with ${pattern.text} button`,
      description: 'Test button interaction and states',
      code: `
        test('should interact with ${pattern.text} button', async ({ page }) => {
          await page.goto('/');
          const button = page.locator('${pattern.selector}');
          
          await expect(button).toBeVisible();
          ${pattern.disabled ? 'await expect(button).toBeDisabled();' : 'await expect(button).toBeEnabled();'}
          
          if (await button.isEnabled()) {
            await button.click();
            await page.waitForTimeout(500);
          }
        });
      `,
    });

    return tests;
  }

  // Generate card/data display tests
  private generateCardTests(pattern: UIPattern): TestCase[] {
    const tests: TestCase[] = [];

    tests.push({
      name: `should display ${pattern.selector} card correctly`,
      description: 'Test card display and data',
      code: `
        test('should display ${pattern.selector} card correctly', async ({ page }) => {
          await page.goto('/');
          const card = page.locator('${pattern.selector}');
          
          await expect(card).toBeVisible();
          
          ${pattern.hasHeading ? `
          const heading = card.locator('h1, h2, h3, h4, h5, h6').first();
          await expect(heading).toBeVisible();
          ` : ''}
          
          ${pattern.hasNumbers ? `
          const numbers = card.locator('text=/\\\\d+/').first();
          if (await numbers.isVisible()) {
            await expect(numbers).toBeVisible();
          }
          ` : ''}
        });
      `,
    });

    return tests;
  }

  // Get unique selector for element
  private async getUniqueSelector(element: any): Promise<string> {
    try {
      // Try data-testid first
      const testId = await element.getAttribute('data-testid');
      if (testId) return `[data-testid="${testId}"]`;

      // Try id
      const id = await element.getAttribute('id');
      if (id) return `#${id}`;

      // Try class (if unique)
      const className = await element.getAttribute('class');
      if (className) {
        const classes = className.split(' ')[0];
        return `.${classes}`;
      }

      // Fallback to tag name
      const tagName = await element.evaluate((el: Element) => el.tagName.toLowerCase());
      return tagName;
    } catch {
      return 'element';
    }
  }

  // Save generated tests to file
  async saveTestsToFile(testCases: TestCase[], filename: string): Promise<void> {
    const testDir = path.join(process.cwd(), 'tests', 'generated');
    await fs.mkdir(testDir, { recursive: true });

    const testContent = `
import { test, expect } from '@playwright/test';

// Auto-generated tests by MCP Test Generator
// Generated on: ${new Date().toISOString()}

test.describe('Auto-generated UI Tests', () => {
${testCases.map(testCase => testCase.code).join('\n\n')}
});
    `;

    const filePath = path.join(testDir, filename);
    await fs.writeFile(filePath, testContent.trim());
    
    console.log(`Generated ${testCases.length} test cases in ${filePath}`);
  }
}

// Type definitions
interface UIPattern {
  type: 'form' | 'navigation' | 'button' | 'card';
  selector: string;
  fields?: FormField[];
  items?: NavItem[];
  text?: string;
  buttonType?: string;
  disabled?: boolean;
  hasHeading?: boolean;
  hasNumbers?: boolean;
  hasSubmit?: boolean;
}

interface FormField {
  type: string;
  name: string;
  placeholder: string;
  required: boolean;
}

interface NavItem {
  text: string;
  href: string;
}

interface TestCase {
  name: string;
  description: string;
  code: string;
}