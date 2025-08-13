"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Mic } from "lucide-react";

interface ChatComposerProps {
  onSendMessage?: (message: string) => void;
  // Legacy props for rule parsing
  onRuleParsed?: (rule: any) => void;
  onError?: (error: string) => void;
}

export function ChatComposer({ onSendMessage, onRuleParsed, onError }: ChatComposerProps) {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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
      // New chat interface mode
      onSendMessage?.(userMessage);
    }

    setIsProcessing(false);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* Attachment Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0 w-10 h-10 rounded-2xl text-slate-500 hover:text-slate-700 hover:bg-white/20"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* Main Input */}
        <div className="flex-1 relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Stablecoin AI..."
            className="w-full h-12 pl-4 pr-12 rounded-3xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-slate-800 placeholder:text-slate-500 focus:border-white/40 focus:bg-white/20 shadow-glass"
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
            className="absolute right-2 top-1 w-8 h-8 rounded-2xl text-slate-500 hover:text-slate-700 hover:bg-white/20"
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          disabled={!input.trim() || isProcessing}
          className="flex-shrink-0 w-12 h-12 rounded-3xl bg-hero-gradient hover:shadow-glass-hover transform hover:scale-105 transition-all duration-200 text-white border-0 disabled:opacity-50 disabled:transform-none"
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </form>
      
      {/* Suggestions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          "Check my balance",
          "Send $100 USDC",
          "Create a new rule",
          "Show recent transfers"
        ].map((suggestion, index) => (
          <button
            key={index}
            onClick={() => setInput(suggestion)}
            className="px-3 py-1.5 text-xs rounded-full bg-white/10 text-slate-600 hover:bg-white/20 hover:text-slate-800 transition-all duration-200 border border-white/20"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}