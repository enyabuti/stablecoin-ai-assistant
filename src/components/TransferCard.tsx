"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  Clock, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  XCircle,
  Pause
} from "lucide-react";
import { getChainConfig } from "@/lib/routing/chains";
import { formatDistanceToNow } from "date-fns";

interface TransferExecution {
  id: string;
  status: "COMPLETED" | "PENDING" | "PROCESSING" | "FAILED" | "CANCELLED";
  feeUsd: number | null;
  chain: string | null;
  txHash: string | null;
  createdAt: Date;
  errorMessage: string | null;
  ruleId: string;
  rule: {
    type: "schedule" | "conditional";
    json: {
      description?: string;
      asset?: string;
      amount?: {
        value: number;
        currency: string;
      };
      destination?: {
        type: string;
        value: string;
      };
    };
  };
}

interface TransferCardProps {
  execution: TransferExecution;
  variant?: "desktop" | "mobile";
}

function StatusIcon({ status }: { status: TransferExecution["status"] }) {
  const iconClass = "w-5 h-5";
  
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 className={`${iconClass} text-green-600`} />;
    case "PENDING":
      return <Clock className={`${iconClass} text-amber-600`} />;
    case "PROCESSING":
      return <Loader2 className={`${iconClass} text-blue-600 animate-spin`} />;
    case "FAILED":
      return <XCircle className={`${iconClass} text-red-600`} />;
    case "CANCELLED":
      return <Pause className={`${iconClass} text-gray-600`} />;
    default:
      return <Clock className={`${iconClass} text-gray-600`} />;
  }
}

function StatusBadge({ status }: { status: TransferExecution["status"] }) {
  const variants = {
    COMPLETED: { variant: "default" as const, color: "bg-green-100 text-green-800 border-green-200" },
    PENDING: { variant: "secondary" as const, color: "bg-amber-100 text-amber-800 border-amber-200" }, 
    PROCESSING: { variant: "secondary" as const, color: "bg-blue-100 text-blue-800 border-blue-200" },
    FAILED: { variant: "destructive" as const, color: "bg-red-100 text-red-800 border-red-200" },
    CANCELLED: { variant: "outline" as const, color: "bg-gray-100 text-gray-800 border-gray-200" },
  };
  
  const config = variants[status] || variants.CANCELLED;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <StatusIcon status={status} />
      {status.toLowerCase()}
    </span>
  );
}

function formatAmount(execution: TransferExecution) {
  const ruleData = execution.rule.json;
  if (ruleData.amount) {
    const symbol = ruleData.amount.currency === "EUR" ? "€" : "$";
    return `${symbol}${ruleData.amount.value}`;
  }
  return "—";
}

function formatDestination(execution: TransferExecution) {
  const ruleData = execution.rule.json;
  if (!ruleData.destination) return "—";
  
  if (ruleData.destination.type === "address") {
    return `${ruleData.destination.value.slice(0, 6)}...${ruleData.destination.value.slice(-4)}`;
  }
  return ruleData.destination.value;
}

export function TransferCard({ execution, variant = "mobile" }: TransferCardProps) {
  const ruleData = execution.rule.json;
  const chainConfig = execution.chain ? getChainConfig(execution.chain as any) : null;
  
  if (variant === "desktop") {
    return (
      <Card className="glass-card hover:shadow-lg transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {execution.rule.type === "schedule" ? "Scheduled" : "Conditional"} Transfer
                  </h3>
                  <p className="text-sm text-foreground-muted mt-1">
                    {ruleData.description || `Rule ${execution.ruleId.slice(0, 8)}`}
                  </p>
                </div>
                <StatusBadge status={execution.status} />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-foreground-muted">Amount</p>
                  <p className="font-semibold text-foreground">{formatAmount(execution)}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-muted">To</p>
                  <p className="font-semibold text-foreground">{formatDestination(execution)}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-muted">Chain</p>
                  {chainConfig ? (
                    <div className="flex items-center gap-2">
                      <span>{chainConfig.icon}</span>
                      <span className="font-semibold text-foreground">{chainConfig.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-foreground-muted">Not assigned</span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-foreground-muted">Fee</p>
                  <p className="font-semibold font-mono text-foreground">
                    {execution.feeUsd ? `$${execution.feeUsd.toFixed(3)}` : "—"}
                  </p>
                </div>
              </div>
              
              {execution.errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-800">{execution.errorMessage}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-foreground-muted">
                  {formatDistanceToNow(execution.createdAt, { addSuffix: true })}
                </p>
                {execution.txHash && (
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Mobile variant
  return (
    <Card className="glass-card active:scale-98 transition-all duration-150">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with status and time */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon status={execution.status} />
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {formatAmount(execution)} {ruleData.asset || "USDC"}
                </p>
                <p className="text-xs text-foreground-muted">
                  {execution.rule.type === "schedule" ? "Scheduled" : "Conditional"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-foreground-muted">
                {formatDistanceToNow(execution.createdAt, { addSuffix: true })}
              </p>
              {execution.feeUsd && (
                <p className="text-xs font-mono text-foreground-muted">
                  Fee: ${execution.feeUsd.toFixed(3)}
                </p>
              )}
            </div>
          </div>
          
          {/* Description */}
          <p className="text-sm text-foreground-muted line-clamp-2">
            {ruleData.description || `Rule ${execution.ruleId.slice(0, 8)}`}
          </p>
          
          {/* Chain and destination */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {chainConfig ? (
                <>
                  <span>{chainConfig.icon}</span>
                  <span className="text-sm font-medium text-foreground">{chainConfig.name}</span>
                </>
              ) : (
                <span className="text-sm text-foreground-muted">No chain</span>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-foreground-muted">To</p>
              <p className="text-sm font-medium text-foreground">{formatDestination(execution)}</p>
            </div>
          </div>
          
          {/* Error message */}
          {execution.errorMessage && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-xs text-red-800">{execution.errorMessage}</p>
            </div>
          )}
          
          {/* Bottom actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <StatusBadge status={execution.status} />
            {execution.txHash && (
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                <ExternalLink className="w-3 h-3 mr-1" />
                View
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}