"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Logo } from "@/components/app/Logo";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-fill px-4 py-10 text-center">
      <Logo size="md" className="mb-8" />
      <div className="h-14 w-14 rounded-full bg-[var(--color-warning)]/15 text-[var(--color-warning)] flex items-center justify-center mb-5">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h1 className="text-3xl font-bold text-ink">Something went sideways</h1>
      <p className="text-muted mt-2 max-w-sm">
        We hit an unexpected error. Try again — if it keeps happening, ping us
        with the reference below.
      </p>
      {error.digest && (
        <p className="text-xs text-faint mt-4 font-mono">ref: {error.digest}</p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/dashboard">
          <Button variant="outline">Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
