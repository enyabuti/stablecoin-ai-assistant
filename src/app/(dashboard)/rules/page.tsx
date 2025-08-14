"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { RuleCard } from "@/components/RuleCard";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Plus,
  Play,
  Pause,
  MoreHorizontal,
  Clock,
  DollarSign,
  Calendar,
  TestTube,
  Shield,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// Rule segments for mobile
type RuleSegment = "active" | "needs_approval" | "paused";

const segments = [
  { key: "active" as RuleSegment, label: "Active", count: 3 },
  { key: "needs_approval" as RuleSegment, label: "Needs Approval", count: 1 },
  { key: "paused" as RuleSegment, label: "Paused", count: 2 },
];

function StatusBadge({ status }: { status: string }) {
  const variants = {
    ACTIVE: "badge-success",
    PAUSED: "badge-secondary", 
    COMPLETED: "badge-secondary",
    FAILED: "badge-warning",
  } as const;
  
  return (
    <span className={variants[status as keyof typeof variants] || "badge-secondary"}>
      {status.toLowerCase()}
    </span>
  );
}

function formatDate(dateString: string | null) {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Mock data for demo mode
const mockRules = [
  {
    id: "rule_demo_1",
    title: "Monthly contractor payment",
    description: "Send $500 USDC to contractor monthly",
    status: "active" as const,
    frequency: "Monthly",
    amount: "$500",
    nextRun: "in 7 days",
    limits: { daily: "$1,000" },
    lastExecution: {
      status: "success" as const,
      timestamp: "30 days ago"
    }
  },
  {
    id: "rule_demo_2", 
    title: "ETH buy the dip",
    description: "Buy $200 ETH when price drops below $2000",
    status: "active" as const,
    frequency: "Price-based",
    amount: "$200",
    nextRun: "Waiting for trigger",
    limits: { confirmOver: "$100" },
    lastExecution: {
      status: "success" as const,
      timestamp: "5 days ago"
    }
  },
  {
    id: "rule_demo_3",
    title: "Weekly BTC DCA",
    description: "Weekly DCA $100 into BTC",
    status: "paused" as const,
    frequency: "Weekly",
    amount: "$100",
    nextRun: "Paused",
    limits: { daily: "$200" },
    lastExecution: {
      status: "success" as const,
      timestamp: "14 days ago"
    }
  },
  {
    id: "rule_demo_4",
    title: "EURC conversion",
    description: "Convert USDC to EURC when EUR strengthens by 2%",
    status: "needs_approval" as const,
    frequency: "Price-based",
    amount: "Dynamic",
    nextRun: "Pending approval",
    limits: { confirmOver: "$50" },
    lastExecution: {
      status: "pending" as const,
      timestamp: "60 days ago"
    }
  }
];

export default function RulesPage() {
  const [activeSegment, setActiveSegment] = useState<RuleSegment>("active");
  
  // Filter rules based on active segment
  const filteredRules = mockRules.filter(rule => {
    if (activeSegment === "active") return rule.status === "active";
    if (activeSegment === "needs_approval") return rule.status === "needs_approval";
    if (activeSegment === "paused") return rule.status === "paused";
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-[calc(env(safe-area-inset-bottom)+80px)] sm:pb-0">
      {/* Mobile Header */}
      <MobileHeader title="Rules" showAddRule={false} />
      
      {/* Desktop Header - Hidden on mobile */}
      <div className="border-b border-border bg-background hidden sm:block">
        <div className="container-page">
          <div className="flex items-center justify-between py-8">
            <div>
              <h1 className="text-heading text-foreground mb-2">Automation Rules</h1>
              <p className="text-body text-foreground-muted">
                Manage your automation rules and schedules
              </p>
            </div>
            <Button asChild className="btn-primary">
              <Link href="/rules/new">
                <Plus className="w-4 h-4 mr-2" />
                New Rule
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Segmented Control */}
      <div className="sm:hidden px-4 pt-4 pb-2">
        <div className="bg-gray-100 rounded-xl p-1">
          <div className="grid grid-cols-3 gap-1">
            {segments.map((segment) => (
              <button
                key={segment.key}
                onClick={() => setActiveSegment(segment.key)}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-all rounded-lg",
                  activeSegment === segment.key
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <span>{segment.label}</span>
                {segment.count > 0 && (
                  <span className={cn(
                    "ml-2 px-2 py-0.5 text-xs rounded-full",
                    activeSegment === segment.key
                      ? "bg-primary text-white"
                      : "bg-gray-300 text-gray-600"
                  )}>
                    {segment.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Rules List */}
      <div className="sm:hidden px-4 pb-6">
        <div className="space-y-3">
          {filteredRules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              variant="mobile"
              onRun={(ruleId) => console.log("Run rule:", ruleId)}
              onEdit={(ruleId) => console.log("Edit rule:", ruleId)}
            />
          ))}
          
          {filteredRules.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No {activeSegment.replace('_', ' ')} rules
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {activeSegment === "active" && "Create your first automation rule to get started"}
                {activeSegment === "needs_approval" && "No rules need approval at this time"}
                {activeSegment === "paused" && "No paused rules to show"}
              </p>
              {activeSegment === "active" && (
                <Button asChild className="btn-primary">
                  <Link href="/rules/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Rule
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Content */}
      <div className="container-page py-8 hidden sm:block">
        {/* Demo Mode Banner */}
        <div className="demo-banner mb-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
              <TestTube className="w-6 h-6 text-yellow-900" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-subheading text-yellow-900">Demo Mode - Sample Data</h3>
                <div className="px-3 py-1 bg-yellow-400/20 rounded-full">
                  <span className="text-xs font-medium text-yellow-800">Safe Testing</span>
                </div>
              </div>
              <p className="text-body text-yellow-800 mb-4">
                These are example automation rules to showcase functionality. 
                <Link href="/auth/signup" className="font-medium hover:underline ml-1">
                  Sign up
                </Link> to create your own rules and enable live transactions.
              </p>
              <div className="flex items-center space-x-2 text-body-small text-yellow-700">
                <Shield className="w-4 h-4" />
                <span>No real transactions • Sample data only • Always safe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Rules */}
        <div className="space-y-4">
          {mockRules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              variant="desktop"
              onRun={(ruleId) => console.log("Run rule:", ruleId)}
              onEdit={(ruleId) => console.log("Edit rule:", ruleId)}
            />
          ))}
        </div>
        
        {mockRules.length === 0 && (
          /* Empty State */
          <div className="card-modern p-16 text-center">
            <div className="w-16 h-16 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-subheading text-foreground mb-3">No automation rules yet</h3>
            <p className="text-body text-foreground-muted mb-8 max-w-md mx-auto">
              Create your first rule to start automating stablecoin transfers across multiple blockchains
            </p>
            <Button asChild className="btn-primary">
              <Link href="/rules/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Rule
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Floating Action Button - Mobile Only */}
      <div className="fixed bottom-20 right-4 z-30 sm:hidden">
        <Button 
          asChild 
          className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-xl transition-all"
        >
          <Link href="/rules/new">
            <Plus className="w-6 h-6" />
            <span className="sr-only">Create new rule</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}