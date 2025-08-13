"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChatComposer } from "@/components/ChatComposer";
import { APP_NAME, APP_TAGLINE } from "@/lib/appConfig";
import Link from "next/link";
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
  TestTube,
  LogIn,
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
    icon: Send,
    label: "Try Demo",
    description: "Explore without signing up",
    href: "/rules/new"
  },
  {
    icon: Sparkles,
    label: "Create Automation",
    description: "Set up your first rule",
    href: "/auth/signin?mode=signup"
  },
  {
    icon: ArrowLeftRight,
    label: "View Features",
    description: "Learn about capabilities",
    href: "#features"
  },
  {
    icon: BarChart3,
    label: "See Analytics",
    description: "View performance metrics",
    href: "#analytics"
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
      {/* Header Navigation */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">{APP_NAME}</h1>
            </div>
            
            {/* Auth Button */}
            <div className="flex items-center gap-3">
              <Button asChild className="btn-primary">
                <Link href="/auth/signin?mode=signup">
                  <Users className="w-4 h-4 mr-2" />
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center py-20 px-6">
            <div className="w-28 h-28 mx-auto mb-10 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glass glow-effect">
              <Sparkles className="w-14 h-14 text-primary-foreground" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-8">
              {APP_NAME}
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground mb-6 max-w-4xl mx-auto leading-relaxed">
              {APP_TAGLINE}
            </p>
            <p className="text-lg md:text-xl text-muted-foreground/80 mb-12 max-w-5xl mx-auto leading-relaxed">
              The AI-powered platform that automates your stablecoin transfers across multiple blockchains. 
              Set up intelligent rules using natural language and let Ferrow handle the rest – 24/7 monitoring, 
              optimal routing, and instant execution.
            </p>
            
            {/* Get Started CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="btn-primary px-8 py-4 text-lg">
                <Link href="/auth/signin?mode=signup">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Automating
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg border-primary/30 hover:bg-primary/10">
                <Link href="/rules/new">
                  <TestTube className="w-5 h-5 mr-2" />
                  Try Demo
                </Link>
              </Button>
            </div>
            
            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-20">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="relative overflow-hidden glass-card p-8 rounded-3xl text-left hover-lift group animate-fade-in block shadow-lg border border-primary/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 smooth-transition"></div>
                  <div className="relative flex items-start gap-6">
                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 smooth-transition">
                      <action.icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-card-foreground mb-2 group-hover:text-primary smooth-transition">{action.label}</h3>
                      <p className="text-muted-foreground leading-relaxed">{action.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Demo Mode Banner */}
          <div className="px-6 mb-12">
            <div className="relative overflow-hidden glass-card border-amber-500/30 bg-gradient-to-r from-amber-50/20 via-yellow-50/20 to-amber-50/20 p-8 rounded-3xl max-w-5xl mx-auto shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5"></div>
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <TestTube className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-bold text-amber-700 dark:text-amber-300">Demo Mode Active</h3>
                    <div className="px-3 py-1 bg-amber-500/20 rounded-full">
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Safe Testing</span>
                    </div>
                  </div>
                  <p className="text-amber-600 dark:text-amber-400 leading-relaxed">
                    Experience Ferrow risk-free! All data and transactions are simulated. 
                    Explore features, test automation rules, and see how our AI handles your requests without any real funds involved.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-amber-600/80 dark:text-amber-400/80">
                    <Shield className="w-4 h-4" />
                    <span>No real transactions • Sample data only • Always safe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div id="features" className="py-16 px-6">
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
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                * Demo metrics - not based on live data
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">4+</div>
                <div className="text-sm text-muted-foreground">Supported Chains</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">~$0.05</div>
                <div className="text-sm text-muted-foreground">Est. Transaction Fee*</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">~2s</div>
                <div className="text-sm text-muted-foreground">Est. Execution Time*</div>
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
                <Button asChild className="btn-primary px-8 py-3 text-lg">
                  <Link href="/rules/new">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Try Demo First
                  </Link>
                </Button>
                <Button asChild variant="outline" className="px-8 py-3 text-lg">
                  <Link href="/auth/signin?mode=signup">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Create Account
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 {APP_NAME}. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/disclaimer" className="text-muted-foreground hover:text-foreground">
                Legal Disclaimer
              </Link>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
              <strong>Important:</strong> This is a demonstration platform. All metrics and balances shown are sample data. 
              Cryptocurrency transactions involve risk. This software is provided for educational purposes only and does not constitute financial advice. 
              Use at your own risk in production environments.
            </p>
          </div>
        </div>
      </footer>

      {/* Chat Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto p-6">
          <ChatComposer />
        </div>
      </div>
    </div>
  );
}