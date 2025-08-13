"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChatComposer } from "@/components/ChatComposer";
import { APP_NAME, APP_TAGLINE } from "@/lib/appConfig";
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
  Shield,
  Globe,
  Cpu,
  Users,
  CheckCircle,
  MessageSquare,
  Wallet,
  BarChart3,
  Timer,
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

const features = [
  {
    icon: MessageSquare,
    title: "Natural Language Interface",
    description: "Simply tell Ferrow what you want to do in plain English. No complex forms or technical jargon required."
  },
  {
    icon: Globe,
    title: "Multi-Chain Support",
    description: "Seamlessly operate across Ethereum, Base, Arbitrum, and Polygon. Smart routing finds the cheapest path."
  },
  {
    icon: Cpu,
    title: "AI-Powered Automation",
    description: "Create intelligent rules that execute automatically based on time, price movements, or custom conditions."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade security with Circle Programmable Wallets, webhook verification, and idempotency protection."
  },
  {
    icon: Zap,
    title: "Instant Execution",
    description: "Background job queues ensure your transactions execute immediately when conditions are met."
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track your automation performance with detailed metrics, fee analysis, and execution history."
  },
];

const howItWorksSteps = [
  {
    step: "1",
    title: "Connect Your Wallet",
    description: "Link your Circle Programmable Wallet or use our demo mode to explore features safely.",
    icon: Wallet
  },
  {
    step: "2", 
    title: "Describe Your Goal",
    description: "Chat with Ferrow about what you want to automate - recurring payments, DCA strategies, or conditional transfers.",
    icon: MessageSquare
  },
  {
    step: "3",
    title: "AI Creates Rules",
    description: "Our AI parses your request and creates precise automation rules with optimal chain routing.",
    icon: Cpu
  },
  {
    step: "4",
    title: "Automatic Execution",
    description: "Ferrow monitors conditions 24/7 and executes your transactions automatically when triggered.",
    icon: CheckCircle
  },
];

