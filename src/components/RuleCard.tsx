"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Rule {
  id: string;
  title: string;
  description: string;
  nextRun?: string;
  status: "active" | "paused" | "needs_approval";
  frequency: string;
  amount?: string;
  limits?: {
    daily?: string;
    confirmOver?: string;
  };
  lastExecution?: {
    status: "success" | "failed" | "pending";
    timestamp: string;
  };
}

interface RuleCardProps {
  rule: Rule;
  variant?: "desktop" | "mobile";
  onRun?: (ruleId: string) => void;
  onEdit?: (ruleId: string) => void;
  className?: string;
}

export function RuleCard({ 
  rule, 
  variant = "desktop", 
  onRun, 
  onEdit, 
  className 
}: RuleCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const statusConfig = {
    active: {
      color: "bg-green-100 text-green-700",
      icon: CheckCircle2,
      label: "Active"
    },
    paused: {
      color: "bg-yellow-100 text-yellow-700", 
      icon: Clock,
      label: "Paused"
    },
    needs_approval: {
      color: "bg-red-100 text-red-700",
      icon: AlertCircle,
      label: "Needs Approval"
    }
  };

  const status = statusConfig[rule.status];

  if (variant === "mobile") {
    return (
      <>
        <Card 
          className={cn(
            "p-4 bg-white border border-gray-200 shadow-card rounded-2xl cursor-pointer sm:hidden",
            "hover:shadow-md transition-all duration-200",
            className
          )}
          onClick={() => setIsDrawerOpen(true)}
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {rule.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {rule.description}
                </p>
              </div>
              
              <div className="ml-3 flex-shrink-0">
                <Badge className={cn("text-xs", status.color)}>
                  <status.icon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
            </div>

            {/* Next run and frequency */}
            {rule.nextRun && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>Next run: {rule.nextRun} • {rule.frequency}</span>
              </div>
            )}

            {/* Amount and limits */}
            <div className="flex items-center justify-between">
              {rule.amount && (
                <div className="flex items-center text-sm font-medium text-gray-900">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {rule.amount}
                </div>
              )}
              
              <div className="flex space-x-2">
                {rule.limits?.daily && (
                  <Badge variant="outline" className="text-xs">
                    Daily: {rule.limits.daily}
                  </Badge>
                )}
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-3 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRun?.(rule.id);
                  }}
                  disabled={rule.status !== "active"}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Run now
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Mobile drawer for audit timeline */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 sm:hidden">
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsDrawerOpen(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
              
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {rule.title}
                  </h2>
                  <p className="text-gray-600">{rule.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <Badge className={cn("mt-1", status.color)}>
                      <status.icon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Frequency</div>
                    <div className="mt-1 font-medium">{rule.frequency}</div>
                  </div>
                </div>

                {rule.lastExecution && (
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Last Execution</div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          rule.lastExecution.status === "success" && "bg-green-500",
                          rule.lastExecution.status === "failed" && "bg-red-500",
                          rule.lastExecution.status === "pending" && "bg-yellow-500"
                        )} />
                        <span className="text-sm capitalize">
                          {rule.lastExecution.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {rule.lastExecution.timestamp}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      onRun?.(rule.id);
                      setIsDrawerOpen(false);
                    }}
                    disabled={rule.status !== "active"}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run now
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      onEdit?.(rule.id);
                      setIsDrawerOpen(false);
                    }}
                  >
                    Edit Rule
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop variant
  return (
    <Card className={cn(
      "p-6 bg-white border border-gray-200 shadow-card rounded-2xl hover:shadow-md transition-all duration-200 hidden sm:block",
      className
    )}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {rule.title}
            </h3>
            <p className="text-gray-600">{rule.description}</p>
          </div>
          
          <Badge className={cn("ml-4", status.color)}>
            <status.icon className="w-4 h-4 mr-1" />
            {status.label}
          </Badge>
        </div>

        {/* Details */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            {rule.nextRun && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>Next: {rule.nextRun}</span>
              </div>
            )}
            
            {rule.amount && (
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                <span className="font-medium text-gray-900">{rule.amount}</span>
              </div>
            )}
            
            <span>{rule.frequency}</span>
          </div>

          <div className="flex items-center space-x-3">
            {rule.limits?.daily && (
              <Badge variant="outline">
                Daily limit: {rule.limits.daily}
              </Badge>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRun?.(rule.id)}
              disabled={rule.status !== "active"}
            >
              <Play className="w-4 h-4 mr-2" />
              Run now
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit?.(rule.id)}
            >
              Edit
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}