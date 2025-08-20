"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TransferCard } from "@/components/TransferCard";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { SearchFilterSheet } from "@/components/mobile/SearchFilterSheet";
import { 
  ArrowLeftRight, 
  RefreshCw, 
  TestTube, 
  Search, 
  Filter, 
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

// async function getUserExecutions(userId: string) {
//   const executions = await prisma.execution.findMany({
//     where: {
//       rule: { userId },
//     },
//     orderBy: { createdAt: "desc" },
//     include: {
//       rule: {
//         select: {
//           type: true,
//           json: true,
//         },
//       },
//     },
//   });

//   return executions;
// }

interface FilterOptions {
  search: string;
  status: string[];
  chains: string[];
  dateRange: string;
}

// Moved StatusBadge to TransferCard component

// Mock data for demo mode - Extended for infinite scroll demo
const generateMockExecutions = (count: number = 50) => {
  const baseExecutions = [
    {
      id: "exec_demo_1",
      status: "COMPLETED" as const,
      feeUsd: 0.23,
      chain: "base",
      txHash: "0x1234567890abcdef1234567890abcdef12345678",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      errorMessage: null,
      ruleId: "rule_demo_1",
      rule: {
        type: "schedule" as const,
        json: { 
          description: "Send $500 USDC to contractor monthly",
          asset: "USDC",
          amount: { value: 500, currency: "USD" },
          destination: { type: "contact", value: "contractor@company.com" }
        }
      }
    },
    {
      id: "exec_demo_2",
      status: "COMPLETED" as const, 
      feeUsd: 0.15,
      chain: "ethereum",
      txHash: "0xabcdef1234567890abcdef1234567890abcdef12",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      errorMessage: null,
      ruleId: "rule_demo_2",
      rule: {
        type: "conditional" as const,
        json: { 
          description: "Buy $200 ETH when price drops below $2000",
          asset: "USDC",
          amount: { value: 200, currency: "USD" },
          destination: { type: "address", value: "0x1234567890123456789012345678901234567890" }
        }
      }
    },
    {
      id: "exec_demo_3",
      status: "PENDING" as const,
      feeUsd: null,
      chain: "base",
      txHash: null,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      errorMessage: null,
      ruleId: "rule_demo_3",
      rule: {
        type: "schedule" as const,
        json: { 
          description: "Weekly DCA $100 into BTC",
          asset: "USDC",
          amount: { value: 100, currency: "USD" },
          destination: { type: "contact", value: "btc-wallet" }
        }
      }
    },
    {
      id: "exec_demo_4",
      status: "FAILED" as const,
      feeUsd: null,
      chain: "polygon",
      txHash: null,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      errorMessage: "Insufficient balance",
      ruleId: "rule_demo_4",
      rule: {
        type: "conditional" as const, 
        json: { 
          description: "Emergency stop-loss at 20% drop",
          asset: "USDC",
          amount: { value: 1000, currency: "USD" },
          destination: { type: "address", value: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef" }
        }
      }
    },
    {
      id: "exec_demo_5",
      status: "COMPLETED" as const,
      feeUsd: 0.08,
      chain: "arbitrum",
      txHash: "0x9876543210fedcba9876543210fedcba98765432",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      errorMessage: null,
      ruleId: "rule_demo_5", 
      rule: {
        type: "schedule" as const,
        json: { 
          description: "Send $25 USDC to Mom weekly",
          asset: "USDC",
          amount: { value: 25, currency: "USD" },
          destination: { type: "contact", value: "mom@family.com" }
        }
      }
    }
  ];
  
  // Generate additional mock data by varying the base data
  const extended = [];
  for (let i = 0; i < count; i++) {
    const base = baseExecutions[i % baseExecutions.length];
    const variation = {
      ...base,
      id: `exec_demo_${i + 1}`,
      createdAt: new Date(Date.now() - (i + 1) * 2 * 60 * 60 * 1000), // Spread over time
      ruleId: `rule_demo_${i + 1}`,
    };
    extended.push(variation);
  }
  
  return extended;
};

const mockExecutions = generateMockExecutions(50);

export default function TransfersPage() {
  // Client-side state management
  const [executions, setExecutions] = useState(mockExecutions);
  const [displayedExecutions, setDisplayedExecutions] = useState(mockExecutions.slice(0, 10));
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    status: [],
    chains: [],
    dateRange: "all"
  });
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    triggerOnce: false
  });
  
  // Filter and search functionality
  const filteredExecutions = useMemo(() => {
    let filtered = [...executions];
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(execution => 
        execution.rule.json.description?.toLowerCase().includes(searchLower) ||
        execution.id.toLowerCase().includes(searchLower) ||
        execution.rule.json.destination?.value.toLowerCase().includes(searchLower)
      );
    }
    
    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(execution => 
        filters.status.includes(execution.status)
      );
    }
    
    // Chain filter
    if (filters.chains.length > 0) {
      filtered = filtered.filter(execution => 
        execution.chain && filters.chains.includes(execution.chain)
      );
    }
    
    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      filtered = filtered.filter(execution => {
        const executionDate = execution.createdAt;
        switch (filters.dateRange) {
          case "today":
            return executionDate >= today;
          case "week":
            return executionDate >= weekAgo;
          case "month":
            return executionDate >= monthAgo;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }, [executions, filters]);
  
  // Load more functionality
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    setTimeout(() => {
      const currentLength = displayedExecutions.length;
      const nextBatch = filteredExecutions.slice(currentLength, currentLength + 10);
      
      if (nextBatch.length === 0) {
        setHasMore(false);
      } else {
        setDisplayedExecutions(prev => [...prev, ...nextBatch]);
      }
      setIsLoading(false);
    }, 500);
  }, [isLoading, hasMore, displayedExecutions.length, filteredExecutions]);
  
  // Trigger load more when intersection observer fires
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, loadMore]);
  
  // Reset displayed executions when filters change
  useEffect(() => {
    setDisplayedExecutions(filteredExecutions.slice(0, 10));
    setHasMore(filteredExecutions.length > 10);
  }, [filteredExecutions]);
  
  const stats = {
    total: filteredExecutions.length,
    completed: filteredExecutions.filter((e: any) => e.status === "COMPLETED").length,
    failed: filteredExecutions.filter((e: any) => e.status === "FAILED").length,
    pending: filteredExecutions.filter((e: any) => e.status === "PENDING" || e.status === "PROCESSING").length,
  };
  
  const activeFiltersCount = 
    (filters.search ? 1 : 0) +
    filters.status.length +
    filters.chains.length +
    (filters.dateRange !== "all" ? 1 : 0);

  return (
    <div className="min-h-screen bg-background pb-[calc(env(safe-area-inset-bottom)+80px)] sm:pb-0">
      {/* Mobile Header */}
      <MobileHeader title="Transfers" showAddRule={false} />
      
      {/* Desktop Header */}
      <div className="hidden sm:block border-b border-border bg-background">
        <div className="container-page">
          <div className="flex items-center justify-between py-8">
            <div>
              <h1 className="text-heading text-foreground mb-2">Transfers</h1>
              <p className="text-body text-foreground-muted">
                View all transfer executions and their status
              </p>
            </div>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container-page py-4 sm:py-8">

        {/* Demo Mode Banner */}
        <div className="demo-banner mb-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
              <TestTube className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-900" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-sm sm:text-subheading text-yellow-900 font-semibold">Demo Mode - Sample Data</h3>
                <div className="px-2 py-1 sm:px-3 bg-yellow-400/20 rounded-full">
                  <span className="text-xs font-medium text-yellow-800">Safe Testing</span>
                </div>
              </div>
              <p className="text-sm sm:text-body text-yellow-800 mb-3 sm:mb-4">
                These are example transfer executions to showcase functionality. 
                <Link href="/auth/signup" className="font-medium hover:underline ml-1">
                  Sign up
                </Link> to see your actual transactions.
              </p>
              <div className="flex items-center space-x-2 text-xs sm:text-body-small text-yellow-700">
                <TestTube className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>No real transactions • Sample data only • Always safe</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Search & Filter Bar */}
        <div className="sm:hidden mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-muted" />
              <Input
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search transfers..."
                className="pl-10 h-11 rounded-2xl"
              />
            </div>
            <Button
              variant={activeFiltersCount > 0 ? "default" : "outline"}
              onClick={() => setIsFilterSheetOpen(true)}
              className="h-11 px-4 rounded-2xl flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <span className="bg-white/20 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card 
            className={`glass-card cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
              filters.status.length === 0 ? 'ring-2 ring-primary/30' : ''
            }`}
            onClick={() => setFilters(prev => ({ ...prev, status: [] }))}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <ArrowLeftRight className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs sm:text-sm text-foreground-muted">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        
          <Card 
            className={`glass-card cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
              filters.status.includes('COMPLETED') ? 'ring-2 ring-success/50' : ''
            }`}
            onClick={() => setFilters(prev => ({ 
              ...prev, 
              status: prev.status.includes('COMPLETED') ? [] : ['COMPLETED'] 
            }))}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-success/20 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold font-mono text-foreground">{stats.completed}</p>
                  <p className="text-xs sm:text-sm text-foreground-muted">Success</p>
                </div>
              </div>
            </CardContent>
          </Card>
        
          <Card 
            className={`glass-card cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
              filters.status.includes('PENDING') || filters.status.includes('PROCESSING') ? 'ring-2 ring-amber-500/50' : ''
            }`}
            onClick={() => setFilters(prev => ({ 
              ...prev, 
              status: prev.status.includes('PENDING') || prev.status.includes('PROCESSING') 
                ? [] 
                : ['PENDING', 'PROCESSING'] 
            }))}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold font-mono text-foreground">{stats.pending}</p>
                  <p className="text-xs sm:text-sm text-foreground-muted">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        
          <Card 
            className={`glass-card cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
              filters.status.includes('FAILED') ? 'ring-2 ring-danger/50' : ''
            }`}
            onClick={() => setFilters(prev => ({ 
              ...prev, 
              status: prev.status.includes('FAILED') ? [] : ['FAILED'] 
            }))}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-danger/20 rounded-xl flex items-center justify-center">
                  <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-danger" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold font-mono text-foreground">{stats.failed}</p>
                  <p className="text-xs sm:text-sm text-foreground-muted">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Desktop Search & Filter */}
        <div className="hidden sm:flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <Input
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search transfers..."
              className="pl-10 h-11 rounded-2xl"
            />
          </div>
          <Button
            variant={activeFiltersCount > 0 ? "default" : "outline"}
            onClick={() => setIsFilterSheetOpen(true)}
            className="h-11 px-6 rounded-2xl flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-white/20 text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>
        
        {/* Transfer Cards */}
        {displayedExecutions.length > 0 ? (
          <div className="space-y-4">
            {/* Mobile: Card List */}
            <div className="sm:hidden space-y-3">
              {displayedExecutions.map((execution: any) => (
                <TransferCard 
                  key={execution.id} 
                  execution={execution} 
                  variant="mobile"
                />
              ))}
            </div>
            
            {/* Desktop: Enhanced Card Grid */}
            <div className="hidden sm:block space-y-4">
              {displayedExecutions.map((execution: any) => (
                <TransferCard 
                  key={execution.id} 
                  execution={execution} 
                  variant="desktop"
                />
              ))}
            </div>
            
            {/* Infinite Scroll Trigger & Loading */}
            {hasMore && (
              <div ref={loadMoreRef} className="py-8 flex items-center justify-center">
                {isLoading ? (
                  <div className="flex items-center gap-3 text-foreground-muted">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading more transfers...</span>
                  </div>
                ) : (
                  <div className="text-sm text-foreground-muted">
                    Scroll to load more
                  </div>
                )}
              </div>
            )}
            
            {!hasMore && filteredExecutions.length > 10 && (
              <div className="py-8 text-center">
                <p className="text-sm text-foreground-muted">
                  You&apos;ve reached the end of your transfers
                </p>
              </div>
            )}
          </div>
        ) : (
          <Card className="glass-card">
            <CardContent className="p-8 sm:p-12 text-center">
              <ArrowLeftRight className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-foreground-muted" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                {activeFiltersCount > 0 ? "No transfers match your filters" : "No transfers yet"}
              </h3>
              <p className="text-foreground-muted mb-6 text-sm sm:text-base">
                {activeFiltersCount > 0 
                  ? "Try adjusting your search or filter criteria"
                  : "Create automation rules to start executing transfers"
                }
              </p>
              {activeFiltersCount > 0 ? (
                <Button 
                  onClick={() => setFilters({ search: "", status: [], chains: [], dateRange: "all" })}
                  variant="outline" 
                  className="font-semibold"
                >
                  Clear Filters
                </Button>
              ) : (
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  <Link href="/rules/new">
                    Create Your First Rule
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Mobile Search & Filter Sheet */}
      <SearchFilterSheet
        isOpen={isFilterSheetOpen}
        onOpenChange={setIsFilterSheetOpen}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={() => setFilters({ search: "", status: [], chains: [], dateRange: "all" })}
      />
    </div>
  );
}