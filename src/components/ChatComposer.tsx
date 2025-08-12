"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Send } from "lucide-react";
import type { RuleJSON } from "@/lib/llm/schema";

interface ChatComposerProps {
  onRuleParsed?: (rule: RuleJSON) => void;
  onError?: (error: string) => void;
}

export function ChatComposer({ onRuleParsed, onError }: ChatComposerProps) {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsProcessing(true);

    try {
      const response = await fetch("/api/chat/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: data.needsClarification || data.error 
        }]);
        onError?.(data.error);
      } else if (data.rule) {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "Great! I've parsed your request into a rule. You can review and edit it in the form." 
        }]);
        onRuleParsed?.(data.rule);
      }
    } catch (error) {
      const errorMsg = "Failed to parse your request. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: errorMsg }]);
      onError?.(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 flex flex-col p-4">
        <div className="flex-1 space-y-4 mb-4 max-h-64 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-brand" />
              <p className="text-sm">
                Describe what you want to automate...
              </p>
              <p className="text-xs mt-1 opacity-75">
                e.g., &quot;Send $50 USDC to John every Friday at 8am&quot;
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl text-sm ${
                  msg.role === "user"
                    ? "bg-brand text-white ml-8"
                    : "bg-bg-elevated mr-8"
                }`}
              >
                {msg.content}
              </div>
            ))
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your automation rule..."
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isProcessing}
            variant="gradient"
            size="icon"
            className="shrink-0 h-[60px] w-12"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}