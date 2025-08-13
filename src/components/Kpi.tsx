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
    <Card className={`glass-card rounded-3xl shadow-glass border-white/20 hover:shadow-glass-hover transform hover:scale-105 transition-all duration-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          {icon && <div className="w-10 h-10 rounded-2xl bg-hero-gradient flex items-center justify-center text-white shadow-lg">{icon}</div>}
        </div>
        
        <div className="space-y-2">
          <p className="text-3xl font-bold font-mono tracking-tight text-slate-800">
            {value}
          </p>
          
          {change && (
            <div className="flex items-center gap-2 text-sm">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                change.positive 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {change.positive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span className="font-semibold">
                  {change.value}
                </span>
              </div>
              <span className="text-slate-500 text-xs">vs last period</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}