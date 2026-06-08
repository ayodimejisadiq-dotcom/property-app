import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
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
}: LogoProps) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0",
          s.box,
        )}
        aria-hidden
      >
        {/* magnifying lens — abstract, leans on indigo background */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[60%] w-[60%]"
        >
          <circle cx="10" cy="10" r="6" />
          <line x1="14.5" y1="14.5" x2="20" y2="20" />
        </svg>
      </span>
      {showWordmark && (
        <span
          className={cn(
            "font-semibold tracking-tight text-ink lowercase",
            s.text,
          )}
        >
          capora
        </span>
      )}
    </span>
  );
}
