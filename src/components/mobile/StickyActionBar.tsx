"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StickyActionBarProps {
  fee?: string;
  eta?: string;
  onConfirm?: () => void;
  confirmText?: string;
  className?: string;
}

export function StickyActionBar({
  fee,
  eta,
  onConfirm,
  confirmText = "Hold to confirm",
  className
}: StickyActionBarProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const holdTimeoutRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  const startHold = useCallback(() => {
    setIsHolding(true);
    setProgress(0);

    // Update progress every 30ms for smooth animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / 30); // 30 updates over 900ms
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 30);

    progressIntervalRef.current = progressInterval;

    // Complete action after 900ms
    const holdTimeout = setTimeout(() => {
      setIsHolding(false);
      setProgress(0);
      onConfirm?.();
      clearInterval(progressInterval);
    }, 900);

    holdTimeoutRef.current = holdTimeout;
  }, [onConfirm]);

  const stopHold = useCallback(() => {
    setIsHolding(false);
    setProgress(0);
    
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
    if (progressIntervalRef.current) {
      clearTimeout(progressIntervalRef.current);
    }
  }, []);

  return (
    <div className={cn(
      "fixed left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-gray-200 px-4 py-3 sm:hidden",
      className
    )} style={{ bottom: "calc(56px + env(safe-area-inset-bottom))" }}>
      <div className="flex items-center justify-between">
        {/* Left side: Fee and ETA */}
        <div className="flex flex-col space-y-1">
          {fee && (
            <div className="text-xs text-gray-600">
              Fee: <span className="font-medium text-gray-900">{fee}</span>
            </div>
          )}
          {eta && (
            <div className="text-xs text-gray-600">
              ETA: <span className="font-medium text-gray-900">{eta}</span>
            </div>
          )}
        </div>

        {/* Right side: Hold to confirm button */}
        <div className="relative">
          <Button
            className={cn(
              "relative overflow-hidden px-6 py-3 rounded-control font-medium transition-all",
              isHolding 
                ? "bg-primary text-white scale-105" 
                : "bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg"
            )}
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={startHold}
            onTouchEnd={stopHold}
            onClick={(e) => {
              // Fallback for quick taps - show confirm dialog
              if (!isHolding && progress < 100) {
                e.preventDefault();
                if (window.confirm("Are you sure you want to confirm this action?")) {
                  onConfirm?.();
                }
              }
            }}
          >
            {/* Progress fill */}
            <div 
              className={cn(
                "absolute inset-0 bg-white/20 transition-all duration-75",
                isHolding ? "opacity-100" : "opacity-0"
              )}
              style={{
                background: `conic-gradient(from 0deg, rgba(255,255,255,0.3) ${progress * 3.6}deg, transparent ${progress * 3.6}deg)`,
                clipPath: "circle(50% at center)"
              }}
            />
            
            <span className="relative z-10">
              {isHolding ? `${Math.round(progress)}%` : confirmText}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}