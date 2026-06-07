import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 text-[11px] tracking-[0.14em] uppercase font-semibold transition-colors disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-paper)]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-ink-deep)] text-[var(--color-paper)] hover:bg-black border border-[var(--color-ink-deep)]",
        outline:
          "bg-transparent text-[var(--color-ink-deep)] border border-[var(--color-ink-deep)] hover:bg-[var(--color-ink-deep)] hover:text-[var(--color-paper)]",
        accent:
          "bg-[var(--color-accent)] text-white border border-[var(--color-accent)] hover:bg-[var(--color-accent-dark)]",
        ghost:
          "bg-transparent text-[var(--color-ink-deep)] hover:underline underline-offset-4",
        danger:
          "bg-[var(--color-danger)] text-white border border-[var(--color-danger)] hover:opacity-90",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-5",
        lg: "h-12 px-7",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
