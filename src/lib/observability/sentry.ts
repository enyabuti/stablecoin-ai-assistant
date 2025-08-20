/**
 * Sentry Configuration and Integration
 * 
 * Temporarily disabled for build compatibility
 */

export interface ErrorContext {
  userId?: string;
  ruleId?: string;
  executionId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceContext {
  operation: string;
  duration?: number;
  success: boolean;
  metadata?: Record<string, any>;
}

class ObservabilityManager {
  private initialized = true; // Always initialized since we're using console

  captureError(error: Error, context: ErrorContext = {}): void {
    console.error('Error captured:', error.message, context);
  }

  captureMessage(message: string, level: 'debug' | 'info' | 'warning' | 'error' | 'fatal' = 'info', context: ErrorContext = {}): void {
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  }

  trackPerformance(context: PerformanceContext): void {
    console.log('Performance:', context);
  }

  startTransaction(name: string, operation: string = 'function'): any {
    console.log(`Transaction started: ${name} (${operation})`);
    return null;
  }

  setUser(userId: string, email?: string, metadata?: Record<string, any>): void {
    console.log('User set:', { userId, email, metadata });
  }

  trackBusinessMetric(metric: string, value: number, tags: Record<string, string> = {}): void {
    console.log('Business metric:', { metric, value, tags });
  }

  trackHealthChange(service: string, oldStatus: string, newStatus: string, metadata?: Record<string, any>): void {
    console.log(`Health change: ${service} ${oldStatus} → ${newStatus}`, metadata);
  }

  close(): Promise<boolean> {
    console.log('Sentry close requested');
    return Promise.resolve(true);
  }
}

// Export singleton instance
export const Observability = new ObservabilityManager();

// Convenience functions for common use cases
export const captureError = (error: Error, context?: ErrorContext) => 
  Observability.captureError(error, context);

export const captureMessage = (message: string, level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal', context?: ErrorContext) => 
  Observability.captureMessage(message, level, context);

export const trackPerformance = (context: PerformanceContext) => 
  Observability.trackPerformance(context);

export const startTransaction = (name: string, operation?: string): any => 
  Observability.startTransaction(name, operation);

export const setUser = (userId: string, email?: string, metadata?: Record<string, any>) => 
  Observability.setUser(userId, email, metadata);

export const trackBusinessMetric = (metric: string, value: number, tags?: Record<string, string>) => 
  Observability.trackBusinessMetric(metric, value, tags);

export const trackHealthChange = (service: string, oldStatus: string, newStatus: string, metadata?: Record<string, any>) => 
  Observability.trackHealthChange(service, oldStatus, newStatus, metadata);