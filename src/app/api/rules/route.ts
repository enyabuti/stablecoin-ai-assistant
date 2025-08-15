import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { RuleJSONSchema } from "@/lib/llm/schema";
import { getAllQuotes } from "@/lib/routing/router";
import { getFeatureFlags } from "@/lib/featureFlags";
import { nanoid } from "nanoid";

// GET /api/rules - List all rules for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const ruleJson = RuleJSONSchema.parse(body);
    
    const userId = session.user.id;
    
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
    const flags = getFeatureFlags();
    const quotes = getAllQuotes(ruleJson, flags);
    
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