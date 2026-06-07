import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Editorial cards: no shadows, hairline border, paper-coloured fill,
 * sharp corners. Drop-in replacement for the old rounded shadowed card.
 */
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border border-[var(--color-line)] bg-[var(--color-card)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pb-3", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "font-serif text-xl text-[var(--color-ink-deep)] tracking-tight",
        className,
      )}
      style={{ fontFamily: "var(--font-serif)" }}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
