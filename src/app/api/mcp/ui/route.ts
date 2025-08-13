import { NextRequest, NextResponse } from 'next/server';
import { mcpServices } from '@/lib/mcp';

export async function POST(request: NextRequest) {
  try {
    const { description, context, type, style, framework } = await request.json();

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const magicUI = mcpServices.getServices().magicUI;

    let component;
    
    if (context && ['rule-creation', 'dashboard', 'transaction', 'analytics'].includes(context)) {
      // Use contextual generation
      component = await mcpServices.generateUIForRequest(description, context);
    } else if (type && ['wallet-connect', 'price-chart', 'transaction-form', 'balance-card'].includes(type)) {
      // Generate crypto-specific component
      component = await magicUI.generateCryptoComponent(type);
    } else if (type && ['rule-card', 'automation-status', 'transfer-history', 'analytics-widget'].includes(type)) {
      // Generate Ferrow-specific component
      component = await magicUI.generateFerrowComponent(type);
    } else {
      // General component generation
      component = await magicUI.generateComponent({
        description,
        type: type || 'component',
        style: style || 'crypto',
        framework: framework || 'react'
      });
    }

    return NextResponse.json({
      success: true,
      component,
      usage: magicUI.getUsageStats()
    });

  } catch (error) {
    console.error('MCP UI generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate UI component',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') as any;
    const format = searchParams.get('format') as any || 'svg';

    const magicUI = mcpServices.getServices().magicUI;
    
    if (query) {
      // Search for logos
      const logos = await magicUI.searchLogos({
        query,
        category,
        format,
        theme: 'auto'
      });

      return NextResponse.json({
        success: true,
        logos,
        usage: magicUI.getUsageStats()
      });
    } else {
      // Return generation history and usage stats
      return NextResponse.json({
        success: true,
        history: magicUI.getGenerationHistory(),
        usage: magicUI.getUsageStats()
      });
    }

  } catch (error) {
    console.error('MCP UI query error:', error);
    
    return NextResponse.json(
      { error: 'Failed to process UI request' },
      { status: 500 }
    );
  }
}