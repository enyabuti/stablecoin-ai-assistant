import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db as prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Activity,
  DollarSign,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  Zap,
  Shield,
  Timer,
  TestTube,
} from "lucide-react";
import { getChainConfig } from "@/lib/routing/chains";

async function getUserData(userId: string) {
  // Skip database queries during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    const mockData = {
      user: { email: 'build@example.com', createdAt: new Date() },
      rules: [],
      executions: [],
      wallets: []
    };
    
    const stats = {
      totalRules: 0,
      activeRules: 0,
      totalExecutions: 0,
      successfulExecutions: 0,
      totalFees: 0,
      connectedChains: 0,
    };
    
    return { ...mockData, stats };
  }

  const [user, rules, executions, wallets] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        createdAt: true,
      },
    }),
    prisma.rule.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        executions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),
    prisma.execution.findMany({
      where: {
        rule: { userId },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.wallet.findMany({
      where: { userId },
    }),
  ]);

  const stats = {
    totalRules: rules.length,
    activeRules: rules.filter((r: any) => r.status === "ACTIVE").length,
    totalExecutions: executions.length,
    successfulExecutions: executions.filter((e: any) => e.status === "COMPLETED").length,
    totalFees: executions.reduce((sum: number, e: any) => sum + (e.feeUsd || 0), 0),
    connectedChains: wallets.length,
  };

  return { user, rules, executions, stats };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { user, rules, executions, stats } = await getUserData(session.user.id);

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-contrast-enhanced">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.email}
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
      <div className="glass-card border-amber-500/20 bg-amber-50/10 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center">
            <TestTube className="w-3 h-3 text-amber-600" />
          </div>
          <h3 className="font-semibold text-amber-700 dark:text-amber-300">Demo Mode Active</h3>
        </div>
        <p className="text-sm text-amber-600 dark:text-amber-400">
          You&apos;re using Ferrow in demo mode. All data shown is for demonstration purposes. 
          To enable live transactions, configure your Circle API keys in Settings.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
                <p className="text-3xl font-bold font-mono">{stats.activeRules}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalRules} total rules
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Executions</p>
                <p className="text-3xl font-bold font-mono">{stats.totalExecutions}</p>
                <p className="text-xs text-success mt-1">
                  {stats.successfulExecutions} successful
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Fees</p>
                <p className="text-3xl font-bold font-mono">${stats.totalFees.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ${stats.totalExecutions > 0 ? (stats.totalFees / stats.totalExecutions).toFixed(3) : '0.000'} avg
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connected Chains</p>
                <p className="text-3xl font-bold font-mono">{stats.connectedChains}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Multi-chain ready
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Rules */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Recent Rules</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/rules">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {rules.length > 0 ? (
              rules.map((rule: any) => (
                <div key={rule.id} className="flex items-center justify-between p-4 rounded-xl bg-bg-elevated/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={rule.status === "ACTIVE" ? "default" : "secondary"}>
                        {rule.status.toLowerCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground capitalize">{rule.type}</span>
                    </div>
                    <p className="text-sm font-medium text-card-foreground truncate">
                      {(rule.json as any)?.description || `Rule ${rule.id.slice(0, 8)}`}
                    </p>
                    {rule.executions[0] && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last run: {new Date(rule.executions[0].createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">No rules created yet</p>
                <Button asChild size="sm" className="btn-primary">
                  <Link href="/rules/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Rule
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/transfers">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {executions.length > 0 ? (
              executions.slice(0, 5).map((execution: any) => (
                <div key={execution.id} className="flex items-center justify-between p-4 rounded-xl bg-bg-elevated/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      execution.status === "COMPLETED" ? "bg-success" :
                      execution.status === "FAILED" ? "bg-danger" :
                      execution.status === "PROCESSING" ? "bg-primary" :
                      "bg-muted-foreground"
                    }`} />
                    <div>
                      <p className="text-sm font-medium">
                        {execution.status === "COMPLETED" ? "Transfer completed" :
                         execution.status === "FAILED" ? "Transfer failed" :
                         execution.status === "PROCESSING" ? "Transfer processing" :
                         "Transfer pending"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(execution.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {execution.feeUsd && (
                      <p className="text-sm font-mono">${execution.feeUsd.toFixed(3)}</p>
                    )}
                    {execution.chain && (
                      <p className="text-xs text-muted-foreground">{execution.chain}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No activity yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto p-4 justify-start">
              <Link href="/rules/new">
                <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center mr-3">
                  <Plus className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Create Rule</p>
                  <p className="text-xs text-muted-foreground">Set up automation</p>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 justify-start">
              <Link href="/transfers">
                <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center mr-3">
                  <TrendingUp className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium">View Transfers</p>
                  <p className="text-xs text-muted-foreground">Check history</p>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 justify-start">
              <Link href="/settings">
                <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center mr-3">
                  <Timer className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Settings</p>
                  <p className="text-xs text-muted-foreground">Configure app</p>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}