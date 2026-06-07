import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-11 w-full bg-[var(--color-paper)] border border-[var(--color-line)] px-3 py-2 text-sm text-[var(--color-ink-deep)] placeholder:text-[var(--color-faint)] focus-visible:outline-none focus-visible:border-[var(--color-ink-deep)] disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
