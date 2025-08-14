"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { 
  Settings, 
  Key, 
  Webhook, 
  TestTube, 
  AlertCircle,
  CheckCircle,
  Shield,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Zap,
  Database,
  Activity,
  Users,
  Server,
  ChevronRight
} from "lucide-react";

export default function SettingsPage() {
  const [showApiKeys, setShowApiKeys] = useState({
    circle: false,
    openai: false,
    webhook: false
  });
  const [featureFlags, setFeatureFlags] = useState({
    circleApi: false,
    mockApis: true,
    cctp: false,
    notifications: true,
    analytics: true,
    mcp: false
  });
  
  const toggleFeature = (feature: keyof typeof featureFlags) => {
    setFeatureFlags(prev => ({ ...prev, [feature]: !prev[feature] }));
  };
  
  const toggleApiKeyVisibility = (key: keyof typeof showApiKeys) => {
    setShowApiKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-background pb-[calc(env(safe-area-inset-bottom)+80px)] sm:pb-0">
      {/* Mobile Header */}
      <MobileHeader title="Settings" showAddRule={false} />
      
      {/* Desktop Header */}
      <div className="hidden sm:block border-b border-border bg-background">
        <div className="container-page">
          <div className="py-8">
            <h1 className="text-heading text-foreground mb-2">Settings</h1>
            <p className="text-body text-foreground-muted">
              Configure API keys, feature flags, and system preferences
            </p>
          </div>
        </div>
      </div>

      <div className="container-page py-4 sm:py-8">
        {/* Demo Mode Banner */}
        <div className="demo-banner mb-6">
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
              <TestTube className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-900" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-sm sm:text-subheading text-yellow-900 font-semibold">Demo Mode - Safe Configuration</h3>
                <div className="px-2 py-1 sm:px-3 bg-yellow-400/20 rounded-full">
                  <span className="text-xs font-medium text-yellow-800">Protected</span>
                </div>
              </div>
              <p className="text-sm sm:text-body text-yellow-800 mb-3 sm:mb-4">
                Settings are in demo mode. Changes won&apos;t affect live systems until you configure production API keys.
              </p>
              <div className="flex items-center space-x-2 text-xs sm:text-body-small text-yellow-700">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>All sensitive data is mocked for security</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Accordion Layout */}
        <div className="sm:hidden space-y-4">
          <Accordion type="single" collapsible className="space-y-4">
            {/* Feature Flags */}
            <AccordionItem value="features" className="bg-white rounded-2xl border shadow-sm">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Settings className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-foreground">Feature Flags</span>
                    <p className="text-xs text-foreground-muted">
                      {Object.values(featureFlags).filter(Boolean).length} enabled
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  {[
                    { key: 'circleApi', label: 'Circle API', desc: 'Real Circle Programmable Wallets', icon: Zap },
                    { key: 'mockApis', label: 'Mock APIs', desc: 'Safe development testing', icon: TestTube },
                    { key: 'cctp', label: 'CCTP', desc: 'Cross-chain transfer protocol', icon: RefreshCw },
                    { key: 'notifications', label: 'Push Notifications', desc: 'Transaction alerts', icon: AlertCircle },
                    { key: 'analytics', label: 'Analytics', desc: 'Usage tracking', icon: Activity },
                    { key: 'mcp', label: 'MCP Features', desc: 'AI-powered enhancements', icon: Shield }
                  ].map(({ key, label, desc, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <div>
                          <h4 className="text-sm font-medium text-foreground">{label}</h4>
                          <p className="text-xs text-foreground-muted">{desc}</p>
                        </div>
                      </div>
                      <Switch 
                        checked={featureFlags[key as keyof typeof featureFlags]}
                        onCheckedChange={() => toggleFeature(key as keyof typeof featureFlags)}
                      />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* API Keys */}
            <AccordionItem value="api-keys" className="bg-white rounded-2xl border shadow-sm">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Key className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-foreground">API Keys</span>
                    <p className="text-xs text-foreground-muted">Security credentials</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Circle API Key</label>
                    <div className="relative">
                      <Input 
                        type={showApiKeys.circle ? "text" : "password"}
                        placeholder="Not configured"
                        className="pr-20 font-mono text-sm"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => toggleApiKeyVisibility('circle')}
                        >
                          {showApiKeys.circle ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">OpenAI API Key</label>
                    <div className="relative">
                      <Input 
                        type={showApiKeys.openai ? "text" : "password"}
                        placeholder="Not configured"
                        className="pr-20 font-mono text-sm"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => toggleApiKeyVisibility('openai')}
                        >
                          {showApiKeys.openai ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full h-11 rounded-2xl">
                    Save API Keys
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* System Status */}
            <AccordionItem value="status" className="bg-white rounded-2xl border shadow-sm">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-foreground">System Status</span>
                    <p className="text-xs text-green-600">All systems operational</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  {[
                    { label: 'Database', status: 'Connected', icon: Database, color: 'green' },
                    { label: 'Redis Queue', status: 'Running', icon: Server, color: 'green' },
                    { label: 'Workers', status: 'Active', icon: Users, color: 'green' },
                    { label: 'Circle API', status: 'Mock Mode', icon: TestTube, color: 'yellow' }
                  ].map(({ label, status, icon: Icon, color }) => (
                    <div key={label} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-foreground">{label}</span>
                      </div>
                      <Badge className={`
                        ${color === 'green' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                        ${color === 'yellow' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
                      `}>
                        {status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        {/* Desktop: Grid Layout */}
        <div className="hidden sm:grid sm:grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Enhanced Feature Flags */}
          <Card className="glass-card">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-subheading text-foreground">Feature Flags</CardTitle>
                  <p className="text-body-small text-foreground-muted mt-1">
                    {Object.values(featureFlags).filter(Boolean).length} of {Object.keys(featureFlags).length} enabled
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'circleApi', label: 'Circle API', desc: 'Connect to real Circle Programmable Wallets for live transactions', icon: Zap },
                { key: 'mockApis', label: 'Mock APIs', desc: 'Use mock providers for safe development and testing', icon: TestTube },
                { key: 'cctp', label: 'Enable CCTP', desc: 'Cross-chain transfer protocol for seamless multi-chain operations', icon: RefreshCw },
                { key: 'notifications', label: 'Push Notifications', desc: 'Real-time alerts for transaction status updates', icon: AlertCircle },
                { key: 'analytics', label: 'Usage Analytics', desc: 'Collect anonymized usage data for improvements', icon: Activity },
                { key: 'mcp', label: 'MCP Features', desc: 'AI-powered rule parsing and UI generation capabilities', icon: Shield }
              ].map(({ key, label, desc, icon: Icon }, index) => (
                <div key={key}>
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-body font-semibold text-foreground mb-1">{label}</h3>
                        <p className="text-body-small text-foreground-muted leading-relaxed">{desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Switch 
                        checked={featureFlags[key as keyof typeof featureFlags]}
                        onCheckedChange={() => toggleFeature(key as keyof typeof featureFlags)}
                      />
                      <Badge className={`
                        ${featureFlags[key as keyof typeof featureFlags] 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                        }
                      `}>
                        {featureFlags[key as keyof typeof featureFlags] ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                  {index < 5 && <div className="h-px bg-border mt-6"></div>}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card className="glass-card">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-subheading text-foreground">API Keys</CardTitle>
                  <p className="text-body-small text-foreground-muted mt-1">Security credentials</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-body font-semibold text-foreground mb-3">Circle API Key</label>
                <div className="relative">
                  <Input 
                    type={showApiKeys.circle ? "text" : "password"}
                    placeholder="Not configured"
                    className="input-modern font-mono pr-24"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleApiKeyVisibility('circle')}
                    >
                      {showApiKeys.circle ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-body-small text-foreground-muted mt-2">
                  Get from Circle Developer Console
                </p>
              </div>
              
              <div>
                <label className="block text-body font-semibold text-foreground mb-3">OpenAI API Key</label>
                <div className="relative">
                  <Input 
                    type={showApiKeys.openai ? "text" : "password"}
                    placeholder="Not configured"
                    className="input-modern font-mono pr-24"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleApiKeyVisibility('openai')}
                    >
                      {showApiKeys.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-body-small text-foreground-muted mt-2">
                  For LLM rule parsing (optional)
                </p>
              </div>
              
              <Button className="btn-primary w-full">
                Save API Keys
              </Button>
            </CardContent>
          </Card>

          {/* Webhooks */}
          <Card className="glass-card">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                  <Webhook className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-subheading text-foreground">Webhook Configuration</CardTitle>
                  <p className="text-body-small text-foreground-muted mt-1">Real-time event notifications</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-body font-semibold text-foreground mb-3">Webhook URL</label>
                <div className="relative">
                  <Input 
                    value="https://your-app.com/api/webhooks/circle"
                    readOnly
                    className="input-modern font-mono bg-background-muted pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-body font-semibold text-foreground mb-3">Webhook Secret</label>
                <div className="relative">
                  <Input 
                    type={showApiKeys.webhook ? "text" : "password"}
                    placeholder="Configure in Circle dashboard"
                    className="input-modern font-mono pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => toggleApiKeyVisibility('webhook')}
                  >
                    {showApiKeys.webhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-body font-medium text-green-700">Webhooks are functioning</span>
              </div>
              
              <Button variant="outline" className="w-full">
                <TestTube className="w-4 h-4 mr-2" />
                Test Webhook
              </Button>
            </CardContent>
          </Card>

          {/* Enhanced System Status */}
          <Card className="glass-card">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-subheading text-foreground">System Status</CardTitle>
                    <p className="text-body-small text-green-600 mt-1">All systems operational</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Database Connection', status: 'Connected', icon: Database, color: 'green' },
                { label: 'Redis Queue', status: 'Running', icon: Server, color: 'green' },
                { label: 'Job Workers', status: 'Active', icon: Users, color: 'green' },
                { label: 'Circle API', status: 'Mock Mode', icon: TestTube, color: 'yellow' }
              ].map(({ label, status, icon: Icon, color }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="text-body text-foreground font-medium">{label}</span>
                  </div>
                  <Badge className={`
                    ${color === 'green' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                    ${color === 'yellow' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
                  `}>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {status}
                  </Badge>
                </div>
              ))}
              
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <p className="text-body-small text-foreground-muted">
                    Last updated: {new Date().toLocaleTimeString()}
                  </p>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Activity className="w-3 h-3 mr-1" />
                    Monitoring
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}