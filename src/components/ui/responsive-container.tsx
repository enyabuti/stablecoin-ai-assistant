"use client";

import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "sm" | "md" | "lg";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md", 
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full"
};

const paddingClasses = {
  sm: "px-4 py-2",
  md: "px-6 py-4", 
  lg: "px-8 py-6"
};

export function ResponsiveContainer({ 
  children, 
  className, 
  maxWidth = "lg",
  padding = "md"
}: ResponsiveContainerProps) {
  return (
    <div className={cn(
      "mx-auto w-full",
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    base?: number;
    sm?: number; 
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "sm" | "md" | "lg";
}

const gapClasses = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6"
};

export function ResponsiveGrid({ 
  children, 
  className,
  cols = { base: 1, sm: 2, md: 3, lg: 4 },
  gap = "md"
}: ResponsiveGridProps) {
  const gridClasses = [
    cols.base && `grid-cols-${cols.base}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`
  ].filter(Boolean).join(" ");

  return (
    <div className={cn(
      "grid",
      gridClasses,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

interface BreakpointProps {
  children: React.ReactNode;
  show?: "sm" | "md" | "lg" | "xl";
  hide?: "sm" | "md" | "lg" | "xl";
}

export function Breakpoint({ children, show, hide }: BreakpointProps) {
  let classes = "";
  
  if (show) {
    classes = `hidden ${show}:block`;
  }
  
  if (hide) {
    classes = `${hide}:hidden`;
  }

  return (
    <div className={classes}>
      {children}
    </div>
  );
}