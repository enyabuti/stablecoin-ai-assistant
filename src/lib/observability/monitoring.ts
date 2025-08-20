/**
 * System Monitoring and Metrics Collection
 * 
 * Provides comprehensive monitoring capabilities including:
 * - System health metrics
 * - Performance tracking
 * - Business metrics
 * - Error rate monitoring
 * - DLQ statistics
 */

import { SafetyController } from '@/lib/safety';
import { getDLQInstance } from '@/lib/jobs/dlq';
import { db } from '@/lib/db';
import { getQueueStatus } from '@/lib/jobs/queue';

export interface SystemMetrics {
  health: {
    overall: 'healthy' | 'degraded' | 'critical';
    services: Record<string, any>;
    uptime: number;
    timestamp: Date;
  };
  performance: {
    avgResponseTime: number;
    errorRate: number;
    throughput: number;
    activeConnections: number;
  };
  business: {
    activeRules: number;
    executionsToday: number;
    totalVolumeUSD: number;
    successRate: number;
  };
  infrastructure: {
    database: {
      connections: number;
      queryTime: number;
      status: 'healthy' | 'degraded' | 'critical';
    };
    redis: {
      status: 'healthy' | 'degraded' | 'critical';
      queueSize: number;
      failedJobs: number;
    };
    dlq: {
      totalEntries: number;
      retryableEntries: number;
      entriesByQueue: Record<string, number>;
    };
  };
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  cooldown: number; // minutes
  lastTriggered?: Date;
}

export interface Alert {
  id: string;
  ruleId: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata: Record<string, any>;
}

class MonitoringService {
  private alerts: Alert[] = [];
  private alertRules: AlertRule[] = [
    {
      id: 'high-error-rate',
      name: 'High Error Rate',
      metric: 'performance.errorRate',
      condition: 'gt',
      threshold: 5, // 5%
      severity: 'high',
      enabled: true,
      cooldown: 15
    },
    {
      id: 'system-critical',
      name: 'System Critical Health',
      metric: 'health.overall',
      condition: 'eq',
      threshold: 0, // 0 = critical (string comparison)
      severity: 'critical',
      enabled: true,
      cooldown: 5
    },
    {
      id: 'high-dlq-entries',
      name: 'High DLQ Entries',
      metric: 'infrastructure.dlq.totalEntries',
      condition: 'gt',
      threshold: 100,
      severity: 'medium',
      enabled: true,
      cooldown: 30
    },
    {
      id: 'slow-database',
      name: 'Slow Database Performance',
      metric: 'infrastructure.database.queryTime',
      condition: 'gt',
      threshold: 1000, // 1 second
      severity: 'medium',
      enabled: true,
      cooldown: 10
    }
  ];

  /**
   * Collect comprehensive system metrics
   */
  async collectMetrics(): Promise<SystemMetrics> {
    const startTime = Date.now();

    try {
      // Health metrics
      const healthStatus = await SafetyController.getSystemHealth();

      // Performance metrics (mock for now - could be real metrics)
      const performanceMetrics = await this.getPerformanceMetrics();

      // Business metrics
      const businessMetrics = await this.getBusinessMetrics();

      // Infrastructure metrics
      const infrastructureMetrics = await this.getInfrastructureMetrics();

      const metrics: SystemMetrics = {
        health: {
          overall: healthStatus.overall,
          services: healthStatus.services,
          uptime: healthStatus.uptime,
          timestamp: new Date()
        },
        performance: performanceMetrics,
        business: businessMetrics,
        infrastructure: infrastructureMetrics
      };

      // Check alert rules
      await this.checkAlertRules(metrics);

      return metrics;
    } catch (error) {
      console.error('Error collecting metrics:', error);
      
      // Return basic error state
      return {
        health: {
          overall: 'critical',
          services: {},
          uptime: 0,
          timestamp: new Date()
        },
        performance: { avgResponseTime: 0, errorRate: 100, throughput: 0, activeConnections: 0 },
        business: { activeRules: 0, executionsToday: 0, totalVolumeUSD: 0, successRate: 0 },
        infrastructure: {
          database: { connections: 0, queryTime: 0, status: 'critical' },
          redis: { status: 'critical', queueSize: 0, failedJobs: 0 },
          dlq: { totalEntries: 0, retryableEntries: 0, entriesByQueue: {} }
        }
      };
    }
  }

  private async getPerformanceMetrics() {
    // Mock performance metrics - in production, these would come from APM tools
    return {
      avgResponseTime: Math.random() * 200 + 50, // 50-250ms
      errorRate: Math.random() * 2, // 0-2%
      throughput: Math.random() * 100 + 50, // 50-150 req/min
      activeConnections: Math.floor(Math.random() * 20) + 5 // 5-25 connections
    };
  }

  private async getBusinessMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const [activeRules, todayExecutions, allExecutions] = await Promise.all([
        db.rule.count({ where: { status: 'ACTIVE' } }),
        db.execution.findMany({
          where: {
            createdAt: { gte: today }
          }
        }),
        db.execution.findMany({
          where: {
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
          }
        })
      ]);

