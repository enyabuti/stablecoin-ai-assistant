import { Worker, Job } from "bullmq";
import { db } from "@/lib/db";
import { connection, ExecuteRuleJob, CheckConditionsJob } from "./queue";
import { quoteCheapest } from "@/lib/routing/router";
import { MockCircleClient } from "@/lib/mocks/circleMock";
import { conditionChecker } from "./conditionChecker";
// import { auditLogger } from "@/lib/audit/auditLogger";
// import { safetyGuardrails } from "@/lib/safety/guardrails";
import { env } from "@/lib/env";
import { nanoid } from "nanoid";
import type { RuleJSON } from "@/lib/llm/schema";

// Initialize dependencies
const circleClient = new MockCircleClient();

// Extracted job processing logic for fallback execution
export async function processExecuteRuleJob(data: ExecuteRuleJob) {
  const { ruleId, userId, idempotencyKey, triggeredBy } = data;
    
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
      const bestRoute = quoteCheapest(ruleJson, { ENABLE_CCTP: true, USE_MOCKS: true });
      
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
      
      // Resolve and validate destination address
      let destinationAddress = typeof ruleJson.destination === 'string' ? ruleJson.destination : ruleJson.destination.value;
      if (typeof ruleJson.destination === 'object' && ruleJson.destination.type === "contact") {
        const contact = await db.contact.findUnique({
          where: {
            userId_name: {
              userId: rule.userId,
              name: typeof ruleJson.destination === 'object' ? ruleJson.destination.value : ruleJson.destination,
            },
          },
        });
        
        if (!contact) {
          throw new Error(`Contact '${typeof ruleJson.destination === 'object' ? ruleJson.destination.value : ruleJson.destination}' not found`);
        }
        
        destinationAddress = contact.address;
      }
      
      // Validate destination address
      if (!circleClient.validateAddress(destinationAddress, bestRoute.chain)) {
        throw new Error(`Invalid destination address: ${destinationAddress}`);
      }
      
      // Get fresh wallet balance before transfer
      const freshWallet = await circleClient.refreshWalletBalance(wallet.circleWalletId!);
      const usdcBalance = parseFloat(freshWallet.balances.find(b => b.currency === "USDC")?.amount || "0");
      const transferAmount = typeof ruleJson.amount === 'string' 
        ? parseFloat(ruleJson.amount) 
        : parseFloat(ruleJson.amount.value.toString());
      
      // Safety check: ensure sufficient balance (with buffer for fees)
      const estimatedFee = bestRoute.feeEstimateUsd;
      if (usdcBalance < transferAmount + estimatedFee + 5) { // $5 buffer
        throw new Error(`Insufficient balance: ${usdcBalance} USDC available, need ${transferAmount + estimatedFee + 5} USDC (including fees and buffer)`);
      }
      
      // Get transfer time estimate
      const timeEstimate = await circleClient.estimateTransferTime(bestRoute.chain);
      console.log(`Estimated transfer time: ${timeEstimate.typical} minutes (${timeEstimate.min}-${timeEstimate.max} min range)`);
      
      // Execute transfer via Circle with enhanced error handling
      const transfer = await circleClient.transferUSDC({
        walletId: wallet.circleWalletId!,
        destinationAddress,
        amount: typeof ruleJson.amount === 'string' ? ruleJson.amount : ruleJson.amount.value.toString(),
        chain: bestRoute.chain,
        idempotencyKey: `${idempotencyKey}-transfer`,
      });
      
      console.log(`Transfer initiated: ${transfer.id} (${transfer.status})`);
      
      // Log wallet access
      // TODO: Re-enable after Vercel deployment fix  
      // await auditLogger.logWalletAccess(userId, wallet.id, "TRANSFER_INITIATED");
      
      // Update execution with comprehensive transfer info
      await db.execution.update({
        where: { id: execution.id },
        data: {
          status: transfer.status === "complete" ? "COMPLETED" : "PROCESSING",
          txHash: transfer.transactionHash || null,
          walletId: wallet.id,
          errorMessage: transfer.errorMessage || null,
        },
      });
      
      // If transfer is still processing, we'll update it later via webhook or polling
      if (transfer.status === "pending" || transfer.status === "running") {
        console.log(`Transfer ${transfer.id} is ${transfer.status}, will be updated when completed`);
      }
      
      // Update rule's last run time
      await db.rule.update({
        where: { id: ruleId },
        data: { lastRunAt: new Date() },
      });
      
      return { 
        executionId: execution.id, 
        status: transfer.status === "complete" ? "success" : "processing", 
        transferId: transfer.id,
        transferStatus: transfer.status,
        estimatedTime: timeEstimate.typical,
        txHash: transfer.transactionHash,
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Execute rule job failed:", { ruleId, userId, error: errorMessage });
      
      // Enhanced error categorization
      let errorCategory = "SYSTEM_ERROR";
      if (errorMessage.includes("Insufficient balance")) {
        errorCategory = "INSUFFICIENT_FUNDS";
      } else if (errorMessage.includes("Invalid destination")) {
        errorCategory = "INVALID_ADDRESS";
      } else if (errorMessage.includes("not found")) {
        errorCategory = "NOT_FOUND";
      } else if (errorMessage.includes("rate limit")) {
        errorCategory = "RATE_LIMITED";
      }
      
      // Update execution with detailed failure info
      await db.execution.updateMany({
        where: { idempotencyKey },
        data: {
          status: "FAILED",
          errorMessage,
        },
      });
      
      // For certain errors, pause the rule temporarily
      if (errorCategory === "INSUFFICIENT_FUNDS" || errorCategory === "RATE_LIMITED") {
        await db.rule.update({
          where: { id: ruleId },
          data: { 
            status: "PAUSED",
            // Resume after 1 hour for rate limits, 24 hours for insufficient funds
            nextRunAt: new Date(Date.now() + (errorCategory === "RATE_LIMITED" ? 3600000 : 86400000))
          },
        });
        console.log(`Rule ${ruleId} temporarily paused due to ${errorCategory}`);
      }
      
      throw error;
    }
}

