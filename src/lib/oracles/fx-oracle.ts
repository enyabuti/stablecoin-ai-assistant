/**
 * Foreign Exchange (FX) Oracle
 * 
 * Provides real-time EUR/USD exchange rates with caching, 
 * circuit breaker protection, and fallback mechanisms.
 */

import { SafetyController } from '@/lib/safety';

export interface FXRate {
  pair: string;        // e.g., "EURUSD"
  rate: number;        // Exchange rate
  bid: number;         // Bid price
  ask: number;         // Ask price
  spread: number;      // Bid-ask spread
  change24h: number;   // 24h change %
  lastUpdated: Date;
  source: string;      // Data source
  confidence: number;  // 0-100%
}

export interface FXHistoricalData {
  pair: string;
  data: Array<{
    timestamp: Date;
    rate: number;
    high: number;
    low: number;
    volume?: number;
  }>;
  period: '1h' | '1d' | '1w' | '1m';
}

class FXOracleService {
  private cache = new Map<string, FXRate>();
  private readonly CACHE_DURATION = 60000; // 1 minute for FX data
  private readonly FALLBACK_RATES: Record<string, Omit<FXRate, 'lastUpdated'>> = {
    EURUSD: {
      pair: 'EURUSD',
      rate: 1.0850,
      bid: 1.0849,
      ask: 1.0851,
      spread: 0.0002,
      change24h: 0.15,
      source: 'fallback',
      confidence: 70
    },
    GBPUSD: {
      pair: 'GBPUSD',
      rate: 1.2650,
      bid: 1.2649,
      ask: 1.2651,
      spread: 0.0002,
      change24h: -0.08,
      source: 'fallback',
      confidence: 70
    },
    USDJPY: {
      pair: 'USDJPY',
      rate: 150.25,
      bid: 150.24,
      ask: 150.26,
      spread: 0.02,
      change24h: 0.45,
      source: 'fallback',
      confidence: 70
    }
  };

  /**
   * Get current FX rate for a currency pair
   */
  async getFXRate(pair: string): Promise<FXRate> {
    const normalizedPair = pair.toUpperCase();
    
    // Check cache first
    const cached = this.cache.get(normalizedPair);
    if (cached && Date.now() - cached.lastUpdated.getTime() < this.CACHE_DURATION) {
      return cached;
    }

    try {
      // Fetch real FX data with circuit breaker protection
      const fxRate = await SafetyController.executeWithProtection('FX_ORACLE',
        () => this.fetchFXRate(normalizedPair)
      );
      
      // Cache the result
      this.cache.set(normalizedPair, fxRate);
      return fxRate;
      
    } catch (error) {
      console.warn(`FX oracle failed for ${normalizedPair}, using fallback:`, error);
      
      // Return fallback rate
      const fallback = this.FALLBACK_RATES[normalizedPair];
      if (!fallback) {
        throw new Error(`No fallback rate available for ${normalizedPair}`);
      }
      
      const fallbackRate: FXRate = {
        ...fallback,
        lastUpdated: new Date()
      };
      
      // Cache fallback for short duration
      this.cache.set(normalizedPair, fallbackRate);
      return fallbackRate;
    }
  }

  /**
   * Get EUR/USD rate specifically (most common for EURC conversions)
   */
  async getEURUSD(): Promise<FXRate> {
    return this.getFXRate('EURUSD');
  }

