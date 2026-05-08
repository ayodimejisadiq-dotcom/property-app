import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromoCardProps {
  eyebrow?: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  tone?: "primary" | "accent";
  className?: string;
}

/**
 * Reusable colour-rich promo card for the dashboard / inline placements.
 */
export function PromoCard({
  eyebrow,
  title,
  body,
  ctaLabel,
  ctaHref,
  tone = "primary",
  className,
}: PromoCardProps) {
  const bg =
    tone === "primary"
      ? "var(--gradient-primary)"
      : "linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%)";
  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden text-white p-6 md:p-8 shadow-md",
        className,
      )}
      style={{ background: bg }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/15 blur-2xl"
      />
      <div className="relative">
        {eyebrow && (
          <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 mb-3">
            {eyebrow}
          </span>
        )}
        <h2 className="text-xl md:text-2xl font-bold tracking-tight max-w-md">
          {title}
        </h2>
        <p className="mt-2 text-white/80 text-sm max-w-lg leading-relaxed">
          {body}
        </p>
        <Link
          href={ctaHref}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold bg-white text-ink rounded-md px-4 py-2 hover:bg-white/95 shadow-sm"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
