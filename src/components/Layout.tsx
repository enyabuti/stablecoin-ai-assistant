"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Settings, 
  ArrowLeftRight, 
  Sparkles,
  Plus,
  TestTube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Rules",
    href: "/rules",
    icon: Sparkles,
  },
  {
    name: "Transfers", 
    href: "/transfers",
    icon: ArrowLeftRight,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  
  return (
    <div className="min-h-screen flex">
      {/* Minimal Chat Sidebar */}
      <div className="w-16 flex flex-col bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-glass border-r border-white/10 shadow-glass">
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="w-8 h-8 bg-hero-gradient rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">S</span>
          </div>
        </div>
        
        {/* Navigation Icons */}
        <nav className="flex-1 p-2 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 transform hover:scale-105 group relative",
                  isActive
                    ? "bg-hero-gradient text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                )}
                title={item.name}
              >
                <item.icon className="w-5 h-5" />
                
                {/* Tooltip */}
                <div className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-800 text-white text-sm rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  {item.name}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
              </Link>
            );
          })}
        </nav>
        
        {/* Status Indicator */}
        <div className="p-4 border-t border-white/10">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mx-auto" title="All systems operational"></div>
        </div>
      </div>
      
      {/* Full-Width Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 border-b border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-xl text-slate-800">Stablecoin AI</h1>
            <div className="px-2 py-1 bg-hero-gradient/10 text-xs rounded-full text-slate-600 border border-white/20">
              Assistant
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Main Chat Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}