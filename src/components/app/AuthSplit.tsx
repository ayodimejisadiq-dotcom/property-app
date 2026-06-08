import * as React from "react";
import {
  CheckCircle2,
  Database,
  Sparkles,
  Star,
} from "lucide-react";
import { Logo } from "./Logo";
import { Blob, GridPattern } from "./Decor";

interface AuthSplitProps {
  variant: "login" | "signup";
  children: React.ReactNode;
}

export function AuthSplit({ variant, children }: AuthSplitProps) {
  const isLogin = variant === "login";
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Brand panel — hidden on mobile, full on desktop */}
      <aside
        className="relative hidden md:flex md:w-[44%] lg:w-1/2 flex-col text-white p-10 lg:p-14 overflow-hidden"
        style={{ background: "var(--color-primary)" }}
      >
        <Blob
          className="-top-24 -left-24 h-72 w-72 opacity-25"
          color="white"
        />
        <Blob
          className="-bottom-24 -right-24 h-80 w-80 opacity-20"
          color="var(--color-accent-light)"
        />
        <GridPattern className="text-white/10" opacity={1} density={28} />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-lg bg-white text-[var(--color-primary)] flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[60%] w-[60%]"
              >
                <circle cx="10" cy="10" r="6" />
                <line x1="14.5" y1="14.5" x2="20" y2="20" />
              </svg>
            </span>
            <span className="font-semibold text-lg lowercase tracking-tight">
              capora
            </span>
          </div>

          <div className="mt-12 lg:mt-20 max-w-md">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/15 mb-5">
              <Sparkles className="h-3 w-3" />
              {isLogin ? "Welcome back" : "Get started"}
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
              {isLogin
                ? "Score your next deal in under a minute."
                : "Score property deals in seconds."}
            </h2>
            <p className="mt-4 text-white/85 text-base leading-relaxed">
              {isLogin
                ? "Pick up where you left off. Paste a Rightmove link, get a 0–100 score across the seven factors that matter."
                : "A 0–100 score and plain-English report on every UK BTL deal. Built for landlords, not algorithms."}
            </p>
          </div>

          <ul className="mt-10 space-y-3 text-sm text-white/90 max-w-md">
            <Bullet icon={CheckCircle2}>Seven scoring factors, one composite score</Bullet>
            <Bullet icon={Database}>Real UK data — Land Registry, ONS, council registers</Bullet>
            <Bullet icon={Star}>Plain-English AI report you can take to your broker</Bullet>
          </ul>

          <div className="mt-auto pt-12 hidden lg:block">
            <p className="text-xs text-white/70 italic max-w-sm leading-relaxed">
              &ldquo;Replaced my old spreadsheet on day one. The score band is a
              fast filter; the report is what I send to my partner.&rdquo;
              <br />
              <span className="not-italic mt-2 inline-block opacity-80">
                — early-access landlord, Manchester
              </span>
            </p>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex-1 flex items-center justify-center bg-fill px-4 py-10 md:py-12 relative">
        {/* Show the logo on mobile only — desktop has it in the brand panel */}
        <div className="md:hidden absolute top-6 left-1/2 -translate-x-1/2">
          <Logo size="md" />
        </div>
        <div className="w-full max-w-md mt-10 md:mt-0">{children}</div>
      </main>
    </div>
  );
}

function Bullet({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 mt-0.5 shrink-0 opacity-90" />
      <span>{children}</span>
    </li>
  );
}
