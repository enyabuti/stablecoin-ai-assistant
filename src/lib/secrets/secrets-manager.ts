/**
 * Secrets Management System
 * 
 * Provides secure storage, rotation, and access control for sensitive
 * configuration values like API keys, database credentials, etc.
 */

import { SafetyController } from '@/lib/safety';

export interface SecretMetadata {
  key: string;
  description: string;
  rotationPolicy: 'never' | 'weekly' | 'monthly' | 'quarterly';
  lastRotated?: Date;
  expiresAt?: Date;
  environment: 'development' | 'staging' | 'production' | 'all';
  sensitive: boolean;
  required: boolean;
}

export interface SecretValue {
  key: string;
  value: string;
  metadata: SecretMetadata;
  masked: boolean;
}

export interface SecretsHealth {
  totalSecrets: number;
  expiringSoon: number;
  rotationOverdue: number;
  missing: string[];
  healthy: boolean;
  lastCheck: Date;
}

class SecretsManagerService {
  private secrets = new Map<string, SecretValue>();
  private initialized = false;

  private readonly SECRET_DEFINITIONS: Record<string, Omit<SecretMetadata, 'key'>> = {
    DATABASE_URL: {
      description: 'Primary database connection string',
      rotationPolicy: 'quarterly',
      environment: 'all',
      sensitive: true,
      required: true
    },
    REDIS_URL: {
      description: 'Redis connection string for job queues',
      rotationPolicy: 'quarterly',
      environment: 'all',
      sensitive: true,
      required: true
    },
    NEXTAUTH_SECRET: {
      description: 'NextAuth.js JWT signing secret',
      rotationPolicy: 'monthly',
      environment: 'all',
      sensitive: true,
      required: true
    },
    CIRCLE_API_KEY: {
      description: 'Circle Programmable Wallets API key',
      rotationPolicy: 'quarterly',
      environment: 'all',
      sensitive: true,
      required: false
    },
    CIRCLE_ENTITY_SECRET: {
      description: 'Circle entity secret for webhooks',
      rotationPolicy: 'quarterly',
      environment: 'all',
      sensitive: true,
      required: false
    },
    OPENAI_API_KEY: {
      description: 'OpenAI API key for LLM services',
      rotationPolicy: 'quarterly',
      environment: 'all',
      sensitive: true,
      required: false
    },
    RESEND_API_KEY: {
      description: 'Resend email service API key',
      rotationPolicy: 'quarterly',
      environment: 'all',
      sensitive: true,
      required: false
    },
    SENTRY_DSN: {
      description: 'Sentry error tracking DSN',
      rotationPolicy: 'never',
      environment: 'production',
      sensitive: false,
      required: false
    },
    WEBHOOK_SECRET: {
      description: 'Generic webhook signature secret',
      rotationPolicy: 'monthly',
      environment: 'all',
      sensitive: true,
      required: false
    }
  };

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await SafetyController.executeWithProtection('SECRETS_MANAGER', async () => {
        // Load secrets from environment variables
        for (const [key, definition] of Object.entries(this.SECRET_DEFINITIONS)) {
          const value = process.env[key];
          
          if (value) {
            const metadata: SecretMetadata = {
              key,
              ...definition
            };

            this.secrets.set(key, {
              key,
              value,
              metadata,
              masked: definition.sensitive
            });
          }
        }

        this.initialized = true;
        console.log(`Secrets manager initialized with ${this.secrets.size} secrets`);
      });
    } catch (error) {
      console.error('Failed to initialize secrets manager:', error);
      // Continue with limited functionality
      this.initialized = true;
    }
  }

  /**
   * Get a secret value
   */
  async getSecret(key: string): Promise<string | null> {
    await this.ensureInitialized();

    return SafetyController.executeWithProtection('SECRETS_MANAGER', async () => {
      const secret = this.secrets.get(key);
      return secret?.value || null;
    });
  }

  /**
   * Get multiple secrets at once
   */
  async getSecrets(keys: string[]): Promise<Record<string, string | null>> {
    await this.ensureInitialized();

    const result: Record<string, string | null> = {};
    
    for (const key of keys) {
      result[key] = await this.getSecret(key);
    }
    
    return result;
  }

  /**
   * Check if a secret exists and is valid
   */
  async hasSecret(key: string): Promise<boolean> {
    await this.ensureInitialized();
    const secret = this.secrets.get(key);
    return secret?.value != null && secret.value.trim() !== '';
  }

  /**
   * Get secret metadata without the value
   */
  async getSecretMetadata(key: string): Promise<SecretMetadata | null> {
    await this.ensureInitialized();
    const secret = this.secrets.get(key);
    return secret?.metadata || null;
  }

  /**
   * List all configured secrets (masked values)
   */
  async listSecrets(includeValues: boolean = false): Promise<SecretValue[]> {
    await this.ensureInitialized();

    return Array.from(this.secrets.values()).map(secret => ({
      ...secret,
      value: includeValues ? secret.value : this.maskValue(secret.value, secret.metadata.sensitive)
    }));
  }

  /**
   * Get comprehensive secrets health status
   */
  async getSecretsHealth(): Promise<SecretsHealth> {
    await this.ensureInitialized();

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    let expiringSoon = 0;
    let rotationOverdue = 0;
    const missing: string[] = [];

    // Check all defined secrets
    for (const [key, definition] of Object.entries(this.SECRET_DEFINITIONS)) {
      const secret = this.secrets.get(key);
      
      if (!secret || !secret.value) {
        if (definition.required) {
          missing.push(key);
        }
        continue;
      }

      // Check expiration
      if (secret.metadata.expiresAt && secret.metadata.expiresAt <= thirtyDaysFromNow) {
        expiringSoon++;
      }

      // Check rotation policy
      if (secret.metadata.rotationPolicy !== 'never' && secret.metadata.lastRotated) {
        const rotationIntervalMs = this.getRotationIntervalMs(secret.metadata.rotationPolicy);
        const rotationDue = secret.metadata.lastRotated.getTime() + rotationIntervalMs;
        
        if (now.getTime() > rotationDue) {
          rotationOverdue++;
        }
      }
    }

    const healthy = missing.length === 0 && rotationOverdue === 0;

    return {
      totalSecrets: this.secrets.size,
      expiringSoon,
      rotationOverdue,
      missing,
      healthy,
      lastCheck: now
    };
  }

  /**
   * Validate that all required secrets are present
   */
  async validateSecrets(): Promise<{
    valid: boolean;
    missing: string[];
    warnings: string[];
    errors: string[];
  }> {
    await this.ensureInitialized();

    const missing: string[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    for (const [key, definition] of Object.entries(this.SECRET_DEFINITIONS)) {
      const secret = this.secrets.get(key);

      if (!secret || !secret.value) {
        if (definition.required) {
          missing.push(key);
          errors.push(`Required secret ${key} is missing`);
        } else {
          warnings.push(`Optional secret ${key} is not configured`);
        }
        continue;
      }

      // Validate format/content if needed
      const validation = this.validateSecretFormat(key, secret.value);
      if (!validation.valid) {
        errors.push(`Secret ${key} has invalid format: ${validation.error}`);
      }
    }

    return {
      valid: missing.length === 0 && errors.length === 0,
      missing,
      warnings,
      errors
    };
  }

  /**
   * Get secrets for a specific environment
   */
  async getSecretsForEnvironment(environment: string): Promise<Record<string, string | null>> {
    await this.ensureInitialized();

    const envSecrets: Record<string, string | null> = {};

    for (const [key, secret] of Array.from(this.secrets.entries())) {
      if (secret.metadata.environment === 'all' || secret.metadata.environment === environment) {
        envSecrets[key] = secret.value;
      }
    }

    return envSecrets;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private maskValue(value: string, sensitive: boolean): string {
    if (!sensitive) return value;
    if (value.length <= 8) return '***';
    return value.slice(0, 4) + '***' + value.slice(-4);
  }

  private getRotationIntervalMs(policy: SecretMetadata['rotationPolicy']): number {
    switch (policy) {
      case 'weekly': return 7 * 24 * 60 * 60 * 1000;
      case 'monthly': return 30 * 24 * 60 * 60 * 1000;
      case 'quarterly': return 90 * 24 * 60 * 60 * 1000;
      case 'never': return Infinity;
      default: return Infinity;
    }
  }

  private validateSecretFormat(key: string, value: string): { valid: boolean; error?: string } {
    switch (key) {
      case 'DATABASE_URL':
      case 'REDIS_URL':
        try {
          new URL(value);
          return { valid: true };
        } catch {
          return { valid: false, error: 'Invalid URL format' };
        }

      case 'NEXTAUTH_SECRET':
        if (value.length < 32) {
          return { valid: false, error: 'Must be at least 32 characters long' };
        }
        return { valid: true };

      case 'CIRCLE_API_KEY':
      case 'OPENAI_API_KEY':
      case 'RESEND_API_KEY':
        if (value.length < 16) {
          return { valid: false, error: 'API key too short' };
        }
        return { valid: true };

      case 'SENTRY_DSN':
        if (!value.startsWith('https://')) {
          return { valid: false, error: 'Sentry DSN must be HTTPS URL' };
        }
        return { valid: true };

      default:
        return { valid: true };
    }
  }

  /**
   * Get configuration summary for debugging (no sensitive values)
   */
  async getConfigurationSummary(): Promise<{
    environment: string;
    secretsConfigured: number;
    requiredSecrets: { configured: number; total: number };
    optionalSecrets: { configured: number; total: number };
    features: Record<string, boolean>;
  }> {
    await this.ensureInitialized();

    const environment = process.env.NODE_ENV || 'development';
    const secretsConfigured = this.secrets.size;
    
    let requiredConfigured = 0;
    let requiredTotal = 0;
    let optionalConfigured = 0;
    let optionalTotal = 0;

    for (const [key, definition] of Object.entries(this.SECRET_DEFINITIONS)) {
      const hasSecret = this.secrets.has(key) && this.secrets.get(key)?.value;
      
      if (definition.required) {
        requiredTotal++;
        if (hasSecret) requiredConfigured++;
      } else {
        optionalTotal++;
        if (hasSecret) optionalConfigured++;
      }
    }

    // Feature availability based on secrets
    const features = {
      circleIntegration: await this.hasSecret('CIRCLE_API_KEY'),
      llmServices: await this.hasSecret('OPENAI_API_KEY'),
      emailNotifications: await this.hasSecret('RESEND_API_KEY'),
      errorTracking: await this.hasSecret('SENTRY_DSN'),
      redis: await this.hasSecret('REDIS_URL'),
      database: await this.hasSecret('DATABASE_URL')
    };

    return {
      environment,
      secretsConfigured,
      requiredSecrets: { configured: requiredConfigured, total: requiredTotal },
      optionalSecrets: { configured: optionalConfigured, total: optionalTotal },
      features
    };
  }
}

export const SecretsManager = new SecretsManagerService();