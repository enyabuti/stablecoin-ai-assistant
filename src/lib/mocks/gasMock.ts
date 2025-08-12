import type { Chain, GasEstimate } from "@/lib/llm/schema";
import { getChainConfig } from "@/lib/routing/chains";

export interface GasOracle {
  estimateGas(chain: Chain, asset: "USDC" | "EURC"): Promise<GasEstimate>;
}

export class MockGasOracle implements GasOracle {
  private readonly baseFees = {
    ethereum: 15.0,
    base: 0.05,
    arbitrum: 0.5,
    polygon: 0.1,
  } as const;
  
  async estimateGas(chain: Chain, asset: "USDC" | "EURC"): Promise<GasEstimate> {
    // Add some randomness to make it feel realistic
    const baseFee = this.baseFees[chain];
    const randomMultiplier = 0.8 + Math.random() * 0.4; // ±20% variance
    const feeUSD = Number((baseFee * randomMultiplier).toFixed(3));
    
    const chainConfig = getChainConfig(chain);
    const baseEta = Math.round(chainConfig.blockTime * 3); // ~3 block confirmations
    const etaSeconds = Math.max(baseEta, 1);
    
    const explanation = this.generateExplanation(chain, feeUSD, etaSeconds, asset);
    
    return {
      chain,
      feeUSD,
      etaSeconds,
      explanation,
    };
  }
  
  private generateExplanation(chain: Chain, feeUSD: number, etaSeconds: number, asset: string): string {
    const config = getChainConfig(chain);
    const minutes = Math.round(etaSeconds / 60);
    
    if (chain === "ethereum") {
      return `${config.name}: Higher gas fees (~$${feeUSD}) but most secure. ${asset} transfer takes ~${minutes}min.`;
    }
    
    if (chain === "base") {
      return `${config.name}: Very low fees (~$${feeUSD}) on Coinbase L2. ${asset} transfer takes ~${etaSeconds}s.`;
    }
    
    if (chain === "arbitrum") {
      return `${config.name}: Low fees (~$${feeUSD}) with fast finality. ${asset} transfer takes ~${etaSeconds}s.`;
    }
    
    if (chain === "polygon") {
      return `${config.name}: Low fees (~$${feeUSD}) with good ecosystem. ${asset} transfer takes ~${etaSeconds}s.`;
    }
    
    return `${config.name}: Fee ~$${feeUSD}, ETA ~${etaSeconds}s`;
  }
}

// Mock for network congestion and dynamic pricing
export async function getCurrentGasMultiplier(): Promise<number> {
  // Simulate network congestion (1.0 = normal, 2.0 = high congestion)
  const hour = new Date().getHours();
  if (hour >= 14 && hour <= 20) {
    // US business hours = higher congestion
    return 1.2 + Math.random() * 0.8;
  }
  return 0.8 + Math.random() * 0.4;
}