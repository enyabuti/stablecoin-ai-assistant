"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Menu, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MobileHeaderProps {
  title?: string;
  showSearch?: boolean;
  showAddRule?: boolean;
  showBack?: boolean;
  showMenu?: boolean;
  onSearch?: () => void;
  onBack?: () => void;
  onMenuToggle?: () => void;
  className?: string;
}

export function MobileHeader({
  title = "Ferrow",
  showSearch = false,
  showAddRule = true,
  showBack = false,
  showMenu = false,
  onSearch,
  onBack,
  onMenuToggle,
  className
}: MobileHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b transition-all duration-200 sm:hidden",
      isScrolled ? "border-gray-200 shadow-sm" : "border-transparent",
      className
    )}>
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left side: Back button or Menu + Title */}
        <div className="flex items-center space-x-3 flex-1">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={onBack}
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          
          {showMenu && (
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={onMenuToggle}
              aria-label="Open menu"
              data-testid="mobile-menu-button"
            >
              <Menu className="w-4 h-4" />
            </Button>
          )}
          
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h1>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center space-x-2">
          {showSearch && (
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={onSearch}
              aria-label="Search"
              data-testid="search-button"
            >
              <Search className="w-4 h-4" />
            </Button>
          )}
          
          {showAddRule && (
            <Button
              asChild
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm hover:shadow-md transition-all rounded-xl"
              aria-label="Create new rule"
            >
              <Link href="/rules/new">
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden xs:inline">Rule</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}