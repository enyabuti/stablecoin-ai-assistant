import { z } from "zod";

export const ChainSchema = z.enum(["ethereum", "base", "arbitrum", "polygon"]);
export type Chain = z.infer<typeof ChainSchema>;

export const RuleJSONSchema = z.object({
  type: z.enum(["schedule", "conditional"]),
  description: z.string().optional(),
  asset: z.enum(["USDC", "EURC"]),
  amount: z.object({
    type: z.literal("fixed"),
    value: z.number().positive(),
    currency: z.enum(["USD", "EUR"]),
  }),
  destination: z.object({
    type: z.enum(["address", "contact"]),
    value: z.string().min(1),
  }),
  schedule: z
    .object({
      cron: z.string(),
      tz: z.string().default("UTC"),
    })
    .optional(),
  condition: z
    .object({
      metric: z.enum(["EURUSD"]),
      change: z.enum(["+%", "-%"]),
      magnitude: z.number().positive(),
      window: z.enum(["24h"]),
    })
    .optional(),
  routing: z.object({
    mode: z.enum(["cheapest", "fastest", "fixed"]),
    allowedChains: z.array(ChainSchema).min(1),
  }),
  limits: z.object({
    dailyMaxUSD: z.number().positive(),
    requireConfirmOverUSD: z.number().positive(),
  }),
});

export type RuleJSON = z.infer<typeof RuleJSONSchema>;

// Gas estimation schema
export const GasEstimateSchema = z.object({
  chain: ChainSchema,
  feeUSD: z.number().positive(),
  etaSeconds: z.number().positive(),
  explanation: z.string(),
});

export type GasEstimate = z.infer<typeof GasEstimateSchema>;

// Route quote schema  
export const RouteQuoteSchema = z.object({
  chain: ChainSchema,
  feeEstimateUsd: z.number().positive(),
  etaSeconds: z.number().positive(),
  explanation: z.string(),
  recommended: z.boolean().default(false),
});

export type RouteQuote = z.infer<typeof RouteQuoteSchema>;