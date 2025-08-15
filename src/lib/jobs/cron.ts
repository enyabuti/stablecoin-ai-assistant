import cronParser from "cron-parser";
import { db } from "@/lib/db";
import { addExecuteRuleJob } from "./queue";
import { conditionChecker } from "./conditionChecker";
import { nanoid } from "nanoid";
import type { RuleJSON } from "@/lib/llm/schema";

export interface SchedulerStats {
  rulesChecked: number;
  rulesScheduled: number;
  rulesExecuted: number;
  conditionsTriggered: number;
  fxRatesUpdated: number;
  errors: string[];
  lastRun: Date;
  nextCheck: Date;
  conditionStates: number;
}

export class CronScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private stats: SchedulerStats = {
    rulesChecked: 0,
    rulesScheduled: 0,
    rulesExecuted: 0,
    conditionsTriggered: 0,
    fxRatesUpdated: 0,
    errors: [],
    lastRun: new Date(),
    nextCheck: new Date(),
    conditionStates: 0,
  };
  private isRunning = false;
  
  start() {
    if (this.intervalId) {
      this.stop();
    }
    
    console.log("Starting enhanced cron scheduler with condition monitoring...");
    
    // Check every minute for scheduled rules and conditions
    this.intervalId = setInterval(async () => {
      await this.checkScheduledRules();
    }, 60 * 1000);
    
    // Run immediately
    this.checkScheduledRules();
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Cron scheduler stopped");
    }
  }
  
  private async checkScheduledRules() {
    if (this.isRunning) {
      console.log("Cron check already running, skipping...");
      return;
    }

    this.isRunning = true;
    const startTime = new Date();
    let rulesProcessed = 0;
    let rulesScheduled = 0;
    let errors: string[] = [];

    try {
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
      
      // Get all active scheduled rules that should run in the next 5 minutes
      const rules = await db.rule.findMany({
        where: {
          status: "ACTIVE",
          type: "schedule",
          OR: [
            { nextRunAt: null }, // Rules that haven't been scheduled yet
            {
              nextRunAt: {
                lte: fiveMinutesFromNow,
              }
            }
          ],
        },
      });
      
      rulesProcessed = rules.length;

      for (const rule of rules) {
        const ruleJson = rule.json as RuleJSON;
        
        if (!ruleJson.schedule) continue;
        
        try {
          const cronExpression = ruleJson.schedule.cron;
          const timezone = ruleJson.schedule.tz || "UTC";
          
          if (!cronExpression) continue;
          
          // Parse cron expression
          const interval = cronParser.parseExpression(cronExpression, {
            currentDate: rule.nextRunAt || now,
            tz: timezone,
          });
          
          const nextRun = interval.next().toDate();
          
          // If the rule should run now (within the next minute)
          if (nextRun <= new Date(now.getTime() + 60 * 1000)) {
            const idempotencyKey = `sched-${rule.id}-${nextRun.getTime()}-${nanoid(8)}`;
            
            // Add execution job
            await addExecuteRuleJob({
              ruleId: rule.id,
              userId: rule.userId,
              idempotencyKey,
              triggeredBy: "schedule",
            });
            
            // Calculate the next run after this one
            const followingRun = interval.next().toDate();
            
            // Update rule with next run time
            await db.rule.update({
              where: { id: rule.id },
              data: { nextRunAt: followingRun },
            });
            
            rulesScheduled++;
            console.log(`Scheduled rule ${rule.id} for execution at ${nextRun}, next run: ${followingRun}`);
          } else if (!rule.nextRunAt) {
            // Just update the next run time for rules that haven't been scheduled
            await db.rule.update({
              where: { id: rule.id },
              data: { nextRunAt: nextRun },
            });
            
            console.log(`Set next run for rule ${rule.id}: ${nextRun}`);
          }
          
        } catch (error) {
          const errorMessage = `Error scheduling rule ${rule.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(errorMessage);
          errors.push(errorMessage);
          
          // Mark rule as failed if cron expression is invalid
          await db.rule.update({
            where: { id: rule.id },
            data: { status: "FAILED" },
          });
        }
      }
    } catch (error) {
      const errorMessage = `Critical error in cron scheduler: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMessage);
      errors.push(errorMessage);
    } finally {
      // Also check conditions during cron runs (for comprehensive monitoring)
      let conditionsTriggered = 0;
      let fxRatesUpdated = 0;
      let conditionStatesCount = 0;
      
      try {
        const conditionResult = await conditionChecker.checkAllConditions();
        conditionsTriggered = conditionResult.triggered.length;
        conditionStatesCount = conditionResult.conditions.length;
        fxRatesUpdated = conditionChecker.getFxRates().size;
        
        if (conditionsTriggered > 0) {
          console.log(`🎯 Cron run also triggered ${conditionsTriggered} condition-based rules`);
        }
      } catch (conditionError) {
        const errorMessage = `Error during condition check in cron run: ${conditionError instanceof Error ? conditionError.message : 'Unknown error'}`;
        console.error(errorMessage);
        errors.push(errorMessage);
      }
      
      // Update comprehensive stats
      const endTime = new Date();
      this.stats = {
        rulesChecked: rulesProcessed,
        rulesScheduled,
        rulesExecuted: this.stats.rulesExecuted, // Cumulative
        conditionsTriggered,
        fxRatesUpdated,
        conditionStates: conditionStatesCount,
        errors: errors.slice(0, 10), // Keep last 10 errors
        lastRun: endTime,
        nextCheck: new Date(endTime.getTime() + 60 * 1000), // Next minute
      };

      this.isRunning = false;

      if (rulesProcessed > 0 || errors.length > 0 || conditionsTriggered > 0) {
        console.log(`📈 Cron check completed: ${rulesProcessed} scheduled rules checked, ${rulesScheduled} scheduled, ${conditionsTriggered} conditions triggered, ${errors.length} errors, took ${endTime.getTime() - startTime.getTime()}ms`);
      }
    }
  }

  // Public method to get scheduler statistics
  getStats(): SchedulerStats {
    return { ...this.stats };
  }

  // Public method to get current status with enhanced monitoring
  getStatus(): { running: boolean; isRunning: boolean; stats: SchedulerStats; health: { fxOracle: boolean; conditionMonitor: boolean } } {
    const conditionStates = conditionChecker.getConditionStates();
    const fxRates = conditionChecker.getFxRates();
    
    return {
      running: this.intervalId !== null,
      isRunning: this.isRunning,
      stats: this.getStats(),
      health: {
        fxOracle: fxRates.size > 0,
        conditionMonitor: conditionStates.size >= 0, // Always healthy if accessible
      },
    };
  }

  // Public method to manually trigger a check (for testing)
  async triggerCheck(): Promise<void> {
    await this.checkScheduledRules();
  }
}

export const cronScheduler = new CronScheduler();