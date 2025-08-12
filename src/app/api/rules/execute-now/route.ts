import { NextRequest, NextResponse } from "next/server";
import { db, safeDbOperation, isDatabaseConnected } from "@/lib/db";
import { addExecuteRuleJob, getQueueStatus } from "@/lib/jobs/queue";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const { ruleId } = await request.json();
    
    if (!ruleId) {
      return NextResponse.json(
        { error: "Rule ID is required" },
        { status: 400 }
      );
    }

    // Check if critical services are available
    if (!isDatabaseConnected()) {
      return NextResponse.json(
        { 
          error: "Service temporarily unavailable",
          details: "Database connection is down. Please try again later.",
          fallback: true
        },
        { status: 503 }
      );
    }
    
    // Verify rule exists and is active with graceful fallback
    const rule = await safeDbOperation(
      () => db.rule.findUnique({ where: { id: ruleId } }),
      null,
      'rule lookup'
    );
    
    if (rule === null) {
      return NextResponse.json(
        { 
          error: "Service temporarily unavailable",
          details: "Unable to verify rule status. Please try again later.",
          fallback: true
        },
        { status: 503 }
      );
    }
    
    if (!rule) {
      return NextResponse.json(
        { error: "Rule not found" },
        { status: 404 }
      );
    }
    
    if (rule.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Rule is not active" },
        { status: 400 }
      );
    }
    
    // Generate idempotency key
    const idempotencyKey = `manual-${ruleId}-${Date.now()}-${nanoid(8)}`;
    
    // Check queue status and inform user about execution mode
    const queueStatus = getQueueStatus();
    
    // Add to execution queue (will fall back to immediate execution if Redis unavailable)
    const job = await addExecuteRuleJob({
      ruleId: rule.id,
      userId: rule.userId,
      idempotencyKey,
      triggeredBy: "manual",
    });
    
    return NextResponse.json({
      success: true,
      jobId: job.id,
      idempotencyKey,
      executionMode: queueStatus.fallbackMode ? "immediate" : "queued",
      fallback: queueStatus.fallbackMode,
      ...(queueStatus.fallbackMode && {
        note: "Queue service unavailable, rule executed immediately"
      })
    });
    
  } catch (error) {
    console.error("Execute now error:", error);
    return NextResponse.json(
      { 
        error: "Failed to execute rule",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}