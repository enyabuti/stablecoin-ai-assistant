import { NextRequest, NextResponse } from "next/server";
import { MockLLMProvider, OpenAIProvider } from "@/lib/llm/parser";
import { env } from "@/lib/env";

// Lazy initialization to avoid env validation during build
function getLLMProvider() {
  return env.OPENAI_API_KEY 
    ? new OpenAIProvider(env.OPENAI_API_KEY)
    : new MockLLMProvider();
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }
    
    const llmProvider = getLLMProvider();
    const result = await llmProvider.parseRule(message);
    
    if ("error" in result) {
      return NextResponse.json({
        error: result.error,
        needsClarification: result.needsClarification,
      });
    }
    
    return NextResponse.json({ rule: result });
    
  } catch (error) {
    console.error("Parse API error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}