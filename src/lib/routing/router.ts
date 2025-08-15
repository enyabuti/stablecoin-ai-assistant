import { Chain, RuleJSONT } from '../llm/schema';

export interface Quote {
  chain: Chain;
  feeUsd: number;
  feeEstimateUsd: number;
  feePercentage?: number;
  etaSeconds: number;
  breakdown: {
    gasUsd: number;
    bridgeUsd: number;
  };
  savingsVsEthL1Usd: number;
  usesCCTP?: boolean;
  recommended?: boolean;
  isHighFee?: boolean;
  explanation: string;
}

interface FeatureFlags {
  ENABLE_CCTP: boolean;
  USE_MOCKS: boolean;
}

// Base gas costs per chain (deterministic mock data)
const chainGasCosts = {
  ethereum: { baseGasUsd: 15.0, speedMultiplier: 1.0, etaSeconds: 300 },
  base: { baseGasUsd: 0.05, speedMultiplier: 0.2, etaSeconds: 30 },
  arbitrum: { baseGasUsd: 0.8, speedMultiplier: 0.3, etaSeconds: 45 },
  polygon: { baseGasUsd: 0.03, speedMultiplier: 0.4, etaSeconds: 60 }
};

// CCTP bridge costs (when enabled)
const cctpCosts = {
  ethereum: 2.0,
  base: 0.1,
  arbitrum: 0.3,
  polygon: 0.15
};

export function quoteCheapest(rule: RuleJSONT, flags: FeatureFlags): Quote {
  const routing = rule.routing || { mode: 'cheapest', allowedChains: ['base', 'arbitrum', 'polygon'] as Chain[] };
  const { allowedChains, mode } = routing;
  
  // Handle both string and object amount formats
  const amount = typeof rule.amount === 'string' 
    ? parseFloat(rule.amount) 
    : rule.amount.value;
  
  const quotes: Quote[] = allowedChains.map(chain => {
    const chainCost = chainGasCosts[chain];
    let gasUsd = chainCost.baseGasUsd;
    let bridgeUsd = 0;
    let usesCCTP = false;
    
    // Apply amount-based scaling (higher amounts = slightly higher gas)
    gasUsd *= Math.max(1, Math.log10(amount / 10));
    
    // Add CCTP costs if enabled and beneficial
    if (flags.ENABLE_CCTP && amount > 100) {
      bridgeUsd = cctpCosts[chain];
      usesCCTP = true;
    }
    
    const totalFeeUsd = gasUsd + bridgeUsd;
    const ethL1Cost = chainGasCosts.ethereum.baseGasUsd * Math.max(1, Math.log10(amount / 10));
    const savingsVsEthL1Usd = Math.max(0, ethL1Cost - totalFeeUsd);
    
    const feePercentage = amount > 0 ? (totalFeeUsd / amount) * 100 : 0;
    const isHighFee = feePercentage > 1; // Consider high if > 1% of amount
    
    // Generate explanation
    const explanation = usesCCTP 
      ? `${chain.charAt(0).toUpperCase() + chain.slice(1)} with CCTP for fast settlement`
      : `${chain.charAt(0).toUpperCase() + chain.slice(1)} offers ${isHighFee ? 'higher' : 'competitive'} fees for this amount`;
    
    return {
      chain,
      feeUsd: Number(totalFeeUsd.toFixed(3)),
      feeEstimateUsd: Number(totalFeeUsd.toFixed(3)),
      feePercentage: Number(feePercentage.toFixed(2)),
      etaSeconds: chainCost.etaSeconds,
      breakdown: {
        gasUsd: Number(gasUsd.toFixed(3)),
        bridgeUsd: Number(bridgeUsd.toFixed(3))
      },
      savingsVsEthL1Usd: Number(savingsVsEthL1Usd.toFixed(2)),
      usesCCTP,
      recommended: false,
      isHighFee,
      explanation
    };
  });
  
  // Sort by criteria based on mode
  let sortedQuotes: Quote[];
  switch (mode) {
    case 'fastest':
      sortedQuotes = quotes.sort((a, b) => a.etaSeconds - b.etaSeconds);
      break;
    case 'cheapest':
    default:
      sortedQuotes = quotes.sort((a, b) => a.feeUsd - b.feeUsd);
      break;
  }
  
  // Mark the best option as recommended
  if (sortedQuotes.length > 0) {
    sortedQuotes[0].recommended = true;
  }
  
  return sortedQuotes[0];
}

export function getAllQuotes(rule: RuleJSONT, flags: FeatureFlags): Quote[] {
  const routing = rule.routing || { mode: 'cheapest', allowedChains: ['base', 'arbitrum', 'polygon'] as Chain[] };
  const { allowedChains } = routing;
  
  // Handle both string and object amount formats
  const amount = typeof rule.amount === 'string' 
    ? parseFloat(rule.amount) 
    : rule.amount.value;
  
  const quotes: Quote[] = allowedChains.map(chain => {
    const chainCost = chainGasCosts[chain];
    let gasUsd = chainCost.baseGasUsd;
    let bridgeUsd = 0;
    let usesCCTP = false;
    
    // Apply amount-based scaling (higher amounts = slightly higher gas)
    gasUsd *= Math.max(1, Math.log10(amount / 10));
    
    // Add CCTP costs if enabled and beneficial
    if (flags.ENABLE_CCTP && amount > 100) {
      bridgeUsd = cctpCosts[chain];
      usesCCTP = true;
    }
    
    const totalFeeUsd = gasUsd + bridgeUsd;
    const ethL1Cost = chainGasCosts.ethereum.baseGasUsd * Math.max(1, Math.log10(amount / 10));
    const savingsVsEthL1Usd = Math.max(0, ethL1Cost - totalFeeUsd);
    
    const feePercentage = amount > 0 ? (totalFeeUsd / amount) * 100 : 0;
    const isHighFee = feePercentage > 1; // Consider high if > 1% of amount
    
    // Generate explanation
    const explanation = usesCCTP 
      ? `${chain.charAt(0).toUpperCase() + chain.slice(1)} with CCTP for fast settlement`
      : `${chain.charAt(0).toUpperCase() + chain.slice(1)} offers ${isHighFee ? 'higher' : 'competitive'} fees for this amount`;
    
    return {
      chain,
      feeUsd: Number(totalFeeUsd.toFixed(3)),
      feeEstimateUsd: Number(totalFeeUsd.toFixed(3)),
      feePercentage: Number(feePercentage.toFixed(2)),
      etaSeconds: chainCost.etaSeconds,
      breakdown: {
        gasUsd: Number(gasUsd.toFixed(3)),
        bridgeUsd: Number(bridgeUsd.toFixed(3))
      },
      savingsVsEthL1Usd: Number(savingsVsEthL1Usd.toFixed(2)),
      usesCCTP,
      recommended: false,
      isHighFee,
      explanation
    };
  });
  
  // Sort by fee
  const sortedQuotes = quotes.sort((a, b) => a.feeUsd - b.feeUsd);
  
  // Mark the best option as recommended
  if (sortedQuotes.length > 0) {
    sortedQuotes[0].recommended = true;
  }
  
  return sortedQuotes;
}