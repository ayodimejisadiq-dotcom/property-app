"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";

// Steps are ordered roughly to match what the backend actually does. Timings
// are cosmetic — we can't stream real progress from the server, so we drip
// them out on a schedule that matches the typical 12–20s analysis wall time.
const STEPS = [
  { label: "Reading the listing", ms: 1200 },
  { label: "Looking up postcode data", ms: 1800 },
  { label: "Fetching rental comparisons", ms: 2400 },
  { label: "Calculating yield & cashflow", ms: 1800 },
  { label: "Checking area growth", ms: 2000 },
  { label: "Running licensing check", ms: 1600 },
  { label: "Writing your plain-English report", ms: 4200 },
];

const TOTAL_MS = STEPS.reduce((a, s) => a + s.ms, 0);

export function AnalysisProgress() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cycle through the step list on its schedule.
    const timers: ReturnType<typeof setTimeout>[] = [];
    let acc = 0;
    for (let i = 0; i < STEPS.length; i++) {
      acc += STEPS[i].ms;
      timers.push(
        setTimeout(() => setActiveIndex(Math.min(i + 1, STEPS.length - 1)), acc),
      );
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    // Ease the bar to 95% over TOTAL_MS. Never reaches 100 here — the parent
    // finishes it when the fetch resolves and the page redirects.
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const target = Math.min(95, (elapsed / TOTAL_MS) * 95);
      setProgress((p) => (p < target ? target : p));
      if (elapsed < TOTAL_MS * 1.2) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-ink/40 backdrop-blur-sm"
      role="dialog"
      aria-live="polite"
      aria-label="Analysis in progress"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-line p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-ink">Scoring your property</p>
            <p className="text-xs text-muted">
              Usually takes 15–25 seconds.
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">
              Progress
            </span>
            <span className="text-sm font-bold text-ink tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-fill overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-200 ease-out"
              style={{
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent, var(--color-primary)) 100%)",
              }}
            />
          </div>
        </div>

        {/* Step list */}
        <ol className="space-y-2.5">
          {STEPS.map((s, i) => {
            const done = i < activeIndex;
            const active = i === activeIndex;
            return (
              <li
                key={s.label}
                className={`flex items-center gap-3 text-sm transition-opacity ${
                  done || active ? "opacity-100" : "opacity-40"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                    done
                      ? "bg-[var(--color-success)] text-white"
                      : active
                        ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                        : "bg-fill text-faint"
                  }`}
                >
                  {done ? (
                    <Check className="h-3 w-3" />
                  ) : active ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </span>
                <span
                  className={
                    done
                      ? "text-body"
                      : active
                        ? "text-ink font-medium"
                        : "text-muted"
                  }
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>

        <p className="mt-6 text-xs text-faint text-center">
          Please keep this tab open.
        </p>
      </div>
    </div>
  );
}
