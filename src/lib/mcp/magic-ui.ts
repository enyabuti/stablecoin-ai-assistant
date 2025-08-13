/**
 * Magic MCP Integration
 * Provides AI-powered UI component generation for the Ferrow application
 */

export interface UIGenerationRequest {
  description: string;
  type: 'button' | 'form' | 'card' | 'modal' | 'banner' | 'layout' | 'component';
  style?: 'modern' | 'minimal' | 'crypto' | 'dashboard' | 'glassmorphism';
  props?: Record<string, any>;
  framework: 'react' | 'vue' | 'html';
}

export interface GeneratedComponent {
  id: string;
  code: string;
  language: 'tsx' | 'jsx' | 'vue' | 'html';
  dependencies?: string[];
  description: string;
  preview?: string;
  generatedAt: Date;
}

export interface LogoSearchRequest {
  query: string;
  category?: 'crypto' | 'finance' | 'tech' | 'general';
  format: 'jsx' | 'tsx' | 'svg';
  theme?: 'light' | 'dark' | 'auto';
}

export interface LogoResult {
  id: string;
  name: string;
  code: string;
  format: string;
  category: string;
  theme: string;
}

export class MagicUIService {
  private apiKey: string;
  private baseUrl = 'https://api.21st.dev/magic';
  private generationHistory: GeneratedComponent[] = [];

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.MAGIC_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Magic MCP: No API key provided. Some features may be limited.');
    }
  }

  /**
   * Generate a UI component based on natural language description
   */
  async generateComponent(request: UIGenerationRequest): Promise<GeneratedComponent> {
    try {
      // Use mock implementation for free tier or when no API key is provided
      const component = this.mockGenerateComponent(request);
      this.generationHistory.push(component);
      return component;
    } catch (error) {
      console.error('Magic UI generation failed:', error);
      throw new Error('Failed to generate UI component');
    }
  }

  /**
   * Search for logos and icons
   */
  async searchLogos(request: LogoSearchRequest): Promise<LogoResult[]> {
    if (!this.apiKey) {
      // Return mock results for free tier
      return this.mockLogoSearch(request);
    }

    try {
      // Mock implementation - replace with actual API call
      return this.mockLogoSearch(request);
    } catch (error) {
      console.error('Logo search failed:', error);
      return [];
    }
  }

  /**
   * Get component inspiration based on description
   */
  async getComponentInspiration(description: string): Promise<{
    suggestions: string[];
    examples: GeneratedComponent[];
    bestPractices: string[];
  }> {
    return {
      suggestions: [
        'Consider using Tailwind CSS for consistent styling',
        'Add hover states and transitions for better UX',
        'Ensure accessibility with proper ARIA labels',
        'Use TypeScript for better type safety'
      ],
      examples: this.getRelatedComponents(description),
      bestPractices: [
        'Keep components small and focused',
        'Use semantic HTML elements',
        'Implement responsive design',
        'Follow design system guidelines'
      ]
    };
  }

  /**
   * Generate crypto-specific UI components
   */
  async generateCryptoComponent(type: 'wallet-connect' | 'price-chart' | 'transaction-form' | 'balance-card', customization?: Record<string, any>): Promise<GeneratedComponent> {
    const descriptions = {
      'wallet-connect': 'A modern wallet connection button with support for multiple wallet providers, loading states, and error handling',
      'price-chart': 'A responsive price chart component with candlestick view, volume indicators, and timeframe selection',
      'transaction-form': 'A transaction form with amount input, asset selection, recipient field, and gas fee estimation',
      'balance-card': 'A crypto balance card showing current holdings, 24h change, and portfolio allocation'
    };

    return this.generateComponent({
      description: descriptions[type],
      type: 'component',
      style: 'crypto',
      props: customization,
      framework: 'react'
    });
  }

  /**
   * Generate Ferrow-specific UI components
   */
  async generateFerrowComponent(componentType: 'rule-card' | 'automation-status' | 'transfer-history' | 'analytics-widget'): Promise<GeneratedComponent> {
    const ferrowDescriptions = {
      'rule-card': 'A rule card component for Ferrow showing automation rule details, status, execution count, and edit/delete actions with glassmorphism design',
      'automation-status': 'A status indicator showing active automations, pending executions, and system health with real-time updates',
      'transfer-history': 'A transfer history table with transaction details, status indicators, and filtering options for Ferrow transactions',
      'analytics-widget': 'An analytics widget showing automation performance metrics, savings calculations, and execution statistics'
    };

    return this.generateComponent({
      description: ferrowDescriptions[componentType],
      type: 'component',
      style: 'glassmorphism',
      props: {
        theme: 'crypto',
        brandColors: ['#667eea', '#764ba2']
      },
      framework: 'react'
    });
  }

  /**
   * Get generation history
   */
  getGenerationHistory(): GeneratedComponent[] {
    return this.generationHistory;
  }

  /**
   * Get usage statistics (free tier tracking)
   */
  getUsageStats(): {
    totalGenerations: number;
    remainingGenerations: number;
    resetDate: Date;
  } {
    const totalGenerations = this.generationHistory.length;
    const freeLimit = 100; // Free tier limit
    
    return {
      totalGenerations,
      remainingGenerations: Math.max(0, freeLimit - totalGenerations),
      resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    };
  }

  // Mock implementations for development/free tier
  private mockGenerateComponent(request: UIGenerationRequest): GeneratedComponent {
    const id = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const mockCode = this.generateMockCode(request);
    
    return {
      id,
      code: mockCode,
      language: 'tsx',
      dependencies: ['react', '@types/react', 'tailwindcss'],
      description: request.description,
      generatedAt: new Date()
    };
  }

  private mockLogoSearch(request: LogoSearchRequest): LogoResult[] {
    const mockLogos = [
      {
        id: 'logo_1',
        name: 'Ethereum',
        code: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L5.5 12.25L12 16.5L18.5 12.25L12 0Z"/></svg>',
        format: 'svg',
        category: 'crypto',
        theme: 'auto'
      },
      {
        id: 'logo_2',
        name: 'Bitcoin',
        code: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"/></svg>',
        format: 'svg',
        category: 'crypto',
        theme: 'auto'
      }
    ];

    return mockLogos.filter(logo => 
      logo.name.toLowerCase().includes(request.query.toLowerCase()) ||
      logo.category === request.category
    );
  }

  private generateMockCode(request: UIGenerationRequest): string {
    const componentName = this.toPascalCase(request.description.split(' ').slice(0, 2).join(''));
    
    return `import React from 'react';

interface ${componentName}Props {
  className?: string;
  ${request.props ? Object.keys(request.props).map(key => `${key}?: any;`).join('\n  ') : ''}
}

export const ${componentName}: React.FC<${componentName}Props> = ({ 
  className = '',
  ${request.props ? Object.keys(request.props).join(', ') : ''}
}) => {
  return (
    <div className={\`${this.generateTailwindClasses(request)} \${className}\`}>
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          ${request.description}
        </h3>
        <div className="space-y-4">
          {/* Generated component content */}
          <p className="text-muted-foreground">
            This is a generated ${request.type} component.
          </p>
        </div>
      </div>
    </div>
  );
};`;
  }

  private toPascalCase(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toUpperCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
  }

  private generateTailwindClasses(request: UIGenerationRequest): string {
    const baseClasses = 'relative';
    const styleClasses = {
      modern: 'bg-gradient-to-br from-primary/10 to-secondary/10',
      minimal: 'bg-card border border-border',
      crypto: 'bg-gradient-primary text-primary-foreground',
      dashboard: 'bg-card/50 backdrop-blur-sm border border-border/50',
      glassmorphism: 'glass-card'
    };

    return `${baseClasses} ${styleClasses[request.style || 'modern']}`;
  }

  private getRelatedComponents(description: string): GeneratedComponent[] {
    return this.generationHistory.filter(comp => 
      comp.description.toLowerCase().includes(description.toLowerCase().split(' ')[0])
    ).slice(0, 3);
  }
}