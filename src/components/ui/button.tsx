import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-105 active:scale-95 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2",
  {
    variants: {
      variant: {
        default: "bg-hero-gradient text-white shadow-glass hover:shadow-glass-hover border-0",
        gradient: "bg-hero-gradient text-white shadow-glass hover:shadow-glass-hover border-0",
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-glass hover:shadow-glass-hover hover:from-red-600 hover:to-red-700",
        outline: "border-2 border-gray-300 bg-transparent text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 focus:ring-gray-300",
        secondary: "bg-white/20 backdrop-blur-sm text-slate-700 shadow-glass hover:bg-white/30 hover:text-slate-800 border border-white/20",
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-300",
        link: "text-brand underline-offset-4 hover:underline transform-none hover:scale-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }