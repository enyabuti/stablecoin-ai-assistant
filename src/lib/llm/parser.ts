import { RuleJSON, RuleJSONSchema } from "./schema";
import { SYSTEM_PROMPT, EXAMPLES } from "./prompts";
import { tools } from "./tools";

export interface LLMProvider {
  parseRule(input: string): Promise<RuleJSON | { error: string; needsClarification?: string }>;
}

export class MockLLMProvider implements LLMProvider {
  async parseRule(input: string): Promise<RuleJSON | { error: string; needsClarification?: string }> {
    // Enhanced pattern matching for demo mode
    const lowerInput = input.toLowerCase();
    const originalInput = input.trim();
    
    // Enhanced pattern matching for schedule rules
    if (lowerInput.includes("send") && (lowerInput.includes("every") || lowerInput.includes("daily") || lowerInput.includes("weekly") || lowerInput.includes("monthly"))) {
      return this.parseScheduleRule(originalInput, lowerInput);
    }
    
    // Enhanced pattern matching for conditional rules
    if (lowerInput.includes("when") || lowerInput.includes("if")) {
      return this.parseConditionalRule(originalInput, lowerInput);
    }
    
    return {
      error: "Could not parse rule",
      needsClarification: "Please describe what you want to do, for example: 'Send $50 USDC to John every Friday' or 'Send €200 to 0x123... when EUR rises 2%'"
    };
  }

  private parseScheduleRule(input: string, lowerInput: string): RuleJSON | { error: string; needsClarification?: string } {
    // Extract amount and currency
    const amountMatch = input.match(/[\$€](\d+(?:\.\d{2})?)/);
    const euroMatch = input.match(/€(\d+)/);
    const asset = euroMatch || lowerInput.includes("eurc") ? "EURC" : "USDC";
    
    if (!amountMatch) {
      return {
        error: "Could not parse amount",
        needsClarification: "Please specify the amount clearly, e.g., '$50' or '€200'"
      };
    }

    // Extract recipient 
    const contactMatch = input.match(/to (\w+)/i);
    const addressMatch = input.match(/(0x[a-fA-F0-9]{40})/);
    
    if (!contactMatch && !addressMatch) {
      return {
        error: "Could not parse recipient",
        needsClarification: "Please specify who to send to, e.g., 'to John' or 'to 0x1234...'"
      };
    }

    // Parse schedule frequency
    let cron = "0 8 * * FRI"; // Default Friday 8am
    let tz = "America/New_York";
    
    if (lowerInput.includes("monday")) cron = "0 8 * * MON";
    else if (lowerInput.includes("tuesday")) cron = "0 8 * * TUE";
    else if (lowerInput.includes("wednesday")) cron = "0 8 * * WED";
    else if (lowerInput.includes("thursday")) cron = "0 8 * * THU";
    else if (lowerInput.includes("friday")) cron = "0 8 * * FRI";
    else if (lowerInput.includes("saturday")) cron = "0 8 * * SAT";
    else if (lowerInput.includes("sunday")) cron = "0 8 * * SUN";
    else if (lowerInput.includes("daily")) cron = "0 8 * * *";
    else if (lowerInput.includes("weekly")) cron = "0 8 * * MON";
    else if (lowerInput.includes("monthly")) cron = "0 8 1 * *";

    // Parse time if specified
    const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const meridiem = timeMatch[3].toLowerCase();
      
      if (meridiem === "pm" && hour !== 12) hour += 12;
      if (meridiem === "am" && hour === 12) hour = 0;
      
      cron = cron.replace(/^0/, minute.toString()).replace(/8/, hour.toString());
    }

    const amount = parseFloat(amountMatch[1]);
    
    // Generate user-friendly description
    const frequency = lowerInput.includes("daily") ? "daily" :
                     lowerInput.includes("weekly") ? "weekly" :
                     lowerInput.includes("monthly") ? "monthly" :
                     lowerInput.includes("monday") ? "every Monday" :
                     lowerInput.includes("tuesday") ? "every Tuesday" :
                     lowerInput.includes("wednesday") ? "every Wednesday" :
                     lowerInput.includes("thursday") ? "every Thursday" :
                     lowerInput.includes("friday") ? "every Friday" :
                     lowerInput.includes("saturday") ? "every Saturday" :
                     lowerInput.includes("sunday") ? "every Sunday" : "every Friday";
    
