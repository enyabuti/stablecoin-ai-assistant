"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { DollarSign, Zap, Activity, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPIItem {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

const defaultKPIs: KPIItem[] = [
  {
    label: "Total Balance",
    value: "$2,543.21",
    icon: DollarSign,
    change: "+2.1%",
    trend: "up"
  },
  {
    label: "Avg Fee",
    value: "$0.05",
    icon: Zap,
    change: "-12%",
    trend: "down"
  },
  {
    label: "24h Executions",
    value: "12",
    icon: Activity,
    change: "+3",
    trend: "up"
  },
  {
    label: "Next Scheduled",
    value: "2h 15m",
    icon: Clock,
    trend: "neutral"
  }
];

interface KPICarouselProps {
  kpis?: KPIItem[];
  className?: string;
}

export function KPICarousel({ kpis = defaultKPIs, className }: KPICarouselProps) {
  return (
    <div className={cn("sm:hidden", className)}>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-3 p-4">
          {kpis.map((kpi, index) => (
            <Card
              key={index}
              className="flex-none w-40 p-4 bg-white border border-gray-200 shadow-card rounded-2xl"
            >
              <div className="flex items-start justify-between mb-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  "bg-gradient-to-br from-primary/10 to-accent/10"
                )}>
                  <kpi.icon className="w-4 h-4 text-primary" />
                </div>
                {kpi.change && (
                  <div className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium",
                    kpi.trend === "up" && "bg-green-100 text-green-700",
                    kpi.trend === "down" && "bg-red-100 text-red-700",
                    kpi.trend === "neutral" && "bg-gray-100 text-gray-600"
                  )}>
                    {kpi.change}
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="text-lg font-semibold text-gray-900">
                  {kpi.value}
                </div>
                <div className="text-xs text-gray-500 leading-tight">
                  {kpi.label}
                </div>
              </div>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </div>
  );
}