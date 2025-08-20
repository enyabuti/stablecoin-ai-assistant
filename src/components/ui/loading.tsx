"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div 
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
        sizeClasses[size],
        className
      )}
      data-testid="loading-spinner"
      aria-label="Loading"
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function LoadingState({ message = "Loading...", size = "md", className }: LoadingStateProps) {
  return (
    <div 
      className={cn("flex items-center justify-center gap-3 p-8", className)}
      data-testid="loading"
    >
      <LoadingSpinner size={size} />
      <span className="text-gray-600 font-medium">{message}</span>
    </div>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

function LoadingOverlay({ isVisible, message = "Loading...", className }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center",
        className
      )}
      data-testid="loading-overlay"
    >
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <LoadingState message={message} />
      </div>
    </div>
  );
}

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

function LoadingButton({ isLoading, children, loadingText = "Loading...", className }: LoadingButtonProps) {
  return (
    <button 
      disabled={isLoading}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200",
        className
      )}
    >
      {isLoading && <LoadingSpinner size="sm" className="border-white border-t-blue-200" />}
      {isLoading ? loadingText : children}
    </button>
  );
}

interface LoadingDotsProps {
  className?: string;
}

function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn("flex space-x-1", className)} data-testid="loading-dots">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
}

interface LoadingBarProps {
  progress?: number;
  isIndeterminate?: boolean;
  className?: string;
}

function LoadingBar({ progress, isIndeterminate = false, className }: LoadingBarProps) {
  return (
    <div 
      className={cn("w-full bg-gray-200 rounded-full h-2", className)}
      data-testid="loading-bar"
    >
      <div
        className={cn(
          "h-2 bg-blue-600 rounded-full transition-all duration-300",
          isIndeterminate && "animate-pulse"
        )}
        style={{
          width: isIndeterminate ? "100%" : `${progress}%`
        }}
      />
    </div>
  );
}

export {
  LoadingSpinner,
  LoadingState, 
  LoadingOverlay,
  LoadingButton,
  LoadingDots,
  LoadingBar
};