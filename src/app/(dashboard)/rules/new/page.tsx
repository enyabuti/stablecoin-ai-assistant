"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatComposer } from "@/components/ChatComposer";
import { QuoteCard } from "@/components/QuoteCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import type { RuleJSON, RouteQuote } from "@/lib/llm/schema";

export default function NewRulePage() {
  const [parsedRule, setParsedRule] = useState<RuleJSON | null>(null);
  const [quotes, setQuotes] = useState<RouteQuote[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRuleParsed = async (rule: RuleJSON) => {
    setParsedRule(rule);
    setError(null);
    setIsLoadingQuotes(true);
    
    try {
      // Get route quotes for the parsed rule
      const response = await fetch("/api/rules/route-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rule),
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setQuotes(data.quotes || []);
      }
    } catch (err) {
      setError("Failed to get route quotes");
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  const handleConfirmRule = async (quote: RouteQuote) => {
    if (!parsedRule) return;
    
    try {
      const response = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedRule),
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        // Redirect to rules page or show success
        window.location.href = "/rules";
      }
    } catch (err) {
      setError("Failed to create rule");
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/rules">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Rules
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-contrast-enhanced">Create New Rule</h1>
          <p className="text-muted-foreground">
            Describe your automation in natural language or use the form
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chat Composer */}
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand" />
                Describe Your Rule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ChatComposer
                onRuleParsed={handleRuleParsed}
                onError={setError}
              />
            </CardContent>
          </Card>
          
          {error && (
            <Card className="glass-card border-danger/20">
              <CardContent className="p-4">
                <p className="text-danger text-sm">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Rule Preview & Quotes */}
        <div className="space-y-6">
          {parsedRule && (
            <>
              {/* Rule JSON Preview */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Parsed Rule</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-bg-elevated rounded-xl p-4 overflow-x-auto">
                    {JSON.stringify(parsedRule, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              {/* Route Quotes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Route Options</h3>
                
                {isLoadingQuotes ? (
                  <Card className="glass-card">
                    <CardContent className="p-8 text-center">
                      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">Getting best routes...</p>
                    </CardContent>
                  </Card>
                ) : quotes.length > 0 ? (
                  <div className="space-y-4">
                    {quotes.map((quote, index) => (
                      <QuoteCard
                        key={`${quote.chain}-${index}`}
                        quote={quote}
                        onConfirm={() => handleConfirmRule(quote)}
                      />
                    ))}
                  </div>
                ) : parsedRule && !isLoadingQuotes ? (
                  <Card className="glass-card">
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No routes available</p>
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            </>
          )}
          
          {/* Placeholder when no rule */}
          {!parsedRule && (
            <Card className="glass-card">
              <CardContent className="p-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Start by describing your rule</h3>
                <p className="text-muted-foreground">
                  Type something like &quot;Send $50 USDC to John every Friday at 8am&quot;
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}