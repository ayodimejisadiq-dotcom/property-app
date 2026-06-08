import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/app/Logo";

interface LegalShellProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

/**
 * Shared frame for /terms and /privacy. Centered prose, sticky-ish back link,
 * matching header to the rest of the site.
 */
export function LegalShell({ title, lastUpdated, children }: LegalShellProps) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-line">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo size="sm" />
          </Link>
          <Link
            href="/"
            className="text-sm text-muted hover:text-ink inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 sm:px-6 py-10 md:py-16">
        <p className="text-xs uppercase tracking-wider text-muted">Legal</p>
        <h1 className="text-3xl md:text-4xl font-bold text-ink mt-1">{title}</h1>
        <p className="text-sm text-muted mt-2">
          Last updated: <span className="text-ink">{lastUpdated}</span>
        </p>

        <div className="mt-4 rounded-md bg-[var(--color-warning-light)] border border-[var(--color-warning)]/30 px-4 py-3 text-sm text-ink">
          <span className="font-semibold">Draft.</span> This document is a
          working draft and not legal advice. It will be reviewed by a UK
          solicitor before launch — terms may change.
        </div>

        <article className="prose prose-sm md:prose-base mt-8 space-y-6 text-body leading-relaxed">
          {children}
        </article>

        <p className="text-xs text-faint mt-12">
          Questions? Email{" "}
          <a
            href="mailto:hello@capora.co.uk"
            className="text-[var(--color-primary)] hover:underline"
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
      <h2 className="text-lg md:text-xl font-semibold text-ink mt-8 mb-3">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
