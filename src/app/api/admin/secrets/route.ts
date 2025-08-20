/**
 * Secrets Management API
 * 
 * Provides secure access to secrets health and configuration status
 * for admin monitoring.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SecretsManager } from '@/lib/secrets/secrets-manager';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'health':
        const health = await SecretsManager.getSecretsHealth();
        return NextResponse.json(health);

      case 'validate':
        const validation = await SecretsManager.validateSecrets();
        return NextResponse.json(validation);

      case 'summary':
        const summary = await SecretsManager.getConfigurationSummary();
        return NextResponse.json(summary);

      case 'list':
        const secrets = await SecretsManager.listSecrets(false); // Never include actual values
        return NextResponse.json({ secrets });

      case 'metadata':
        const key = url.searchParams.get('key');
        if (!key) {
          return NextResponse.json(
            { error: 'Key parameter required' },
            { status: 400 }
          );
        }
        
        const metadata = await SecretsManager.getSecretMetadata(key);
        if (!metadata) {
          return NextResponse.json(
            { error: 'Secret not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({ metadata });

      default:
        // Default to health check
        const defaultHealth = await SecretsManager.getSecretsHealth();
        return NextResponse.json(defaultHealth);
    }
  } catch (error) {
    console.error('Secrets API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to access secrets information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'validate-all':
        const validation = await SecretsManager.validateSecrets();
        return NextResponse.json(validation);

      case 'health-check':
        const health = await SecretsManager.getSecretsHealth();
        return NextResponse.json(health);

      case 'check-feature':
        const { feature } = body;
        const summary = await SecretsManager.getConfigurationSummary();
        const available = summary.features[feature] || false;
        
        return NextResponse.json({
          feature,
          available,
          reason: available ? 'Required secrets configured' : 'Missing required secrets'
        });

      case 'environment-config':
        const { environment } = body;
        if (!environment) {
          return NextResponse.json(
            { error: 'Environment parameter required' },
            { status: 400 }
          );
        }
        
        // Only return summary, never actual secret values
        const envSummary = await SecretsManager.getConfigurationSummary();
        const secretsList = await SecretsManager.listSecrets(false);
        
        return NextResponse.json({
          environment,
          summary: envSummary,
          secrets: secretsList.filter(s => 
            s.metadata.environment === 'all' || s.metadata.environment === environment
          )
        });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Secrets API POST error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to process secrets request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}