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
    <div className="space-y-8">
      {/* Modern Header with Glass Card */}
      <div className="glass-card p-8 rounded-3xl shadow-glass">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-hero-gradient bg-clip-text text-transparent mb-2">
              Welcome back
            </h1>
            <p className="text-lg text-slate-600">
              Manage your stablecoin automation rules and monitor activity
            </p>
          </div>
          <Button 
            asChild 
            className="h-12 px-6 bg-hero-gradient hover:shadow-glass-hover transform hover:scale-105 transition-all duration-200 text-white border-0"
          >
            <Link href="/rules/new">
              <Plus className="w-5 h-5 mr-2" />
              Create Rule
            </Link>
          </Button>
        </div>
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
        {/* Enhanced Recent Activity */}
        <Card className="glass-card rounded-3xl shadow-glass border-white/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-2xl font-bold text-slate-800">
              Recent Activity
              <Button variant="ghost" size="sm" asChild className="text-slate-600 hover:text-slate-800 hover:bg-white/20">
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
                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/20 hover:bg-white/40 transition-all duration-200">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800">{item.type}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="font-medium">{item.chain}</span>
                      <span>•</span>
                      <span>{item.fee}</span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                  <Badge
                    className={`${
                      item.status === "completed" 
                        ? "bg-green-100 text-green-800 border-green-200" 
                        : item.status === "pending" 
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200" 
                        : "bg-blue-100 text-blue-800 border-blue-200"
                    } font-medium`}
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Quick Actions */}
        <Card className="glass-card rounded-3xl shadow-glass border-white/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-slate-800">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button asChild className="w-full justify-start h-16 bg-hero-gradient hover:shadow-glass-hover transform hover:scale-105 transition-all duration-200 text-white border-0 rounded-2xl">
                <Link href="/rules/new">
                  <Plus className="w-5 h-5 mr-4" />
                  <div className="text-left">
                    <div className="font-semibold text-base">Create New Rule</div>
                    <div className="text-sm opacity-90">Set up automation</div>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start h-16 bg-white/20 border-white/30 text-slate-700 hover:bg-white/30 hover:text-slate-800 backdrop-blur-sm rounded-2xl transform hover:scale-105 transition-all duration-200">
                <Zap className="w-5 h-5 mr-4" />
                <div className="text-left">
                  <div className="font-semibold text-base">Test Transfer</div>
                  <div className="text-sm opacity-75">Send a test transaction</div>
                </div>
              </Button>

              <Button variant="ghost" asChild className="w-full justify-start h-16 text-slate-600 hover:text-slate-800 hover:bg-white/20 rounded-2xl transform hover:scale-105 transition-all duration-200">
                <Link href="/rules">
                  <Activity className="w-5 h-5 mr-4" />
                  <div className="text-left">
                    <div className="font-semibold text-base">View All Rules</div>
                    <div className="text-sm opacity-75">Manage automations</div>
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