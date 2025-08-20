"use client";

import { useState, useEffect, useRef } from "react";
import { X, Home, FileText, ArrowLeftRight, Settings, User, LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview and analytics"
  },
  {
    title: "Rules",
    href: "/rules",
    icon: FileText,
    description: "Automation rules"
  },
  {
    title: "Transfers",
    href: "/transfers",
    icon: ArrowLeftRight,
    description: "Transaction history"
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Account preferences"
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    description: "User profile"
  }
];

export function MobileNav({ isOpen, onClose, className }: MobileNavProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Handle escape key and outside clicks
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnimating(true);
    } else {
      document.body.style.overflow = '';
      setIsAnimating(false);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstFocusable = menuRef.current.querySelector('button, a, [tabindex]:not([tabindex="-1"])') as HTMLElement;
      firstFocusable?.focus();
    }
  }, [isOpen]);

  const handleNavigation = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleSignOut = async () => {
    onClose();
    await signOut({ callbackUrl: '/' });
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 sm:hidden",
          isOpen ? "opacity-100" : "opacity-0",
          className
        )}
        data-testid="mobile-nav-backdrop"
      />

      {/* Navigation Menu */}
      <div
        ref={menuRef}
        className={cn(
          "fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out sm:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        data-testid="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Ferrow</h2>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6">
          <ul className="space-y-1 px-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              return (
                <li key={item.href}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 group",
                      isActive 
                        ? "bg-blue-50 text-blue-700 shadow-sm" 
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className={cn(
                      "w-6 h-6 flex items-center justify-center rounded-lg transition-colors",
                      isActive 
                        ? "bg-blue-100 text-blue-600" 
                        : "text-gray-400 group-hover:text-gray-600"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-4 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open('https://docs.ferrow.com', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-3" />
            Documentation
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
}