import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
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
  TestTube,
} from "lucide-react";
import { getChainConfig } from "@/lib/routing/chains";

async function getUserRules(userId: string) {
  const rules = await prisma.rule.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      executions: {
        select: {
          status: true,
          feeUsd: true,
          createdAt: true,
        },
      },
    },
  });

  return rules.map((rule: any) => {
    const completedExecutions = rule.executions.filter((e: any) => e.status === "COMPLETED");
    const totalFees = completedExecutions.reduce((sum: number, e: any) => sum + (e.feeUsd || 0), 0);
    const avgFee = completedExecutions.length > 0 ? totalFees / completedExecutions.length : 0;
    
    return {
      ...rule,
      executionCount: rule.executions.length,
      totalFees,
      avgFee,
      lastExecution: rule.executions[0]?.createdAt || null,
    };
  });
}

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

// Mock data for demo mode
const mockRules = [
  {
    id: "rule_demo_1",
    type: "schedule",
    status: "ACTIVE",
    json: { description: "Send $500 USDC to contractor monthly" },
    nextRunAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    executionCount: 12,
    totalFees: 2.84,
    avgFee: 0.237,
    lastExecution: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  },
  {
    id: "rule_demo_2", 
    type: "conditional",
    status: "ACTIVE",
    json: { description: "Buy $200 ETH when price drops below $2000" },
    nextRunAt: null,
    executionCount: 3,
    totalFees: 0.45,
    avgFee: 0.150,
    lastExecution: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },
  {
    id: "rule_demo_3",
    type: "schedule", 
    status: "PAUSED",
    json: { description: "Weekly DCA $100 into BTC" },
    nextRunAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    executionCount: 8,
    totalFees: 1.92,
    avgFee: 0.240,
    lastExecution: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
  }
];

export default async function RulesPage() {
  const session = await getServerSession(authOptions);
  
  // Use mock data for demo mode, real data for authenticated users
  const rules = session?.user?.id ? await getUserRules(session.user.id) : mockRules;

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
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          <Link href="/rules/new">
            <Plus className="w-4 h-4 mr-2" />
            New Rule
          </Link>
        </Button>
      </div>

      {/* Demo Mode Banner */}
      {!session?.user?.id && (
        <div className="glass-card border-amber-500/20 bg-amber-50/10 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center">
              <TestTube className="w-3 h-3 text-amber-600" />
            </div>
            <h3 className="font-semibold text-amber-700 dark:text-amber-300">Demo Mode - Sample Data</h3>
          </div>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            These are example automation rules to showcase functionality. 
            <Link href="/auth/signin?mode=signup" className="font-medium hover:underline ml-1">
              Sign up
            </Link> to create your own rules and enable live transactions.
          </p>
        </div>
      )}

      {/* Rules Table */}
      {rules.length > 0 ? (
        <Card className="glass-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left">
                    <th className="p-4 font-medium text-sm text-muted-foreground">Rule</th>
                    <th className="p-4 font-medium text-sm text-muted-foreground">Status</th>
                    <th className="p-4 font-medium text-sm text-muted-foreground">Next Run</th>
                    <th className="p-4 font-medium text-sm text-muted-foreground">Stats</th>
                    <th className="p-4 font-medium text-sm text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule: any) => {
                    const ruleData = rule.json as any;
                    return (
                      <tr key={rule.id} className="border-b border-white/5 hover:bg-bg-elevated/30">
                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="font-medium">
                              {ruleData?.description || `Rule ${rule.id.slice(0, 8)}`}
                            </p>
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
                          <div className="text-sm">
                            {rule.type === "conditional" ? (
                              <span className="text-muted-foreground">Monitoring</span>
                            ) : rule.nextRunAt ? (
                              formatDate(rule.nextRunAt.toISOString())
                            ) : (
                              <span className="text-muted-foreground">Not scheduled</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs space-y-1">
                            <div>{rule.executionCount} runs</div>
                            <div className="text-muted-foreground">
                              ${rule.totalFees.toFixed(2)} total fees
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
      ) : (
        /* Empty State */
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No automation rules yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first rule to start automating stablecoin transfers
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
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