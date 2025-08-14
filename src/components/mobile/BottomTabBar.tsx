"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Cog, CreditCard, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    href: "/rules",
    label: "Rules",
    icon: Activity,
  },
  {
    href: "/transfers",
    label: "Transfers",
    icon: CreditCard,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Cog,
  },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-lg"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center px-2 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-gray-500 hover:text-gray-700"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-pill transition-all duration-200 transform",
                isActive && "bg-gradient-to-r from-primary to-accent text-white shadow-md scale-110"
              )}>
                <tab.icon className="w-4 h-4" />
              </div>
              <span className={cn(
                "mt-1 transition-colors",
                isActive && "font-semibold"
              )}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}