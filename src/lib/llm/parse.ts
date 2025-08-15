import { RuleJSONT, RuleJSONSchema } from './schema';

interface ParseResult {
  success: true;
  rule: RuleJSONT;
}

interface ParseError {
  success: false;
  need: 'destination' | 'amount' | 'schedule' | 'asset' | 'unclear';
  message: string;
  error: string;
}

export type ParseResponse = ParseResult | ParseError;

// Deterministic phrase mappings for demo
const phrasePatterns = {
  // Amount patterns
  amount: [
    { pattern: /\$(\d+)/g, extract: (match: string) => ({ value: parseInt(match.replace('$', '')), currency: 'USD' as const }) },
    { pattern: /€(\d+)/g, extract: (match: string) => ({ value: parseInt(match.replace('€', '')), currency: 'EUR' as const }) },
    { pattern: /(\d+)\s*dollars?/gi, extract: (match: string) => ({ value: parseInt(match.replace(/\D/g, '')), currency: 'USD' as const }) },
    { pattern: /(\d+)\s*euros?/gi, extract: (match: string) => ({ value: parseInt(match.replace(/\D/g, '')), currency: 'EUR' as const }) }
  ],
  
  // Destination patterns
  destination: [
    { pattern: /to\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)*)/gi, type: 'contact' as const },
    { pattern: /(0x[a-fA-F0-9]{40})/g, type: 'address' as const },
    { pattern: /address\s+([a-zA-Z0-9]+)/gi, type: 'address' as const }
  ],
  
  // Schedule patterns
  schedule: [
    { pattern: /every\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi, cron: '0 8 * * 1' }, // Default 8am
    { pattern: /weekly/gi, cron: '0 8 * * 1' },
    { pattern: /monthly/gi, cron: '0 8 1 * *' },
    { pattern: /daily/gi, cron: '0 8 * * *' },
    { pattern: /every\s+friday/gi, cron: '0 8 * * 5' },
    { pattern: /at\s+(\d{1,2})(am|pm)/gi, extract: (match: string) => {
      const hour = parseInt(match.replace(/\D/g, ''));
      const isPM = match.toLowerCase().includes('pm');
      const hour24 = isPM && hour !== 12 ? hour + 12 : (hour === 12 && !isPM ? 0 : hour);
      return `0 ${hour24} * * *`;
    }}
  ],
  
  // Asset patterns
  asset: [
    { pattern: /usdc/gi, value: 'USDC' as const },
    { pattern: /eurc/gi, value: 'EURC' as const }
  ],
  
  // Routing patterns
  routing: [
    { pattern: /cheapest/gi, mode: 'cheapest' as const },
    { pattern: /fastest/gi, mode: 'fastest' as const },
    { pattern: /on\s+(base|ethereum|arbitrum|polygon)/gi, mode: 'fixed' as const, chain: (match: string) => match.toLowerCase().replace('on ', '') }
  ],
  
  // Condition patterns
  condition: [
    { pattern: /when\s+eur(?:usd)?\s+(rises?|increases?)\s+(\d+)%/gi, change: '+%' as const },
    { pattern: /when\s+eur(?:usd)?\s+(falls?|drops?|decreases?)\s+(\d+)%/gi, change: '-%' as const },
    { pattern: /if\s+eur(?:usd)?\s+(rises?|increases?)\s+(\d+)%/gi, change: '+%' as const },
    { pattern: /if\s+eur(?:usd)?\s+(falls?|drops?|decreases?)\s+(\d+)%/gi, change: '-%' as const }
  ]
};

