"use client";

import * as React from "react";
import Link from "next/link";
import { X } from "lucide-react";

interface AnnouncementBarProps {
  storageKey?: string;
  message: React.ReactNode;
  href?: string;
  ctaLabel?: string;
}

export function AnnouncementBar({
  storageKey = "capora-announcement-v2",
  message,
  href,
  ctaLabel = "Learn more",
}: AnnouncementBarProps) {
  const [hidden, setHidden] = React.useState(true);

  React.useEffect(() => {
    try {
      const dismissed = localStorage.getItem(storageKey);
      setHidden(dismissed === "1");
    } catch {
      setHidden(false);
    }
  }, [storageKey]);

  function dismiss() {
    setHidden(true);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* noop */
    }
  }

  if (hidden) return null;

  return (
    <div className="border-b border-[var(--color-line-strong)] bg-[var(--color-paper)] text-[var(--color-ink-deep)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-2 flex items-center gap-3 text-[11px] tracking-[0.12em] uppercase">
        <span
          className="inline-block w-1.5 h-1.5"
          style={{ background: "var(--color-accent)" }}
          aria-hidden
        />
        <p className="flex-1 leading-snug">{message}</p>
        {href && (
          <Link
            href={href}
            className="hidden sm:inline-flex font-semibold underline-offset-4 hover:underline whitespace-nowrap"
          >
            {ctaLabel} →
          </Link>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="text-[var(--color-muted)] hover:text-[var(--color-ink-deep)] p-1 -mr-1"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
