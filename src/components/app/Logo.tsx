import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
  /** "arc" (default) | "peak" | "tile" — see file for variants. */
  variant?: "arc" | "peak" | "tile";
  /** Override the symbol colour. Defaults to --color-primary. */
  colour?: string;
}

const SIZES = {
  sm: { mark: 22, text: "text-base", gap: "gap-2" },
  md: { mark: 28, text: "text-lg", gap: "gap-2.5" },
  lg: { mark: 38, text: "text-2xl", gap: "gap-3" },
};

export function Logo({
  size = "md",
  showWordmark = true,
  className,
  variant = "arc",
  colour,
}: LogoProps) {
  const s = SIZES[size];
  const c = colour ?? "var(--color-primary)";

  return (
    <span className={cn("inline-flex items-center", s.gap, className)}>
      <span
        aria-hidden
        className="shrink-0 inline-flex items-center justify-center"
        style={{ width: s.mark, height: s.mark, color: c }}
      >
        {variant === "tile" ? (
          <TileMark />
        ) : variant === "peak" ? (
          <PeakMark />
        ) : (
          <ArcMark />
        )}
      </span>
      {showWordmark && (
        <span
          className={cn(
            "font-semibold tracking-tight text-ink lowercase leading-none",
            s.text,
          )}
          style={{ letterSpacing: "-0.025em" }}
        >
          capora
        </span>
      )}
    </span>
  );
}

/**
 * Primary mark: a confident open-C arc. Reads as the letter C and as
 * the score gauge that anchors every deal page. No container — the
 * mark lives on whatever surface it sits on. Scales cleanly to 16px.
 */
function ArcMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path
        d="M 19 7.5 A 9 9 0 1 0 19 16.5"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Roofline chevron + baseline (the previous mark, kept as a swap). */
function PeakMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M4 14 L12 5 L20 14" />
      <path d="M6 18 L18 18" />
    </svg>
  );
}

/** Old tile-style monogram, here only for legacy use. */
function TileMark() {
  return (
    <span
      className="w-full h-full flex items-center justify-center rounded-md text-white"
      style={{ background: "currentColor" }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-[62%] h-[62%]">
        <path
          d="M 19 7.5 A 9 9 0 1 0 19 16.5"
          stroke="white"
          strokeWidth="3.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
