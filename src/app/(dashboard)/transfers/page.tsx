import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, ExternalLink, RefreshCw } from "lucide-react";
import { getChainConfig } from "@/lib/routing/chains";

// Mock data
const mockTransfers = [
  {
    id: "1",
    type: "Scheduled Transfer",
    from: "Wallet",
    to: "John (0x1234...5678)",
    amount: "$50.00 USDC",
    chain: "base",
    status: "completed",
    txHash: "0xabcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
    fee: "$0.05",
    timestamp: "2024-02-16T08:00:00Z",
  },
  {
    id: "2", 
    type: "Manual Transfer",
    from: "Wallet",
    to: "Alice (0x5678...9abc)",
    amount: "$100.00 USDC",
    chain: "arbitrum",
    status: "pending",
    txHash: null,
    fee: "$0.15",
    timestamp: "2024-02-16T09:30:00Z",
  },
  {
    id: "3",
    type: "Conditional Transfer", 
    from: "Wallet",
    to: "0xdef0...1234",
    amount: "€200.00 EURC",
    chain: "polygon", 
    status: "failed",
    txHash: null,
    fee: "$0.12",
    timestamp: "2024-02-15T14:22:00Z",
  },
];

function StatusBadge({ status }: { status: string }) {
  const variants = {
    completed: "default",
    pending: "secondary",
    failed: "destructive",
    cancelled: "outline",
  } as const;
  
  return (
    <Badge variant={variants[status as keyof typeof variants] || "outline"}>
      {status}
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

export default function TransfersPage() {
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

      {/* Transfers Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr className="text-left">
                  <th className="p-4 font-medium text-sm text-muted-foreground">Transfer</th>
                  <th className="p-4 font-medium text-sm text-muted-foreground">Amount</th>
                  <th className="p-4 font-medium text-sm text-muted-foreground">Chain</th>
                  <th className="p-4 font-medium text-sm text-muted-foreground">Status</th>
                  <th className="p-4 font-medium text-sm text-muted-foreground">Fee</th>
                  <th className="p-4 font-medium text-sm text-muted-foreground">Date</th>
                  <th className="p-4 font-medium text-sm text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockTransfers.map((transfer) => {
                  const chainConfig = getChainConfig(transfer.chain as any);
                  return (
                    <tr key={transfer.id} className="border-b border-white/5 hover:bg-bg-elevated/30">
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="font-medium">{transfer.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {transfer.from} → {transfer.to}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-medium">{transfer.amount}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span>{chainConfig.icon}</span>
                          <span className="text-sm">{chainConfig.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={transfer.status} />
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm">{transfer.fee}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{formatDate(transfer.timestamp)}</span>
                      </td>
                      <td className="p-4">
                        {transfer.txHash ? (
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <ArrowLeftRight className="w-8 h-8 text-brand" />
              <div>
                <p className="text-2xl font-bold font-mono">47</p>
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
                <p className="text-2xl font-bold font-mono">44</p>
                <p className="text-sm text-muted-foreground">Successful</p>
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
                <p className="text-2xl font-bold font-mono">3</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}