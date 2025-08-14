"use client";

import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MobileHeaderProps {
  title?: string;
  showSearch?: boolean;
  showAddRule?: boolean;
  onSearch?: () => void;
  className?: string;
}

export function MobileHeader({
  title = "Ferrow",
  showSearch = false,
  showAddRule = true,
  onSearch,
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
        {/* Left side: Title */}
        <div className="flex items-center">
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
            >
              <Search className="w-4 h-4" />
              <span className="sr-only">Search</span>
            </Button>
          )}
          
          {showAddRule && (
            <Button
              asChild
              size="sm"
              className="bg-gradient-to-r from-primary to-accent text-white shadow-sm hover:shadow-md transition-all"
            >
              <Link href="/rules/new">
                <Plus className="w-4 h-4 mr-1" />
                Rule
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}