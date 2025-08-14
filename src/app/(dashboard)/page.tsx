"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChatComposer } from "@/components/ChatComposer";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { KPICarousel } from "@/components/mobile/KPICarousel";
import { RuleCard } from "@/components/RuleCard";
import { APP_NAME, APP_TAGLINE } from "@/lib/appConfig";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Globe,
  Activity,
  CheckCircle,
  Play,
  Users,
  MessageSquare,
  BarChart3,
  Clock,
  DollarSign,
  TestTube,
  TrendingUp,
  Rocket,
  ExternalLink,
  Plus,
  Send,
  Repeat,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Natural Language Interface",
    description: "Simply describe what you want to automate in plain English. No complex forms or technical knowledge required.",
  },
  {
    icon: Globe,
    title: "Multi-Chain Support",
    description: "Seamlessly operate across Ethereum, Base, Arbitrum, and Polygon with intelligent routing.",
  },
  {
    icon: Zap,
    title: "Instant Execution",
    description: "Lightning-fast automation with real-time monitoring and immediate transaction execution.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade security with Circle Programmable Wallets and advanced encryption.",
  },
];

const stats = [
  { label: "Supported Chains", value: "4+", icon: Globe },
  { label: "Avg Transaction Fee", value: "~$0.05", icon: DollarSign },
  { label: "Uptime", value: "99.9%", icon: Activity },
  { label: "Execution Speed", value: "~2s", icon: Zap },
];

const quickActions = [
  {
    title: "Send $100",
    description: "Quick transfer",
    icon: Send,
    action: "Send $100 USDC to Alice weekly"
  },
  {
    title: "Create allowance", 
    description: "Set spending limit",
    icon: Plus,
    action: "Allow $500 monthly spending on Base"
  },
  {
    title: "Move to EURC",
    description: "On price change",
    icon: Repeat,
    action: "Move to EURC if EUR rises 2%"
  },
  {
    title: "Schedule payment",
    description: "Recurring transfer",
    icon: Clock,
    action: "Send $50 USDC to John every Friday"
  }
];

const recentActivity = [
  {
    id: "1",
    title: "Send $50 USDC to John",
    status: "success" as const,
    timestamp: "2 hours ago",
    amount: "$50.00",
    chain: "Base"
  },
  {
    id: "2", 
    title: "Weekly DCA into ETH",
    status: "success" as const,
    timestamp: "1 day ago",
    amount: "$200.00",
    chain: "Ethereum"
  },
  {
    id: "3",
    title: "Monthly rent payment",
    status: "pending" as const,
    timestamp: "2 days ago",
    amount: "$1,500.00", 
    chain: "Polygon"
  }
];

const useCases = [
  {
    title: "Recurring Payments",
    description: "Automate salary, rent, or subscription payments on schedule",
    example: "Send $1,000 USDC to contractor every month",
  },
  {
    title: "Dollar-Cost Averaging",
    description: "Build crypto positions gradually with automated purchases", 
    example: "Buy $200 ETH weekly when price below $2,000",
  },
  {
    title: "Smart Rebalancing",
    description: "Maintain portfolio allocation automatically",
    example: "If USDC > 60% of portfolio, convert excess to ETH",
  },
];

