/**
 * Gas Oracle API
 * 
 * Provides gas price data and estimates for transfer cost calculations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GasOracle } from '@/lib/oracles';
import type { Chain } from '@/lib/llm/schema';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const chain = url.searchParams.get('chain') as Chain | null;
    const speed = url.searchParams.get('speed') as 'slow' | 'standard' | 'fast' | 'instant' | null;
    const action = url.searchParams.get('action');

    // Get gas prices for specific chain
    if (chain && !action) {
      const gasPrice = await GasOracle.getGasPrice(chain);
      return NextResponse.json(gasPrice);
    }

    // Get transfer cost estimate
    if (action === 'estimate' && chain) {
      const estimate = await GasOracle.estimateTransferCost(chain, speed || 'standard');
      return NextResponse.json(estimate);
    }

    // Get cheapest chain
    if (action === 'cheapest') {
      const excludeChains = url.searchParams.get('exclude')?.split(',') as Chain[] | undefined;
      const result = await GasOracle.getCheapestChain(excludeChains);
      return NextResponse.json(result);
    }

    // Get all gas prices (default)
    const allPrices = await GasOracle.getAllGasPrices();
    return NextResponse.json(allPrices);

  } catch (error) {
    console.error('Gas Oracle API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch gas data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'clear-cache':
        GasOracle.clearCache();
        return NextResponse.json({ success: true, message: 'Cache cleared' });

      case 'cache-status':
        const status = GasOracle.getCacheStatus();
        return NextResponse.json(status);

      case 'batch-estimate':
        const { chains, speed = 'standard' } = body;
        const estimates = await Promise.all(
          chains.map(async (chain: Chain) => ({
            chain,
            estimate: await GasOracle.estimateTransferCost(chain, speed)
          }))
        );
        return NextResponse.json({ estimates });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Gas Oracle API POST error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to process gas oracle request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}