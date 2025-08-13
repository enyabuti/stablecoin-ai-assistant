import { db } from "@/lib/db";

export interface AuditEvent {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: "AUTH" | "RULE" | "EXECUTION" | "FINANCIAL" | "SYSTEM" | "SECURITY";
}

export interface SecurityAlert {
  userId: string;
  alertType: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  metadata?: Record<string, any>;
  resolved?: boolean;
}

export class AuditLogger {
  private static instance: AuditLogger;
  
  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async logEvent(event: AuditEvent): Promise<void> {
    try {
      await db.auditLog.create({
        data: {
          userId: event.userId,
          action: event.action,
          resource: event.resource,
          resourceId: event.resourceId,
          metadata: event.metadata || {},
          severity: event.severity,
          category: event.category,
          timestamp: new Date(),
        },
      });

      // Console log for development
      const logLevel = this.getLogLevel(event.severity);
      console[logLevel](`[AUDIT] ${event.category}:${event.action}`, {
        userId: event.userId,
        resource: event.resource,
        resourceId: event.resourceId,
        metadata: event.metadata,
      });

      // Trigger alerts for high severity events
      if (event.severity === "HIGH" || event.severity === "CRITICAL") {
        await this.triggerSecurityAlert(event);
      }
    } catch (error) {
      console.error("Failed to log audit event:", error);
      // Don't throw - audit failures shouldn't break main functionality
    }
  }

  async createSecurityAlert(alert: SecurityAlert): Promise<void> {
    try {
      await db.securityAlert.create({
        data: {
          userId: alert.userId,
          alertType: alert.alertType,
          description: alert.description,
          severity: alert.severity,
          metadata: alert.metadata || {},
          resolved: alert.resolved || false,
          createdAt: new Date(),
        },
      });

      console.warn(`[SECURITY ALERT] ${alert.alertType}:`, {
        userId: alert.userId,
        description: alert.description,
        severity: alert.severity,
        metadata: alert.metadata,
      });
    } catch (error) {
      console.error("Failed to create security alert:", error);
    }
  }

  private async triggerSecurityAlert(event: AuditEvent): Promise<void> {
    const alertType = this.getAlertType(event);
    const description = this.generateAlertDescription(event);

    await this.createSecurityAlert({
      userId: event.userId,
      alertType,
      description,
      severity: event.severity,
      metadata: {
        originalEvent: event,
        timestamp: new Date(),
      },
    });
  }

  private getLogLevel(severity: string): "log" | "info" | "warn" | "error" {
    switch (severity) {
      case "LOW": return "log";
      case "MEDIUM": return "info";
      case "HIGH": return "warn";
      case "CRITICAL": return "error";
      default: return "log";
    }
  }

  private getAlertType(event: AuditEvent): string {
    const actionMapping = {
      "RULE_EXECUTION_FAILED": "EXECUTION_FAILURE",
      "LARGE_TRANSFER": "HIGH_VALUE_TRANSACTION",
      "RAPID_RULE_CREATION": "SUSPICIOUS_ACTIVITY",
      "AUTHENTICATION_FAILURE": "AUTH_ANOMALY",
      "WALLET_ACCESS": "WALLET_SECURITY",
    };

    return actionMapping[event.action as keyof typeof actionMapping] || "GENERAL_ALERT";
  }

  private generateAlertDescription(event: AuditEvent): string {
    const descriptions = {
      "RULE_EXECUTION_FAILED": `Rule execution failed for user ${event.userId}`,
      "LARGE_TRANSFER": `Large transfer attempted: ${event.metadata?.amount} ${event.metadata?.currency}`,
      "RAPID_RULE_CREATION": `Rapid rule creation detected: ${event.metadata?.count} rules in ${event.metadata?.timeWindow}`,
      "AUTHENTICATION_FAILURE": `Authentication failure for user ${event.userId}`,
      "WALLET_ACCESS": `Wallet access from new location for user ${event.userId}`,
    };

    return descriptions[event.action as keyof typeof descriptions] || 
           `Security event: ${event.action} for resource ${event.resource}`;
  }

  // Convenience methods for common audit events
  async logRuleCreation(userId: string, ruleId: string, ruleData: any): Promise<void> {
    await this.logEvent({
      userId,
      action: "RULE_CREATED",
      resource: "rule",
      resourceId: ruleId,
      metadata: { ruleType: ruleData.type, amount: ruleData.amount },
      severity: "LOW",
      category: "RULE",
    });
  }

  async logRuleExecution(userId: string, ruleId: string, executionId: string, status: string): Promise<void> {
    await this.logEvent({
      userId,
      action: "RULE_EXECUTED",
      resource: "execution",
      resourceId: executionId,
      metadata: { ruleId, status },
      severity: status === "FAILED" ? "MEDIUM" : "LOW",
      category: "EXECUTION",
    });
  }

  async logTransfer(userId: string, transferId: string, amount: number, currency: string, chain: string): Promise<void> {
    const isLargeTransfer = amount > 1000;
    
    await this.logEvent({
      userId,
      action: isLargeTransfer ? "LARGE_TRANSFER" : "TRANSFER",
      resource: "transfer",
      resourceId: transferId,
      metadata: { amount, currency, chain },
      severity: isLargeTransfer ? "HIGH" : "LOW",
      category: "FINANCIAL",
    });
  }

  async logAuthentication(userId: string, success: boolean, metadata?: any): Promise<void> {
    await this.logEvent({
      userId,
      action: success ? "AUTH_SUCCESS" : "AUTH_FAILURE",
      resource: "authentication",
      metadata,
      severity: success ? "LOW" : "MEDIUM",
      category: "AUTH",
    });
  }

  async logWalletAccess(userId: string, walletId: string, action: string): Promise<void> {
    await this.logEvent({
      userId,
      action: "WALLET_ACCESS",
      resource: "wallet",
      resourceId: walletId,
      metadata: { action },
      severity: "MEDIUM",
      category: "FINANCIAL",
    });
  }

  async logSystemError(userId: string, error: string, context?: any): Promise<void> {
    await this.logEvent({
      userId,
      action: "SYSTEM_ERROR",
      resource: "system",
      metadata: { error, context },
      severity: "HIGH",
      category: "SYSTEM",
    });
  }
}

export const auditLogger = AuditLogger.getInstance();