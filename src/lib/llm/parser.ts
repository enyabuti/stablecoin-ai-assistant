import { RuleJSON, RuleJSONSchema } from "./schema";
import { SYSTEM_PROMPT, EXAMPLES } from "./prompts";
import { tools } from "./tools";

export interface LLMProvider {
  parseRule(input: string): Promise<RuleJSON | { error: string; needsClarification?: string }>;
}

export class MockLLMProvider implements LLMProvider {
  async parseRule(input: string): Promise<RuleJSON | { error: string; needsClarification?: string }> {
    // Simple pattern matching for demo - replace with actual LLM calls
    const lowerInput = input.toLowerCase();
    
    // Check for common patterns
    if (lowerInput.includes("send") && lowerInput.includes("every")) {
      // Schedule rule
      const amountMatch = input.match(/\$(\d+)/);
      const asset = lowerInput.includes("eurc") ? "EURC" : "USDC";
      const contactMatch = input.match(/to (\w+)/i);
      
      if (!amountMatch || !contactMatch) {
        return {
          error: "Could not parse amount or recipient",
          needsClarification: "Please specify the amount and recipient clearly, e.g., 'Send $50 USDC to John'"
        };
      }
      
      return {
        type: "schedule",
        asset,
        amount: {
          type: "fixed",
          value: parseInt(amountMatch[1]),
          currency: asset === "EURC" ? "EUR" : "USD",
        },
        destination: {
          type: "contact",
          value: contactMatch[1],
        },
        schedule: {
          cron: "0 8 * * FRI", // Default to Friday 8am
          tz: "America/New_York",
        },
        routing: {
          mode: "cheapest",
          allowedChains: ["base", "arbitrum", "polygon", "ethereum"],
        },
        limits: {
          dailyMaxUSD: 200,
          requireConfirmOverUSD: 500,
        },
      };
    }
    
    if (lowerInput.includes("when") && lowerInput.includes("eur")) {
      // Conditional rule
      const amountMatch = input.match(/[\$€](\d+)/);
      const addressMatch = input.match(/0x[a-fA-F0-9]{4,}/);
      
      if (!amountMatch) {
        return {
          error: "Could not parse amount",
          needsClarification: "Please specify the amount clearly"
        };
      }
      
      if (!addressMatch) {
        return {
          error: "Missing destination",
          needsClarification: "What destination address should I send the funds to?"
        };
      }
      
      return {
        type: "conditional",
        asset: "EURC",
        amount: {
          type: "fixed",
          value: parseInt(amountMatch[1]),
          currency: "EUR",
        },
        destination: {
          type: "address", 
          value: addressMatch[0],
        },
        condition: {
          metric: "EURUSD",
          change: "+%",
          magnitude: 2,
          window: "24h",
        },
        routing: {
          mode: "cheapest",
          allowedChains: ["base", "arbitrum", "polygon", "ethereum"],
        },
        limits: {
          dailyMaxUSD: 1000,
          requireConfirmOverUSD: 500,
        },
      };
    }
    
    return {
      error: "Could not parse rule",
      needsClarification: "Please describe what you want to do, for example: 'Send $50 USDC to John every Friday' or 'Send €200 to 0x123... when EUR rises 2%'"
    };
  }
}

export class OpenAIProvider implements LLMProvider {
  constructor(private apiKey: string) {}
  
  async parseRule(input: string): Promise<RuleJSON | { error: string; needsClarification?: string }> {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4-1106-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: input },
          ],
          tools,
          tool_choice: { type: "function", function: { name: "parse_rule" } },
        }),
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const toolCall = data.choices[0]?.message?.tool_calls?.[0];
      
      if (!toolCall || toolCall.function?.name !== "parse_rule") {
        return {
          error: "Could not parse rule",
          needsClarification: "Please provide a clearer description of the automation rule you want to create."
        };
      }
      
      const parsedRule = JSON.parse(toolCall.function.arguments).rule;
      const validated = RuleJSONSchema.parse(parsedRule);
      
      return validated;
    } catch (error) {
      console.error("OpenAI parsing error:", error);
      return {
        error: "Failed to parse rule",
        needsClarification: "There was an issue parsing your request. Please try rephrasing it."
      };
    }
  }
}