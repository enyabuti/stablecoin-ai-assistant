import { Worker, Job } from "bullmq";
import { db } from "@/lib/db";
import { connection, ExecuteRuleJob, CheckConditionsJob } from "./queue";
import { createRouter } from "@/lib/routing/router";
import { MockCircleClient } from "@/lib/mocks/circleMock";
import { env } from "@/lib/env";
import { nanoid } from "nanoid";
import type { RuleJSON } from "@/lib/llm/schema";

// Initialize dependencies
const router = createRouter();
const circleClient = new MockCircleClient();

// Execute Rule Worker
export const executeRuleWorker = new Worker<ExecuteRuleJob>(
  "execute-rule",
  async (job: Job<ExecuteRuleJob>) => {
    const { ruleId, userId, idempotencyKey, triggeredBy } = job.data;
    
    try {
      // Check if execution already exists (idempotency)
      const existingExecution = await db.execution.findUnique({
        where: { idempotencyKey },
      });
      
      if (existingExecution) {
        return { executionId: existingExecution.id, status: "duplicate" };
      }
      
      // Get rule details
      const rule = await db.rule.findUnique({
        where: { id: ruleId },
        include: { user: true },
      });
      
      if (!rule || rule.status !== "ACTIVE") {
        throw new Error(`Rule ${ruleId} not found or inactive`);
      }
      
      const ruleJson = rule.json as RuleJSON;
      
      // Create execution record
      const execution = await db.execution.create({
        data: {
          ruleId,
          status: "PROCESSING",
          idempotencyKey,
        },
      });
      
      // Get best route quote
      const bestRoute = await router.getBestRoute(ruleJson);
      
      // Update execution with route info
      await db.execution.update({
        where: { id: execution.id },
        data: {
          chain: bestRoute.chain,
          feeUsd: bestRoute.feeEstimateUsd,
        },
      });
      
      // Get or create wallet for the chain
      let wallet = await db.wallet.findUnique({
        where: {
          userId_chain: {
            userId: rule.userId,
            chain: bestRoute.chain,
          },
        },
      });
      
      if (!wallet) {
        // Create wallet using Circle API
        const circleWallet = await circleClient.createWallet(userId, bestRoute.chain);
        wallet = await db.wallet.create({
          data: {
            userId: rule.userId,
            chain: bestRoute.chain,
            circleWalletId: circleWallet.id,
            address: circleWallet.address,
          },
        });
      }
      
      // Resolve destination address
      let destinationAddress = ruleJson.destination.value;
      if (ruleJson.destination.type === "contact") {
        const contact = await db.contact.findUnique({
          where: {
            userId_name: {
              userId: rule.userId,
              name: ruleJson.destination.value,
            },
          },
        });
        
        if (!contact) {
          throw new Error(`Contact '${ruleJson.destination.value}' not found`);
        }
        
        destinationAddress = contact.address;
      }
      
      // Execute transfer via Circle
      const transfer = await circleClient.transferUSDC({
        walletId: wallet.circleWalletId!,
        destinationAddress,
        amount: ruleJson.amount.value.toString(),
        chain: bestRoute.chain,
        idempotencyKey: `${idempotencyKey}-transfer`,
      });
      
      // Update execution with success
      await db.execution.update({
        where: { id: execution.id },
        data: {
          status: "COMPLETED",
          txHash: transfer.transactionHash || null,
          walletId: wallet.id,
        },
      });
      
      // Update rule's last run time
      await db.rule.update({
        where: { id: ruleId },
        data: { lastRunAt: new Date() },
      });
      
      return { 
        executionId: execution.id, 
        status: "success", 
        transferId: transfer.id 
      };
      
    } catch (error) {
      console.error("Execute rule job failed:", error);
      
      // Update execution with failure
      await db.execution.updateMany({
        where: { idempotencyKey },
        data: {
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      });
      
      throw error;
    }
  },
  { connection }
);

// Condition Check Worker
export const conditionCheckWorker = new Worker<CheckConditionsJob>(
  "condition-check",
  async (job: Job<CheckConditionsJob>) => {
    const { timestamp } = job.data;
    
    // Get all active conditional rules
    const conditionalRules = await db.rule.findMany({
      where: {
        status: "ACTIVE",
        type: "conditional",
      },
    });
    
    const triggered = [];
    
    for (const rule of conditionalRules) {
      const ruleJson = rule.json as RuleJSON;
      
      if (!ruleJson.condition) continue;
      
      // Mock condition checking (replace with real FX oracle)
      const shouldTrigger = await checkCondition(ruleJson.condition);
      
      if (shouldTrigger) {
        // Add execution job
        const idempotencyKey = `cond-${rule.id}-${Date.now()}-${nanoid(8)}`;
        
        // Add to execution queue
        const { addExecuteRuleJob } = await import("./queue");
        await addExecuteRuleJob({
          ruleId: rule.id,
          userId: rule.userId,
          idempotencyKey,
          triggeredBy: "condition",
        });
        
        triggered.push(rule.id);
      }
    }
    
    return { 
      checkedAt: timestamp, 
      rulesChecked: conditionalRules.length, 
      triggered 
    };
  },
  { connection }
);

async function checkCondition(condition: RuleJSON["condition"]): Promise<boolean> {
  if (!condition) return false;
  
  // Mock FX oracle - in real implementation, fetch from actual FX API
  const mockCurrentRate = 1.0500 + (Math.random() - 0.5) * 0.02; // ±1% variance
  const mock24hAgoRate = 1.0500;
  const changePercent = ((mockCurrentRate - mock24hAgoRate) / mock24hAgoRate) * 100;
  
  if (condition.metric === "EURUSD") {
    if (condition.change === "+%" && changePercent >= condition.magnitude) {
      return true;
    }
    if (condition.change === "-%" && Math.abs(changePercent) >= condition.magnitude && changePercent < 0) {
      return true;
    }
  }
  
  return false;
}

export function startWorkers() {
  console.log("Starting job workers...");
  
  executeRuleWorker.on("completed", (job) => {
    console.log(`Execute rule job ${job.id} completed:`, job.returnvalue);
  });
  
  executeRuleWorker.on("failed", (job, err) => {
    console.error(`Execute rule job ${job?.id} failed:`, err);
  });
  
  conditionCheckWorker.on("completed", (job) => {
    console.log(`Condition check completed:`, job.returnvalue);
  });
  
  return { executeRuleWorker, conditionCheckWorker };
}