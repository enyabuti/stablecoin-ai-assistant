import React from "react";
import { Button } from "@/components/ui/button";
import { ChatComposer } from "@/components/ChatComposer";
import {
  DollarSign,
  Activity,
  Clock,
  TrendingUp,
  Sparkles,
  Zap,
  Send,
  Settings,
  ArrowLeftRight,
} from "lucide-react";

// Mock conversation data
const mockConversation = [
  {
    id: "1",
    type: "user",
    message: "Show me my portfolio balance",
    timestamp: "2 min ago",
  },
  {
    id: "2",
    type: "assistant",
    message: "Your current portfolio balance is $2,847.50, which is up 12.3% from last week. You have 47 automated transactions executed in the last 24 hours with an average fee of $0.23.",
    timestamp: "2 min ago",
    data: {
      balance: "$2,847.50",
      change: "+12.3%",
      executions: "47",
      avgFee: "$0.23"
    }
  },
  {
    id: "3",
    type: "user",
    message: "Create a rule to send $50 USDC to john@example.com when ETH price goes above $2500",
    timestamp: "5 min ago",
  },
  {
    id: "4",
    type: "assistant",
    message: "I've created a new automation rule for you:\n\n✅ **Trigger**: ETH price > $2,500\n✅ **Action**: Send $50 USDC to john@example.com\n✅ **Network**: Base (lowest fees)\n✅ **Status**: Active and monitoring\n\nThe rule is now live and will execute automatically when the condition is met.",
    timestamp: "5 min ago",
  },
];

const quickActions = [
  {
    icon: DollarSign,
    label: "Check Balance",
    description: "View portfolio summary",
    command: "Show me my current balance and recent activity"
  },
  {
    icon: Send,
    label: "Send Money",
    description: "Transfer stablecoins",
    command: "I want to send USDC to someone"
  },
  {
    icon: Sparkles,
    label: "Create Rule",
    description: "Set up automation",
    command: "Help me create a new automation rule"
  },
  {
    icon: ArrowLeftRight,
    label: "View Transfers",
    description: "See transaction history",
    command: "Show me my recent transfers and their status"
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section - Only shown when no conversation */}
          <div className="text-center py-12 px-6">
            <div className="w-20 h-20 mx-auto mb-6 bg-hero-gradient rounded-3xl flex items-center justify-center shadow-glass">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-hero-gradient bg-clip-text text-transparent mb-4">
              Stablecoin AI Assistant
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Your intelligent companion for stablecoin automation, cross-chain transfers, and DeFi management.
            </p>
            
            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="glass-card p-6 rounded-2xl border border-white/20 hover:border-white/30 text-left transition-all duration-200 hover:scale-105 hover:shadow-glass-hover group"
                  onClick={() => {
                    // This would trigger sending the command to chat
                    console.log(`Sending: ${action.command}`);
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-hero-gradient rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">{action.label}</h3>
                      <p className="text-sm text-slate-600">{action.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Conversation History */}
          <div className="space-y-6 px-6 pb-6">
            {mockConversation.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-3xl ${message.type === 'user' ? 'ml-12' : 'mr-12'}`}>
                  {/* Message Bubble */}
                  <div
                    className={`p-6 rounded-3xl ${
                      message.type === 'user'
                        ? 'bg-hero-gradient text-white shadow-glass'
                        : 'glass-card border border-white/20 shadow-glass'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-white/20' 
                          : 'bg-hero-gradient'
                      }`}>
                        {message.type === 'user' ? (
                          <span className="text-sm font-bold text-white">You</span>
                        ) : (
                          <Sparkles className="w-4 h-4 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className={`prose prose-sm max-w-none ${
                          message.type === 'user' ? 'text-white' : 'text-slate-700'
                        }`}>
                          {message.message.split('\n').map((line, i) => (
                            <p key={i} className="mb-2 last:mb-0">{line}</p>
                          ))}
                        </div>
                        
                        {/* Data Cards for Assistant Messages */}
                        {message.type === 'assistant' && message.data && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                              <p className="text-xs text-slate-600 mb-1">Balance</p>
                              <p className="font-bold text-slate-800">{message.data.balance}</p>
                            </div>
                            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                              <p className="text-xs text-slate-600 mb-1">Change</p>
                              <p className="font-bold text-green-600">{message.data.change}</p>
                            </div>
                            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                              <p className="text-xs text-slate-600 mb-1">Executions</p>
                              <p className="font-bold text-slate-800">{message.data.executions}</p>
                            </div>
                            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                              <p className="text-xs text-slate-600 mb-1">Avg Fee</p>
                              <p className="font-bold text-slate-800">{message.data.avgFee}</p>
                            </div>
                          </div>
                        )}
                        
                        <p className={`text-xs mt-3 ${
                          message.type === 'user' ? 'text-white/70' : 'text-slate-500'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Input Area */}
      <div className="border-t border-white/20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-6">
          <ChatComposer />
        </div>
      </div>
    </div>
  );
}