export async function parseNlToRule(input: string): Promise<ParseResponse> {
  try {
    const normalizedInput = input.toLowerCase().trim();
    
    // Extract amount
    let amount: { value: number; currency: 'USD' | 'EUR' } | null = null;
    for (const amountPattern of phrasePatterns.amount) {
      const match = normalizedInput.match(amountPattern.pattern);
      if (match) {
        amount = amountPattern.extract(match[0]);
        break;
      }
    }
    
    if (!amount) {
      return {
        success: false,
        need: 'amount',
        message: 'Please specify an amount like "$50" or "€100"'
      };
    }
    
    // Extract destination
    let destination: { type: 'address' | 'contact'; value: string } | null = null;
    for (const destPattern of phrasePatterns.destination) {
      const match = normalizedInput.match(destPattern.pattern);
      if (match) {
        destination = {
          type: destPattern.type,
          value: destPattern.type === 'contact' ? match[1].trim() : match[0]
        };
        break;
      }
    }
    
    if (!destination) {
      return {
        success: false,
        need: 'destination',
        message: 'Please specify who to send to, like "John" or an address',
        error: 'Please specify who to send to, like "John" or an address'
      };
    }
    
    // Extract asset
    let asset: 'USDC' | 'EURC' = 'USDC'; // Default
    for (const assetPattern of phrasePatterns.asset) {
      if (assetPattern.pattern.test(normalizedInput)) {
        asset = assetPattern.value;
        break;
      }
    }
    
    // Determine rule type
    const isConditional = /when|if/.test(normalizedInput);
    const type = isConditional ? 'conditional' : 'schedule';
    
    // Extract schedule (for scheduled rules)
    let schedule: { cron: string; tz: string } | undefined;
    if (type === 'schedule') {
      let cron = '0 8 * * 1'; // Default: Monday 8am
      
      for (const schedPattern of phrasePatterns.schedule) {
        const match = normalizedInput.match(schedPattern.pattern);
        if (match) {
          if ('extract' in schedPattern) {
            cron = schedPattern.extract(match[0]);
          } else {
            cron = schedPattern.cron;
          }
          break;
        }
      }
      
      schedule = { cron, tz: 'UTC' };
    }
    
    // Extract condition (for conditional rules)
    let condition: { metric: 'EURUSD'; change: '+%' | '-%'; magnitude: number; window: '24h' } | undefined;
    if (type === 'conditional') {
      for (const condPattern of phrasePatterns.condition) {
        const match = normalizedInput.match(condPattern.pattern);
        if (match) {
          const magnitude = parseInt(match[2] || '2'); // Default 2%
          condition = {
            metric: 'EURUSD',
            change: condPattern.change,
            magnitude,
            window: '24h'
          };
          break;
        }
      }
      
      if (!condition) {
        condition = {
          metric: 'EURUSD',
          change: '+%',
          magnitude: 2,
          window: '24h'
        };
      }
    }
    
    // Extract routing
    let routing = {
      mode: 'cheapest' as const,
      allowedChains: ['base', 'arbitrum', 'polygon'] as const
    };
    
    for (const routePattern of phrasePatterns.routing) {
      if (routePattern.pattern.test(normalizedInput)) {
        routing.mode = routePattern.mode;
        if (routePattern.mode === 'fixed' && 'chain' in routePattern) {
          const chainMatch = normalizedInput.match(routePattern.pattern);
          if (chainMatch) {
            const chain = routePattern.chain!(chainMatch[0]);
            routing.allowedChains = [chain] as any;
          }
        }
        break;
      }
    }
    
    // Build rule object
    const rule: RuleJSONT = {
      type,
      description: input,
      asset,
      amount: {
        type: 'fixed',
        ...amount
      },
      destination,
      routing,
      limits: {
        dailyMaxUSD: Math.max(amount.value * 10, 1000), // 10x amount or $1000
        requireConfirmOverUSD: Math.max(amount.value * 2, 100) // 2x amount or $100
      }
    };
    
    if (schedule) rule.schedule = schedule;
    if (condition) rule.condition = condition;
    
    // Validate with schema
    const validated = RuleJSONSchema.parse(rule);
    
    return {
      success: true,
      rule: validated
    };
    
  } catch (error) {
    console.error('Parse error:', error);
    return {
      success: false,
      need: 'unclear',
      message: 'Could not understand the request. Please try rephrasing.',
      error: 'Could not understand the request. Please try rephrasing.'
    };
  }
}