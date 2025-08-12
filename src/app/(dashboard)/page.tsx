import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Kpi } from "@/components/Kpi";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  DollarSign,
  Activity,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  Zap,
} from "lucide-react";

// Mock data - in real app this would come from API
const mockKpis = {
  balance: { value: "$2,847.50", change: { value: "+12.3%", positive: true } },
  avgFee: { value: "$0.23", change: { value: "-8.2%", positive: true } },
  executions24h: { value: "47", change: { value: "+23.1%", positive: true } },
  scheduled: { value: "12" },
};

const mockRecentActivity = [
  {
    id: "1",
    type: "Send $50 USDC to John",
    status: "completed",
    chain: "Base",
    fee: "$0.05",
    timestamp: "2 min ago",
  },
  {
    id: "2", 
    type: "EUR/USD condition check",
    status: "monitoring",
    chain: "Polygon",
    fee: "$0.12",
    timestamp: "5 min ago",
  },
  {
    id: "3",
    type: "Send $25 USDC to Alice", 
    status: "pending",
    chain: "Arbitrum",
    fee: "$0.15",
    timestamp: "12 min ago",
  },
];

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-contrast-enhanced">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your stablecoin automation rules
          </p>
        </div>
        <Button asChild>
          <Link href="/rules/new">
            <Plus className="w-4 h-4 mr-2" />
            New Rule
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Kpi
          title="Total Balance"
          value={mockKpis.balance.value}
          change={mockKpis.balance.change}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <Kpi
          title="Avg Fee"
          value={mockKpis.avgFee.value}
          change={mockKpis.avgFee.change}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <Kpi
          title="24h Executions"
          value={mockKpis.executions24h.value}
          change={mockKpis.executions24h.change}
          icon={<Activity className="w-4 h-4" />}
        />
        <Kpi
          title="Scheduled"
          value={mockKpis.scheduled.value}
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-contrast-enhanced">
              Recent Activity
              <Button variant="ghost" size="sm" asChild>
                <Link href="/transfers">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-elevated/50">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.type}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.chain}</span>
                      <span>•</span>
                      <span>{item.fee}</span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                  <Badge
                    variant={item.status === "completed" ? "default" : item.status === "pending" ? "secondary" : "outline"}
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-contrast-enhanced">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild className="w-full justify-start h-12">
                <Link href="/rules/new">
                  <Plus className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Create New Rule</div>
                    <div className="text-xs opacity-75">Set up automation</div>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start h-12">
                <Zap className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Test Transfer</div>
                  <div className="text-xs opacity-75">Send a test transaction</div>
                </div>
              </Button>

              <Button variant="ghost" asChild className="w-full justify-start h-12">
                <Link href="/rules">
                  <Activity className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">View All Rules</div>
                    <div className="text-xs opacity-75">Manage automations</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}