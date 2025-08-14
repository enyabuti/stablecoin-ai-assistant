"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Key, 
  Webhook, 
  TestTube, 
  AlertCircle,
  CheckCircle,
  Shield
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="container-page">
          <div className="py-8">
            <h1 className="text-heading text-foreground mb-2">Settings</h1>
            <p className="text-body text-foreground-muted">
              Configure API keys, feature flags, and webhook settings
            </p>
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        {/* Demo Mode Banner */}
        <div className="demo-banner mb-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
              <TestTube className="w-6 h-6 text-yellow-900" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-subheading text-yellow-900">Demo Mode - Safe Configuration</h3>
                <div className="px-3 py-1 bg-yellow-400/20 rounded-full">
                  <span className="text-xs font-medium text-yellow-800">Protected</span>
                </div>
              </div>
              <p className="text-body text-yellow-800 mb-4">
                Settings are in demo mode. Changes won&apos;t affect live systems until you configure production API keys.
              </p>
              <div className="flex items-center space-x-2 text-body-small text-yellow-700">
                <Shield className="w-4 h-4" />
                <span>All sensitive data is mocked for security</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Feature Flags */}
          <div className="card-modern p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-subheading text-foreground">Feature Flags</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <h3 className="text-body font-semibold text-foreground mb-1">Use Circle API</h3>
                  <p className="text-body-small text-foreground-muted leading-relaxed">
                    Connect to real Circle Programmable Wallets for live transactions
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Switch />
                  <Badge className="bg-gray-100 text-gray-700 border-gray-200">Disabled</Badge>
                </div>
              </div>
              
              <div className="h-px bg-border"></div>
              
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <h3 className="text-body font-semibold text-foreground mb-1">Use Mock APIs</h3>
                  <p className="text-body-small text-foreground-muted leading-relaxed">
                    Use mock providers for safe development and testing
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Switch defaultChecked />
                  <Badge className="bg-green-100 text-green-700 border-green-200">Enabled</Badge>
                </div>
              </div>
              
              <div className="h-px bg-border"></div>
              
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <h3 className="text-body font-semibold text-foreground mb-1">Enable CCTP</h3>
                  <p className="text-body-small text-foreground-muted leading-relaxed">
                    Cross-chain transfer protocol for seamless multi-chain operations
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Switch />
                  <Badge className="bg-gray-100 text-gray-700 border-gray-200">Disabled</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* API Keys */}
          <div className="card-modern p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-subheading text-foreground">API Keys</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-body font-semibold text-foreground mb-3">Circle API Key</label>
                <Input 
                  type="password" 
                  placeholder="Not configured"
                  className="input-modern font-mono"
                />
                <p className="text-body-small text-foreground-muted mt-2">
                  Get from Circle Developer Console
                </p>
              </div>
              
              <div>
                <label className="block text-body font-semibold text-foreground mb-3">OpenAI API Key</label>
                <Input 
                  type="password" 
                  placeholder="Not configured"
                  className="input-modern font-mono"
                />
                <p className="text-body-small text-foreground-muted mt-2">
                  For LLM rule parsing (optional)
                </p>
              </div>
              
              <Button className="btn-primary w-full">
                Save API Keys
              </Button>
            </div>
          </div>

          {/* Webhooks */}
          <div className="card-modern p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                <Webhook className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-subheading text-foreground">Webhook Configuration</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-body font-semibold text-foreground mb-3">Webhook URL</label>
                <Input 
                  value="https://your-app.com/api/webhooks/circle"
                  readOnly
                  className="input-modern font-mono bg-background-muted"
                />
              </div>
              
              <div>
                <label className="block text-body font-semibold text-foreground mb-3">Webhook Secret</label>
                <Input 
                  type="password"
                  placeholder="Configure in Circle dashboard"
                  className="input-modern font-mono"
                />
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-body font-medium text-green-700">Webhooks are functioning</span>
              </div>
              
              <Button variant="outline" className="w-full">
                <TestTube className="w-4 h-4 mr-2" />
                Test Webhook
              </Button>
            </div>
          </div>

          {/* System Status */}
          <div className="card-modern p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-subheading text-foreground">System Status</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-body text-foreground">Database Connection</span>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-body text-foreground">Redis Queue</span>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Running
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-body text-foreground">Job Workers</span>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-body text-foreground">Circle API</span>
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Mock Mode
                </Badge>
              </div>
              
              <div className="pt-4 border-t border-border">
                <p className="text-body-small text-foreground-muted">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}