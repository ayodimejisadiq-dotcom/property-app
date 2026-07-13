"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Logo } from "@/components/app/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinWaitlist } from "@/app/waitlist-action";

export function WaitlistLanding() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [alreadyOn, setAlreadyOn] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setStatus("loading");
    setMessage("");
    const res = await joinWaitlist(fd);
    if (res.ok) {
      setStatus("done");
      setAlreadyOn(!!res.alreadyOn);
    } else {
      setStatus("error");
      setMessage(res.error ?? "Something went wrong.");
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-line">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          <Link
            href="/login"
            className="text-sm text-muted hover:text-ink"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main
        className="flex-1 flex items-center"
        style={{ background: "var(--color-primary-light)" }}
      >
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-16 md:py-24 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-white shadow-sm border border-line text-[var(--color-primary)]">
            <Sparkles className="h-3 w-3" />
            Launching soon · early access
          </span>

          <h1 className="mt-5 text-[2.5rem] sm:text-5xl md:text-6xl font-bold text-ink tracking-tight leading-[1.05]">
            Is this property
            <br />
            <span style={{ color: "var(--color-primary)" }}>a good buy?</span>
          </h1>

          <p className="mt-5 text-lg text-body leading-relaxed max-w-xl mx-auto">
            Capora gives you a clear, honest score on any UK property in under
            a minute — plain English, real data, no fluff. Whether it&apos;s
            your first home or your fifteenth rental.
          </p>

          {status === "done" ? (
            <div className="mt-10 max-w-md mx-auto rounded-xl border border-line bg-white shadow-sm p-8">
              <div className="h-12 w-12 rounded-full bg-[var(--color-success)]/15 text-[var(--color-success)] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-ink">
                {alreadyOn
                  ? "You're already on the list"
                  : "You're on the list"}
              </h2>
              <p className="text-muted mt-2">
                We&apos;ll email you the moment Capora goes live.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-10 max-w-md mx-auto rounded-xl border border-line bg-white shadow-sm p-6 text-left space-y-3"
            >
              <div>
                <label
                  htmlFor="wl-name"
                  className="block text-xs font-medium text-muted mb-1"
                >
                  Your name
                </label>
                <Input
                  id="wl-name"
                  name="name"
                  placeholder="Jamie Smith"
                  autoComplete="name"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="wl-email"
                  className="block text-xs font-medium text-muted mb-1"
                >
                  Email
                </label>
                <Input
                  id="wl-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              <input type="hidden" name="source" value="landing" />
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Joining…" : "Join the waitlist"}
                {status !== "loading" && <ArrowRight className="h-4 w-4" />}
              </Button>
              {status === "error" && (
                <p className="text-sm text-[var(--color-danger)] text-center">
                  {message}
                </p>
              )}
              <p className="text-xs text-muted text-center pt-1">
                No spam. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </main>

      <footer className="border-t border-line bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-sm text-muted">© 2026 Capora</p>
          <div className="flex gap-4 text-sm text-muted">
            <Link href="/terms" className="hover:text-ink">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
