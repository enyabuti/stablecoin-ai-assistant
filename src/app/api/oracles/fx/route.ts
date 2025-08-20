/**
 * Foreign Exchange (FX) Oracle API
 * 
 * Provides FX rates and currency conversion services.
 */

import { NextRequest, NextResponse } from 'next/server';
import { FXOracle } from '@/lib/oracles';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pair = url.searchParams.get('pair');
    const action = url.searchParams.get('action');

    // Get specific FX rate
    if (pair && !action) {
      const fxRate = await FXOracle.getFXRate(pair);
      return NextResponse.json(fxRate);
    }

    // Get EUR/USD rate specifically
    if (action === 'eurusd') {
      const eurusd = await FXOracle.getEURUSD();
      return NextResponse.json(eurusd);
    }

    // Convert currency
    if (action === 'convert') {
      const amount = parseFloat(url.searchParams.get('amount') || '1');
      const from = url.searchParams.get('from') || 'EUR';
      const to = url.searchParams.get('to') || 'USD';
      
      const conversion = await FXOracle.convertCurrency(amount, from, to);
      return NextResponse.json(conversion);
    }

    // Check rate movement
    if (action === 'movement') {
      const threshold = parseFloat(url.searchParams.get('threshold') || '2');
      const timeWindow = parseInt(url.searchParams.get('timeWindow') || '86400000'); // 24h
      
      if (!pair) {
        return NextResponse.json(
          { error: 'Pair parameter required for movement check' },
          { status: 400 }
        );
      }
      
      const movement = await FXOracle.checkRateMovement(pair, threshold, timeWindow);
      return NextResponse.json(movement);
    }

    // Get volatility
    if (action === 'volatility') {
      if (!pair) {
        return NextResponse.json(
          { error: 'Pair parameter required for volatility check' },
          { status: 400 }
        );
      }
      
      const volatility = await FXOracle.getVolatility(pair);
      return NextResponse.json(volatility);
    }

    // Get supported pairs
    if (action === 'pairs') {
      const pairs = FXOracle.getSupportedPairs();
      return NextResponse.json({ pairs });
    }

    // Get multiple rates (default)
    const pairs = url.searchParams.get('pairs')?.split(',') || ['EURUSD', 'GBPUSD', 'USDJPY'];
    const rates = await FXOracle.getMultipleRates(pairs);
    return NextResponse.json(rates);

  } catch (error) {
    console.error('FX Oracle API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch FX data',
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
        FXOracle.clearCache();
        return NextResponse.json({ success: true, message: 'FX cache cleared' });

      case 'cache-status':
        const status = FXOracle.getCacheStatus();
        return NextResponse.json(status);

      case 'batch-convert':
        const { conversions } = body;
        const results = await Promise.all(
          conversions.map(async (conv: any) => ({
            ...conv,
            result: await FXOracle.convertCurrency(conv.amount, conv.from, conv.to)
          }))
        );
        return NextResponse.json({ conversions: results });

      case 'batch-movement':
        const { pairs, threshold = 2, timeWindow = 86400000 } = body;
        const movements = await Promise.all(
          pairs.map(async (pair: string) => ({
            pair,
            movement: await FXOracle.checkRateMovement(pair, threshold, timeWindow)
          }))
        );
        return NextResponse.json({ movements });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('FX Oracle API POST error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to process FX oracle request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}