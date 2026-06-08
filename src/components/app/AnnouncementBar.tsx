"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";

interface AnnouncementBarProps {
  storageKey?: string;
  message: React.ReactNode;
  href?: string;
  ctaLabel?: string;
}

export function AnnouncementBar({
  storageKey = "capora-announcement-v1",
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
    <div className="relative bg-[var(--color-primary)] text-white">
            <div className="relative max-w-6xl mx-auto px-5 sm:px-6 py-2 flex items-center gap-3 text-sm">
        <Sparkles className="h-4 w-4 shrink-0" />
        <p className="flex-1 leading-snug">{message}</p>
        {href && (
          <Link
            href={href}
            className="hidden sm:inline-flex text-xs font-medium underline-offset-2 hover:underline whitespace-nowrap"
          >
            {ctaLabel} →
          </Link>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="text-white/70 hover:text-white p-1 -mr-1"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
