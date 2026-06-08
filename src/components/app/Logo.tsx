import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
  /**
   * Symbol variant. "peak" = clean chevron with horizontal ground line.
   * "arch" = softer rounded apex (alternative).
   */
  variant?: "peak" | "arch";
}

const SIZES = {
  sm: { box: "h-7 w-7", text: "text-base" },
  md: { box: "h-9 w-9", text: "text-lg" },
  lg: { box: "h-12 w-12", text: "text-2xl" },
};

export function Logo({
  size = "md",
  showWordmark = true,
  className,
  variant = "peak",
}: LogoProps) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex items-center justify-center shrink-0 rounded-md",
          s.box,
        )}
        style={{ background: "var(--color-primary)", color: "white" }}
        aria-hidden
      >
        {variant === "peak" ? <Peak /> : <Arch />}
      </span>
      {showWordmark && (
        <span
          className={cn(
            "font-semibold tracking-tight text-ink lowercase leading-none",
            s.text,
          )}
          style={{ letterSpacing: "-0.02em" }}
        >
          capora
        </span>
      )}
    </span>
  );
}

/**
 * Clean chevron + ground line. Reads as a roofline / house silhouette
 * without being a literal cartoon house. Works down to 16px.
 */
function Peak() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[62%] w-[62%]"
    >
      <path d="M4 14 L12 5 L20 14" />
      <path d="M6 18 L18 18" />
    </svg>
  );
}

/**
 * Alternative: softer rounded apex. Same proportions, less angular.
 */
function Arch() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[62%] w-[62%]"
    >
      <path d="M4 14 Q12 4 20 14" />
      <path d="M6 18 L18 18" />
    </svg>
  );
}
