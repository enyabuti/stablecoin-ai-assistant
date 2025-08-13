import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check all critical systems for deployment readiness
    const checks = await Promise.allSettled([
      checkDatabase(),
      checkEnvironment(), 
      checkCoreAPIs()
    ]);

    const results = checks.map((check, index) => ({
      name: ['database', 'environment', 'core-apis'][index],
      status: check.status === 'fulfilled' ? 'healthy' : 'failed',
      error: check.status === 'rejected' ? (check.reason as Error)?.message : null
    }));

    const allHealthy = results.every(r => r.status === 'healthy');
    const hasWarnings = results.some(r => r.status === 'failed');

    return NextResponse.json({
      status: allHealthy ? 'ready' : hasWarnings ? 'degraded' : 'not-ready',
      timestamp: new Date().toISOString(),
      deployment: {
        commit: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
        branch: process.env.VERCEL_GIT_COMMIT_REF || 'unknown',
        url: process.env.VERCEL_URL || 'unknown'
      },
      checks: results,
      summary: {
        total: results.length,
        healthy: results.filter(r => r.status === 'healthy').length,
        failed: results.filter(r => r.status === 'failed').length
      }
    }, { 
      status: allHealthy ? 200 : hasWarnings ? 200 : 503 
    });

  } catch (error) {
    console.error('Deployment check failed:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      deployment: {
        commit: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
        branch: process.env.VERCEL_GIT_COMMIT_REF || 'unknown'
      }
    }, { status: 500 });
  }
}

async function checkDatabase() {
  try {
    const { db, isDatabaseConnected } = await import("@/lib/db");
    
    if (!isDatabaseConnected()) {
      throw new Error('Database client not initialized');
    }

    // Test basic database connectivity
    await db.$queryRaw`SELECT 1`;
    return { status: 'connected', details: 'Database connection successful' };
  } catch (error) {
    throw new Error(`Database check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function checkEnvironment() {
  const required = ['DATABASE_URL', 'NEXTAUTH_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Check for placeholder values that shouldn't be in production
  const placeholders = required.filter(key => {
    const value = process.env[key];
    return value?.includes('placeholder') || value?.includes('localhost') || value?.includes('build-');
  });

  if (placeholders.length > 0) {
    throw new Error(`Environment variables contain placeholder values: ${placeholders.join(', ')}`);
  }

  return { 
    status: 'configured', 
    details: `All ${required.length} required environment variables are set` 
  };
}

async function checkCoreAPIs() {
  try {
    // We can't make HTTP requests to ourselves during build/check, so we'll test the imports
    const { env } = await import("@/lib/env");
    const { isDatabaseConnected } = await import("@/lib/db");
    const { getQueueStatus } = await import("@/lib/jobs/queue");

    // Test that core modules can be loaded
    const moduleTests = [
      { name: 'env', test: () => env.NODE_ENV !== undefined },
      { name: 'database', test: () => typeof isDatabaseConnected === 'function' },
      { name: 'queue', test: () => typeof getQueueStatus === 'function' }
    ];

    const failed = moduleTests.filter(test => {
      try {
        return !test.test();
      } catch {
        return true;
      }
    });

    if (failed.length > 0) {
      throw new Error(`Core module loading failed: ${failed.map(f => f.name).join(', ')}`);
    }

    return { 
      status: 'loaded', 
      details: `All ${moduleTests.length} core modules loaded successfully` 
    };
  } catch (error) {
    throw new Error(`Core API check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}