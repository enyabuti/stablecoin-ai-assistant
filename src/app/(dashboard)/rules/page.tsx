import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
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
  Shield,
  TrendingUp,
} from "lucide-react";

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
    type: "schedule",
    status: "ACTIVE",
    json: { description: "Send $500 USDC to contractor monthly" },
    nextRunAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    executionCount: 12,
    totalFees: 2.84,
    avgFee: 0.237,
    lastExecution: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
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
    lastExecution: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: "rule_demo_3",
    type: "schedule", 
    status: "PAUSED",
    json: { description: "Weekly DCA $100 into BTC" },
    nextRunAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    executionCount: 8,
    totalFees: 1.92,
    avgFee: 0.240,
    lastExecution: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  }
];

export default async function RulesPage() {
  const session = await getServerSession(authOptions);
  const rules = session?.user?.id ? await getUserRules(session.user.id) : mockRules;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background">
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

      <div className="container-page py-8">
        {/* Demo Mode Banner */}
        {!session?.user?.id && (
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
                  <Link href="/auth/signin?mode=signup" className="font-medium hover:underline ml-1">
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
        )}

        {/* Rules Table */}
        {rules.length > 0 ? (
          <div className="card-modern overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-background-muted">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-body-small font-medium text-foreground-muted">Rule</th>
                    <th className="px-6 py-4 text-body-small font-medium text-foreground-muted">Status</th>
                    <th className="px-6 py-4 text-body-small font-medium text-foreground-muted">Next Run</th>
                    <th className="px-6 py-4 text-body-small font-medium text-foreground-muted">Performance</th>
                    <th className="px-6 py-4 text-body-small font-medium text-foreground-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule: any) => {
                    const ruleData = rule.json as any;
                    return (
                      <tr key={rule.id} className="border-b border-border hover:bg-background-muted/50 transition-colors">
                        <td className="px-6 py-6">
                          <div className="space-y-2">
                            <p className="text-body font-medium text-foreground">
                              {ruleData?.description || `Rule ${rule.id.slice(0, 8)}`}
                            </p>
                            <div className="flex items-center gap-3">
                              {rule.type === "schedule" ? (
                                <Calendar className="w-4 h-4 text-foreground-muted" />
                              ) : (
                                <TrendingUp className="w-4 h-4 text-foreground-muted" />
                              )}
                              <span className="text-body-small text-foreground-muted capitalize font-medium">{rule.type}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <StatusBadge status={rule.status} />
                        </td>
                        <td className="px-6 py-6">
                          <div className="text-body text-foreground">
                            {rule.type === "conditional" ? (
                              <span className="text-foreground-muted font-medium">Monitoring</span>
                            ) : rule.nextRunAt ? (
                              <span className="font-medium">{formatDate(rule.nextRunAt.toISOString())}</span>
                            ) : (
                              <span className="text-foreground-muted font-medium">Not scheduled</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="space-y-1">
                            <div className="text-body font-medium text-foreground">{rule.executionCount} executions</div>
                            <div className="text-body-small text-foreground-muted">
                              ${rule.totalFees.toFixed(2)} total fees
                            </div>
                            <div className="text-body-small text-foreground-muted">
                              ${rule.avgFee.toFixed(3)} avg fee
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                              {rule.status === "ACTIVE" ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
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
    </div>
  );
}