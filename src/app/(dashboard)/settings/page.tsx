"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="content-section">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-headline text-gradient-subtle mb-3">Settings</h1>
        <p className="text-body-large text-muted-foreground">
          Configure API keys, feature flags, and webhook settings
        </p>
      </div>

      {/* Demo Mode Banner */}
      <div className="panel-modern border-amber-500/30 bg-gradient-to-r from-amber-50/20 via-yellow-50/20 to-amber-50/20 mb-12">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-3xl flex items-center justify-center shadow-lg">
            <TestTube className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xl font-bold text-amber-700 dark:text-amber-300">Demo Mode - Safe Configuration</h3>
              <div className="px-4 py-2 bg-amber-500/20 rounded-full">
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Protected</span>
              </div>
            </div>
            <p className="text-body text-amber-600 dark:text-amber-400 leading-relaxed mb-4">
              Settings are in demo mode. Changes won&apos;t affect live systems until you configure production API keys.
            </p>
            <div className="flex items-center gap-3 text-caption text-amber-600/80 dark:text-amber-400/80">
              <Shield className="w-5 h-5" />
              <span>All sensitive data is mocked for security</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Feature Flags */}
        <div className="panel-modern">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-card-foreground mb-2 flex items-center gap-3">
              <Settings className="w-6 h-6" />
              Feature Flags
            </h2>
          </div>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-body font-semibold text-card-foreground">Use Circle API</p>
                <p className="text-caption text-muted-foreground leading-relaxed">
                  Connect to real Circle Programmable Wallets
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Switch />
                <Badge variant="secondary" className="font-medium">Disabled</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-body font-semibold text-card-foreground">Use Mock APIs</p>
                <p className="text-caption text-muted-foreground leading-relaxed">
                  Use mock providers for development
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Switch defaultChecked />
                <Badge variant="default" className="font-medium">Enabled</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-body font-semibold text-card-foreground">Enable CCTP</p>
                <p className="text-caption text-muted-foreground leading-relaxed">
                  Cross-chain transfer protocol
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Switch />
                <Badge variant="secondary" className="font-medium">Disabled</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="panel-modern">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-card-foreground mb-2 flex items-center gap-3">
              <Key className="w-6 h-6" />
              API Keys
            </h2>
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-body font-semibold text-card-foreground">Circle API Key</label>
              <Input 
                type="password" 
                placeholder="Not configured"
                className="font-mono h-12 text-body rounded-xl"
              />
              <p className="text-caption text-muted-foreground">
                Get from Circle Developer Console
              </p>
            </div>
            
            <div className="space-y-3">
              <label className="text-body font-semibold text-card-foreground">OpenAI API Key</label>
              <Input 
                type="password" 
                placeholder="Not configured"
                className="font-mono h-12 text-body rounded-xl"
              />
              <p className="text-caption text-muted-foreground">
                For LLM rule parsing (optional)
              </p>
            </div>
            
            <Button variant="outline" size="lg" className="w-full h-12 text-base font-semibold rounded-xl">
              Save API Keys
            </Button>
          </div>
        </div>

        {/* Webhooks */}
        <div className="panel-modern">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-card-foreground mb-2 flex items-center gap-3">
              <Webhook className="w-6 h-6" />
              Webhook Configuration
            </h2>
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-body font-semibold text-card-foreground">Webhook URL</label>
              <Input 
                value="https://your-app.com/api/webhooks/circle"
                readOnly
                className="font-mono h-12 text-body rounded-xl bg-muted/50"
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-body font-semibold text-card-foreground">Webhook Secret</label>
              <Input 
                type="password"
                placeholder="Configure in Circle dashboard"
                className="font-mono h-12 text-body rounded-xl"
              />
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-success/10 border border-success/20">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-body font-medium text-success">Webhooks are functioning</span>
            </div>
            
            <Button variant="outline" size="lg" className="w-full h-12 text-base font-semibold rounded-xl">
              <TestTube className="w-5 h-5 mr-3" />
              Test Webhook
            </Button>
          </div>
        </div>

        {/* System Status */}
        <div className="panel-modern">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-card-foreground mb-2">System Status</h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-body font-medium text-card-foreground">Database Connection</span>
              <Badge variant="default" className="bg-success font-medium">
                <CheckCircle className="w-4 h-4 mr-2" />
                Connected
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-body font-medium text-card-foreground">Redis Queue</span>
              <Badge variant="default" className="bg-success font-medium">
                <CheckCircle className="w-4 h-4 mr-2" />
                Running
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-body font-medium text-card-foreground">Job Workers</span>
              <Badge variant="default" className="bg-success font-medium">
                <CheckCircle className="w-4 h-4 mr-2" />
                Active
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-body font-medium text-card-foreground">Circle API</span>
              <Badge variant="secondary" className="font-medium">
                <AlertCircle className="w-4 h-4 mr-2" />
                Mock Mode
              </Badge>
            </div>
            
            <div className="pt-6 border-t border-border/50">
              <p className="text-caption text-muted-foreground">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}