/**
 * MCP Services Integration
 * Aggregates Sequential Thinking and Magic UI MCP servers for Ferrow
 */

import { SequentialThinkingService } from './sequential-thinking';
import { MagicUIService } from './magic-ui';

export interface MCPServices {
  sequentialThinking: SequentialThinkingService;
  magicUI: MagicUIService;
}

export class MCPServiceManager {
  private services: MCPServices;

  constructor() {
    this.services = {
      sequentialThinking: new SequentialThinkingService(),
      magicUI: new MagicUIService()
    };
  }

  /**
   * Get all MCP services
   */
  getServices(): MCPServices {
    return this.services;
  }

  /**
   * Process user input with enhanced reasoning capabilities
   */
  async processWithSequentialThinking(userInput: string): Promise<{
    analysis: any;
    enhancedResponse: string;
    suggestions: string[];
  }> {
    const analysis = await this.services.sequentialThinking.analyzeRuleRequest(userInput);
    
    return {
      analysis,
      enhancedResponse: this.generateEnhancedResponse(analysis),
      suggestions: this.generateSuggestions(analysis)
    };
  }

  /**
   * Generate UI components based on user requests
   */
  async generateUIForRequest(description: string, context: 'rule-creation' | 'dashboard' | 'transaction' | 'analytics') {
    const contextualDescriptions = {
      'rule-creation': `${description} for crypto automation rule creation with form validation and preview`,
      'dashboard': `${description} for crypto dashboard with real-time data and interactive elements`,
      'transaction': `${description} for crypto transaction interface with security features`,
      'analytics': `${description} for crypto analytics with charts and metrics`
    };

    return await this.services.magicUI.generateComponent({
      description: contextualDescriptions[context],
      type: 'component',
      style: 'crypto',
      framework: 'react'
    });
  }

  /**
   * Enhanced chat processing with MCP capabilities
   */
  async processChatMessage(message: string, context?: {
    previousMessages?: string[];
    userGoals?: string[];
    currentScreen?: string;
  }): Promise<{
    response: string;
    actions?: Array<{
      type: 'generate-ui' | 'create-rule' | 'show-analysis' | 'suggest-improvement';
      data: any;
    }>;
    metadata?: {
      confidence: number;
      reasoning: string[];
      alternatives: string[];
    };
  }> {
    // Use sequential thinking to analyze the message
    const thinking = await this.services.sequentialThinking.analyzeRuleRequest(message);
    
    // Determine if UI generation would be helpful
    const uiSuggestion = this.shouldSuggestUI(message);
    
    const actions = [];
    
    if (uiSuggestion) {
      const component = await this.generateUIForRequest(message, uiSuggestion.context);
      actions.push({
        type: 'generate-ui' as const,
        data: component
      });
    }

    // Check if this looks like a rule creation request
    if (this.isRuleCreationRequest(message)) {
      actions.push({
        type: 'create-rule' as const,
        data: {
          suggestedRule: thinking.suggestedImplementation,
          breakdown: thinking.breakdown
        }
      });
    }

    return {
      response: this.generateContextualResponse(message, thinking, context),
      actions,
      metadata: {
        confidence: 0.85,
        reasoning: thinking.considerations,
        alternatives: this.generateAlternatives(message)
      }
    };
  }

  /**
   * Get MCP service health and status
   */
  getServiceStatus(): {
    sequential: { status: 'active' | 'inactive'; sessions: number };
    magicUI: { status: 'active' | 'inactive'; usage: any };
  } {
    return {
      sequential: {
        status: 'active',
        sessions: (this.services.sequentialThinking as any).sessions.size || 0
      },
      magicUI: {
        status: 'active',
        usage: this.services.magicUI.getUsageStats()
      }
    };
  }

  private generateEnhancedResponse(analysis: any): string {
    return `Based on sequential analysis:\n\n` +
           `**Key Insights:**\n${analysis.considerations.join('\n- ')}\n\n` +
           `**Suggested Implementation:**\n${analysis.suggestedImplementation}\n\n` +
           `**Risk Factors to Consider:**\n${analysis.riskFactors.join('\n- ')}`;
  }

  private generateSuggestions(analysis: any): string[] {
    return [
      'Start with a small test amount',
      'Set up monitoring alerts',
      'Consider market hours for execution',
      'Review gas fee optimization',
      'Test with simulation first'
    ];
  }

  private shouldSuggestUI(message: string): { context: 'rule-creation' | 'dashboard' | 'transaction' | 'analytics' } | null {
    // Only suggest UI for explicit UI generation requests
    const uiKeywords = ['generate', 'create component', 'design', 'ui', 'interface', 'component'];
    
    if (!uiKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      return null;
    }

    const contextKeywords = {
      'rule-creation': ['form', 'rule', 'setup', 'configure'],
      'dashboard': ['dashboard', 'overview', 'summary', 'portfolio'],
      'transaction': ['transaction', 'payment'],
      'analytics': ['chart', 'graph', 'analytics', 'performance', 'metrics']
    };

    for (const [context, keywords] of Object.entries(contextKeywords)) {
      if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
        return { context: context as any };
      }
    }

    return { context: 'rule-creation' }; // Default context
  }

  private isRuleCreationRequest(message: string): boolean {
    const ruleKeywords = ['send', 'transfer', 'when', 'if', 'every', 'schedule', 'automate'];
    return ruleKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private generateContextualResponse(message: string, thinking: any, context?: any): string {
    let response = `I understand you want to ${message.toLowerCase()}. `;
    
    if (thinking.breakdown.length > 0) {
      response += `Let me break this down:\n\n${thinking.breakdown.join('\n• ')}\n\n`;
    }

    response += `Here's what I recommend:\n${thinking.suggestedImplementation}`;

    if (thinking.riskFactors.length > 0) {
      response += `\n\n⚠️ **Important considerations:**\n${thinking.riskFactors.join('\n• ')}`;
    }

    return response;
  }

  private generateAlternatives(message: string): string[] {
    return [
      'Consider using a different trigger condition',
      'Try a percentage-based amount instead of fixed',
      'Use multiple smaller rules instead of one large rule',
      'Add additional safety conditions'
    ];
  }
}

// Export singleton instance
export const mcpServices = new MCPServiceManager();
export * from './sequential-thinking';
export * from './magic-ui';