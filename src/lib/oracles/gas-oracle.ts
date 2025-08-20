/**
 * Gas Price Oracle
 * 
 * Provides real-time and cached gas price data across multiple chains
 * with fallback mechanisms and circuit breaker protection.
 */

import { SafetyController } from '@/lib/safety';
import type { Chain } from '@/lib/llm/schema';

export interface GasPrice {
  chain: Chain;
  slow: number;      // Gwei
  standard: number;  // Gwei  
  fast: number;      // Gwei
  instant: number;   // Gwei
  lastUpdated: Date;
  estimatedWaitTimes: {
    slow: number;      // minutes
    standard: number;  // minutes
    fast: number;      // minutes
    instant: number;   // minutes
  };
}

export interface GasEstimate {
  chain: Chain;
  gasPrice: number;     // Gwei
  gasLimit: number;     // Gas units
  totalCostETH: number; // ETH
  totalCostUSD: number; // USD
  confidence: number;   // 0-100%
  source: 'oracle' | 'fallback' | 'cache';
}

class GasOracleService {
  private cache = new Map<Chain, GasPrice>();
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private readonly FALLBACK_GAS_PRICES: Record<Chain, Omit<GasPrice, 'lastUpdated'>> = {
    ethereum: {
      chain: 'ethereum',
      slow: 15,
      standard: 20,
      fast: 30,
      instant: 50,
      estimatedWaitTimes: { slow: 10, standard: 5, fast: 2, instant: 1 }
    },
    base: {
      chain: 'base',
      slow: 0.01,
      standard: 0.02,
      fast: 0.05,
      instant: 0.1,
      estimatedWaitTimes: { slow: 5, standard: 2, fast: 1, instant: 1 }
    },
    arbitrum: {
      chain: 'arbitrum',
      slow: 0.1,
      standard: 0.2,
      fast: 0.5,
      instant: 1.0,
      estimatedWaitTimes: { slow: 2, standard: 1, fast: 1, instant: 1 }
    },
    polygon: {
      chain: 'polygon',
      slow: 30,
      standard: 50,
      fast: 100,
      instant: 150,
      estimatedWaitTimes: { slow: 3, standard: 2, fast: 1, instant: 1 }
    }
  };

  /**
   * Get current gas prices for a specific chain
   */
  async getGasPrice(chain: Chain): Promise<GasPrice> {
    // Check cache first
    const cached = this.cache.get(chain);
    if (cached && Date.now() - cached.lastUpdated.getTime() < this.CACHE_DURATION) {
      return cached;
    }

    try {
      // Try to fetch real gas prices with circuit breaker protection
      const gasPrice = await SafetyController.executeWithProtection('GAS_ORACLE', 
        () => this.fetchGasPrice(chain)
      );
      
      // Cache the result
      this.cache.set(chain, gasPrice);
      return gasPrice;
      
    } catch (error) {
      console.warn(`Gas oracle failed for ${chain}, using fallback:`, error);
      
      // Return fallback prices
      const fallback: GasPrice = {
        ...this.FALLBACK_GAS_PRICES[chain],
        lastUpdated: new Date()
      };
      
      // Cache fallback for short duration
      this.cache.set(chain, fallback);
      return fallback;
    }
  }

  /**
   * Get gas prices for all supported chains
   */
  async getAllGasPrices(): Promise<Record<Chain, GasPrice>> {
    const chains: Chain[] = ['ethereum', 'base', 'arbitrum', 'polygon'];
    const results: Record<string, GasPrice> = {};
    
    await Promise.allSettled(
      chains.map(async (chain) => {
        try {
          results[chain] = await this.getGasPrice(chain);
        } catch (error) {
          console.error(`Failed to get gas price for ${chain}:`, error);
          results[chain] = {
            ...this.FALLBACK_GAS_PRICES[chain],
            lastUpdated: new Date()
          };
        }
      })
    );
    
    return results as Record<Chain, GasPrice>;
  }

