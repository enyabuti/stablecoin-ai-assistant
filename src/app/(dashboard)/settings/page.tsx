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
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-contrast-enhanced">Settings</h1>
        <p className="text-muted-foreground">
          Configure API keys, feature flags, and webhook settings
        </p>
      </div>

      {/* Demo Mode Banner */}
      <div className="glass-card border-amber-500/20 bg-amber-50/10 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center">
            <TestTube className="w-3 h-3 text-amber-600" />
          </div>
          <h3 className="font-semibold text-amber-700 dark:text-amber-300">Demo Mode - Safe Configuration</h3>
        </div>
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Settings are in demo mode. Changes won&apos;t affect live systems until you configure production API keys.
          <span className="flex items-center gap-1 mt-2">
            <Shield className="w-3 h-3" />
            All sensitive data is mocked for security
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Feature Flags */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Feature Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Use Circle API</p>
                <p className="text-sm text-muted-foreground">
                  Connect to real Circle Programmable Wallets
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch />
                <Badge variant="secondary">Disabled</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Use Mock APIs</p>
                <p className="text-sm text-muted-foreground">
                  Use mock providers for development
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <Badge variant="default">Enabled</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Enable CCTP</p>
                <p className="text-sm text-muted-foreground">
                  Cross-chain transfer protocol
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch />
                <Badge variant="secondary">Disabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Keys
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Circle API Key</label>
              <Input 
                type="password" 
                placeholder="Not configured"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Get from Circle Developer Console
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">OpenAI API Key</label>
              <Input 
                type="password" 
                placeholder="Not configured"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                For LLM rule parsing (optional)
              </p>
            </div>
            
            <Button variant="outline" className="w-full">
              Save API Keys
            </Button>
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5" />
              Webhook Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Webhook URL</label>
              <Input 
                value="https://your-app.com/api/webhooks/circle"
                readOnly
                className="font-mono bg-bg-elevated"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Webhook Secret</label>
              <Input 
                type="password"
                placeholder="Configure in Circle dashboard"
                className="font-mono"
              />
            </div>
            
            <div className="flex items-center gap-2 p-3 rounded-xl bg-success/10 border border-success/20">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm text-success">Webhooks are functioning</span>
            </div>
            
            <Button variant="outline" className="w-full">
              <TestTube className="w-4 h-4 mr-2" />
              Test Webhook
            </Button>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Connection</span>
              <Badge variant="default" className="bg-success">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Redis Queue</span>
              <Badge variant="default" className="bg-success">
                <CheckCircle className="w-3 h-3 mr-1" />
                Running
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Job Workers</span>
              <Badge variant="default" className="bg-success">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Circle API</span>
              <Badge variant="secondary">
                <AlertCircle className="w-3 h-3 mr-1" />
                Mock Mode
              </Badge>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}