"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Status =
  | { kind: "idle" }
  | { kind: "applying"; code: string }
  | { kind: "success" }
  | { kind: "error"; message: string };

/**
 * Listens for a pendingReferral entry in sessionStorage (set on /signup
 * with ?ref=CODE), tries to apply it once the user is authed, and shows
 * a small banner while/after it runs. Removes the entry on first attempt
 * regardless of outcome so we don't spam the API.
 */
export function PendingReferralApplier({
  alreadyReferred,
}: {
  alreadyReferred: boolean;
}) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    if (alreadyReferred) {
      try {
        sessionStorage.removeItem("pendingReferral");
      } catch {
        /* noop */
      }
      return;
    }
    let pending: string | null = null;
    try {
      pending = sessionStorage.getItem("pendingReferral");
    } catch {
      return;
    }
    if (!pending) return;
    setStatus({ kind: "applying", code: pending });
    try {
      sessionStorage.removeItem("pendingReferral");
    } catch {
      /* noop */
    }
    fetch("/api/referral/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: pending }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          setStatus({
            kind: "error",
            message: j.error ?? "Couldn't apply that referral code.",
          });
        } else {
          setStatus({ kind: "success" });
        }
      })
      .catch(() =>
        setStatus({ kind: "error", message: "Network error applying code" }),
      );
  }, [alreadyReferred]);

  if (status.kind === "idle" || status.kind === "applying") return null;

  return (
    <div className="border-b border-line">
      <div
        className={cn(
          "max-w-6xl mx-auto px-4 py-2 text-sm flex items-center justify-between gap-3",
          status.kind === "success" ? "text-ink" : "text-ink",
        )}
      >
        <span
          className={cn(
            "inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full",
            status.kind === "success"
              ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
              : "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
          )}
        >
          {status.kind === "success"
            ? "Referral applied — you're credited to whoever invited you."
            : status.message}
        </span>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="text-xs text-muted hover:text-ink"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