  /**
   * Estimate gas cost for a USDC transfer
   */
  async estimateTransferCost(
    chain: Chain, 
    speed: 'slow' | 'standard' | 'fast' | 'instant' = 'standard'
  ): Promise<GasEstimate> {
    const gasPrice = await this.getGasPrice(chain);
    
    // Typical gas limits for USDC transfers
    const gasLimits: Record<Chain, number> = {
      ethereum: 65000,  // ERC-20 transfer
      base: 21000,      // Lower L2 costs
      arbitrum: 150000, // Arbitrum specific
      polygon: 50000    // Polygon USDC
    };
    
    const gasLimit = gasLimits[chain];
    const gasPriceGwei = gasPrice[speed];
    
    // Convert to ETH (1 ETH = 1e9 Gwei = 1e18 Wei)
    const totalCostETH = (gasPriceGwei * gasLimit) / 1e9;
    
    // Estimate USD cost (mock ETH price - in production, use price oracle)
    const ethPriceUSD = await this.getETHPrice();
    const totalCostUSD = totalCostETH * ethPriceUSD;
    
    return {
      chain,
      gasPrice: gasPriceGwei,
      gasLimit,
      totalCostETH,
      totalCostUSD,
      confidence: SafetyController.isServiceHealthy('GAS_ORACLE') ? 95 : 70,
      source: SafetyController.isServiceHealthy('GAS_ORACLE') ? 'oracle' : 'fallback'
    };
  }

  /**
   * Get the most cost-effective chain for a transfer
   */
  async getCheapestChain(excludeChains: Chain[] = []): Promise<{
    chain: Chain;
    estimate: GasEstimate;
    savings?: number; // USD savings vs most expensive
  }> {
    const allPrices = await this.getAllGasPrices();
    const estimates: Array<{ chain: Chain; estimate: GasEstimate }> = [];
    
    for (const [chain, gasPrice] of Object.entries(allPrices)) {
      if (excludeChains.includes(chain as Chain)) continue;
      
      const estimate = await this.estimateTransferCost(chain as Chain);
      estimates.push({ chain: chain as Chain, estimate });
    }
    
    // Sort by USD cost
    estimates.sort((a, b) => a.estimate.totalCostUSD - b.estimate.totalCostUSD);
    
    const cheapest = estimates[0];
    const mostExpensive = estimates[estimates.length - 1];
    const savings = mostExpensive.estimate.totalCostUSD - cheapest.estimate.totalCostUSD;
    
    return {
      ...cheapest,
      savings: savings > 0.01 ? savings : undefined // Only show significant savings
    };
  }

  /**
   * Mock ETH price fetch - in production, integrate with price oracle
   */
  private async getETHPrice(): Promise<number> {
    // Mock ETH price - in production, fetch from Coingecko, Chainlink, etc.
    return 2000; // $2000 USD
  }

  /**
   * Fetch real gas prices from chain APIs
   */
  private async fetchGasPrice(chain: Chain): Promise<GasPrice> {
    // Mock implementation - in production, integrate with:
    // - Etherscan Gas Tracker
    // - Alchemy Gas API
    // - QuickNode Gas API
    // - Chain-specific gas stations
    
    const basePrice = this.FALLBACK_GAS_PRICES[chain];
    
    // Add some realistic variation
    const variation = 0.8 + Math.random() * 0.4; // ±20% variation
    
    return {
      chain,
      slow: Math.round(basePrice.slow * variation * 100) / 100,
      standard: Math.round(basePrice.standard * variation * 100) / 100,
      fast: Math.round(basePrice.fast * variation * 100) / 100,
      instant: Math.round(basePrice.instant * variation * 100) / 100,
      estimatedWaitTimes: basePrice.estimatedWaitTimes,
      lastUpdated: new Date()
    };
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache status
   */
  getCacheStatus(): {
    size: number;
    entries: Array<{ chain: Chain; age: number; valid: boolean }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([chain, gasPrice]) => ({
      chain,
      age: now - gasPrice.lastUpdated.getTime(),
      valid: now - gasPrice.lastUpdated.getTime() < this.CACHE_DURATION
    }));
    
    return {
      size: this.cache.size,
      entries
    };
  }
}

export const GasOracle = new GasOracleService();