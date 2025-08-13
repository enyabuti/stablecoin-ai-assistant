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
    <div className="min-h-screen">
      {/* Modern Glass Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-72">
        <div className="h-full bg-gradient-to-b from-slate-900/90 to-slate-800/90 backdrop-blur-glass border-r border-white/10 shadow-glass">
          <div className="flex flex-col h-full">
            {/* Enhanced Logo Section */}
            <div className="flex items-center gap-3 p-6 border-b border-white/10">
              <div className="w-10 h-10 bg-hero-gradient rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-white">Stablecoin AI</h1>
                <p className="text-sm text-slate-300">Smart Assistant</p>
              </div>
            </div>
            
            {/* Enhanced Quick Actions */}
            <div className="p-6 border-b border-white/10">
              <div className="space-y-3">
                <Button asChild className="w-full justify-start h-11 bg-hero-gradient hover:bg-gradient-to-r hover:from-brand-600 hover:to-accent-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-200">
                  <Link href="/rules/new">
                    <Plus className="w-5 h-5 mr-3" />
                    Create Rule
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start h-10 bg-white/5 border-white/20 text-slate-200 hover:bg-white/10 hover:text-white backdrop-blur-sm">
                  <TestTube className="w-4 h-4 mr-3" />
                  Test Transfer
                </Button>
              </div>
            </div>
            
            {/* Enhanced Navigation */}
            <nav className="flex-1 p-6 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 transform hover:scale-105",
                      isActive
                        ? "bg-hero-gradient text-white shadow-lg"
                        : "text-slate-300 hover:text-white hover:bg-white/5 hover:backdrop-blur-sm"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            {/* Status Footer */}
            <div className="p-6 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Main Content */}
      <div className="pl-72">
        <main className="min-h-screen p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}