/**
 * Safety Controller - Central reliability and safety management
 * 
 * Coordinates circuit breakers, monitors system health, and enforces
 * safety policies across the entire application.
 */

import { CircuitBreaker, CircuitBreakerConfig, CIRCUIT_BREAKER_CONFIGS } from './circuit-breaker';

export interface SystemHealthStatus {
  overall: 'healthy' | 'degraded' | 'critical';
  services: Record<string, ServiceHealthStatus>;
  lastUpdated: Date;
  uptime: number;
}

export interface ServiceHealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  circuitBreaker: {
    state: string;
    failures: number;
    failureRate: number;
  };
  lastCheck: Date;
  responseTime?: number;
  errorCount: number;
}

export interface SafetyPolicy {
  maxConcurrentExecutions: number;
  maxDailyExecutions: number;
  maxAmountUSD: number;
  requireApprovalOverUSD: number;
  enableRateLimiting: boolean;
}

class SafetyControllerImpl {
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private startTime: Date = new Date();
  private healthCheckCache: SystemHealthStatus | null = null;
  private healthCheckCacheTime: number = 0;
  private readonly HEALTH_CACHE_TTL = 30000; // 30 seconds

  private defaultSafetyPolicy: SafetyPolicy = {
    maxConcurrentExecutions: 10,
    maxDailyExecutions: 100,
    maxAmountUSD: 10000,
    requireApprovalOverUSD: 1000,
    enableRateLimiting: true
  };

  constructor() {
    this.initializeCircuitBreakers();
  }

  private initializeCircuitBreakers(): void {
    Object.entries(CIRCUIT_BREAKER_CONFIGS).forEach(([key, config]) => {
      this.circuitBreakers.set(key, new CircuitBreaker(config));
    });
  }

  /**
   * Execute operation with circuit breaker protection
   */
  async executeWithProtection<T>(
    service: keyof typeof CIRCUIT_BREAKER_CONFIGS,
    operation: () => Promise<T>
  ): Promise<T> {
    const circuitBreaker = this.circuitBreakers.get(service);
    if (!circuitBreaker) {
      throw new Error(`Circuit breaker not found for service: ${service}`);
    }

    return circuitBreaker.execute(operation);
  }

  /**
   * Check if a service is healthy and available
   */
  isServiceHealthy(service: keyof typeof CIRCUIT_BREAKER_CONFIGS): boolean {
    const circuitBreaker = this.circuitBreakers.get(service);
    return circuitBreaker?.isHealthy() ?? false;
  }

  /**
   * Get comprehensive system health status
   */
  async getSystemHealth(): Promise<SystemHealthStatus> {
    const now = Date.now();
    
    // Return cached result if still valid
    if (this.healthCheckCache && (now - this.healthCheckCacheTime) < this.HEALTH_CACHE_TTL) {
      return this.healthCheckCache;
    }

    const services: Record<string, ServiceHealthStatus> = {};
    let healthyCount = 0;
    let degradedCount = 0;
    let criticalCount = 0;

    // Check each service
    for (const [serviceName, circuitBreaker] of Array.from(this.circuitBreakers.entries())) {
      const metrics = circuitBreaker.getMetrics();
      let status: 'healthy' | 'degraded' | 'critical';

      if (metrics.state === 'CLOSED' && metrics.failureRate < 10) {
        status = 'healthy';
        healthyCount++;
      } else if (metrics.state === 'HALF_OPEN' || metrics.failureRate < 50) {
        status = 'degraded';
        degradedCount++;
      } else {
        status = 'critical';
        criticalCount++;
      }

      services[serviceName] = {
        status,
        circuitBreaker: {
          state: metrics.state,
          failures: metrics.failures,
          failureRate: metrics.failureRate
        },
        lastCheck: new Date(),
        errorCount: metrics.failures
      };
    }

    // Determine overall system health
    let overall: 'healthy' | 'degraded' | 'critical';
    if (criticalCount > 0) {
      overall = 'critical';
    } else if (degradedCount > 0) {
      overall = 'degraded';  
    } else {
      overall = 'healthy';
    }

    const healthStatus: SystemHealthStatus = {
      overall,
      services,
      lastUpdated: new Date(),
      uptime: now - this.startTime.getTime()
    };

    // Cache the result
    this.healthCheckCache = healthStatus;
    this.healthCheckCacheTime = now;

    return healthStatus;
  }

  /**
   * Validate if an execution meets safety policies
   */
  validateExecution(params: {
    amountUSD: number;
    userId: string;
    concurrentExecutions?: number;
    dailyExecutions?: number;
  }): { allowed: boolean; reason?: string; requiresApproval: boolean } {
    const { amountUSD, concurrentExecutions = 0, dailyExecutions = 0 } = params;

    // Check amount limits
    if (amountUSD > this.defaultSafetyPolicy.maxAmountUSD) {
      return {
        allowed: false,
        reason: `Amount exceeds maximum limit of $${this.defaultSafetyPolicy.maxAmountUSD}`,
        requiresApproval: false
      };
    }

    // Check concurrent executions
    if (concurrentExecutions >= this.defaultSafetyPolicy.maxConcurrentExecutions) {
      return {
        allowed: false,
        reason: `Too many concurrent executions (${concurrentExecutions}/${this.defaultSafetyPolicy.maxConcurrentExecutions})`,
        requiresApproval: false
      };
    }

    // Check daily limits
    if (dailyExecutions >= this.defaultSafetyPolicy.maxDailyExecutions) {
      return {
        allowed: false,
        reason: `Daily execution limit reached (${dailyExecutions}/${this.defaultSafetyPolicy.maxDailyExecutions})`,
        requiresApproval: false
      };
    }

    // Check if approval required
    const requiresApproval = amountUSD > this.defaultSafetyPolicy.requireApprovalOverUSD;

    return {
      allowed: true,
      requiresApproval
    };
  }

  /**
   * Reset all circuit breakers (emergency use)
   */
  resetAllCircuitBreakers(): void {
    Array.from(this.circuitBreakers.values()).forEach(cb => cb.reset());
    this.healthCheckCache = null;
  }

  /**
   * Get safety policy
   */
  getSafetyPolicy(): SafetyPolicy {
    return { ...this.defaultSafetyPolicy };
  }

  /**
   * Update safety policy (requires admin privileges)
   */
  updateSafetyPolicy(policy: Partial<SafetyPolicy>): void {
    this.defaultSafetyPolicy = {
      ...this.defaultSafetyPolicy,
      ...policy
    };
  }

  /**
   * Get circuit breaker metrics for a specific service
   */
  getServiceMetrics(service: keyof typeof CIRCUIT_BREAKER_CONFIGS) {
    const circuitBreaker = this.circuitBreakers.get(service);
    return circuitBreaker?.getMetrics() ?? null;
  }

  /**
   * Check if system is in safe state for operations
   */
  isSystemSafe(): boolean {
    // System is safe if no critical services are down
    const criticalServices = ['CIRCLE_API', 'SECRETS_MANAGER'] as const;
    
    return criticalServices.every(service => 
      this.isServiceHealthy(service)
    );
  }
}

// Export singleton instance
export const SafetyController = new SafetyControllerImpl();