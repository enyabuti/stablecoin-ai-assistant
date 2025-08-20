/**
 * Admin Health Panel
 * 
 * Comprehensive system monitoring dashboard with real-time metrics,
 * alerts, DLQ management, and safety controls.
 */

"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Gauge, 
  RefreshCw, 
  Server, 
  Shield,
  TrendingUp,
  XCircle,
  Zap
} from 'lucide-react';

interface SystemMetrics {
  health: {
    overall: 'healthy' | 'degraded' | 'critical';
    services: Record<string, any>;
    uptime: number;
    timestamp: string;
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

interface AlertData {
  total: number;
  unresolved: number;
  recent: Array<{
    id: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    resolved: boolean;
  }>;
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<AlertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/admin/health');
      const data = await response.json();
      
      if (response.ok) {
        setMetrics(data.metrics);
        setAlerts(data.alerts);
        setLastRefresh(new Date());
      } else {
        console.error('Health API error:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchHealthData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500 border-green-200 bg-green-50';
      case 'degraded': return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case 'critical': return 'text-red-500 border-red-200 bg-red-50';
      default: return 'text-gray-500 border-gray-200 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await fetch('/api/admin/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve-alert', alertId })
      });
      fetchHealthData(); // Refresh data
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const resetCircuitBreakers = async () => {
    try {
      await fetch('/api/admin/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-circuit-breakers' })
      });
      fetchHealthData(); // Refresh data
    } catch (error) {
      console.error('Failed to reset circuit breakers:', error);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading system metrics...</span>
        </div>
      </div>
    );
  }

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / 3600000);
    const minutes = Math.floor((uptime % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Health Panel</h1>
          <p className="text-gray-600">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Disable' : 'Enable'} Auto Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={fetchHealthData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
              {getStatusIcon(metrics.health.overall)}
            </div>
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(metrics.health.overall)}>
              {metrics.health.overall.toUpperCase()}
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              Uptime: {formatUptime(metrics.health.uptime)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <Gauge className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {Math.round(metrics.performance.avgResponseTime)}ms
            </div>
            <p className="text-xs text-gray-500">
              Error Rate: {metrics.performance.errorRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {metrics.business.activeRules}
            </div>
            <p className="text-xs text-gray-500">
              {metrics.business.executionsToday} executions today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">DLQ Entries</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {metrics.infrastructure.dlq.totalEntries}
            </div>
            <p className="text-xs text-gray-500">
              {metrics.infrastructure.dlq.retryableEntries} retryable
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts {alerts && alerts.unresolved > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {alerts.unresolved}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(metrics.health.services).map(([serviceName, service]) => (
              <Card key={serviceName}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium capitalize">
                      {serviceName.replace('_', ' ')}
                    </CardTitle>
                    {getStatusIcon(service.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge className={getStatusColor(service.status)}>
                    {service.status.toUpperCase()}
                  </Badge>
                  {service.circuitBreaker && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-500">
                        Circuit: {service.circuitBreaker.state}
                      </p>
                      <p className="text-xs text-gray-500">
                        Failures: {service.circuitBreaker.failures}
                      </p>
                      <p className="text-xs text-gray-500">
                        Failure Rate: {service.circuitBreaker.failureRate}%
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Infrastructure Status</CardTitle>
                <Button variant="outline" size="sm" onClick={resetCircuitBreakers}>
                  <Shield className="h-4 w-4 mr-2" />
                  Reset Circuit Breakers
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span className="font-medium">Database</span>
                  {getStatusIcon(metrics.infrastructure.database.status)}
                </div>
                <p className="text-sm text-gray-600">
                  Query Time: {metrics.infrastructure.database.queryTime}ms
                </p>
                <p className="text-sm text-gray-600">
                  Connections: {metrics.infrastructure.database.connections}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Server className="h-4 w-4" />
                  <span className="font-medium">Redis</span>
                  {getStatusIcon(metrics.infrastructure.redis.status)}
                </div>
                <p className="text-sm text-gray-600">
                  Queue Size: {metrics.infrastructure.redis.queueSize}
                </p>
                <p className="text-sm text-gray-600">
                  Failed Jobs: {metrics.infrastructure.redis.failedJobs}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Dead Letter Queue</span>
                </div>
                <p className="text-sm text-gray-600">
                  Total: {metrics.infrastructure.dlq.totalEntries}
                </p>
                <p className="text-sm text-gray-600">
                  Retryable: {metrics.infrastructure.dlq.retryableEntries}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {alerts && alerts.total > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Recent Alerts</h3>
                <div className="text-sm text-gray-600">
                  {alerts.unresolved} unresolved of {alerts.total} total
                </div>
              </div>
              {alerts.recent.map((alert) => (
                <Alert key={alert.id} className={alert.resolved ? 'opacity-50' : ''}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        {alert.resolved && (
                          <Badge variant="outline">RESOLVED</Badge>
                        )}
                      </div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!alert.resolved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-600">No active alerts</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {Math.round(metrics.performance.avgResponseTime)}ms
                </div>
                <Progress 
                  value={Math.min(metrics.performance.avgResponseTime / 10, 100)} 
                  className="mb-2"
                />
                <p className="text-sm text-gray-600">
                  Target: &lt;100ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {metrics.business.successRate.toFixed(1)}%
                </div>
                <Progress 
                  value={metrics.business.successRate} 
                  className="mb-2"
                />
                <p className="text-sm text-gray-600">
                  Error Rate: {metrics.performance.errorRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Throughput</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {Math.round(metrics.performance.throughput)} req/min
                </div>
                <div className="text-sm text-gray-600">
                  Active connections: {metrics.performance.activeConnections}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Executions today:</span>
                  <span className="font-medium">{metrics.business.executionsToday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Volume (USD):</span>
                  <span className="font-medium">
                    ${metrics.business.totalVolumeUSD.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Active rules:</span>
                  <span className="font-medium">{metrics.business.activeRules}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="safety" className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Safety controls are active and monitoring system health.
              <Button
                variant="link"
                className="p-0 ml-2"
                onClick={resetCircuitBreakers}
              >
                Reset all circuit breakers
              </Button>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Circuit Breaker Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics.health.services).map(([service, data]) => (
                    <div key={service} className="flex items-center justify-between">
                      <span className="text-sm capitalize">
                        {service.replace('_', ' ')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className={
                            data.circuitBreaker?.state === 'CLOSED'
                              ? 'text-green-700 border-green-300'
                              : data.circuitBreaker?.state === 'OPEN'
                              ? 'text-red-700 border-red-300'
                              : 'text-yellow-700 border-yellow-300'
                          }
                        >
                          {data.circuitBreaker?.state || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Safety</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Safe:</span>
                    <Badge
                      className={
                        metrics.health.overall === 'healthy'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {metrics.health.overall === 'healthy' ? 'YES' : 'NO'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">DLQ Size:</span>
                    <Badge
                      variant="outline"
                      className={
                        metrics.infrastructure.dlq.totalEntries < 10
                          ? 'text-green-700 border-green-300'
                          : metrics.infrastructure.dlq.totalEntries < 50
                          ? 'text-yellow-700 border-yellow-300'
                          : 'text-red-700 border-red-300'
                      }
                    >
                      {metrics.infrastructure.dlq.totalEntries}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Rate:</span>
                    <Badge
                      variant="outline"
                      className={
                        metrics.performance.errorRate < 1
                          ? 'text-green-700 border-green-300'
                          : metrics.performance.errorRate < 5
                          ? 'text-yellow-700 border-yellow-300'
                          : 'text-red-700 border-red-300'
                      }
                    >
                      {metrics.performance.errorRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}