const useCases = [
  {
    title: "Recurring Payments",
    description: "Send salary, rent, or subscription payments automatically on schedule",
    example: "Send $1,000 USDC to my contractor every 1st of the month"
  },
  {
    title: "Dollar-Cost Averaging",
    description: "Build crypto positions gradually with automated purchases",
    example: "Buy $200 of ETH every Friday when price is below $2,000"
  },
  {
    title: "Smart Rebalancing",
    description: "Maintain portfolio allocation with automatic rebalancing",
    example: "If USDC exceeds 60% of portfolio, convert excess to ETH"
  },
  {
    title: "Cross-Chain Arbitrage",
    description: "Automatically move funds to chains with better yields",
    example: "Move USDC to Base when fees are 90% lower than Ethereum"
  },
  {
    title: "Emergency Triggers",
    description: "Protect your funds with market-based safety rules",
    example: "If ETH drops 20% in 24h, convert 50% to USDC"
  },
  {
    title: "Loyalty Rewards",
    description: "Automate customer rewards and affiliate payments",
    example: "Send 5% commission to referrer when sale completes"
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center py-16 px-6">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glass glow-effect">
              <Sparkles className="w-12 h-12 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6">
              {APP_NAME}
            </h1>
            <p className="text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
              {APP_TAGLINE}
            </p>
            <p className="text-lg text-muted-foreground/80 mb-12 max-w-4xl mx-auto">
              The AI-powered platform that automates your stablecoin transfers across multiple blockchains. 
              Set up intelligent rules using natural language and let Ferrow handle the rest – 24/7 monitoring, 
              optimal routing, and instant execution.
            </p>
            
            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-16">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="glass-card p-6 rounded-2xl text-left hover-lift group animate-fade-in"
                  onClick={() => {
                    console.log(`Sending: ${action.command}`);
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 smooth-transition">
                      <action.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground mb-1">{action.label}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="py-16 px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Powerful Features</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to automate your crypto operations with confidence and ease.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="glass-card p-6 rounded-2xl hover-lift group">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 smooth-transition">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-card-foreground mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works Section */}
          <div className="py-16 px-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl mx-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get started with Ferrow in four simple steps. No technical expertise required.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {howItWorksSteps.map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mx-auto mb-6">
                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 smooth-transition">
                      <step.icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-primary shadow-lg">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="font-semibold text-card-foreground mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases Section */}
          <div className="py-16 px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">What You Can Automate</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From simple recurring payments to sophisticated trading strategies, Ferrow handles it all.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {useCases.map((useCase, index) => (
                <div key={index} className="glass-card p-6 rounded-2xl hover-lift group">
                  <h3 className="font-semibold text-card-foreground mb-3">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{useCase.description}</p>
                  <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                    <p className="text-xs text-primary font-mono">&ldquo;{useCase.example}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="py-16 px-6 bg-gradient-to-br from-secondary/5 to-primary/5 rounded-3xl mx-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Built for Scale</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Ferrow is designed to handle high-volume operations with enterprise-grade reliability.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">4+</div>
                <div className="text-sm text-muted-foreground">Supported Chains</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">$0.05</div>
                <div className="text-sm text-muted-foreground">Avg Transaction Fee</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">2s</div>
                <div className="text-sm text-muted-foreground">Avg Execution Time</div>
              </div>
            </div>
          </div>

          {/* Demo Conversation Section */}
          <div className="py-16 px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">See It In Action</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Watch how Ferrow understands natural language and creates precise automation rules.
              </p>
            </div>
            <div className="space-y-6 max-w-4xl mx-auto">
              {mockConversation.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-3xl ${message.type === 'user' ? 'ml-12' : 'mr-12'}`}>
                    <div
                      className={`p-6 rounded-3xl ${
                        message.type === 'user'
                          ? 'message-user'
                          : 'message-assistant'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          message.type === 'user' 
                            ? 'bg-primary-foreground/20' 
                            : 'bg-gradient-primary'
                        }`}>
                          {message.type === 'user' ? (
                            <span className="text-sm font-bold text-primary-foreground">You</span>
                          ) : (
                            <Sparkles className="w-4 h-4 text-primary-foreground" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className={`prose prose-sm max-w-none ${
                            message.type === 'user' ? 'text-primary-foreground' : 'text-card-foreground'
                          }`}>
                            {message.message.split('\n').map((line, i) => (
                              <p key={i} className="mb-2 last:mb-0">{line}</p>
                            ))}
                          </div>
                          
                          {message.type === 'assistant' && message.data && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                              <div className="glass-card-strong rounded-xl p-3">
                                <p className="text-xs text-muted-foreground mb-1">Balance</p>
                                <p className="font-bold text-card-foreground">{message.data.balance}</p>
                              </div>
                              <div className="glass-card-strong rounded-xl p-3">
                                <p className="text-xs text-muted-foreground mb-1">Change</p>
                                <p className="font-bold text-success">{message.data.change}</p>
                              </div>
                              <div className="glass-card-strong rounded-xl p-3">
                                <p className="text-xs text-muted-foreground mb-1">Executions</p>
                                <p className="font-bold text-card-foreground">{message.data.executions}</p>
                              </div>
                              <div className="glass-card-strong rounded-xl p-3">
                                <p className="text-xs text-muted-foreground mb-1">Avg Fee</p>
                                <p className="font-bold text-card-foreground">{message.data.avgFee}</p>
                              </div>
                            </div>
                          )}
                          
                          <p className={`text-xs mt-3 ${
                            message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
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

          {/* CTA Section */}
          <div className="py-16 px-6 text-center">
            <div className="glass-card p-12 rounded-3xl max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Start Automating?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join the future of crypto automation. Start with our demo mode and upgrade to live trading when you&apos;re ready.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="btn-primary px-8 py-3 text-lg">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Start Chatting
                </Button>
                <Button variant="outline" className="px-8 py-3 text-lg">
                  <Users className="w-5 h-5 mr-2" />
                  Join Community
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto p-6">
          <ChatComposer />
        </div>
      </div>
    </div>
  );
}