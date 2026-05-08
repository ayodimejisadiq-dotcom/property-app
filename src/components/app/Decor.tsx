import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Subtle dot grid background. Use behind hero / banners / cards.
 * Renders an inline SVG so it stays crisp and doesn't add a network request.
 */
export function GridPattern({
  className,
  density = 24,
  opacity = 0.4,
}: {
  className?: string;
  density?: number;
  opacity?: number;
}) {
  const id = React.useId();
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      width="100%"
      height="100%"
    >
      <defs>
        <pattern
          id={id}
          x="0"
          y="0"
          width={density}
          height={density}
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="1" fill="currentColor" opacity={opacity} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/**
 * Diagonal hair-line grid. More structural, used behind data sections.
 */
export function LinedGrid({
  className,
  size = 32,
  opacity = 0.5,
}: {
  className?: string;
  size?: number;
  opacity?: number;
}) {
  const id = React.useId();
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    >
      <defs>
        <pattern
          id={id}
          x="0"
          y="0"
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${size} 0 L 0 0 0 ${size}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity={opacity}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/**
 * Soft blurred blob — adds depth to hero panels.
 */
export function Blob({
  className,
  color = "var(--color-primary)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute rounded-full blur-3xl opacity-30",
        className,
      )}
      style={{ background: color }}
    />
  );
}
