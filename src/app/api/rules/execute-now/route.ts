import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { addExecuteRuleJob } from "@/lib/jobs/queue";
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
    
    // Verify rule exists and is active
    const rule = await db.rule.findUnique({
      where: { id: ruleId },
    });
    
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
    
    // Add to execution queue
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
    });
    
  } catch (error) {
    console.error("Execute now error:", error);
    return NextResponse.json(
      { error: "Failed to execute rule" },
      { status: 500 }
    );
  }
}