    const timeStr = timeMatch ? ` at ${timeMatch[1]}${timeMatch[2] ? ':' + timeMatch[2] : ''}${timeMatch[3]}` : " at 8:00am";
    const recipient = addressMatch ? `to ${addressMatch[1].slice(0, 6)}...${addressMatch[1].slice(-4)}` : `to ${contactMatch![1]}`;
    const description = `Send ${asset === "EURC" ? "€" : "$"}${amount} ${asset} ${recipient} ${frequency}${timeStr}`;
    
    return {
      type: "schedule",
      description,
      asset,
      amount: {
        type: "fixed",
        value: amount,
        currency: asset === "EURC" ? "EUR" : "USD",
      },
      destination: {
        type: addressMatch ? "address" : "contact",
        value: addressMatch ? addressMatch[1] : contactMatch![1],
      },
      schedule: { cron, tz },
      routing: {
        mode: "cheapest",
        allowedChains: ["base", "arbitrum", "polygon", "ethereum"],
      },
      limits: {
        dailyMaxUSD: Math.max(200, amount * 2),
        requireConfirmOverUSD: 500,
      },
    };
  }

  private parseConditionalRule(input: string, lowerInput: string): RuleJSON | { error: string; needsClarification?: string } {
    // Extract amount and currency
    const amountMatch = input.match(/[\$€](\d+(?:\.\d{2})?)/);
    const euroMatch = input.match(/€(\d+)/);
    
    if (!amountMatch) {
      return {
        error: "Could not parse amount",
        needsClarification: "Please specify the amount clearly, e.g., '$50' or '€200'"
      };
    }

    // Extract recipient
    const contactMatch = input.match(/to (\w+)/i);
    const addressMatch = input.match(/(0x[a-fA-F0-9]{40})/);
    
    if (!contactMatch && !addressMatch) {
      return {
        error: "Missing destination",
        needsClarification: "What destination address or contact should I send the funds to?"
      };
    }

    // Parse condition - for now only support EUR/USD
    if (!lowerInput.includes("eur")) {
      return {
        error: "Unsupported condition",
        needsClarification: "Currently only EUR/USD price conditions are supported. Try: 'when EUR rises 2%'"
      };
    }

    // Extract percentage change
    const percentMatch = input.match(/(\d+(?:\.\d+)?)%/);
    const magnitude = percentMatch ? parseFloat(percentMatch[1]) : 2;
    
    // Determine direction
    const isIncrease = lowerInput.includes("rise") || lowerInput.includes("up") || lowerInput.includes("strengthen") || lowerInput.includes("goes up") || lowerInput.includes("increase");
    const isDecrease = lowerInput.includes("fall") || lowerInput.includes("down") || lowerInput.includes("weaken") || lowerInput.includes("goes down") || lowerInput.includes("decrease");
    
    if (!isIncrease && !isDecrease) {
      return {
        error: "Could not parse condition direction",
        needsClarification: "Please specify if EUR should 'rise' or 'fall', e.g., 'when EUR rises 2%'"
      };
    }

    const amount = parseFloat(amountMatch[1]);
    const asset = euroMatch || lowerInput.includes("eurc") ? "EURC" : "USDC";
    
    // Generate user-friendly description
    const recipient = addressMatch ? `to ${addressMatch[1].slice(0, 6)}...${addressMatch[1].slice(-4)}` : `to ${contactMatch![1]}`;
    const direction = isIncrease ? "rises" : "falls";
    const description = `Send ${asset === "EURC" ? "€" : "$"}${amount} ${asset} ${recipient} when EUR ${direction} ${magnitude}%`;
    
    return {
      type: "conditional",
      description,
      asset,
      amount: {
        type: "fixed", 
        value: amount,
        currency: asset === "EURC" ? "EUR" : "USD",
      },
      destination: {
        type: addressMatch ? "address" : "contact",
        value: addressMatch ? addressMatch[1] : contactMatch![1],
      },
      condition: {
        metric: "EURUSD",
        change: isIncrease ? "+%" : "-%",
        magnitude,
        window: "24h",
      },
      routing: {
        mode: "cheapest",
        allowedChains: ["base", "arbitrum", "polygon", "ethereum"],
      },
      limits: {
        dailyMaxUSD: Math.max(1000, amount * 2),
        requireConfirmOverUSD: 500,
      },
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