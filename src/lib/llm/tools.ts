import { z } from "zod";
import { RuleJSONSchema } from "./schema";

export const parseRuleToolSchema = z.object({
  name: z.literal("parse_rule"),
  description: z.literal(
    "Parse user natural language input into structured RuleJSON format for stablecoin automation"
  ),
  parameters: z.object({
    type: z.literal("object"),
    properties: z.object({
      rule: RuleJSONSchema,
    }),
    required: z.array(z.literal("rule")),
  }),
});

export type ParseRuleTool = z.infer<typeof parseRuleToolSchema>;

export const tools = [
  {
    type: "function",
    function: {
      name: "parse_rule",
      description: "Parse user natural language input into structured RuleJSON format for stablecoin automation",
      parameters: {
        type: "object",
        properties: {
          rule: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["schedule", "conditional"],
                description: "Type of rule - schedule for time-based, conditional for event-based"
              },
              asset: {
                type: "string", 
                enum: ["USDC", "EURC"],
                description: "The stablecoin asset to transfer"
              },
              amount: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["fixed"] },
                  value: { type: "number", minimum: 0 },
                  currency: { type: "string", enum: ["USD", "EUR"] }
                },
                required: ["type", "value", "currency"]
              },
              destination: {
                type: "object", 
                properties: {
                  type: { type: "string", enum: ["address", "contact"] },
                  value: { type: "string" }
                },
                required: ["type", "value"]
              },
              schedule: {
                type: "object",
                properties: {
                  cron: { type: "string", description: "Cron expression for scheduling" },
                  tz: { type: "string", default: "UTC" }
                }
              },
              condition: {
                type: "object",
                properties: {
                  metric: { type: "string", enum: ["EURUSD"] },
                  change: { type: "string", enum: ["+%", "-%"] },
                  magnitude: { type: "number", minimum: 0 },
                  window: { type: "string", enum: ["24h"] }
                }
              },
              routing: {
                type: "object",
                properties: {
                  mode: { type: "string", enum: ["cheapest", "fastest", "fixed"] },
                  allowedChains: {
                    type: "array",
                    items: { type: "string", enum: ["ethereum", "base", "arbitrum", "polygon"] },
                    minItems: 1
                  }
                },
                required: ["mode", "allowedChains"]
              },
              limits: {
                type: "object", 
                properties: {
                  dailyMaxUSD: { type: "number", minimum: 0 },
                  requireConfirmOverUSD: { type: "number", minimum: 0 }
                },
                required: ["dailyMaxUSD", "requireConfirmOverUSD"]
              }
            },
            required: ["type", "asset", "amount", "destination", "routing", "limits"]
          }
        },
        required: ["rule"]
      }
    }
  }
] as const;