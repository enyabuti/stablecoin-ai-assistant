"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChatComposer } from "@/components/ChatComposer";
import { APP_NAME, APP_TAGLINE } from "@/lib/appConfig";
import Link from "next/link";
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
  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
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
            <Button className="btn-primary">
              <Users className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-xl bg-gradient-to-b from-background to-background-muted">
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
              <Link href="/auth/signin?mode=signup">
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

      {/* Demo Banner */}
      <section className="section-sm">
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

      {/* Features Section */}
      <section className="section-lg">
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

      {/* Use Cases Section */}
      <section className="section-lg bg-background-muted">
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

      {/* Performance Stats */}
      <section className="section-lg">
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

      {/* CTA Section */}
      <section className="section-lg">
        <div className="container-content">
          <div className="card-modern p-12 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <h2 className="text-heading text-foreground mb-4">Ready to Start Automating?</h2>
            <p className="text-body-large text-foreground-muted mb-8 max-w-xl mx-auto">
              Join the future of crypto automation. Start with our demo mode and upgrade when you're ready.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild className="btn-primary px-8 py-4 text-base">
                <Link href="/rules/new">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Try Demo First
                </Link>
              </Button>
              <Button asChild className="btn-secondary px-8 py-4 text-base">
                <Link href="/auth/signin?mode=signup">
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
          
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-caption text-center text-foreground-subtle max-w-4xl mx-auto">
              <strong>Important:</strong> This is a demonstration platform. All metrics and balances shown are sample data. 
              Cryptocurrency transactions involve risk. This software is provided for educational purposes only and does not constitute financial advice.
            </p>
          </div>
        </div>
      </footer>

      {/* Chat Input */}
      <div className="border-t border-border bg-background/80 backdrop-blur-lg">
        <div className="container-page py-6">
          <ChatComposer />
        </div>
      </div>
    </div>
  );
}