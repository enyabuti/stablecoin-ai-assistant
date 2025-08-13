"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Clock, DollarSign, Info } from "lucide-react";
import type { RouteQuote } from "@/lib/llm/schema";

interface QuoteSummaryProps {
  quotes: RouteQuote[];
  transferAmount: number;
  className?: string;
}

export function QuoteSummary({ quotes, transferAmount, className }: QuoteSummaryProps) {
  if (quotes.length === 0) return null;

  const cheapest = quotes.reduce((min, quote) => 
    quote.feeEstimateUsd < min.feeEstimateUsd ? quote : min
  );
  
  const fastest = quotes.reduce((min, quote) => 
    quote.etaSeconds < min.etaSeconds ? quote : min
  );
  
  const mostExpensive = quotes.reduce((max, quote) => 
    quote.feeEstimateUsd > max.feeEstimateUsd ? quote : max
  );

  const recommended = quotes.find(q => q.recommended) || cheapest;
  
  const savings = mostExpensive.feeEstimateUsd - cheapest.feeEstimateUsd;
  const savingsPercentage = ((savings / mostExpensive.feeEstimateUsd) * 100).toFixed(1);
  
  const averageFee = quotes.reduce((sum, q) => sum + q.feeEstimateUsd, 0) / quotes.length;
  const averageEta = Math.round(quotes.reduce((sum, q) => sum + q.etaSeconds, 0) / quotes.length);

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          Quote Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-bg-elevated rounded-xl">
            <p className="text-lg font-bold text-success">
              ${cheapest.feeEstimateUsd.toFixed(3)}
            </p>
            <p className="text-xs text-muted-foreground">Cheapest Route</p>
            <p className="text-xs text-success">{cheapest.chain}</p>
          </div>
          
          <div className="text-center p-3 bg-bg-elevated rounded-xl">
            <p className="text-lg font-bold text-primary">
              {fastest.etaSeconds < 60 ? `${fastest.etaSeconds}s` : `${Math.round(fastest.etaSeconds / 60)}m`}
            </p>
            <p className="text-xs text-muted-foreground">Fastest Route</p>
            <p className="text-xs text-primary">{fastest.chain}</p>
          </div>
          
          <div className="text-center p-3 bg-bg-elevated rounded-xl">
            <p className="text-lg font-bold text-amber-600">
              ${savings.toFixed(3)}
            </p>
            <p className="text-xs text-muted-foreground">Max Savings</p>
            <p className="text-xs text-amber-600">{savingsPercentage}% less</p>
          </div>
          
          <div className="text-center p-3 bg-bg-elevated rounded-xl">
            <p className="text-lg font-bold text-card-foreground">
              ${averageFee.toFixed(3)}
            </p>
            <p className="text-xs text-muted-foreground">Average Fee</p>
            <p className="text-xs text-card-foreground">
              {averageEta < 60 ? `${averageEta}s` : `${Math.round(averageEta / 60)}m`} avg
            </p>
          </div>
        </div>

        {/* Fee Analysis */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Fee Analysis</h4>
          <div className="space-y-1">
            {quotes.map((quote, index) => {
              const feePercentage = (quote.feeEstimateUsd / transferAmount) * 100;
              const isExpensive = feePercentage > 2;
              const isReasonable = feePercentage < 1;
              
              return (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: quote.recommended ? '#10b981' : '#6b7280' }} />
                    <span className="font-medium">{quote.chain}</span>
                    {quote.recommended && (
                      <Badge variant="outline" className="text-xs">recommended</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">${quote.feeEstimateUsd.toFixed(3)}</span>
                    <span className={`text-xs ${
                      isExpensive ? 'text-red-500' : 
                      isReasonable ? 'text-green-500' : 
                      'text-yellow-500'
                    }`}>
                      ({feePercentage.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
          <h4 className="font-medium text-sm text-primary mb-2">💡 Smart Insights</h4>
          <div className="space-y-1 text-xs text-primary/80">
            {transferAmount < 50 && (
              <p>• For small transfers, choose the cheapest option to minimize fees</p>
            )}
            {transferAmount >= 50 && transferAmount <= 500 && (
              <p>• Medium transfers: Balance speed and cost for best value</p>
            )}
            {transferAmount > 500 && (
              <p>• Large transfers: Consider security and avoid high-fee percentages</p>
            )}
            {savings > 5 && (
              <p>• You could save ${savings.toFixed(2)} by choosing the cheapest route</p>
            )}
            {quotes.some(q => q.isHighFee) && (
              <p>• Some routes have high fees relative to transfer amount</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}