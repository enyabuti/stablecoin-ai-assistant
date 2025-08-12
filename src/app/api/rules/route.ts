import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RuleJSONSchema } from "@/lib/llm/schema";
import { createRouter } from "@/lib/routing/router";
import { nanoid } from "nanoid";

const router = createRouter();

// GET /api/rules - List all rules for user
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = "demo-user";
    
    const rules = await db.rule.findMany({
      where: { userId },
      include: {
        executions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: { executions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json({ rules });
  } catch (error) {
    console.error("Get rules error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rules" },
      { status: 500 }
    );
  }
}

// POST /api/rules - Create a new rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ruleJson = RuleJSONSchema.parse(body);
    
    // TODO: Get userId from session
    const userId = "demo-user";
    
    // Create the rule
    const rule = await db.rule.create({
      data: {
        userId,
        type: ruleJson.type,
        json: ruleJson,
        status: "ACTIVE",
      },
    });
    
    // Generate initial quote
    const quotes = await router.getRouteQuotes(ruleJson);
    
    // Save quotes to database
    await Promise.all(
      quotes.map(quote =>
        db.quote.create({
          data: {
            ruleId: rule.id,
            chain: quote.chain,
            feeEstimateUsd: quote.feeEstimateUsd,
            etaSeconds: quote.etaSeconds,
            explanation: quote.explanation,
          },
        })
      )
    );
    
    // Return rule with quotes
    const ruleWithQuotes = await db.rule.findUnique({
      where: { id: rule.id },
      include: {
        quotes: {
          orderBy: { feeEstimateUsd: "asc" },
        },
      },
    });
    
    return NextResponse.json({ rule: ruleWithQuotes });
    
  } catch (error) {
    console.error("Create rule error:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid rule format" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create rule" },
      { status: 500 }
    );
  }
}