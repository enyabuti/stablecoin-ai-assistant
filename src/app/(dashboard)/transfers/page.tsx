import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, ExternalLink, RefreshCw, TestTube } from "lucide-react";
import { getChainConfig } from "@/lib/routing/chains";
import Link from "next/link";

async function getUserExecutions(userId: string) {
  const executions = await prisma.execution.findMany({
    where: {
      rule: { userId },
    },
    orderBy: { createdAt: "desc" },
    include: {
      rule: {
        select: {
          type: true,
          json: true,
        },
      },
    },
  });

  return executions;
}

function StatusBadge({ status }: { status: string }) {
  const variants = {
    COMPLETED: "default",
    PENDING: "secondary", 
    PROCESSING: "secondary",
    FAILED: "destructive",
    CANCELLED: "outline",
  } as const;
  
  return (
    <Badge variant={variants[status as keyof typeof variants] || "outline"}>
      {status.toLowerCase()}
    </Badge>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Mock data for demo mode
const mockExecutions = [
  {
    id: "exec_demo_1",
    status: "COMPLETED",
    feeUsd: 0.23,
    chain: "base",
    txHash: "0x1234567890abcdef1234567890abcdef12345678",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    errorMessage: null,
    ruleId: "rule_demo_1",
    rule: {
      type: "schedule",
      json: { description: "Send $500 USDC to contractor monthly" }
    }
  },
  {
    id: "exec_demo_2",
    status: "COMPLETED", 
    feeUsd: 0.15,
    chain: "ethereum",
    txHash: "0xabcdef1234567890abcdef1234567890abcdef12",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    errorMessage: null,
    ruleId: "rule_demo_2",
    rule: {
      type: "conditional",
      json: { description: "Buy $200 ETH when price drops below $2000" }
    }
  },
  {
    id: "exec_demo_3",
    status: "PENDING",
    feeUsd: null,
    chain: "base",
    txHash: null,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    errorMessage: null,
    ruleId: "rule_demo_3",
    rule: {
      type: "schedule",
      json: { description: "Weekly DCA $100 into BTC" }
    }
  },
  {
    id: "exec_demo_4",
    status: "FAILED",
    feeUsd: null,
    chain: "polygon",
    txHash: null,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    errorMessage: "Insufficient balance",
    ruleId: "rule_demo_4",
    rule: {
      type: "conditional", 
      json: { description: "Emergency stop-loss at 20% drop" }
    }
  },
  {
    id: "exec_demo_5",
    status: "COMPLETED",
    feeUsd: 0.08,
    chain: "arbitrum",
    txHash: "0x9876543210fedcba9876543210fedcba98765432",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    errorMessage: null,
    ruleId: "rule_demo_5", 
    rule: {
      type: "schedule",
      json: { description: "Send $25 USDC to Mom weekly" }
    }
  }
];

export default async function TransfersPage() {
  const session = await getServerSession(authOptions);
  
  // Use mock data for demo mode, real data for authenticated users
  const executions = session?.user?.id ? await getUserExecutions(session.user.id) : mockExecutions;

  const stats = {
    total: executions.length,
    completed: executions.filter((e: any) => e.status === "COMPLETED").length,
    failed: executions.filter((e: any) => e.status === "FAILED").length,
    pending: executions.filter((e: any) => e.status === "PENDING" || e.status === "PROCESSING").length,
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-contrast-enhanced">Transfers</h1>
          <p className="text-muted-foreground">
            View all transfer executions and their status
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
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
            These are example transfer executions to showcase functionality. 
            <Link href="/auth/signin?mode=signup" className="font-medium hover:underline ml-1">
              Sign up
            </Link> to see your actual transactions and execute real transfers.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <ArrowLeftRight className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold font-mono">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Transfers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success/20 rounded-xl flex items-center justify-center">
                <span className="text-success text-sm">✓</span>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Successful</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <span className="text-amber-600 text-sm">⏳</span>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-danger/20 rounded-xl flex items-center justify-center">
                <span className="text-danger text-sm">×</span>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{stats.failed}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transfers Table */}
      {executions.length > 0 ? (
        <Card className="glass-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left">
                    <th className="p-4 font-medium text-sm text-muted-foreground">Execution</th>
                    <th className="p-4 font-medium text-sm text-muted-foreground">Chain</th>
                    <th className="p-4 font-medium text-sm text-muted-foreground">Status</th>
                    <th className="p-4 font-medium text-sm text-muted-foreground">Fee</th>
                    <th className="p-4 font-medium text-sm text-muted-foreground">Date</th>
                    <th className="p-4 font-medium text-sm text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map((execution: any) => {
                    const ruleData = execution.rule.json as any;
                    return (
                      <tr key={execution.id} className="border-b border-white/5 hover:bg-bg-elevated/30">
                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="font-medium">
                              {execution.rule.type === "schedule" ? "Scheduled" : "Conditional"} Transfer
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {ruleData?.description || `Rule ${execution.ruleId.slice(0, 8)}`}
                            </p>
                            {execution.errorMessage && (
                              <p className="text-xs text-danger">
                                Error: {execution.errorMessage}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {execution.chain ? (
                            <div className="flex items-center gap-2">
                              <span>{getChainConfig(execution.chain as any).icon}</span>
                              <span className="text-sm">{getChainConfig(execution.chain as any).name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Not assigned</span>
                          )}
                        </td>
                        <td className="p-4">
                          <StatusBadge status={execution.status} />
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm">
                            {execution.feeUsd ? `$${execution.feeUsd.toFixed(3)}` : "—"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">{formatDate(execution.createdAt.toISOString())}</span>
                        </td>
                        <td className="p-4">
                          {execution.txHash ? (
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">No tx</span>
                          )}
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
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <ArrowLeftRight className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No transfers yet</h3>
            <p className="text-muted-foreground mb-6">
              Create automation rules to start executing transfers
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Link href="/rules/new">
                Create Your First Rule
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}