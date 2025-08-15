import type { Chain } from "@/lib/llm/schema";

interface GasEstimate {
  chain: Chain;
  feeUSD: number;
  etaSeconds: number;
  explanation: string;
}
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

  private readonly networkUtilization = {
    ethereum: 0.85,  // Usually high utilization
    base: 0.45,      // Medium utilization
    arbitrum: 0.55,  // Medium utilization  
    polygon: 0.65,   // Medium-high utilization
  } as const;
  
  async estimateGas(chain: Chain, asset: "USDC" | "EURC"): Promise<GasEstimate> {
    // Get base fee and apply realistic factors
    const baseFee = this.baseFees[chain];
    const congestionMultiplier = await getCurrentGasMultiplier();
    const utilization = this.networkUtilization[chain];
    
    // Apply network utilization and congestion
    const utilizationMultiplier = 1 + (utilization * 0.5); // Up to 50% increase based on utilization
    const randomVariance = 0.9 + Math.random() * 0.2; // ±10% random variance
    
    const feeUSD = Number((baseFee * congestionMultiplier * utilizationMultiplier * randomVariance).toFixed(3));
    
    const chainConfig = getChainConfig(chain);
    
    // Calculate ETA based on network congestion and utilization
    const baseEta = chainConfig.blockTime * 3; // ~3 block confirmations
    const congestionDelay = congestionMultiplier > 1.5 ? baseEta * 0.5 : 0; // Additional delay if congested
    const etaSeconds = Math.max(Math.round(baseEta + congestionDelay), 1);
    
    const explanation = this.generateExplanation(chain, feeUSD, etaSeconds, asset, utilization, congestionMultiplier > 1.2);
    
    return {
      chain,
      feeUSD,
      etaSeconds,
      explanation,
    };
  }
  
  private generateExplanation(chain: Chain, feeUSD: number, etaSeconds: number, asset: string, utilization: number, isCongested: boolean): string {
    const config = getChainConfig(chain);
    const timeStr = etaSeconds < 60 ? `${etaSeconds}s` : `${Math.round(etaSeconds / 60)}min`;
    const utilizationText = utilization > 0.8 ? "High network activity" : utilization > 0.6 ? "Moderate activity" : "Low activity";
    const congestionText = isCongested ? " (congested)" : "";
    
    if (chain === "ethereum") {
      return `${config.name}: $${feeUSD} fee${congestionText}. Most secure option. ${utilizationText}. ETA: ${timeStr}`;
    }
    
    if (chain === "base") {
      return `${config.name}: $${feeUSD} fee on Coinbase L2${congestionText}. Excellent for USDC. ${utilizationText}. ETA: ${timeStr}`;
    }
    
    if (chain === "arbitrum") {
      return `${config.name}: $${feeUSD} fee with optimistic rollup${congestionText}. Fast & cheap. ${utilizationText}. ETA: ${timeStr}`;
    }
    
    if (chain === "polygon") {
      return `${config.name}: $${feeUSD} fee on PoS sidechain${congestionText}. Good DeFi ecosystem. ${utilizationText}. ETA: ${timeStr}`;
    }
    
    return `${config.name}: $${feeUSD} fee, ETA ${timeStr}${congestionText}`;
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