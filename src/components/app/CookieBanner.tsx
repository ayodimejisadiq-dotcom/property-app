"use client";

import * as React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "capora-cookies-v1";

/**
 * Strictly-necessary cookies notice. We don't use advertising or analytics
 * cookies, so technically consent isn't required under UK GDPR — this is a
 * transparency notice rather than a consent prompt.
 *
 * Hidden once dismissed; one-time per browser via localStorage.
 */
export function CookieBanner() {
  const [hidden, setHidden] = React.useState(true);

  React.useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      setHidden(seen === "1");
    } catch {
      setHidden(false);
    }
  }, []);

  function dismiss() {
    setHidden(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* noop */
    }
  }

  if (hidden) return null;

  return (
    <div
      role="region"
      aria-label="Cookies notice"
      className={cn(
        "fixed bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md z-40",
        "rounded-xl border border-line bg-white shadow-lg p-4 sm:p-5",
        "animate-in slide-in-from-bottom-4",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink">We use cookies</p>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Only strictly-necessary cookies — they keep you signed in and help
            us enforce rate limits. No tracking, no advertising. See our{" "}
            <Link
              href="/privacy"
              className="text-[var(--color-primary)] hover:underline"
            >
              Privacy Policy
            </Link>{" "}
            for details.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={dismiss}
              className="text-xs font-semibold px-3 py-1.5 rounded-md bg-ink text-white hover:opacity-90"
            >
              Got it
            </button>
            <Link
              href="/privacy"
              className="text-xs font-medium px-3 py-1.5 rounded-md border border-line text-body hover:bg-fill"
            >
              Learn more
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="text-faint hover:text-ink p-1 -m-1 rounded shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
