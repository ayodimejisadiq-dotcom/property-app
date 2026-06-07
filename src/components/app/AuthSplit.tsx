import * as React from "react";
import { Logo } from "./Logo";

interface AuthSplitProps {
  variant: "login" | "signup";
  children: React.ReactNode;
}

export function AuthSplit({ variant, children }: AuthSplitProps) {
  const isLogin = variant === "login";
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--color-paper)]">
      <aside className="relative hidden md:flex md:w-[44%] lg:w-1/2 flex-col p-10 lg:p-14 bg-[var(--color-paper-deep)] border-r border-[var(--color-line-strong)]">
        <Logo size="md" />

        <div className="mt-auto max-w-md">
          <p className="eyebrow">
            {isLogin ? "Welcome back" : "Get started · free during early access"}
          </p>
          <h2
            className="display mt-5 leading-[1.05]"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "var(--color-ink-deep)",
            }}
          >
            {isLogin ? (
              <>
                Score your next deal in
                <br />
                under a minute.
              </>
            ) : (
              <>
                Score property deals
                <br />
                in seconds.
              </>
            )}
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-[var(--color-body)] max-w-md">
            {isLogin
              ? "Pick up where you left off. Paste a Rightmove link, get a 0–100 score across the seven factors that matter."
              : "A 0–100 score and plain-English report on every UK BTL deal. Built for landlords, not algorithms."}
          </p>

          <ul className="mt-10 space-y-3 text-sm text-[var(--color-body)]">
            <li className="grid grid-cols-[auto_1fr] gap-x-3">
              <span style={{ color: "var(--color-accent)" }}>—</span>
              <span>Seven scoring factors, one composite score.</span>
            </li>
            <li className="grid grid-cols-[auto_1fr] gap-x-3">
              <span style={{ color: "var(--color-accent)" }}>—</span>
              <span>Real UK data: Land Registry, ONS, council registers.</span>
            </li>
            <li className="grid grid-cols-[auto_1fr] gap-x-3">
              <span style={{ color: "var(--color-accent)" }}>—</span>
              <span>
                Plain-English analyst&apos;s note you can take to your broker.
              </span>
            </li>
          </ul>

          <p className="hidden lg:block mt-14 text-xs italic text-[var(--color-muted)] max-w-sm leading-relaxed border-t border-[var(--color-line)] pt-6">
            &ldquo;Replaced my old spreadsheet on day one. The score band is a
            fast filter; the analyst&apos;s note is what I send to my
            partner.&rdquo;
            <br />
            <span className="not-italic mt-2 inline-block">
              — early-access landlord, Manchester
            </span>
          </p>
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center bg-[var(--color-paper)] px-5 sm:px-8 py-10 md:py-12 relative">
        <div className="md:hidden absolute top-6 left-1/2 -translate-x-1/2">
          <Logo size="md" />
        </div>
        <div className="w-full max-w-md mt-10 md:mt-0">{children}</div>
      </main>
    </div>
  );
}
