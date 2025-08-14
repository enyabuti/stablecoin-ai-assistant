"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/appConfig";
import { 
  LayoutDashboard, 
  Settings, 
  ArrowLeftRight, 
  Sparkles,
  Plus,
  TestTube,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthButton } from "@/components/AuthButton";

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
    name: "Profile",
    href: "/profile",
    icon: User,
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
      <div className="sidebar-glass w-16 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="w-8 h-8 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground font-bold text-sm">F</span>
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
                  "flex items-center justify-center w-12 h-12 rounded-2xl smooth-transition hover-lift group relative",
                  isActive
                    ? "bg-gradient-primary text-primary-foreground shadow-lg glow-effect"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
                title={item.name}
              >
                <item.icon className="w-5 h-5" />
                
                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-[9999]">
                  {item.name}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                </div>
              </Link>
            );
          })}
        </nav>
        
        {/* Status Indicator */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="w-3 h-3 bg-success rounded-full animate-pulse mx-auto" title="All systems operational"></div>
        </div>
      </div>
      
      {/* Full-Width Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar - Hidden */}
        <div className="hidden">
        </div>
        
        {/* Main Chat Content */}
        <main className="flex-1 overflow-hidden relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}