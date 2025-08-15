import { z } from "zod";

export type Chain = 'ethereum' | 'base' | 'arbitrum' | 'polygon';

export const ChainSchema = z.enum(['ethereum', 'base', 'arbitrum', 'polygon']);

export const RuleJSONSchema = z.object({
  type: z.enum(['schedule', 'conditional']),
  description: z.string().optional(),
  asset: z.enum(['USDC', 'EURC']),
  amount: z.union([
    z.string(),
    z.object({ 
      type: z.literal('fixed'), 
      value: z.number().positive(), 
      currency: z.enum(['USD', 'EUR']) 
    })
  ]),
  destination: z.union([
    z.string(),
    z.object({ 
      type: z.enum(['address', 'contact']), 
      value: z.string().min(2) 
    })
  ]),
  fromChain: ChainSchema.optional(),
  toChain: ChainSchema.optional(),
  schedule: z.object({ 
    frequency: z.enum(['daily', 'weekly', 'monthly', 'once']).optional(),
    cron: z.string().optional(), 
    tz: z.string().default('UTC'),
    startDate: z.string().optional(),
    dayOfWeek: z.number().min(0).max(6).optional(),
    dayOfMonth: z.number().min(1).max(31).optional()
  }).optional(),
  condition: z.object({ 
    type: z.enum(['price']).optional(),
    asset: z.string().optional(),
    metric: z.literal('EURUSD').optional(), 
    change: z.enum(['+%', '-%']).optional(), 
    operator: z.enum(['gt', 'lt', 'gte', 'lte']).optional(),
    threshold: z.number().optional(),
    magnitude: z.number().positive().optional(), 
    window: z.literal('24h').optional() 
  }).optional(),
  routing: z.object({ 
    mode: z.enum(['cheapest', 'fastest', 'fixed']), 
    allowedChains: z.array(ChainSchema).min(1) 
  }).optional(),
  limits: z.object({ 
    dailyMaxUSD: z.number().positive(), 
    requireConfirmOverUSD: z.number().positive() 
  }).optional()
});

export type RuleJSONT = z.infer<typeof RuleJSONSchema>;

// Quote and RouteQuote schemas
export const RouteQuoteSchema = z.object({
  chain: ChainSchema,
  feeEstimateUsd: z.number(),
  feePercentage: z.number().optional(),
  etaSeconds: z.number(),
  recommended: z.boolean().default(false),
  isHighFee: z.boolean().default(false),
  explanation: z.string()
});

export type RouteQuote = z.infer<typeof RouteQuoteSchema>;

// Legacy compatibility
export const RuleJSON = RuleJSONSchema;
export type RuleJSON = RuleJSONT;