import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Plus,
  Play,
  Pause,
  MoreHorizontal,
  Clock,
  DollarSign,
  Calendar,
} from "lucide-react";
import { getChainConfig } from "@/lib/routing/chains";

// Mock data - in real app this would come from API
const mockRules = [
  {
    id: "1",
    type: "schedule",
    description: "Send $50 USDC to John every Friday",
    status: "ACTIVE",
    nextRun: "2024-02-16T08:00:00Z",
    lastRun: "2024-02-09T08:00:00Z", 
    executions: 12,
    chain: "base",
    totalSpent: 600,
    avgFee: 0.05,
  },
  {
    id: "2",
    type: "conditional", 
    description: "Send €200 EURC when EUR strengthens 2%",
    status: "ACTIVE",
    nextRun: null,
    lastRun: null,
    executions: 0,
    chain: "polygon",
    totalSpent: 0,
    avgFee: 0.12,
  },
  {
    id: "3",
    type: "schedule",
    description: "Send $100 USDC to Alice monthly",
    status: "PAUSED", 
    nextRun: null,
    lastRun: "2024-01-15T12:00:00Z",
    executions: 3,
    chain: "arbitrum",
    totalSpent: 300,
    avgFee: 0.18,
  },
];

function StatusBadge({ status }: { status: string }) {
  const variants = {
    ACTIVE: "default",
    PAUSED: "secondary", 
    COMPLETED: "outline",
    FAILED: "destructive",
  } as const;
  
  return (
    <Badge variant={variants[status as keyof typeof variants] || "outline"}>
      {status.toLowerCase()}
    </Badge>
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

export default function RulesPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-contrast-enhanced">Rules</h1>
          <p className="text-muted-foreground">
            Manage your automation rules and schedules
          </p>
        </div>
        <Button asChild>
          <Link href="/rules/new">
            <Plus className="w-4 h-4 mr-2" />
            New Rule
          </Link>
        </Button>
      </div>

      {/* Rules Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr className="text-left">
                  <th className="p-4 font-medium text-sm text-muted-foreground">Rule</th>
                  <th className="p-4 font-medium text-sm text-muted-foreground">Status</th>
                  <th className="p-4 font-medium text-sm text-muted-foreground">Chain</th>
                  <th className="p-4 font-medium text-sm text-muted-foreground">Next Run</th>
                  <th className="p-4 font-medium text-sm text-muted-foreground">Stats</th>
                  <th className="p-4 font-medium text-sm text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockRules.map((rule) => {
                  const chainConfig = getChainConfig(rule.chain as any);
                  return (
                    <tr key={rule.id} className="border-b border-white/5 hover:bg-bg-elevated/30">
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="font-medium">{rule.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {rule.type === "schedule" ? (
                              <Calendar className="w-3 h-3" />
                            ) : (
                              <DollarSign className="w-3 h-3" />
                            )}
                            <span className="capitalize">{rule.type}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={rule.status} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span>{chainConfig.icon}</span>
                          <span className="text-sm">{chainConfig.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {rule.type === "conditional" ? (
                            <span className="text-muted-foreground">Monitoring</span>
                          ) : (
                            formatDate(rule.nextRun)
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs space-y-1">
                          <div>{rule.executions} runs</div>
                          <div className="text-muted-foreground">
                            ${rule.totalSpent} total
                          </div>
                          <div className="text-muted-foreground">
                            ${rule.avgFee.toFixed(3)} avg fee
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            {rule.status === "ACTIVE" ? (
                              <Pause className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Empty State (show when no rules) */}
      {mockRules.length === 0 && (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No automation rules yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first rule to start automating stablecoin transfers
            </p>
            <Button asChild>
              <Link href="/rules/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Rule
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}