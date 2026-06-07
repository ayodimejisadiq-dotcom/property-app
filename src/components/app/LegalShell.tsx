import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/app/Logo";

interface LegalShellProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

const INK = "var(--color-ink-deep)";

export function LegalShell({ title, lastUpdated, children }: LegalShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink-deep)]">
      <header className="border-b border-[var(--color-line)]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo size="sm" />
          </Link>
          <Link
            href="/"
            className="text-[11px] tracking-[0.14em] uppercase font-semibold hover:underline underline-offset-4"
            style={{ color: INK }}
          >
            ← Home
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-14 md:py-20">
        <p className="eyebrow">Legal</p>
        <h1
          className="display mt-5 leading-[1.05]"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: INK }}
        >
          {title}
        </h1>
        <p className="mt-4 text-xs tracking-[0.14em] uppercase text-[var(--color-muted)]">
          Last updated · {lastUpdated}
        </p>

        <div className="mt-6 border border-[var(--color-warning)] bg-[var(--color-warning-light)] px-4 py-3 text-sm text-[var(--color-ink-deep)]">
          <span className="font-semibold">Draft.</span> This document is a
          working draft and not legal advice. It will be reviewed by a UK
          solicitor before launch — terms may change.
        </div>

        <article className="mt-10 space-y-8 text-[var(--color-body)] leading-relaxed text-sm md:text-base">
          {children}
        </article>

        <p className="text-xs text-[var(--color-muted)] mt-14 border-t border-[var(--color-line)] pt-6">
          Questions? Email{" "}
          <a
            href="mailto:hello@capora.co.uk"
            className="underline underline-offset-4"
            style={{ color: "var(--color-accent)" }}
          >
            hello@capora.co.uk
          </a>
          .
        </p>
      </main>
    </div>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id}>
      <h2
        className="display mt-12 mb-4 leading-snug"
        style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)", color: INK }}
      >
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
