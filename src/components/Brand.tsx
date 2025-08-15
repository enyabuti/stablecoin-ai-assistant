// components/Brand.tsx
import Image from 'next/image';
import { APP_NAME, APP_TAGLINE } from "@/lib/appConfig";

interface BrandProps {
  subtitle?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon" | "text";
}

export function Brand({ subtitle = false, size = "md", variant = "full" }: BrandProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  if (variant === "icon") {
    return (
      <Image 
        src="/brand/ferrow-icon.svg" 
        alt={APP_NAME} 
        width={size === 'sm' ? 16 : size === 'md' ? 24 : 32}
        height={size === 'sm' ? 16 : size === 'md' ? 24 : 32}
        className={sizeClasses[size]} 
      />
    );
  }

  if (variant === "text") {
    return (
      <div className="flex flex-col leading-tight">
        <span className={`font-semibold ${textSizeClasses[size]}`}>{APP_NAME}</span>
        {subtitle && <span className="text-xs text-muted-foreground">{APP_TAGLINE}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Image 
        src="/brand/ferrow-icon.svg" 
        alt={APP_NAME} 
        width={size === 'sm' ? 16 : size === 'md' ? 24 : 32}
        height={size === 'sm' ? 16 : size === 'md' ? 24 : 32}
        className={sizeClasses[size]} 
      />
      <div className="flex flex-col leading-tight">
        <span className={`font-semibold ${textSizeClasses[size]}`}>{APP_NAME}</span>
        {subtitle && <span className="text-xs text-muted-foreground">{APP_TAGLINE}</span>}
      </div>
    </div>
  );
}