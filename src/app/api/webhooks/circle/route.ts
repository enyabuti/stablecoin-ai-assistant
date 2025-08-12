import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MockCircleClient } from "@/lib/mocks/circleMock";
import { env } from "@/lib/env";

const circleClient = new MockCircleClient();

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-circle-signature");
    const body = await request.text();
    
    // Verify webhook signature
    if (!circleClient.verifyWebhook(body, signature || "")) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }
    
    const payload = JSON.parse(body);
    
    // Store webhook event
    await db.webhookEvent.create({
      data: {
        type: payload.type || "unknown",
        payload: payload,
        processed: false,
      },
    });
    
    // Process specific webhook types
    await processWebhook(payload);
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

async function processWebhook(payload: any) {
  const { type, data } = payload;
  
  switch (type) {
    case "transfer.completed":
      await handleTransferCompleted(data);
      break;
    case "transfer.failed":
      await handleTransferFailed(data);
      break;
    default:
      console.log("Unhandled webhook type:", type);
  }
}

async function handleTransferCompleted(data: any) {
  const { id: transferId, transactionHash } = data;
  
  // Find execution by transfer ID (would need to store this in real implementation)
  // For now, just log the completion
  console.log("Transfer completed:", { transferId, transactionHash });
}

async function handleTransferFailed(data: any) {
  const { id: transferId, errorCode } = data;
  
  // Find execution and mark as failed
  console.log("Transfer failed:", { transferId, errorCode });
}