  /**
   * Convert amount between currencies
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<{
    originalAmount: number;
    convertedAmount: number;
    rate: number;
    pair: string;
    confidence: number;
    timestamp: Date;
  }> {
    const pair = `${fromCurrency}${toCurrency}`.toUpperCase();
    
    try {
      const fxRate = await this.getFXRate(pair);
      
      return {
        originalAmount: amount,
        convertedAmount: amount * fxRate.rate,
        rate: fxRate.rate,
        pair: fxRate.pair,
        confidence: fxRate.confidence,
        timestamp: fxRate.lastUpdated
      };
    } catch (error) {
      // Try reverse pair
      const reversePair = `${toCurrency}${fromCurrency}`.toUpperCase();
      try {
        const reverseFxRate = await this.getFXRate(reversePair);
        const inverseRate = 1 / reverseFxRate.rate;
        
        return {
          originalAmount: amount,
          convertedAmount: amount * inverseRate,
          rate: inverseRate,
          pair: pair,
          confidence: reverseFxRate.confidence,
          timestamp: reverseFxRate.lastUpdated
        };
      } catch (reverseError) {
        throw new Error(`Unable to convert ${fromCurrency} to ${toCurrency}: ${error}`);
      }
    }
  }

  /**
   * Check if FX rate has moved significantly (for conditional rules)
   */
  async checkRateMovement(
    pair: string,
    thresholdPercent: number,
    timeWindow: number = 24 * 60 * 60 * 1000 // 24 hours in ms
  ): Promise<{
    currentRate: number;
    previousRate: number;
    changePercent: number;
    thresholdMet: boolean;
    direction: 'up' | 'down' | 'stable';
  }> {
    const currentFX = await this.getFXRate(pair);
    
    // In a real implementation, you'd fetch historical data
    // For now, use the 24h change from the current data
    const previousRate = currentFX.rate / (1 + currentFX.change24h / 100);
    const changePercent = currentFX.change24h;
    
    return {
      currentRate: currentFX.rate,
      previousRate,
      changePercent,
      thresholdMet: Math.abs(changePercent) >= thresholdPercent,
      direction: changePercent > 0.1 ? 'up' : changePercent < -0.1 ? 'down' : 'stable'
    };
  }

  /**
   * Get FX volatility indicator
   */
  async getVolatility(pair: string): Promise<{
    pair: string;
    volatility: number; // Standard deviation
    level: 'low' | 'medium' | 'high';
    confidence: number;
  }> {
    const fxRate = await this.getFXRate(pair);
    
    // Mock volatility calculation - in production, calculate from historical data
    const mockVolatility = Math.abs(fxRate.change24h) * 0.1 + Math.random() * 0.5;
    
    return {
      pair,
      volatility: mockVolatility,
      level: mockVolatility < 0.3 ? 'low' : mockVolatility < 0.7 ? 'medium' : 'high',
      confidence: fxRate.confidence
    };
  }

  /**
   * Fetch real FX data from external APIs
   */
  private async fetchFXRate(pair: string): Promise<FXRate> {
    // Mock implementation - in production, integrate with:
    // - Alpha Vantage FX API
    // - Fixer.io
    // - Currencylayer
    // - Open Exchange Rates
    // - Bank APIs (ECB, Fed, etc.)
    
    const fallback = this.FALLBACK_RATES[pair];
    if (!fallback) {
      throw new Error(`Unsupported currency pair: ${pair}`);
    }
    
    // Add realistic market movement
    const movement = (Math.random() - 0.5) * 0.002; // ±0.1% movement
    const newRate = fallback.rate * (1 + movement);
    
    return {
      pair,
      rate: Math.round(newRate * 10000) / 10000, // 4 decimal precision
      bid: newRate - 0.0001,
      ask: newRate + 0.0001,
      spread: 0.0002,
      change24h: movement * 100,
      source: 'mock-api',
      confidence: 85,
      lastUpdated: new Date()
    };
  }

  /**
   * Get multiple FX rates at once
   */
  async getMultipleRates(pairs: string[]): Promise<Record<string, FXRate>> {
    const results: Record<string, FXRate> = {};
    
    await Promise.allSettled(
      pairs.map(async (pair) => {
        try {
          results[pair.toUpperCase()] = await this.getFXRate(pair);
        } catch (error) {
          console.error(`Failed to get FX rate for ${pair}:`, error);
          
          // Try to provide fallback
          const fallback = this.FALLBACK_RATES[pair.toUpperCase()];
          if (fallback) {
            results[pair.toUpperCase()] = {
              ...fallback,
              lastUpdated: new Date()
            };
          }
        }
      })
    );
    
    return results;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache status
   */
  getCacheStatus(): {
    size: number;
    entries: Array<{ pair: string; age: number; valid: boolean }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([pair, fxRate]) => ({
      pair,
      age: now - fxRate.lastUpdated.getTime(),
      valid: now - fxRate.lastUpdated.getTime() < this.CACHE_DURATION
    }));
    
    return {
      size: this.cache.size,
      entries
    };
  }

  /**
   * Get supported currency pairs
   */
  getSupportedPairs(): string[] {
    return Object.keys(this.FALLBACK_RATES);
  }
}

export const FXOracle = new FXOracleService();