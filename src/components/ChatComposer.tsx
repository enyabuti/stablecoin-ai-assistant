"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Mic, Brain, Sparkles, Zap } from "lucide-react";
import { APP_NAME } from "@/lib/appConfig";
import { mcpServices } from "@/lib/mcp";

interface ChatComposerProps {
  onSendMessage?: (message: string) => void;
  // Legacy props for rule parsing
  onRuleParsed?: (rule: any) => void;
  onError?: (error: string) => void;
  // MCP integration props
  onMCPResponse?: (response: any) => void;
  enableMCP?: boolean;
}

export function ChatComposer({ onSendMessage, onRuleParsed, onError, onMCPResponse, enableMCP = true }: ChatComposerProps) {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mcpEnabled, setMcpEnabled] = useState(enableMCP);
  const [showMCPFeatures, setShowMCPFeatures] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput("");
    setIsProcessing(true);

    // If this is being used for rule parsing (legacy mode)
    if (onRuleParsed) {
      try {
        const response = await fetch("/api/chat/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage }),
        });

        const data = await response.json();

        if (data.error) {
          onError?.(data.error);
        } else if (data.rule) {
          onRuleParsed(data.rule);
        }
      } catch (error) {
        const errorMsg = "Failed to parse your request. Please try again.";
        onError?.(errorMsg);
      }
    } else {
      // New chat interface mode with MCP integration
      if (mcpEnabled && onMCPResponse) {
        try {
          const mcpResponse = await mcpServices.processChatMessage(userMessage);
          onMCPResponse(mcpResponse);
        } catch (error) {
          console.error('MCP processing failed:', error);
          onSendMessage?.(userMessage); // Fallback to regular chat
        }
      } else {
        onSendMessage?.(userMessage);
      }
    }

    setIsProcessing(false);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* MCP Features Toggle */}
        {enableMCP && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowMCPFeatures(!showMCPFeatures)}
            className={`flex-shrink-0 w-10 h-10 rounded-2xl smooth-transition ${
              showMCPFeatures 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
            title="MCP Features"
          >
            <Brain className="w-5 h-5" />
          </Button>
        )}

        {/* Attachment Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0 w-10 h-10 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 smooth-transition"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* Main Input */}
        <div className="flex-1 relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${APP_NAME}...`}
            className="input-glass w-full h-12 pl-4 pr-12 rounded-3xl text-foreground placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          
          {/* Voice Input Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1 w-8 h-8 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 smooth-transition"
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          disabled={!input.trim() || isProcessing}
          className="btn-primary flex-shrink-0 w-12 h-12 rounded-3xl border-0 disabled:opacity-50 disabled:transform-none"
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </form>
      
      {/* MCP Features Panel */}
      {showMCPFeatures && enableMCP && (
        <div className="mt-4 p-6 glass-card rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <span className="text-sm font-bold text-foreground">AI-Powered Features</span>
                <p className="text-xs text-muted-foreground">Enhanced by MCP servers</p>
              </div>
            </div>
            <div className="px-2 py-1 bg-success/20 rounded-full">
              <span className="text-xs font-medium text-success">Active</span>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-primary/10">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-primary" />
                <div>
                  <span className="text-sm font-medium text-foreground">Sequential Thinking</span>
                  <p className="text-xs text-muted-foreground">Structured analysis for complex rules</p>
                </div>
              </div>
              <button
                onClick={() => setMcpEnabled(!mcpEnabled)}
                className={`px-4 py-2 text-xs rounded-xl smooth-transition font-medium ${
                  mcpEnabled
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-secondary/70 text-muted-foreground hover:bg-secondary'
                }`}
              >
                {mcpEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-primary/10">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <div>
                  <span className="text-sm font-medium text-foreground">Magic UI Generation</span>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">AI-powered component creation</p>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-success/20 rounded-full">
                      <Zap className="w-3 h-3 text-success" />
                      <span className="text-xs font-medium text-success">100 free/month</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInput("Generate a crypto portfolio balance card component")}
                className="px-4 py-2 text-xs rounded-xl smooth-transition font-medium bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
              >
                TRY NOW
              </button>
            </div>
          </div>
          
          <div className="border-t border-primary/20 pt-4">
            <h4 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Quick Examples</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => setInput("Analyze: Send $100 USDC when ETH price drops 10%")}
                className="p-2 text-xs rounded-xl smooth-transition border bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-left"
              >
                📊 Complex Rule Analysis
              </button>
              <button
                onClick={() => setInput("Generate a transaction status component")}
                className="p-2 text-xs rounded-xl smooth-transition border bg-secondary/20 text-muted-foreground border-border hover:bg-secondary/30 text-left"
              >
                🎨 UI Component Creation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {!showMCPFeatures && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Quick Start</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: "💰", text: "Send $50 USDC to John every Friday" },
              { icon: "📈", text: "Send €200 EURC when EUR rises 2%" },
              { icon: "🔄", text: "Transfer $100 to Alice monthly" },
              { icon: "❤️", text: "Send $25 USDC to Mom weekly" }
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInput(suggestion.text)}
                className="px-4 py-2 text-xs rounded-2xl smooth-transition border font-medium bg-white/5 text-foreground border-border hover:bg-white/10 hover:border-primary/30 flex items-center gap-2"
              >
                <span>{suggestion.icon}</span>
                <span>{suggestion.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}