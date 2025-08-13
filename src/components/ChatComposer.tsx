"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Mic } from "lucide-react";
import { APP_NAME } from "@/lib/appConfig";

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
            className={`px-3 py-1.5 text-xs rounded-full smooth-transition border ${
              suggestion.includes('rule') 
                ? 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 hover:text-primary font-medium' 
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border-border'
            }`}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}