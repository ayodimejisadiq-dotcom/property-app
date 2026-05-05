import * as React from "react";
import { cn } from "@/lib/utils";

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={cn(
      "h-4 w-4 rounded border-line text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]",
      className,
    )}
    {...props}
  />
));
Checkbox.displayName = "Checkbox";
