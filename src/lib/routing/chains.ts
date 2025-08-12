import type { Chain } from "@/lib/llm/schema";

export const CHAIN_CONFIG = {
  ethereum: {
    name: "Ethereum",
    shortName: "ETH",
    chainId: 1,
    blockTime: 12,
    color: "#627EEA",
    icon: "⟠",
    explorerUrl: "https://etherscan.io",
  },
  base: {
    name: "Base",
    shortName: "BASE", 
    chainId: 8453,
    blockTime: 2,
    color: "#0052FF",
    icon: "🔵",
    explorerUrl: "https://basescan.org",
  },
  arbitrum: {
    name: "Arbitrum One",
    shortName: "ARB",
    chainId: 42161,
    blockTime: 0.3,
    color: "#28A0F0",
    icon: "🔷",
    explorerUrl: "https://arbiscan.io",
  },
  polygon: {
    name: "Polygon",
    shortName: "MATIC",
    chainId: 137,
    blockTime: 2,
    color: "#8247E5", 
    icon: "🟣",
    explorerUrl: "https://polygonscan.com",
  },
} as const satisfies Record<Chain, any>;

export function getChainConfig(chain: Chain) {
  return CHAIN_CONFIG[chain];
}

export function getAllChains(): Chain[] {
  return Object.keys(CHAIN_CONFIG) as Chain[];
}