      const executionsToday = todayExecutions.length;
      const totalVolumeUSD = todayExecutions.reduce((sum: number, exec: any) => 
        sum + (exec.feeUsd || 0), 0
      );
      
      const successfulExecutions = allExecutions.filter((e: any) => e.status === 'COMPLETED');
      const successRate = allExecutions.length > 0 
        ? (successfulExecutions.length / allExecutions.length) * 100 
        : 100;

      return {
        activeRules,
        executionsToday,
        totalVolumeUSD,
        successRate
      };
    } catch (error) {
      console.error('Error getting business metrics:', error);
      return {
        activeRules: 0,
        executionsToday: 0,
        totalVolumeUSD: 0,
        successRate: 0
      };
    }
  }

  private async getInfrastructureMetrics() {
    // Database metrics (simplified)
    const databaseMetrics = await this.getDatabaseMetrics();
    
    // Queue/Redis metrics
    const queueStatus = getQueueStatus();
    
    // DLQ metrics
    const dlqMetrics = await this.getDLQMetrics();

    return {
      database: databaseMetrics,
      redis: {
        status: queueStatus.redis ? 'healthy' as const : 'critical' as const,
        queueSize: queueStatus.inMemoryJobs || 0,
        failedJobs: 0 // Would come from queue stats
      },
      dlq: dlqMetrics
    };
  }

  private async getDatabaseMetrics() {
    const startTime = Date.now();
    
    try {
      // Simple health check query
      await db.$queryRaw`SELECT 1`;
      const queryTime = Date.now() - startTime;
      
      return {
        connections: 1, // Would be actual connection pool size
        queryTime,
        status: queryTime < 100 ? 'healthy' as const : 
               queryTime < 1000 ? 'degraded' as const : 'critical' as const
      };
    } catch (error) {
      return {
        connections: 0,
        queryTime: Date.now() - startTime,
        status: 'critical' as const
      };
    }
  }

  private async getDLQMetrics() {
    try {
      const dlq = getDLQInstance();
      if (!dlq) {
        return { totalEntries: 0, retryableEntries: 0, entriesByQueue: {} };
      }

      const stats = await dlq.getDLQStats();
      return {
        totalEntries: stats.totalEntries,
        retryableEntries: stats.retryableEntries,
        entriesByQueue: stats.entriesByQueue
      };
    } catch (error) {
      return { totalEntries: 0, retryableEntries: 0, entriesByQueue: {} };
    }
  }

  private async checkAlertRules(metrics: SystemMetrics): Promise<void> {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      // Check cooldown
      if (rule.lastTriggered) {
        const cooldownMs = rule.cooldown * 60 * 1000;
        if (Date.now() - rule.lastTriggered.getTime() < cooldownMs) {
          continue;
        }
      }

      const value = this.getMetricValue(metrics, rule.metric);
      const shouldTrigger = this.evaluateCondition(value, rule.condition, rule.threshold);

      if (shouldTrigger) {
        await this.triggerAlert(rule, value, metrics);
      }
    }
  }

  private getMetricValue(metrics: SystemMetrics, path: string): any {
    const keys = path.split('.');
    let value: any = metrics;
    
    for (const key of keys) {
      value = value?.[key];
    }
    
    // Special handling for string comparisons
    if (path === 'health.overall') {
      return value === 'critical' ? 0 : value === 'degraded' ? 1 : 2;
    }
    
    return typeof value === 'number' ? value : 0;
  }

  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case 'gt': return value > threshold;
      case 'lt': return value < threshold;
      case 'eq': return value === threshold;
      default: return false;
    }
  }

  private async triggerAlert(rule: AlertRule, value: any, metrics: SystemMetrics): Promise<void> {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      ruleId: rule.id,
      message: `${rule.name}: ${rule.metric} is ${value} (threshold: ${rule.threshold})`,
      severity: rule.severity,
      timestamp: new Date(),
      resolved: false,
      metadata: {
        metric: rule.metric,
        value,
        threshold: rule.threshold,
        condition: rule.condition
      }
    };

    this.alerts.push(alert);
    
    // Update rule's last triggered time
    rule.lastTriggered = new Date();
    
    console.log(`🚨 ALERT: ${alert.message}`);
    
    // In production, you would send this to alerting systems
    // await this.sendAlert(alert);
  }

  /**
   * Get recent alerts
   */
  getAlerts(limit: number = 50, resolved?: boolean): Alert[] {
    let alerts = [...this.alerts];
    
    if (resolved !== undefined) {
      alerts = alerts.filter(alert => alert.resolved === resolved);
    }
    
    return alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Get alert rules
   */
  getAlertRules(): AlertRule[] {
    return [...this.alertRules];
  }

  /**
   * Update alert rule
   */
  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const rule = this.alertRules.find(r => r.id === ruleId);
    if (rule) {
      Object.assign(rule, updates);
      return true;
    }
    return false;
  }
}

export const Monitoring = new MonitoringService();