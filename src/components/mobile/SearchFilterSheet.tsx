"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  X, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Pause,
  Loader2
} from "lucide-react";
import { getChainConfig } from "@/lib/routing/chains";

interface FilterOptions {
  search: string;
  status: string[];
  chains: string[];
  dateRange: string;
}

interface SearchFilterSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

const statusOptions = [
  { value: "COMPLETED", label: "Completed", icon: CheckCircle2, color: "bg-green-100 text-green-800" },
  { value: "PENDING", label: "Pending", icon: Clock, color: "bg-amber-100 text-amber-800" },
  { value: "PROCESSING", label: "Processing", icon: Loader2, color: "bg-blue-100 text-blue-800" },
  { value: "FAILED", label: "Failed", icon: XCircle, color: "bg-red-100 text-red-800" },
  { value: "CANCELLED", label: "Cancelled", icon: Pause, color: "bg-gray-100 text-gray-800" },
];

const chainOptions = [
  { value: "ethereum", label: "Ethereum" },
  { value: "base", label: "Base" },
  { value: "arbitrum", label: "Arbitrum" },
  { value: "polygon", label: "Polygon" },
];

const dateRangeOptions = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

export function SearchFilterSheet({ 
  isOpen, 
  onOpenChange, 
  filters, 
  onFiltersChange,
  onClearFilters 
}: SearchFilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  
  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };
  
  const handleClearFilters = () => {
    const clearedFilters = {
      search: "",
      status: [],
      chains: [],
      dateRange: "all"
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClearFilters();
    onOpenChange(false);
  };
  
  const toggleStatus = (status: string) => {
    setLocalFilters(prev => ({
      ...prev,
      status: prev.status.includes(status) 
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };
  
  const toggleChain = (chain: string) => {
    setLocalFilters(prev => ({
      ...prev,
      chains: prev.chains.includes(chain) 
        ? prev.chains.filter(c => c !== chain)
        : [...prev.chains, chain]
    }));
  };
  
  const activeFiltersCount = 
    (localFilters.search ? 1 : 0) +
    localFilters.status.length +
    localFilters.chains.length +
    (localFilters.dateRange !== "all" ? 1 : 0);
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">
              Search & Filter
            </SheetTitle>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="px-2 py-1 text-xs">
                  {activeFiltersCount} active
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>
        
        <div className="space-y-6 pb-20">
          {/* Search */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Transfers
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-muted" />
              <Input
                value={localFilters.search}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search descriptions, addresses..."
                className="pl-10 h-12 rounded-2xl"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Status</h3>
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = localFilters.status.includes(option.value);
                
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleStatus(option.value)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border bg-background hover:bg-secondary/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-foreground-muted'}`} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Chain Filter */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Blockchain</h3>
            <div className="grid grid-cols-2 gap-3">
              {chainOptions.map((option) => {
                const isSelected = localFilters.chains.includes(option.value);
                const chainConfig = getChainConfig(option.value as any);
                
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleChain(option.value)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border bg-background hover:bg-secondary/50'
                    }`}
                  >
                    <span>{chainConfig.icon}</span>
                    <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Date Range Filter */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Time Period</h3>
            <div className="grid grid-cols-2 gap-3">
              {dateRangeOptions.map((option) => {
                const isSelected = localFilters.dateRange === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => setLocalFilters(prev => ({ ...prev, dateRange: option.value }))}
                    className={`flex items-center justify-center gap-3 p-3 rounded-2xl border transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border bg-background hover:bg-secondary/50'
                    }`}
                  >
                    <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              className="flex-1 h-12 rounded-2xl"
            >
              Clear All
            </Button>
            <Button 
              onClick={handleApplyFilters}
              className="flex-1 h-12 rounded-2xl"
            >
              Apply Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-white/20">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}