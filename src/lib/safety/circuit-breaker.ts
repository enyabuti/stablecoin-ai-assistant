/**
 * Circuit Breaker Implementation for Safety Controller
 * 
 * Provides reliability patterns for external services:
 * - Gas price monitoring
 * - Oracle service reliability  
 * - Secrets management availability
 * - External API health checks
 */

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringWindow: number;
  name: string;
}

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failures detected, blocking requests
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

export interface CircuitBreakerMetrics {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure?: Date;
  lastSuccess?: Date;
  totalRequests: number;
  failureRate: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime?: Date;
  private lastSuccessTime?: Date;
  private nextAttempt: number = 0;
  private totalRequests: number = 0;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new CircuitBreakerError(`Circuit breaker OPEN for ${this.config.name}`, this.getMetrics());
      }
      // Try to recover
      this.state = CircuitState.HALF_OPEN;
    }

    this.totalRequests++;

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.successes++;
    this.lastSuccessTime = new Date();
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      this.failures = 0;
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = new Date();

    if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.config.recoveryTimeout;
    }
  }

  getMetrics(): CircuitBreakerMetrics {
    const failureRate = this.totalRequests > 0 
      ? (this.failures / this.totalRequests) * 100 
      : 0;

    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailureTime,
      lastSuccess: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      failureRate: Math.round(failureRate * 100) / 100
    };
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = undefined;
    this.lastSuccessTime = undefined;
    this.nextAttempt = 0;
    this.totalRequests = 0;
  }

  isHealthy(): boolean {
    return this.state !== CircuitState.OPEN;
  }
}

export class CircuitBreakerError extends Error {
  constructor(
    message: string,
    public metrics: CircuitBreakerMetrics
  ) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

// Predefined circuit breaker configurations
export const CIRCUIT_BREAKER_CONFIGS = {
  GAS_ORACLE: {
    name: 'Gas Oracle',
    failureThreshold: 3,
    recoveryTimeout: 30000, // 30 seconds
    monitoringWindow: 60000  // 1 minute
  },
  FX_ORACLE: {
    name: 'FX Oracle', 
    failureThreshold: 2,
    recoveryTimeout: 60000, // 1 minute
    monitoringWindow: 300000 // 5 minutes
  },
  SECRETS_MANAGER: {
    name: 'Secrets Manager',
    failureThreshold: 2,
    recoveryTimeout: 15000, // 15 seconds
    monitoringWindow: 60000  // 1 minute
  },
  CIRCLE_API: {
    name: 'Circle API',
    failureThreshold: 5,
    recoveryTimeout: 120000, // 2 minutes
    monitoringWindow: 300000  // 5 minutes
  },
  LLM_SERVICE: {
    name: 'LLM Service',
    failureThreshold: 3,
    recoveryTimeout: 45000,  // 45 seconds
    monitoringWindow: 180000  // 3 minutes
  }
} as const satisfies Record<string, CircuitBreakerConfig>;