"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Clock, DollarSign, Zap, AlertTriangle, TrendingUp, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RouteQuote } from "@/lib/llm/schema";
import { getChainConfig } from "@/lib/routing/chains";

interface QuoteCardProps {
  quote: RouteQuote;
  onConfirm?: () => void;
  isLoading?: boolean;
  className?: string;
  variant?: "desktop" | "mobile";
  routes?: RouteQuote[];
  selectedRouteIndex?: number;
  onRouteChange?: (index: number) => void;
}

export function QuoteCard({ 
  quote, 
  onConfirm, 
  isLoading, 
  className,
  variant = "desktop",
  routes = [quote],
  selectedRouteIndex = 0,
  onRouteChange
}: QuoteCardProps) {
  const [showWhyRoute, setShowWhyRoute] = useState(false);
  const chainConfig = getChainConfig(quote.chain);
  const etaText = quote.etaSeconds < 60 
    ? `${quote.etaSeconds}s` 
    : `${Math.round(quote.etaSeconds / 60)}m`;

  if (variant === "mobile") {
    return (
      <div className={cn("space-y-4 sm:hidden", className)}>
        {/* Big stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center bg-white shadow-card rounded-2xl">
            <div className="space-y-1">
              <div className={cn(
                "text-2xl font-bold",
                quote.isHighFee ? "text-amber-600" : "text-gray-900"
              )}>
                ${quote.feeEstimateUsd.toFixed(3)}
              </div>
              <div className="text-sm text-gray-500">
                Fee {quote.feePercentage ? `(${quote.feePercentage}%)` : ''}
              </div>
              {quote.isHighFee && (
                <Badge className="bg-amber-100 text-amber-700 text-xs mt-2">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  High Fee
                </Badge>
              )}
            </div>
          </Card>

          <Card className="p-4 text-center bg-white shadow-card rounded-2xl">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">
                {etaText}
              </div>
              <div className="text-sm text-gray-500">ETA</div>
              {quote.recommended && (
                <Badge className="bg-gradient-to-r from-primary to-accent text-white text-xs mt-2">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Best
                </Badge>
              )}
            </div>
          </Card>
        </div>

        {/* Route carousel */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Route Options</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWhyRoute(true)}
              className="text-primary hover:text-primary/80"
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              Why this route?
            </Button>
          </div>

          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-3">
              {routes.map((route, index) => {
                const routeConfig = getChainConfig(route.chain);
                const isSelected = index === selectedRouteIndex;
                
                return (
                  <button
                    key={index}
                    onClick={() => onRouteChange?.(index)}
                    className={cn(
                      "flex-none w-32 p-3 rounded-xl border-2 transition-all",
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                  >
                    <div className="text-center space-y-2">
                      <div className="text-2xl">{routeConfig.icon}</div>
                      <div className="text-xs font-medium text-gray-900">
                        {routeConfig.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        ${route.feeEstimateUsd.toFixed(3)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" className="h-2" />
          </ScrollArea>
        </div>

        {/* "Why this route?" popover */}
        {showWhyRoute && (
          <div className="fixed inset-0 z-50 flex items-end sm:hidden">
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowWhyRoute(false)}
            />
            <div className="relative w-full bg-white rounded-t-3xl p-6 max-h-[60vh] overflow-y-auto">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Why {chainConfig.name}?
              </h3>
              
              <div className="space-y-3 text-sm text-gray-600">
                <p>{quote.explanation}</p>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-2">Fee Breakdown:</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Gas Cost:</span>
                      <span>${(quote.feeEstimateUsd * 0.7).toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bridge Fee:</span>
                      <span>${(quote.feeEstimateUsd * 0.3).toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-1 border-t">
                      <span>Total:</span>
                      <span>${quote.feeEstimateUsd.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-4"
                onClick={() => setShowWhyRoute(false)}
              >
                Got it
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop variant
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:shadow-lg hidden sm:block",
      quote.isHighFee ? 'border-amber-500/30' : '',
      className
    )}>
      <div className="absolute top-2 right-2 flex gap-2">
        {quote.isHighFee && (
          <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 border-amber-500/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            High Fee
          </Badge>
        )}
        {quote.recommended && (
          <Badge variant="default" className="hero-gradient text-white border-0">
            <TrendingUp className="w-3 h-3 mr-1" />
            Recommended
          </Badge>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="text-lg">{chainConfig.icon}</span>
          {chainConfig.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className={`w-4 h-4 ${quote.isHighFee ? 'text-amber-600' : 'text-muted-foreground'}`} />
            <div>
              <p className={`text-sm font-medium font-mono ${quote.isHighFee ? 'text-amber-600' : ''}`}>
                ${quote.feeEstimateUsd.toFixed(3)}
              </p>
              <p className="text-xs text-muted-foreground">
                Est. Fee {quote.feePercentage ? `(${quote.feePercentage}%)` : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium font-mono">{etaText}</p>
              <p className="text-xs text-muted-foreground">ETA</p>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {quote.explanation}
        </p>
        
        {onConfirm && (
          <Button 
            onClick={onConfirm} 
            disabled={isLoading}
            className="w-full"
            variant={quote.recommended ? "default" : "outline"}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Confirm & Schedule
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}