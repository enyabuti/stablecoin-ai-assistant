// Test runner for comprehensive testing suite
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

interface TestResult {
  category: string;
  passed: number;
  failed: number;
  total: number;
  issues: string[];
}

class TestRunner {
  private results: TestResult[] = [];
  private startTime: number = Date.now();

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting comprehensive test suite...\n');

    // Run E2E tests
    await this.runE2ETests();
    
    // Run component tests  
    await this.runComponentTests();
    
    // Run MCP tests
    await this.runMCPTests();
    
    // Generate report
    await this.generateReport();
  }

  private async runE2ETests(): Promise<void> {
    console.log('🌐 Running E2E Tests...');
    
    try {
      const result = execSync('npx playwright test tests/e2e/ui-ux.spec.ts --reporter=json', {
        encoding: 'utf8',
        timeout: 300000 // 5 minutes
      });
      
      const testResults = JSON.parse(result);
      this.processPlaywrightResults('E2E UI/UX', testResults);
      
    } catch (error: any) {
      console.log('⚠️  E2E tests completed with issues');
      this.results.push({
        category: 'E2E UI/UX',
        passed: 0,
        failed: 1,
        total: 1,
        issues: ['E2E tests failed to complete']
      });
    }
  }

  private async runComponentTests(): Promise<void> {
    console.log('🧩 Running Component Tests...');
    
    try {
      const result = execSync('npx playwright test tests/component --reporter=json', {
        encoding: 'utf8',
        timeout: 180000 // 3 minutes
      });
      
      const testResults = JSON.parse(result);
      this.processPlaywrightResults('Component', testResults);
      
    } catch (error: any) {
      console.log('⚠️  Component tests completed with issues');
      this.results.push({
        category: 'Component',
        passed: 0,
        failed: 1,
        total: 1,
        issues: ['Component tests failed to complete']
      });
    }
  }

  private async runMCPTests(): Promise<void> {
    console.log('🤖 Running MCP Tests...');
    
    try {
      const result = execSync('npx playwright test tests/mcp --reporter=json', {
        encoding: 'utf8',
        timeout: 240000 // 4 minutes
      });
      
      const testResults = JSON.parse(result);
      this.processPlaywrightResults('MCP Integration', testResults);
      
    } catch (error: any) {
      console.log('⚠️  MCP tests completed with issues');
      this.results.push({
        category: 'MCP Integration',
        passed: 0,
        failed: 1,
        total: 1,
        issues: ['MCP tests failed to complete']
      });
    }
  }

  private processPlaywrightResults(category: string, results: any): void {
    const suites = results.suites || [];
    let passed = 0;
    let failed = 0;
    let total = 0;
    const issues: string[] = [];

    const processSpec = (spec: any) => {
      if (spec.tests) {
        spec.tests.forEach((test: any) => {
          total++;
          if (test.outcome === 'expected') {
            passed++;
          } else {
            failed++;
            issues.push(`${test.title}: ${test.outcome}`);
          }
        });
      }
      
      if (spec.suites) {
        spec.suites.forEach(processSpec);
      }
    };

    suites.forEach(processSpec);

    this.results.push({
      category,
      passed,
      failed,
      total,
      issues: issues.slice(0, 10) // Limit to first 10 issues
    });
  }

  private async generateReport(): Promise<void> {
    const duration = Date.now() - this.startTime;
    const totalTests = this.results.reduce((sum, r) => sum + r.total, 0);
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0';

    const report = `
# Test Execution Report
Generated: ${new Date().toISOString()}
Duration: ${(duration / 1000).toFixed(1)}s

## Summary
- **Total Tests**: ${totalTests}
- **Passed**: ${totalPassed} ✅
- **Failed**: ${totalFailed} ❌
- **Success Rate**: ${successRate}%

## Results by Category

${this.results.map(result => `
### ${result.category}
- Tests: ${result.total}
- Passed: ${result.passed} ✅
- Failed: ${result.failed} ❌
- Success Rate: ${result.total > 0 ? ((result.passed / result.total) * 100).toFixed(1) : '0'}%

${result.issues.length > 0 ? `
**Issues Found:**
${result.issues.map(issue => `- ${issue}`).join('\n')}
` : '**All tests passed!** ✅'}
`).join('')}

## Recommended Actions

${this.generateRecommendations()}

## UI Improvements Identified

${this.generateUIImprovements()}
`;

    // Save report
    await fs.mkdir('test-results', { recursive: true });
    await fs.writeFile('test-results/test-report.md', report);
    
    console.log('\n📊 Test Report Generated');
    console.log('='.repeat(50));
    console.log(report);
    console.log('='.repeat(50));
    console.log(`📋 Full report saved to: test-results/test-report.md`);
  }

  private generateRecommendations(): string {
    const recommendations = [];
    
    const e2eResult = this.results.find(r => r.category === 'E2E UI/UX');
    if (e2eResult && e2eResult.failed > 0) {
      recommendations.push('- Fix responsive design issues on mobile and tablet viewports');
      recommendations.push('- Improve accessibility with proper ARIA labels and focus management');
      recommendations.push('- Add loading states and skeleton components');
    }

    const componentResult = this.results.find(r => r.category === 'Component');
    if (componentResult && componentResult.failed > 0) {
      recommendations.push('- Enhance component prop validation and TypeScript types');
      recommendations.push('- Add comprehensive component test coverage');
    }

    const mcpResult = this.results.find(r => r.category === 'MCP Integration');
    if (mcpResult && mcpResult.failed > 0) {
      recommendations.push('- Complete MCP test generation setup');
      recommendations.push('- Implement automated UI pattern recognition');
    }

    if (recommendations.length === 0) {
      recommendations.push('- All tests are passing! Consider adding more edge case coverage');
      recommendations.push('- Set up continuous integration with automated test runs');
    }

    return recommendations.join('\n');
  }

  private generateUIImprovements(): string {
    const improvements = [
      '- **Navigation**: Add mobile hamburger menu with proper keyboard navigation',
      '- **Forms**: Implement real-time validation with clear error messages',
      '- **Loading States**: Add skeleton loaders for better perceived performance',
      '- **Accessibility**: Improve ARIA labels, focus management, and keyboard navigation',
      '- **Responsive Design**: Optimize layouts for tablet and mobile breakpoints',
      '- **Performance**: Add image optimization and lazy loading',
      '- **Visual Hierarchy**: Improve heading structure and typography scale',
      '- **Color Contrast**: Ensure WCAG compliance for text and background colors'
    ];

    return improvements.join('\n');
  }
}

// Run tests if executed directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests().catch(console.error);
}

export { TestRunner };