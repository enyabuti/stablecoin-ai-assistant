"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiProps {
  title: string;
  value: string;
  change?: {
    value: string;
    positive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function Kpi({ title, value, change, icon, className }: KpiProps) {
  return (
    <Card className={`glass-card hover:bg-bg-elevated/60 transition-all ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          {icon && <div className="text-accent">{icon}</div>}
        </div>
        
        <div className="space-y-1">
          <p className="text-2xl font-bold font-mono tracking-tight">
            {value}
          </p>
          
          {change && (
            <div className="flex items-center gap-1 text-xs">
              {change.positive ? (
                <TrendingUp className="w-3 h-3 text-success" />
              ) : (
                <TrendingDown className="w-3 h-3 text-danger" />
              )}
              <span className={change.positive ? "text-success" : "text-danger"}>
                {change.value}
              </span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}