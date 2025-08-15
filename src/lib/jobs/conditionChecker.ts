import { db } from "@/lib/db";
import { addExecuteRuleJob } from "./queue";
import { nanoid } from "nanoid";
import type { RuleJSON } from "@/lib/llm/schema";

export interface ConditionState {
  metric: string;
  currentValue: number;
  previousValue: number;
  changePercent: number;
  timestamp: Date;
}

export interface FXRate {
  pair: string;
  rate: number;
  timestamp: Date;
  source: string;
}

export class ConditionChecker {
  private conditionStates = new Map<string, ConditionState>();
  private lastFxRates = new Map<string, FXRate>();

  async checkAllConditions(): Promise<{
    rulesChecked: number;
    triggered: string[];
    conditions: ConditionState[];
  }> {
    const now = new Date();
    
    // Get all active conditional rules
    const conditionalRules = await db.rule.findMany({
      where: {
        status: "ACTIVE",
        type: "conditional",
      },
    });

    const triggered: string[] = [];
    const conditions: ConditionState[] = [];

    // Update FX rates first
    await this.updateFxRates();

    for (const rule of conditionalRules) {
      const ruleJson = rule.json as RuleJSON;
      
      if (!ruleJson.condition) continue;

      try {
        const conditionMet = await this.checkCondition(ruleJson.condition, rule.id);
        
        if (conditionMet) {
          // Prevent duplicate triggers by checking recent executions
          const recentExecution = await this.hasRecentExecution(rule.id, 300); // 5 minutes
          
          if (!recentExecution) {
            const idempotencyKey = `cond-${rule.id}-${now.getTime()}-${nanoid(8)}`;
            
            await addExecuteRuleJob({
              ruleId: rule.id,
              userId: rule.userId,
              idempotencyKey,
              triggeredBy: "condition",
            });
            
            triggered.push(rule.id);
            
            console.log(`Condition triggered for rule ${rule.id}: ${ruleJson.condition.metric} ${ruleJson.condition.change} ${ruleJson.condition.magnitude}%`);
          } else {
            console.log(`Rule ${rule.id} condition met but skipping due to recent execution`);
          }
        }

        // Store condition state for monitoring
        const stateKey = `${rule.id}-${ruleJson.condition.metric}`;
        const state = this.conditionStates.get(stateKey);
        if (state) {
          conditions.push(state);
        }
        
      } catch (error) {
        console.error(`Error checking condition for rule ${rule.id}:`, error);
      }
    }

    return {
      rulesChecked: conditionalRules.length,
      triggered,
      conditions,
    };
  }

  private async checkCondition(condition: RuleJSON["condition"], ruleId: string): Promise<boolean> {
    if (!condition) return false;

    const stateKey = `${ruleId}-${condition.metric}`;
    
    if (condition.metric === "EURUSD") {
      const currentRate = this.getFxRate("EURUSD");
      const previousRate = this.getPreviousRate("EURUSD", condition.window || "24h");
      
      if (!currentRate || !previousRate) {
        console.warn(`Missing FX data for ${condition.metric}`);
        return false;
      }

      const changePercent = ((currentRate - previousRate) / previousRate) * 100;
      
      // Store condition state
      this.conditionStates.set(stateKey, {
        metric: condition.metric,
        currentValue: currentRate,
        previousValue: previousRate,
        changePercent,
        timestamp: new Date(),
      });

      // Check if condition is met
      if (condition.change === "+%" && condition.magnitude && changePercent >= condition.magnitude) {
        return true;
      }
      
      if (condition.change === "-%" && condition.magnitude && changePercent <= -condition.magnitude) {
        return true;
      }
    }

    return false;
  }

  private async updateFxRates(): Promise<void> {
    // In a real implementation, this would fetch from a real FX API
    // For demo, we'll simulate realistic EUR/USD movements
    const now = new Date();
    const baseRate = 1.0500;
    
    // Simulate intraday volatility with some persistence
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Add some market-hours bias (more volatile during overlap)
    let volatilityMultiplier = 1.0;
    if ((hour >= 8 && hour <= 12) || (hour >= 14 && hour <= 17)) {
      volatilityMultiplier = 1.5; // Higher volatility during market overlap
    }
    
    // Generate rate with some persistence (trending behavior)
    const previousRate = this.lastFxRates.get("EURUSD")?.rate || baseRate;
    const randomWalk = (Math.random() - 0.5) * 0.002 * volatilityMultiplier; // ±0.2% max move
    const meanReversion = (baseRate - previousRate) * 0.1; // Gentle pull toward base
    
    const newRate = previousRate + randomWalk + meanReversion;
    
    // Store rates with timestamps for historical analysis
    this.lastFxRates.set("EURUSD", {
      pair: "EURUSD",
      rate: Number(newRate.toFixed(6)),
      timestamp: now,
      source: "mock-fx-oracle",
    });
    
    // Keep rate history for different time windows (demo purposes)
    const timeKeys = ["5min", "15min", "1hour", "24hour"];
    for (const timeKey of timeKeys) {
      const key = `EURUSD-${timeKey}`;
      if (!this.lastFxRates.has(key)) {
        // Initialize historical rates with slight variations
        const variation = (Math.random() - 0.5) * 0.01; // ±0.5%
        this.lastFxRates.set(key, {
          pair: "EURUSD",
          rate: Number((baseRate + variation).toFixed(6)),
          timestamp: new Date(now.getTime() - this.getTimeWindow(timeKey)),
          source: `mock-fx-oracle-${timeKey}`,
        });
      }
    }
  }

  private getFxRate(pair: string): number | null {
    const rate = this.lastFxRates.get(pair);
    return rate ? rate.rate : null;
  }

  private getPreviousRate(pair: string, window: string): number | null {
    // For demo, map window to our stored rates
    let timeKey: string;
    
    switch (window) {
      case "5min":
        timeKey = "5min";
        break;
      case "15min":
        timeKey = "15min";
        break;
      case "1hour":
      case "1h":
        timeKey = "1hour";
        break;
      case "24hour":
      case "24h":
      case "1day":
      default:
        timeKey = "24hour";
        break;
    }
    
    const rateKey = `${pair}-${timeKey}`;
    const rate = this.lastFxRates.get(rateKey);
    return rate ? rate.rate : null;
  }

  private getTimeWindow(timeKey: string): number {
    switch (timeKey) {
      case "5min":
        return 5 * 60 * 1000;
      case "15min":
        return 15 * 60 * 1000;
      case "1hour":
        return 60 * 60 * 1000;
      case "24hour":
        return 24 * 60 * 60 * 1000;
      default:
        return 24 * 60 * 60 * 1000;
    }
  }

  private async hasRecentExecution(ruleId: string, seconds: number): Promise<boolean> {
    const cutoff = new Date(Date.now() - seconds * 1000);
    
    const recentExecution = await db.execution.findFirst({
      where: {
        ruleId,
        createdAt: {
          gte: cutoff,
        },
      },
    });

    return !!recentExecution;
  }

  // Public method to get current condition states for monitoring
  getConditionStates(): Map<string, ConditionState> {
    return new Map(this.conditionStates);
  }

  // Public method to get current FX rates for monitoring
  getFxRates(): Map<string, FXRate> {
    return new Map(this.lastFxRates);
  }

  // Public method to force an FX rate update
  async refreshRates(): Promise<void> {
    await this.updateFxRates();
  }
}

export const conditionChecker = new ConditionChecker();