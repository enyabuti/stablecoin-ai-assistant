/**
 * Admin Health Monitoring API
 * 
 * Provides comprehensive system health and monitoring data
 * for the admin dashboard.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Monitoring } from '@/lib/observability/monitoring';
import { getDLQInstance } from '@/lib/jobs/dlq';
import { SafetyController } from '@/lib/safety';

export async function GET(request: NextRequest) {
  try {
    // Collect comprehensive system metrics
    const metrics = await Monitoring.collectMetrics();
    
    // Get recent alerts
    const alerts = Monitoring.getAlerts(20);
    const unresolved = alerts.filter(a => !a.resolved);
    
    // Get DLQ details if available
    let dlqDetails = null;
    try {
      const dlq = getDLQInstance();
      if (dlq) {
        const { entries } = await dlq.getDLQEntries(0, 10);
        dlqDetails = {
          recentEntries: entries.slice(0, 10),
          stats: await dlq.getDLQStats()
        };
      }
    } catch (error) {
      console.warn('Could not fetch DLQ details:', error);
    }

    // Get safety controller status
    const safetyStatus = {
      isSystemSafe: SafetyController.isSystemSafe(),
      policy: SafetyController.getSafetyPolicy()
    };

    const response = {
      timestamp: new Date().toISOString(),
      metrics,
      alerts: {
        total: alerts.length,
        unresolved: unresolved.length,
        recent: alerts.slice(0, 10)
      },
      dlq: dlqDetails,
      safety: safetyStatus,
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: Math.floor(process.uptime()),
        memoryUsage: process.memoryUsage(),
        environment: process.env.NODE_ENV
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Health API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to collect health metrics',
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'resolve-alert':
        const resolved = Monitoring.resolveAlert(params.alertId);
        return NextResponse.json({ success: resolved });

      case 'update-alert-rule':
        const updated = Monitoring.updateAlertRule(params.ruleId, params.updates);
        return NextResponse.json({ success: updated });

      case 'reset-circuit-breakers':
        SafetyController.resetAllCircuitBreakers();
        return NextResponse.json({ success: true, message: 'All circuit breakers reset' });

      case 'update-safety-policy':
        SafetyController.updateSafetyPolicy(params.policy);
        return NextResponse.json({ success: true, message: 'Safety policy updated' });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Health API POST error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to process admin action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}