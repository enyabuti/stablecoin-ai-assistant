import type { Chain, RuleJSON, RouteQuote } from "@/lib/llm/schema";
import type { GasOracle } from "@/lib/mocks/gasMock";
import { MockGasOracle } from "@/lib/mocks/gasMock";

export interface Router {
  getRouteQuotes(rule: RuleJSON): Promise<RouteQuote[]>;
  getBestRoute(rule: RuleJSON): Promise<RouteQuote>;
}

export class MockRouter implements Router {
  constructor(private gasOracle: GasOracle = new MockGasOracle()) {}
  
  async getRouteQuotes(rule: RuleJSON): Promise<RouteQuote[]> {
    const { routing, asset, amount } = rule;
    const estimates = await Promise.all(
      routing.allowedChains.map(chain => 
        this.gasOracle.estimateGas(chain, asset)
      )
    );
    
    const quotes = estimates.map(estimate => {
      // Calculate fee percentage relative to transfer amount
      const feePercentage = (estimate.feeUSD / amount.value) * 100;
      const isHighFee = feePercentage > 2; // Flag fees over 2% of transfer amount
      
      return {
        chain: estimate.chain,
        feeEstimateUsd: estimate.feeUSD,
        etaSeconds: estimate.etaSeconds,
        explanation: estimate.explanation,
        recommended: false,
        feePercentage: Number(feePercentage.toFixed(2)),
        isHighFee,
      };
    });
    
    // Enhanced sorting and recommendation logic
    if (routing.mode === "cheapest") {
      quotes.sort((a, b) => a.feeEstimateUsd - b.feeEstimateUsd);
    } else if (routing.mode === "fastest") {
      quotes.sort((a, b) => a.etaSeconds - b.etaSeconds);
    } else if (routing.mode === "fixed") {
      // Keep original order for fixed routing
    }
    
    // Intelligent recommendation logic
    this.applyRecommendations(quotes, amount.value);
    
    return quotes;
  }
  
  async getBestRoute(rule: RuleJSON): Promise<RouteQuote> {
    const quotes = await this.getRouteQuotes(rule);
    const best = quotes.find(q => q.recommended) || quotes[0];
    
    if (!best) {
      throw new Error("No valid routes found");
    }
    
    return best;
  }

  private applyRecommendations(quotes: RouteQuote[], transferAmount: number): void {
    if (quotes.length === 0) return;

    // For small amounts (<$50), prioritize cheapest option
    if (transferAmount < 50) {
      const cheapest = quotes.reduce((min, quote) => 
        quote.feeEstimateUsd < min.feeEstimateUsd ? quote : min
      );
      cheapest.recommended = true;
      return;
    }

    // For medium amounts ($50-$500), balance cost and speed
    if (transferAmount <= 500) {
      // Find quotes with reasonable fees (< 1% of transfer)
      const reasonableFees = quotes.filter(q => (q.feePercentage || 0) < 1);
      
      if (reasonableFees.length > 0) {
        // Among reasonable fees, pick fastest
        const fastest = reasonableFees.reduce((min, quote) => 
          quote.etaSeconds < min.etaSeconds ? quote : min
        );
        fastest.recommended = true;
      } else {
        // If all fees are high, pick cheapest
        quotes[0].recommended = true;
      }
      return;
    }

    // For large amounts (>$500), prioritize security and reasonable speed
    // Prefer Ethereum for security, but warn about high fees
    const ethereum = quotes.find(q => q.chain === "ethereum");
    const cheapAlternatives = quotes.filter(q => 
      q.chain !== "ethereum" && (q.feePercentage || 0) < 0.5
    );

    if (ethereum && (ethereum.feePercentage || 0) < 2) {
      // If Ethereum fee is reasonable, recommend it for security
      ethereum.recommended = true;
    } else if (cheapAlternatives.length > 0) {
      // Otherwise recommend fastest cheap alternative
      const fastest = cheapAlternatives.reduce((min, quote) => 
        quote.etaSeconds < min.etaSeconds ? quote : min
      );
      fastest.recommended = true;
    } else {
      // Fallback to cheapest option
      quotes[0].recommended = true;
    }
  }
}

export function createRouter(): Router {
  return new MockRouter();
}