// Execute Rule Worker (only create if connection exists)
export const executeRuleWorker = connection ? new Worker<ExecuteRuleJob>(
  "execute-rule",
  async (job: Job<ExecuteRuleJob>) => {
    return await processExecuteRuleJob(job.data);
  },
  { connection }
) : null;

// Enhanced Condition Check Worker with sophisticated condition monitoring
export const conditionCheckWorker = connection ? new Worker<CheckConditionsJob>(
  "condition-check",
  async (job: Job<CheckConditionsJob>) => {
    const { timestamp } = job.data;
    
    try {
      // Use the sophisticated condition checker
      const result = await conditionChecker.checkAllConditions();
      
      if (result.triggered.length > 0) {
        console.log(`🎯 Condition check triggered ${result.triggered.length} rules:`, result.triggered);
      }
      
      console.log(`📊 Condition monitoring: ${result.rulesChecked} rules checked, ${result.conditions.length} conditions tracked`);
      
      return {
        checkedAt: timestamp,
        rulesChecked: result.rulesChecked,
        triggered: result.triggered,
        conditions: result.conditions,
        fxRates: Array.from(conditionChecker.getFxRates().entries()).map(([, rate]) => rate),
      };
    } catch (error) {
      console.error('❌ Condition check worker error:', error);
      throw error;
    }
  },
  { connection }
) : null;

// Extracted job processing for condition check fallback execution
export async function processConditionCheckJob(data: CheckConditionsJob) {
  try {
    // Use the sophisticated condition checker
    const result = await conditionChecker.checkAllConditions();
    
    console.log(`Fallback condition check: ${result.rulesChecked} rules checked, ${result.triggered.length} triggered`);
    
    return {
      checkedAt: data.timestamp,
      rulesChecked: result.rulesChecked,
      triggered: result.triggered,
      conditions: result.conditions,
      fxRates: Array.from(conditionChecker.getFxRates().entries()).map(([, rate]) => rate),
    };
  } catch (error) {
    console.error('Condition check processing error:', error);
    throw error;
  }
}

export function startWorkers() {
  console.log("Starting job workers...");
  
  if (executeRuleWorker) {
    executeRuleWorker.on("completed", (job) => {
      console.log(`Execute rule job ${job.id} completed:`, job.returnvalue);
    });
    
    executeRuleWorker.on("failed", (job, err) => {
      console.error(`Execute rule job ${job?.id} failed:`, err);
    });
  }
  
  if (conditionCheckWorker) {
    conditionCheckWorker.on("completed", (job) => {
      console.log(`Condition check completed:`, job.returnvalue);
    });
  }
  
  if (!executeRuleWorker || !conditionCheckWorker) {
    console.warn("Some workers could not be started due to Redis unavailability");
  }
  
  return { executeRuleWorker, conditionCheckWorker };
}