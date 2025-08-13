import { NextRequest, NextResponse } from 'next/server';
import { mcpServices } from '@/lib/mcp';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Process the message with MCP services
    const response = await mcpServices.processChatMessage(message, context);

    return NextResponse.json({
      success: true,
      response: response.response,
      actions: response.actions || [],
      metadata: response.metadata || {}
    });

  } catch (error) {
    console.error('MCP chat processing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process message with MCP services',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return MCP service status
    const status = mcpServices.getServiceStatus();
    
    return NextResponse.json({
      status: 'active',
      services: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('MCP status check error:', error);
    
    return NextResponse.json(
      { error: 'Failed to get MCP service status' },
      { status: 500 }
    );
  }
}