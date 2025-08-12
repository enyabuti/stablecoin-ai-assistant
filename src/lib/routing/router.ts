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
    const { routing, asset } = rule;
    const estimates = await Promise.all(
      routing.allowedChains.map(chain => 
        this.gasOracle.estimateGas(chain, asset)
      )
    );
    
    const quotes = estimates.map(estimate => ({
      chain: estimate.chain,
      feeEstimateUsd: estimate.feeUSD,
      etaSeconds: estimate.etaSeconds,
      explanation: estimate.explanation,
      recommended: false,
    }));
    
    // Sort by routing preference
    if (routing.mode === "cheapest") {
      quotes.sort((a, b) => a.feeEstimateUsd - b.feeEstimateUsd);
    } else if (routing.mode === "fastest") {
      quotes.sort((a, b) => a.etaSeconds - b.etaSeconds);
    }
    
    // Mark the best option as recommended
    if (quotes.length > 0) {
      quotes[0].recommended = true;
    }
    
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
}

export function createRouter(): Router {
  return new MockRouter();
}