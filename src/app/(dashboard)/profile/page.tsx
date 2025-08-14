"use client";

import React, { useState } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Calendar,
  MapPin,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Edit,
  Save,
  X,
  TestTube,
  Shield,
  Camera
} from "lucide-react";
import Link from "next/link";

// Mock user data for demo mode
const mockUser = {
  id: "user_demo_1",
  name: "Demo User",
  email: "demo@ferrow.app",
  bio: "Crypto automation enthusiast exploring the future of DeFi. Building automated trading strategies and enjoying the seamless experience that Ferrow provides.",
  location: "San Francisco, CA",
  website: "https://demo-user.dev",
  github: "demo-user",
  twitter: "demouser",
  linkedin: "demo-user",
  joinDate: "2024-08-01",
  emailVerified: true,
  avatar: null,
  preferences: {
    notifications: true,
    newsletter: true,
    analytics: false,
    darkMode: "auto"
  },
  stats: {
    rulesCreated: 12,
    transfersExecuted: 47,
    totalVolume: 15420.50,
    avgFee: 0.23
  }
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(mockUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // This would come from session in real app

  const handleSave = () => {
    // In a real app, this would save to the database
    console.log("Saving profile:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(mockUser);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-contrast-enhanced">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="btn-primary">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button onClick={handleCancel} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Demo Mode Banner */}
      {!isAuthenticated && (
        <div className="glass-card border-amber-500/20 bg-amber-50/10 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center">
              <TestTube className="w-3 h-3 text-amber-600" />
            </div>
            <h3 className="font-semibold text-amber-700 dark:text-amber-300">Demo Profile</h3>
          </div>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            This is a sample profile to showcase functionality. 
            <Link href="/auth/signup" className="font-medium hover:underline ml-1">
              Sign up
            </Link> to create your own profile and save your preferences.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar and Name */}
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                      {formData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button 
                      size="sm" 
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                      title="Upload photo"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name</label>
                    {isEditing ? (
                      <Input 
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="max-w-md"
                      />
                    ) : (
                      <p className="text-lg font-semibold">{formData.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{formData.email}</span>
                      {formData.emailVerified && (
                        <Badge variant="default" className="bg-success">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="text-sm font-medium mb-2 block">Bio</label>
                {isEditing ? (
                  <Textarea 
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                ) : (
                  <p className="text-muted-foreground leading-relaxed">{formData.bio}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                {isEditing ? (
                  <Input 
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, Country"
                    className="max-w-md"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{formData.location}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Social Links</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Website</label>
                    {isEditing ? (
                      <Input 
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://yoursite.com"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <a href={formData.website} target="_blank" rel="noopener noreferrer" 
                           className="text-primary hover:underline">
                          {formData.website}
                        </a>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">GitHub</label>
                    {isEditing ? (
                      <Input 
                        value={formData.github}
                        onChange={(e) => handleInputChange('github', e.target.value)}
                        placeholder="username"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Github className="w-4 h-4 text-muted-foreground" />
                        <a href={`https://github.com/${formData.github}`} target="_blank" rel="noopener noreferrer" 
                           className="text-primary hover:underline">
                          @{formData.github}
                        </a>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Twitter</label>
                    {isEditing ? (
                      <Input 
                        value={formData.twitter}
                        onChange={(e) => handleInputChange('twitter', e.target.value)}
                        placeholder="username"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Twitter className="w-4 h-4 text-muted-foreground" />
                        <a href={`https://twitter.com/${formData.twitter}`} target="_blank" rel="noopener noreferrer" 
                           className="text-primary hover:underline">
                          @{formData.twitter}
                        </a>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">LinkedIn</label>
                    {isEditing ? (
                      <Input 
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        placeholder="username"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4 text-muted-foreground" />
                        <a href={`https://linkedin.com/in/${formData.linkedin}`} target="_blank" rel="noopener noreferrer" 
                           className="text-primary hover:underline">
                          {formData.linkedin}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Stats */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Member since</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span className="text-sm font-mono">
                    {new Date(formData.joinDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rules Created</span>
                <span className="text-sm font-bold">{formData.stats.rulesCreated}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transfers</span>
                <span className="text-sm font-bold">{formData.stats.transfersExecuted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Volume</span>
                <span className="text-sm font-bold font-mono">${formData.stats.totalVolume.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Fee</span>
                <span className="text-sm font-bold font-mono">${formData.stats.avgFee}</span>
              </div>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Verified</span>
                <Badge variant="default" className="bg-success">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">2FA</span>
                <Badge variant="secondary">Not Set</Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                Security Settings
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                Export Data
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Download Transactions
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-danger">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}