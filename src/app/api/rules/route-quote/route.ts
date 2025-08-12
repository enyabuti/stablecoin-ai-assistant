import { NextRequest, NextResponse } from "next/server";
import { RuleJSONSchema } from "@/lib/llm/schema";
import { createRouter } from "@/lib/routing/router";

const router = createRouter();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the rule JSON
    const ruleJson = RuleJSONSchema.parse(body);
    
    // Get route quotes
    const quotes = await router.getRouteQuotes(ruleJson);
    
    return NextResponse.json({ quotes });
    
  } catch (error) {
    console.error("Route quote error:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid rule format" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to get route quotes" },
      { status: 500 }
    );
  }
}