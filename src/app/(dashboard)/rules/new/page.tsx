"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatComposer } from "@/components/ChatComposer";
import { QuoteCard } from "@/components/QuoteCard";
import { QuoteSummary } from "@/components/QuoteSummary";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, CheckCircle, Rocket, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { RuleJSON, RouteQuote } from "@/lib/llm/schema";

export default function NewRulePage() {
  const [parsedRule, setParsedRule] = useState<RuleJSON | null>(null);
  const [quotes, setQuotes] = useState<RouteQuote[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
    
    setIsCreatingRule(true);
    setError(null);
    
    try {
      // Add delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedRule),
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setIsCreatingRule(false);
      } else {
        setIsCreatingRule(false);
        setShowSuccess(true);
        
        // Redirect after showing success animation
        setTimeout(() => {
          window.location.href = "/rules";
        }, 2500);
      }
    } catch (err) {
      setError("Failed to create rule");
      setIsCreatingRule(false);
    }
  };

  return (
    <div className="container-page section-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
        <Button variant="ghost" size="sm" asChild className="btn-secondary">
          <Link href="/rules">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Rules
          </Link>
        </Button>
        <div>
          <h1 className="text-heading sm:text-display text-foreground">Create New Rule</h1>
          <p className="text-body sm:text-body-large text-foreground-muted mt-2">
            Describe your automation in natural language or use the form
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Chat Composer */}
        <div className="space-y-6 lg:space-y-8">
          <div className="card-modern p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-light rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-body-large sm:text-subheading text-foreground">Describe Your Rule</h2>
                <p className="text-caption sm:text-body-small text-foreground-muted">Use natural language to create automation</p>
              </div>
            </div>
            <ChatComposer
              onRuleParsed={handleRuleParsed}
              onError={setError}
            />
          </div>
          
          {error && (
            <div className="card-modern p-6 border-red-200 bg-red-50">
              <p className="text-red-600 text-body">{error}</p>
            </div>
          )}
        </div>

        {/* Rule Preview & Quotes */}
        <div className="space-y-6 lg:space-y-8">
          {parsedRule && (
            <>
              {/* Rule Preview */}
              <div className="card-modern p-6 sm:p-8 border-green-200 bg-green-50">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-body-large sm:text-subheading text-green-800">Rule Parsed Successfully</h3>
                    <p className="text-caption sm:text-body-small text-green-600">Your automation rule is ready</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {/* Human-readable summary */}
                  <div className="p-6 bg-green-100 rounded-2xl border border-green-200">
                    <h4 className="text-body font-semibold text-green-800 mb-3">Rule Summary</h4>
                    <p className="text-body text-green-700">
                      {parsedRule.description || `${parsedRule.type} rule for ${parsedRule.asset}`}
                    </p>
                  </div>
                  
                  {/* Rule details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <span className="text-caption sm:text-body-small text-green-600">Type:</span>
                      <p className="text-body font-medium text-green-800 capitalize">{parsedRule.type}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-caption sm:text-body-small text-green-600">Asset:</span>
                      <p className="text-body font-medium text-green-800">{parsedRule.asset}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-caption sm:text-body-small text-green-600">Amount:</span>
                      <p className="text-body font-medium text-green-800">
                        {parsedRule.amount.currency === "EUR" ? "€" : "$"}{parsedRule.amount.value}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-caption sm:text-body-small text-green-600">Destination:</span>
                      <p className="text-body font-medium text-green-800 break-all sm:break-normal">
                        {parsedRule.destination.type === "address" 
                          ? `${parsedRule.destination.value.slice(0, 6)}...${parsedRule.destination.value.slice(-4)}`
                          : parsedRule.destination.value
                        }
                      </p>
                    </div>
                  </div>
                  
                  {/* JSON Preview (collapsible) */}
                  <details className="mt-6">
                    <summary className="cursor-pointer text-body-small text-green-600 hover:text-green-800 transition-colors">
                      View raw JSON
                    </summary>
                    <pre className="text-caption bg-white rounded-xl p-4 overflow-x-auto mt-3 border border-green-200">
                      {JSON.stringify(parsedRule, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>

              {/* Quote Summary */}
              {quotes.length > 1 && (
                <QuoteSummary 
                  quotes={quotes} 
                  transferAmount={parsedRule.amount.value}
                />
              )}

              {/* Route Quotes */}
              <div className="space-y-6">
                <h3 className="text-subheading text-foreground">Route Options</h3>
                
                {isLoadingQuotes ? (
                  <div className="card-modern p-12 text-center">
                    <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                    <p className="text-body text-foreground-muted">Getting best routes...</p>
                  </div>
                ) : quotes.length > 0 ? (
                  <div className="space-y-6">
                    {quotes.map((quote, index) => (
                      <div key={`${quote.chain}-${index}`} className="transform transition-all duration-300 hover:scale-[1.02]">
                        <QuoteCard
                          quote={quote}
                          onConfirm={() => handleConfirmRule(quote)}
                        />
                      </div>
                    ))}
                  </div>
                ) : parsedRule && !isLoadingQuotes ? (
                  <div className="card-modern p-12 text-center">
                    <p className="text-body text-foreground-muted">No routes available</p>
                  </div>
                ) : null}
              </div>
            </>
          )}
          
          {/* Placeholder when no rule */}
          {!parsedRule && (
            <div className="card-modern p-8 sm:p-12 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-body-large sm:text-subheading text-foreground mb-3 sm:mb-4">Start by describing your rule</h3>
              <p className="text-body text-foreground-muted max-w-md mx-auto">
                Type something like &quot;Send $50 USDC to John every Friday at 8am&quot;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Creating Rule Animation */}
      {isCreatingRule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-12 max-w-md mx-4 text-center shadow-2xl animate-scale-in">
            <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <Sparkles className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h3 className="text-heading text-foreground mb-4">Creating Your Rule</h3>
            <p className="text-body text-foreground-muted mb-6">
              Our AI is processing your automation and setting up the blockchain transaction...
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Success Confirmation */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-12 max-w-lg mx-4 text-center shadow-2xl animate-scale-in">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-heading text-foreground mb-4">Rule Created Successfully! 🎉</h3>
            <p className="text-body text-foreground-muted mb-8">
              Your automation rule has been created and deployed to the blockchain. It's now active and monitoring for your specified conditions.
            </p>
            
            <div className="bg-green-50 rounded-2xl p-6 mb-8 border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <Rocket className="w-5 h-5 text-green-600" />
                <span className="text-body font-medium text-green-800">New Automation Rule</span>
              </div>
              <p className="text-body text-green-700">
                {parsedRule?.description || `${parsedRule?.type} rule for ${parsedRule?.asset}`}
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <Button 
                onClick={() => window.location.href = "/rules"} 
                className="btn-primary w-full py-4 text-base"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                View All Rules
              </Button>
              <p className="text-caption text-foreground-muted">
                Redirecting automatically in 2.5 seconds...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}