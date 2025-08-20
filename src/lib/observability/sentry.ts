/**
 * Sentry Configuration and Integration
 * 
 * Provides comprehensive error tracking, performance monitoring,
 * and observability for the Ferrow application.
 */

import * as Sentry from '@sentry/nextjs';
import { env } from '@/lib/env';

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
  private initialized = false;

  constructor() {
    this.initializeSentry();
  }

  private initializeSentry(): void {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    try {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        
        // Performance monitoring
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        
        // Error filtering
        beforeSend(event) {
          // Don't send development errors
          if (process.env.NODE_ENV === 'development') {
            console.log('Sentry event (dev mode):', event);
            return null;
          }
          
          // Filter out known non-critical errors
          if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
            return null;
          }
          
          return event;
        },
        
        // Tag all events
        initialScope: {
          tags: {
            component: 'ferrow-app',
            version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
          }
        },

        // Integrations handled by platform

        // Release tracking
        release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
      });

      this.initialized = true;
      console.log('Sentry initialized for observability');
    } catch (error) {
      console.warn('Failed to initialize Sentry:', error);
    }
  }

  /**
   * Track application errors with context
   */
  captureError(error: Error, context: ErrorContext = {}): void {
    if (!this.initialized) return;

    Sentry.withScope((scope) => {
      // Set user context
      if (context.userId) {
        scope.setUser({ id: context.userId });
      }

      // Set tags for filtering
      if (context.component) {
        scope.setTag('component', context.component);
      }
      if (context.action) {
        scope.setTag('action', context.action);
      }
      if (context.ruleId) {
        scope.setTag('ruleId', context.ruleId);
      }

      // Set additional context
      scope.setContext('error_context', {
        executionId: context.executionId,
        timestamp: new Date().toISOString(),
        ...context.metadata
      });

      // Set level based on error type
      if (error.message.includes('CRITICAL') || error.message.includes('SECURITY')) {
        scope.setLevel('fatal');
      } else if (error.message.includes('WARN') || error.message.includes('DEGRADED')) {
        scope.setLevel('warning');
      } else {
        scope.setLevel('error');
      }

      Sentry.captureException(error);
    });
  }

  /**
   * Track custom messages and events
   */
  captureMessage(message: string, level: 'debug' | 'info' | 'warning' | 'error' | 'fatal' = 'info', context: ErrorContext = {}): void {
    if (!this.initialized) return;

    Sentry.withScope((scope) => {
      if (context.userId) {
        scope.setUser({ id: context.userId });
      }

      if (context.component) {
        scope.setTag('component', context.component);
      }

      scope.setContext('message_context', context.metadata || {});
      scope.setLevel(level);

      Sentry.captureMessage(message);
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(context: PerformanceContext): void {
    if (!this.initialized) return;

    // Create custom breadcrumb for performance tracking
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `${context.operation} - ${context.success ? 'success' : 'failed'}`,
      level: context.success ? 'info' : 'error',
      data: {
        duration: context.duration,
        operation: context.operation,
        ...context.metadata
      }
    });

    // For critical operations, also send as event
    if (context.duration && context.duration > 5000) { // > 5 seconds
      this.captureMessage(
        `Slow operation detected: ${context.operation} took ${context.duration}ms`,
        'warning',
        { metadata: context.metadata }
      );
    }
  }

  /**
   * Start performance transaction
   */
  startTransaction(name: string, operation: string = 'function'): any {
    // Transaction API not available in this Sentry version
    console.log(`Transaction started: ${name} (${operation})`);
    return null;
  }

  /**
   * Track user activity
   */
  setUser(userId: string, email?: string, metadata?: Record<string, any>): void {
    if (!this.initialized) return;

    Sentry.setUser({
      id: userId,
      email,
      ...metadata
    });
  }

  /**
   * Track business metrics
   */
  trackBusinessMetric(metric: string, value: number, tags: Record<string, string> = {}): void {
    if (!this.initialized) return;

    // Use Sentry's custom metrics (if available) or breadcrumbs
    Sentry.addBreadcrumb({
      category: 'business_metric',
      message: `${metric}: ${value}`,
      level: 'info',
      data: {
        metric,
        value,
        timestamp: Date.now(),
        ...tags
      }
    });
  }

  /**
   * Track system health changes
   */
  trackHealthChange(service: string, oldStatus: string, newStatus: string, metadata?: Record<string, any>): void {
    const severity = newStatus === 'critical' ? 'error' : 
                    newStatus === 'degraded' ? 'warning' : 'info';

    this.captureMessage(
      `System health change: ${service} ${oldStatus} → ${newStatus}`,
      severity,
      {
        component: 'health-monitor',
        metadata: {
          service,
          oldStatus,
          newStatus,
          ...metadata
        }
      }
    );
  }

  /**
   * Clean up resources
   */
  close(): Promise<boolean> {
    if (!this.initialized) return Promise.resolve(true);
    return Sentry.close(2000); // 2 second timeout
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