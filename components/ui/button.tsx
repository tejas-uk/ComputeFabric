/**
 * @description
 * A reusable Button component built with Tailwind CSS, following Shadcn UI patterns.
 * This component supports various variants, sizes, and can be rendered as different elements.
 *
 * Key features:
 * - Multiple variants: default, primary, secondary, outline, destructive
 * - Different sizes: default, sm, lg
 * - Can be rendered as any element via the `asChild` prop
 * - Fully typed with TypeScript
 * - Accessible with proper ARIA attributes
 *
 * @dependencies
 * - React: For component rendering
 * - tailwindcss: For styling
 * - lucide-react: For optional icons (not used directly in this component)
 *
 * @notes
 * - This follows the Shadcn UI component pattern
 * - Consider adding more variants or sizes as needed for the ComputeFabric UI
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Define types for button props, extending standard button attributes
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "outline" | "destructive";
  size?: "default" | "sm" | "lg";
  isLoading?: boolean;
}

/**
 * Button component with variants and sizes
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Combine variant and size classes with any additional className props
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base button styles
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          "disabled:pointer-events-none disabled:opacity-50",

          // Variant styles
          variant === "default" && "bg-gray-100 text-gray-900 hover:bg-gray-200",
          variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
          variant === "secondary" && "bg-gray-700 text-white hover:bg-gray-800",
          variant === "outline" && "border border-gray-300 bg-transparent hover:bg-gray-50",
          variant === "destructive" && "bg-red-600 text-white hover:bg-red-700",

          // Size styles
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-8 px-3 text-sm",
          size === "lg" && "h-12 px-6 text-lg",

          // Additional classes passed to the component
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
        ) : null}
        {children}
      </button>
    );
  }
);

// Set display name for better debugging
Button.displayName = "Button";

export { Button };