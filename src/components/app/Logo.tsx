import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
}

const SIZES = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
};

/**
 * Editorial wordmark — serif, lowercase, single dot accent.
 * Replaces the old indigo-block logo for the redesign.
 */
export function Logo({
  size = "md",
  showWordmark = true,
  className,
}: LogoProps) {
  if (!showWordmark) {
    return (
      <span
        className={cn("inline-block w-2 h-2", className)}
        style={{ background: "var(--color-accent)" }}
        aria-label="Capora"
      />
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 font-serif tracking-tight text-ink",
        SIZES[size],
        className,
      )}
      style={{ fontFamily: "var(--font-serif)" }}
    >
      <span className="lowercase">capora</span>
      <span
        className="inline-block"
        style={{
          width: "0.32em",
          height: "0.32em",
          background: "var(--color-accent)",
          marginBottom: "0.08em",
        }}
        aria-hidden
      />
    </span>
  );
}
