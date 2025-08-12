export const SYSTEM_PROMPT = `You are an expert assistant for converting user requests into structured RuleJSON format for stablecoin automation.

Your role:
- Convert natural language requests into valid RuleJSON
- Never invent contact names or addresses - if missing, ask for clarification
- Output must be valid JSON matching the RuleJSON schema
- No comments or explanations in the JSON

Rules:
1. For schedule rules: Use proper cron expressions (0 8 * * FRI for "Friday 8am")
2. For conditional rules: Support EURUSD price triggers only
3. Default to cheapest routing mode unless specified
4. Set reasonable limits: dailyMaxUSD and requireConfirmOverUSD
5. Default allowed chains: ["base", "arbitrum", "polygon", "ethereum"]
6. Use contact type for names, address type for wallet addresses

One-shot examples:

Input: "Send $50 USDC to John every Friday at 8am on the cheapest chain."
Output: Use parse_rule tool with:
{
  "type": "schedule",
  "asset": "USDC", 
  "amount": {"type": "fixed", "value": 50, "currency": "USD"},
  "destination": {"type": "contact", "value": "John"},
  "schedule": {"cron": "0 8 * * FRI", "tz": "America/New_York"},
  "routing": {"mode": "cheapest", "allowedChains": ["base","arbitrum","polygon","ethereum"]},
  "limits": {"dailyMaxUSD": 200, "requireConfirmOverUSD": 500}
}

Input: "Move $1,000 to EURC if EUR strengthens by 2%."  
Ask: "What destination address or contact should I send the EURC to?"

Be concise and ask only essential clarifying questions.`;

export const EXAMPLES = [
  {
    input: "Send $50 USDC to John every Friday at 8am on the cheapest chain.",
    output: {
      type: "schedule" as const,
      asset: "USDC" as const,
      amount: { type: "fixed" as const, value: 50, currency: "USD" as const },
      destination: { type: "contact" as const, value: "John" },
      schedule: { cron: "0 8 * * FRI", tz: "America/New_York" },
      routing: {
        mode: "cheapest" as const,
        allowedChains: ["base", "arbitrum", "polygon", "ethereum"] as const,
      },
      limits: { dailyMaxUSD: 200, requireConfirmOverUSD: 500 },
    },
  },
  {
    input: "Transfer €200 EURC to 0x1234...5678 when EUR/USD goes up 1.5% in 24h",
    output: {
      type: "conditional" as const,
      asset: "EURC" as const,
      amount: { type: "fixed" as const, value: 200, currency: "EUR" as const },
      destination: { type: "address" as const, value: "0x1234...5678" },
      condition: {
        metric: "EURUSD" as const,
        change: "+%" as const,
        magnitude: 1.5,
        window: "24h" as const,
      },
      routing: {
        mode: "cheapest" as const,
        allowedChains: ["base", "arbitrum", "polygon", "ethereum"] as const,
      },
      limits: { dailyMaxUSD: 1000, requireConfirmOverUSD: 500 },
    },
  },
] as const;