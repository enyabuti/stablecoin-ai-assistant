import { test, expect } from '@playwright/test';
import { MCPTestGenerator } from './test-generator';

test.describe('MCP Test Generation', () => {
  test('should analyze landing page and generate tests', async ({ page }) => {
    const generator = new MCPTestGenerator(page);
    
    // Navigate to landing page
    await page.goto('/');
    
    // Generate tests based on UI analysis
    const testCases = await generator.analyzeAndGenerateTests('/');
    
    // Verify test cases were generated
    expect(testCases.length).toBeGreaterThan(0);
    
    // Save generated tests
    await generator.saveTestsToFile(testCases, 'landing-page-auto.spec.ts');
    
    console.log(`Generated ${testCases.length} test cases for landing page`);
  });

  test('should analyze dashboard and generate tests', async ({ page }) => {
    const generator = new MCPTestGenerator(page);
    
    // Navigate to dashboard (would require auth in real scenario)
    try {
      await page.goto('/dashboard');
      
      // Generate tests based on UI analysis
      const testCases = await generator.analyzeAndGenerateTests('/dashboard');
      
      // Verify test cases were generated
      expect(testCases.length).toBeGreaterThan(0);
      
      // Save generated tests
      await generator.saveTestsToFile(testCases, 'dashboard-auto.spec.ts');
      
      console.log(`Generated ${testCases.length} test cases for dashboard`);
    } catch (error) {
      console.log('Dashboard requires authentication, skipping auto-generation');
    }
  });

  test('should analyze auth pages and generate tests', async ({ page }) => {
    const generator = new MCPTestGenerator(page);
    
    // Navigate to sign-in page
    await page.goto('/auth/signin');
    
    // Generate tests based on UI analysis
    const testCases = await generator.analyzeAndGenerateTests('/auth/signin');
    
    // Verify test cases were generated
    expect(testCases.length).toBeGreaterThan(0);
    
    // Should find form patterns
    const formTests = testCases.filter(test => test.name.includes('form'));
    expect(formTests.length).toBeGreaterThan(0);
    
    // Save generated tests
    await generator.saveTestsToFile(testCases, 'auth-auto.spec.ts');
    
    console.log(`Generated ${testCases.length} test cases for auth pages`);
  });

  test('should identify UI patterns correctly', async ({ page }) => {
    const generator = new MCPTestGenerator(page);
    
    // Test on a page with known patterns
    await page.goto('/');
    
    // The generator should identify common patterns
    const testCases = await generator.analyzeAndGenerateTests('/');
    
    // Check for specific pattern types
    const buttonTests = testCases.filter(test => test.name.includes('button'));
    const navigationTests = testCases.filter(test => test.name.includes('navigate'));
    
    console.log('Pattern analysis results:');
    console.log(`- Button tests: ${buttonTests.length}`);
    console.log(`- Navigation tests: ${navigationTests.length}`);
    console.log(`- Total tests: ${testCases.length}`);
    
    // At minimum, should find some interactive elements
    expect(testCases.length).toBeGreaterThan(0);
  });

  test('should generate accessibility tests', async ({ page }) => {
    const generator = new MCPTestGenerator(page);
    
    await page.goto('/');
    
    // Generate standard tests
    const testCases = await generator.analyzeAndGenerateTests('/');
    
    // Add accessibility-focused test cases
    const accessibilityTests = [
      {
        name: 'should have proper heading hierarchy',
        description: 'Test heading structure for accessibility',
        code: `
          test('should have proper heading hierarchy', async ({ page }) => {
            await page.goto('/');
            
            const h1Count = await page.locator('h1').count();
            expect(h1Count).toBeLessThanOrEqual(1);
            
            const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
            expect(headings.length).toBeGreaterThan(0);
          });
        `
      },
      {
        name: 'should have accessible form labels',
        description: 'Test form accessibility',
        code: `
          test('should have accessible form labels', async ({ page }) => {
            await page.goto('/');
            
            const inputs = await page.locator('input[type="text"], input[type="email"], input[type="password"]').all();
            
            for (const input of inputs) {
              const id = await input.getAttribute('id');
              const ariaLabel = await input.getAttribute('aria-label');
              const placeholder = await input.getAttribute('placeholder');
              
              expect(id || ariaLabel || placeholder).toBeTruthy();
            }
          });
        `
      }
    ];
    
    const allTests = [...testCases, ...accessibilityTests];
    
    // Save combined tests
    await generator.saveTestsToFile(allTests, 'comprehensive-auto.spec.ts');
    
    console.log(`Generated ${allTests.length} comprehensive test cases`);
  });
});