export default function DashboardPage() {
  const [showAuthButtons, setShowAuthButtons] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdRule, setCreatedRule] = useState<string>("");
  const router = useRouter();

  const handleGetStarted = () => {
    setShowAuthButtons(true);
  };

  const handleQuickStart = (text: string) => {
    setChatInput(text);
    // Scroll to chat section
    document.getElementById('chat-section')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
  };

  const handleChatSubmit = async (message: string) => {
    console.log("🤖 Processing automation rule:", message);
    setIsCreatingRule(true);
    
    // Simulate AI processing and rule creation
    setTimeout(() => {
      setIsCreatingRule(false);
      setCreatedRule(message);
      setShowSuccess(true);
      
      // Hide success message and redirect after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        router.push('/rules');
      }, 3000);
    }, 2000); // 2 second processing simulation
  };

  const handleViewRules = () => {
    setShowSuccess(false);
    router.push('/rules');
  };

  return (
    <div className="min-h-screen bg-background pb-[calc(env(safe-area-inset-bottom)+80px)] sm:pb-0">
      {/* Mobile Header */}
      <MobileHeader title="Home" showAddRule={true} />
      
      {/* Desktop Header - Hidden on mobile */}
      <header className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50 hidden sm:block">
        <div className="container-page">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-foreground">{APP_NAME}</span>
            </div>
            
            {/* CTA Button */}
            <div className="flex items-center gap-3">
              <Button onClick={handleGetStarted} className="btn-primary">
                <Users className="w-4 h-4 mr-2" />
                Get Started
              </Button>
              
              {showAuthButtons && (
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/auth/signin">
                      Sign in
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="btn-primary">
                    <Link href="/auth/signup">
                      Sign up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Hero Section */}
      <section className="sm:hidden px-4 pt-4 pb-6">
        {/* CTA Section */}
        <Card className="p-6 mb-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-primary-light text-primary px-3 py-1 rounded-full text-xs font-medium">
              <TestTube className="w-3 h-3" />
              <span>Demo Mode</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Create your first rule
            </h1>
            <p className="text-sm text-foreground-muted">
              Automate crypto payments with simple English
            </p>
            <Button asChild className="btn-primary w-full">
              <Link href="/rules/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </Link>
            </Button>
          </div>
        </Card>

        {/* KPI Carousel */}
        <KPICarousel />
      </section>

      {/* Desktop Hero - Hidden on mobile */}
      <section className="section-xl bg-gradient-to-b from-background to-background-muted hidden sm:block">
        <div className="container-content text-center">
          {/* Hero Badge */}
          <div className="inline-flex items-center space-x-2 bg-primary-light text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in">
            <TestTube className="w-4 h-4" />
            <span>Demo Mode Active - Safe Testing Environment</span>
          </div>

          {/* Hero Content */}
          <h1 className="text-display text-foreground mb-6 animate-slide-up">
            Automate Your Crypto
            <span className="text-gradient block">With Natural Language</span>
          </h1>
          
          <p className="text-body-large text-foreground-muted max-w-2xl mx-auto mb-12 animate-slide-up">
            {APP_TAGLINE}. Set up intelligent rules using simple English and let our AI handle complex multi-chain operations automatically.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-scale-in">
            <Button asChild className="btn-primary px-8 py-4 text-base">
              <Link href="/rules/new">
                <Play className="w-5 h-5 mr-2" />
                Try Demo
              </Link>
            </Button>
            <Button asChild className="btn-secondary px-8 py-4 text-base">
              <Link href="/auth/signup">
                <Users className="w-5 h-5 mr-2" />
                Create Account
              </Link>
            </Button>
          </div>

          {/* Hero Stats */}
          <div className="grid-4 max-w-3xl mx-auto mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-light rounded-xl mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-body-small text-foreground-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Quick Actions */}
      <section className="sm:hidden px-4 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickStart(action.action)}
                className="card-interactive p-4 text-left group"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                    <action.icon className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors text-sm mb-1">
                  {action.title}
                </h3>
                <p className="text-xs text-gray-500">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <Link
              href="/transfers"
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              See all
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <Card key={activity.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate text-sm">
                      {activity.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{activity.chain}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-medium text-gray-900 text-sm">{activity.amount}</div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === "success" ? "bg-green-500" :
                      activity.status === "pending" ? "bg-yellow-500" :
                      "bg-red-500"
                    }`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Desktop Chat Input - Message Ferrow */}
      <section id="chat-section" className="section-sm hidden sm:block">
        <div className="container-page">
          <div className="card-modern p-8">
            <div className="text-center mb-6">
              <h2 className="text-subheading text-foreground mb-2">Message Ferrow Assistant</h2>
              <p className="text-body text-foreground-muted">
                Describe what you want to automate in natural language
              </p>
            </div>
            <ChatComposer 
              initialValue={chatInput}
              onInputChange={setChatInput}
              onSendMessage={handleChatSubmit}
            />
            
            {/* Processing Animation */}
            {isCreatingRule && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
                  <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Sparkles className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <h3 className="text-heading text-foreground mb-2">Creating Your Rule</h3>
                  <p className="text-body text-foreground-muted">
                    Our AI is parsing your request and setting up the automation...
                  </p>
                  <div className="flex items-center justify-center mt-4 space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Confirmation */}
            {showSuccess && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl animate-scale-in">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-heading text-foreground mb-2">Rule Created Successfully! 🎉</h3>
                  <p className="text-body text-foreground-muted mb-6">
                    Your automation rule has been created and is now active:
                  </p>
                  
                  <div className="bg-primary-light rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Rocket className="w-4 h-4 text-primary" />
                      <span className="text-body-small font-medium text-primary">New Rule</span>
                    </div>
                    <p className="text-body font-medium text-foreground">&ldquo;{createdRule}&rdquo;</p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <Button onClick={handleViewRules} className="btn-primary w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View All Rules
                    </Button>
                    <p className="text-caption text-foreground-muted">
                      Redirecting automatically in 3 seconds...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Start Examples - Desktop Only */}
      <section className="section-md hidden sm:block">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-heading text-foreground mb-4">Quick Start</h2>
            <p className="text-body-large text-foreground-muted max-w-2xl mx-auto">
              Try these popular automation examples to get started quickly
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <button 
              onClick={() => handleQuickStart("Send $50 USDC to John every Friday")}
              className="card-interactive p-6 text-left group"
            >
              <div className="text-2xl mb-3">💰</div>
              <p className="text-body font-medium text-foreground group-hover:text-primary transition-colors">
                Send $50 USDC to John every Friday
              </p>
            </button>
            
            <button 
              onClick={() => handleQuickStart("Send €200 EURC when EUR rises 2%")}
              className="card-interactive p-6 text-left group"
            >
              <div className="text-2xl mb-3">📈</div>
              <p className="text-body font-medium text-foreground group-hover:text-primary transition-colors">
                Send €200 EURC when EUR rises 2%
              </p>
            </button>
            
            <button 
              onClick={() => handleQuickStart("Transfer $100 to Alice monthly")}
              className="card-interactive p-6 text-left group"
            >
              <div className="text-2xl mb-3">🔄</div>
              <p className="text-body font-medium text-foreground group-hover:text-primary transition-colors">
                Transfer $100 to Alice monthly
              </p>
            </button>
            
            <button 
              onClick={() => handleQuickStart("Send $25 USDC to Mom weekly")}
              className="card-interactive p-6 text-left group"
            >
              <div className="text-2xl mb-3">❤️</div>
              <p className="text-body font-medium text-foreground group-hover:text-primary transition-colors">
                Send $25 USDC to Mom weekly
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* Demo Banner - Desktop Only */}
      <section className="section-sm hidden sm:block">
        <div className="container-content">
          <div className="demo-banner animate-fade-in">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
                <TestTube className="w-6 h-6 text-yellow-900" />
              </div>
              <div className="flex-1">
                <h3 className="text-subheading text-yellow-900 mb-2">Demo Mode Active</h3>
                <p className="text-body text-yellow-800 mb-4">
                  Experience Ferrow risk-free! All transactions are simulated. Explore features and test automation rules without any real funds.
                </p>
                <div className="flex items-center space-x-2 text-body-small text-yellow-700">
                  <Shield className="w-4 h-4" />
                  <span>No real transactions • Sample data only • Always safe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Desktop Only */}
      <section className="section-lg hidden sm:block">
        <div className="container-page">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-4">Powerful Automation Features</h2>
            <p className="text-body-large text-foreground-muted max-w-2xl mx-auto">
              Everything you need to automate your crypto operations with confidence and ease.
            </p>
          </div>

          <div className="grid-auto-fit">
            {features.map((feature, index) => (
              <div key={index} className="card-modern p-8 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-subheading text-foreground mb-3">{feature.title}</h3>
                <p className="text-body text-foreground-muted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section - Desktop Only */}
      <section className="section-lg bg-background-muted hidden sm:block">
        <div className="container-page">
          <div className="text-center mb-16">
            <h2 className="text-heading text-foreground mb-4">What You Can Automate</h2>
            <p className="text-body-large text-foreground-muted max-w-2xl mx-auto">
              From simple recurring payments to sophisticated trading strategies, Ferrow handles it all.
            </p>
          </div>

          <div className="grid-3">
            {useCases.map((useCase, index) => (
              <div key={index} className="card-modern p-8 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <h3 className="text-subheading text-foreground mb-3">{useCase.title}</h3>
                <p className="text-body text-foreground-muted mb-6 leading-relaxed">{useCase.description}</p>
                <div className="bg-primary-light rounded-xl p-4 border border-primary/20">
                  <p className="text-body-small text-primary font-medium">&ldquo;{useCase.example}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Stats - Desktop Only */}
      <section className="section-lg hidden sm:block">
        <div className="container-content">
          <div className="card-modern p-12 text-center">
            <h2 className="text-heading text-foreground mb-4">Built for Scale</h2>
            <p className="text-body-large text-foreground-muted mb-8 max-w-xl mx-auto">
              Ferrow is designed to handle high-volume operations with enterprise-grade reliability.
            </p>
            
            <div className="grid-4 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                  <div className="text-body text-foreground-muted">{stat.label}</div>
                </div>
              ))}
            </div>

            <p className="text-caption text-foreground-subtle">
              * Demo metrics - not based on live data
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section - Desktop Only */}
      <section className="section-lg hidden sm:block">
        <div className="container-content">
          <div className="card-modern p-12 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <h2 className="text-heading text-foreground mb-4">Ready to Start Automating?</h2>
            <p className="text-body-large text-foreground-muted mb-8 max-w-xl mx-auto">
              Join the future of crypto automation. Start with our demo mode and upgrade when you&rsquo;re ready.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild className="btn-primary px-8 py-4 text-base">
                <Link href="/rules/new">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Try Demo First
                </Link>
              </Button>
              <Button asChild className="btn-secondary px-8 py-4 text-base">
                <Link href="/auth/signup">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Create Account
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container-page py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-body-small text-foreground-muted">
              © 2025 {APP_NAME}. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-6 text-body-small">
              <Link href="/terms" className="text-foreground-muted hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-foreground-muted hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/disclaimer" className="text-foreground-muted hover:text-foreground transition-colors">
                Legal Disclaimer
              </Link>
            </div>
          </div>
          
        </div>
      </footer>

      {/* Privacy Disclaimer */}
      <section className="section-sm bg-background-muted">
        <div className="container-content">
          <div className="card-modern p-8 text-center">
            <p className="text-body text-foreground-subtle max-w-4xl mx-auto">
              <strong>Important:</strong> This is a demonstration platform. All metrics and balances shown are sample data. 
              Cryptocurrency transactions involve risk. This software is provided for educational purposes only and does not constitute financial advice.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}