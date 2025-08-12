import cronParser from "cron-parser";
import { db } from "@/lib/db";
import { addExecuteRuleJob } from "./queue";
import { nanoid } from "nanoid";
import type { RuleJSON } from "@/lib/llm/schema";

export class CronScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  
  start() {
    if (this.intervalId) {
      this.stop();
    }
    
    console.log("Starting cron scheduler...");
    
    // Check every minute for scheduled rules
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
      
      for (const rule of rules) {
        const ruleJson = rule.json as RuleJSON;
        
        if (!ruleJson.schedule) continue;
        
        try {
          const cronExpression = ruleJson.schedule.cron;
          const timezone = ruleJson.schedule.tz || "UTC";
          
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
          console.error(`Error scheduling rule ${rule.id}:`, error);
          
          // Mark rule as failed if cron expression is invalid
          await db.rule.update({
            where: { id: rule.id },
            data: { status: "FAILED" },
          });
        }
      }
    } catch (error) {
      console.error("Error in cron scheduler:", error);
    }
  }
}

export const cronScheduler = new CronScheduler();