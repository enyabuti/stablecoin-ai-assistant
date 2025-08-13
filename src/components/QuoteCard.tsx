"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Zap, AlertTriangle, TrendingUp } from "lucide-react";
import type { RouteQuote } from "@/lib/llm/schema";
import { getChainConfig } from "@/lib/routing/chains";

interface QuoteCardProps {
  quote: RouteQuote;
  onConfirm?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function QuoteCard({ quote, onConfirm, isLoading, className }: QuoteCardProps) {
  const chainConfig = getChainConfig(quote.chain);
  const etaText = quote.etaSeconds < 60 
    ? `${quote.etaSeconds}s` 
    : `${Math.round(quote.etaSeconds / 60)}m`;

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${quote.isHighFee ? 'border-amber-500/30' : ''} ${className}`}>
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