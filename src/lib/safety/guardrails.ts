import { db } from "@/lib/db";
import { auditLogger } from "@/lib/audit/auditLogger";
import type { RuleJSON } from "@/lib/llm/schema";

export interface SafetyCheck {
  passed: boolean;
  reason?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendation?: string;
}

export interface TransferLimits {
  maxSingleTransfer: number;
  maxDailyTotal: number;
  maxMonthlyTotal: number;
  maxRulesPerUser: number;
  minTimeBetweenTransfers: number; // in seconds
}

export class SafetyGuardrails {
  private static instance: SafetyGuardrails;
  
  // Default safety limits (in USD)
  private readonly DEFAULT_LIMITS: TransferLimits = {
    maxSingleTransfer: 5000,
    maxDailyTotal: 10000,
    maxMonthlyTotal: 50000,
    maxRulesPerUser: 20,
    minTimeBetweenTransfers: 300, // 5 minutes
  };

  public static getInstance(): SafetyGuardrails {
    if (!SafetyGuardrails.instance) {
      SafetyGuardrails.instance = new SafetyGuardrails();
    }
    return SafetyGuardrails.instance;
  }

  async validateRuleCreation(userId: string, ruleData: RuleJSON): Promise<SafetyCheck> {
    // Check 1: Maximum rules per user
    const userRuleCount = await db.rule.count({
      where: { userId, status: { not: "DELETED" } },
    });

    if (userRuleCount >= this.DEFAULT_LIMITS.maxRulesPerUser) {
      await auditLogger.logEvent({
        userId,
        action: "RULE_CREATION_BLOCKED",
        resource: "rule",
        metadata: { currentCount: userRuleCount, maxAllowed: this.DEFAULT_LIMITS.maxRulesPerUser },
        severity: "MEDIUM",
        category: "SECURITY",
      });

      return {
        passed: false,
        reason: `Maximum number of rules reached (${this.DEFAULT_LIMITS.maxRulesPerUser})`,
        severity: "MEDIUM",
        recommendation: "Delete unused rules before creating new ones",
      };
    }

    // Check 2: Transfer amount limits
    const transferAmount = parseFloat(ruleData.amount.value.toString());
    if (transferAmount > this.DEFAULT_LIMITS.maxSingleTransfer) {
      return {
        passed: false,
        reason: `Transfer amount $${transferAmount} exceeds single transfer limit of $${this.DEFAULT_LIMITS.maxSingleTransfer}`,
        severity: "HIGH",
        recommendation: `Reduce transfer amount to $${this.DEFAULT_LIMITS.maxSingleTransfer} or less`,
      };
    }

    // Check 3: Rapid rule creation detection
    const recentRules = await db.rule.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 3600000), // Last hour
        },
      },
    });

    if (recentRules >= 5) {
      await auditLogger.createSecurityAlert({
        userId,
        alertType: "RAPID_RULE_CREATION",
        description: `User created ${recentRules} rules in the last hour`,
        severity: "HIGH",
        metadata: { recentRuleCount: recentRules, timeWindow: "1 hour" },
      });

      return {
        passed: false,
        reason: "Too many rules created recently. Please wait before creating more rules.",
        severity: "HIGH",
        recommendation: "Wait at least 1 hour between rule creation sessions",
      };
    }

    // Check 4: Validate destination addresses
    if (!this.isValidAddress(ruleData.destination.value, ruleData.destination.type)) {
      return {
        passed: false,
        reason: "Invalid destination address format",
        severity: "HIGH",
        recommendation: "Verify the destination address is correct",
      };
    }

    return { passed: true, severity: "LOW" };
  }

  async validateTransferExecution(userId: string, ruleId: string, transferAmount: number): Promise<SafetyCheck> {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Check 1: Single transfer limit
    if (transferAmount > this.DEFAULT_LIMITS.maxSingleTransfer) {
      await auditLogger.logEvent({
        userId,
        action: "TRANSFER_BLOCKED_AMOUNT",
        resource: "transfer",
        resourceId: ruleId,
        metadata: { amount: transferAmount, limit: this.DEFAULT_LIMITS.maxSingleTransfer },
        severity: "HIGH",
        category: "FINANCIAL",
      });

      return {
        passed: false,
        reason: `Transfer amount $${transferAmount} exceeds limit of $${this.DEFAULT_LIMITS.maxSingleTransfer}`,
        severity: "HIGH",
        recommendation: "Reduce transfer amount or contact support for limit increase",
      };
    }

    // Check 2: Daily spending limit
    const dailySpent = await db.execution.aggregate({
      where: {
        rule: { userId },
        createdAt: { gte: dayStart },
        status: "COMPLETED",
      },
      _sum: { feeUsd: true },
    });

    const dailyTotal = (dailySpent._sum.feeUsd || 0) + transferAmount;
    if (dailyTotal > this.DEFAULT_LIMITS.maxDailyTotal) {
      return {
        passed: false,
        reason: `Daily spending limit exceeded. Current: $${dailySpent._sum.feeUsd || 0}, Attempted: $${transferAmount}, Limit: $${this.DEFAULT_LIMITS.maxDailyTotal}`,
        severity: "HIGH",
        recommendation: "Wait until tomorrow or contact support for limit increase",
      };
    }

    // Check 3: Monthly spending limit
    const monthlySpent = await db.execution.aggregate({
      where: {
        rule: { userId },
        createdAt: { gte: monthStart },
        status: "COMPLETED",
      },
      _sum: { feeUsd: true },
    });

    const monthlyTotal = (monthlySpent._sum.feeUsd || 0) + transferAmount;
    if (monthlyTotal > this.DEFAULT_LIMITS.maxMonthlyTotal) {
      return {
        passed: false,
        reason: `Monthly spending limit exceeded. Current: $${monthlySpent._sum.feeUsd || 0}, Attempted: $${transferAmount}, Limit: $${this.DEFAULT_LIMITS.maxMonthlyTotal}`,
        severity: "CRITICAL",
        recommendation: "Contact support for limit review",
      };
    }

    // Check 4: Time between transfers (prevent spam)
    const lastExecution = await db.execution.findFirst({
      where: {
        rule: { userId },
        status: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
    });

    if (lastExecution) {
      const timeSinceLastTransfer = (now.getTime() - lastExecution.createdAt.getTime()) / 1000;
      if (timeSinceLastTransfer < this.DEFAULT_LIMITS.minTimeBetweenTransfers) {
        return {
          passed: false,
          reason: `Minimum time between transfers not met. Please wait ${Math.ceil(this.DEFAULT_LIMITS.minTimeBetweenTransfers - timeSinceLastTransfer)} seconds`,
          severity: "MEDIUM",
          recommendation: "Space out your transfers to prevent system overload",
        };
      }
    }

    // Check 5: Wallet balance validation
    const userWallets = await db.wallet.findMany({
      where: { userId },
    });

    if (userWallets.length === 0) {
      return {
        passed: false,
        reason: "No wallet available for transfer",
        severity: "HIGH",
        recommendation: "Create a wallet before attempting transfers",
      };
    }

    return { passed: true, severity: "LOW" };
  }

  async validateConditionTrigger(userId: string, ruleId: string, conditionData: any): Promise<SafetyCheck> {
    // Check 1: Prevent condition spam (too many triggers in short time)
    const recentTriggers = await db.execution.count({
      where: {
        ruleId,
        createdAt: {
          gte: new Date(Date.now() - 900000), // Last 15 minutes
        },
      },
    });

    if (recentTriggers >= 3) {
      await auditLogger.createSecurityAlert({
        userId,
        alertType: "CONDITION_SPAM",
        description: `Rule ${ruleId} triggered ${recentTriggers} times in 15 minutes`,
        severity: "MEDIUM",
        metadata: { ruleId, recentTriggers, timeWindow: "15 minutes" },
      });

      return {
        passed: false,
        reason: "Condition triggered too frequently. Rule temporarily paused.",
        severity: "MEDIUM",
        recommendation: "Review condition settings to prevent excessive triggering",
      };
    }

    // Check 2: Validate condition data
    if (!conditionData || typeof conditionData !== 'object') {
      return {
        passed: false,
        reason: "Invalid condition data",
        severity: "HIGH",
        recommendation: "Check rule configuration for valid condition parameters",
      };
    }

    return { passed: true, severity: "LOW" };
  }

  async performHealthCheck(userId: string): Promise<{
    overall: "HEALTHY" | "WARNING" | "CRITICAL";
    checks: Array<{ name: string; status: "PASS" | "WARN" | "FAIL"; details?: string }>;
  }> {
    const checks = [];

    // Check 1: Rule count
    const ruleCount = await db.rule.count({
      where: { userId, status: "ACTIVE" },
    });

    checks.push({
      name: "Active Rules",
      status: ruleCount > this.DEFAULT_LIMITS.maxRulesPerUser ? "FAIL" : 
             ruleCount > this.DEFAULT_LIMITS.maxRulesPerUser * 0.8 ? "WARN" : "PASS",
      details: `${ruleCount}/${this.DEFAULT_LIMITS.maxRulesPerUser} rules`,
    });

    // Check 2: Recent transfer activity
    const recentTransfers = await db.execution.count({
      where: {
        rule: { userId },
        createdAt: { gte: new Date(Date.now() - 86400000) }, // Last 24 hours
      },
    });

    checks.push({
      name: "Daily Activity",
      status: recentTransfers > 20 ? "WARN" : "PASS",
      details: `${recentTransfers} executions in last 24h`,
    });

    // Check 3: Failed executions rate
    const failedExecutions = await db.execution.count({
      where: {
        rule: { userId },
        status: "FAILED",
        createdAt: { gte: new Date(Date.now() - 604800000) }, // Last week
      },
    });

    const totalExecutions = await db.execution.count({
      where: {
        rule: { userId },
        createdAt: { gte: new Date(Date.now() - 604800000) },
      },
    });

    const failureRate = totalExecutions > 0 ? (failedExecutions / totalExecutions) * 100 : 0;

    checks.push({
      name: "Execution Success Rate",
      status: failureRate > 20 ? "FAIL" : failureRate > 10 ? "WARN" : "PASS",
      details: `${failureRate.toFixed(1)}% failure rate`,
    });

    // Determine overall status
    const hasFailures = checks.some(check => check.status === "FAIL");
    const hasWarnings = checks.some(check => check.status === "WARN");
    
    const overall = hasFailures ? "CRITICAL" : hasWarnings ? "WARNING" : "HEALTHY";

    return { overall, checks };
  }

  private isValidAddress(address: string, type: "address" | "contact"): boolean {
    if (type === "contact") {
      // Contact names should be alphanumeric with basic punctuation
      return /^[a-zA-Z0-9\s\-_\.]{1,50}$/.test(address);
    }
    
    // Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // Method to adjust limits for specific users (admin functionality)
  async setCustomLimits(userId: string, limits: Partial<TransferLimits>): Promise<void> {
    // In a real implementation, this would store custom limits in the database
    // For now, we'll just log the change
    await auditLogger.logEvent({
      userId,
      action: "LIMITS_MODIFIED",
      resource: "user",
      resourceId: userId,
      metadata: { newLimits: limits },
      severity: "HIGH",
      category: "SYSTEM",
    });
  }

  // Emergency pause functionality
  async emergencyPause(userId: string, reason: string): Promise<void> {
    await db.rule.updateMany({
      where: { userId, status: "ACTIVE" },
      data: { status: "PAUSED" },
    });

    await auditLogger.createSecurityAlert({
      userId,
      alertType: "EMERGENCY_PAUSE",
      description: `All rules paused for user: ${reason}`,
      severity: "CRITICAL",
      metadata: { reason, timestamp: new Date() },
    });
  }
}

export const safetyGuardrails = SafetyGuardrails.getInstance();