"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthSplit } from "@/components/app/AuthSplit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/\d/, "Must include a number"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref")?.toUpperCase() ?? null;
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentAt, setResentAt] = useState<number | null>(null);

  useEffect(() => {
    if (!refCode) return;
    if (!/^[A-Z0-9]{4,12}$/.test(refCode)) return;
    try {
      sessionStorage.setItem("pendingReferral", refCode);
    } catch {
      /* noop */
    }
  }, [refCode]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormData) {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/disclaimer`
            : undefined,
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSentTo(values.email);
  }

  async function resend() {
    if (!sentTo) return;
    if (resentAt && Date.now() - resentAt < 60_000) return;
    setResending(true);
    const supabase = createClient();
    await supabase.auth.resend({
      type: "signup",
      email: sentTo,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/disclaimer`
            : undefined,
      },
    });
    setResending(false);
    setResentAt(Date.now());
  }

  const canResend = !resentAt || Date.now() - resentAt > 60_000;

  return (
    <AuthSplit variant="signup">
      <div className="bg-[var(--color-card)] border border-[var(--color-line)] p-7 md:p-8">
        <h1 className="text-2xl display text-[var(--color-ink-deep)]">Get started</h1>
        <p className="text-sm text-muted mt-1">
          5 deal reports a month, free. No card required.
        </p>
        <div className="mt-3 rounded-md bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 px-3 py-2 text-xs text-ink">
          <span className="font-semibold">Free tier only during early access.</span>{" "}
          Paid plans (Investor, Pro, Portfolio) are coming soon — you&apos;ll see
          them on the Billing page.
        </div>

        {sentTo ? (
          <div className="text-center py-4 mt-4">
            <div className="h-12 w-12 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6" />
            </div>
            <p className="font-semibold text-ink">Check your inbox</p>
            <p className="text-sm text-muted mt-2">
              We&apos;ve sent a link to{" "}
              <span className="text-ink font-medium">{sentTo}</span>. Click it
              to activate your account.
            </p>
            <div className="mt-6 space-y-2">
              <Button
                variant="outline"
                onClick={resend}
                disabled={!canResend || resending}
                className="w-full"
              >
                {resending
                  ? "Sending…"
                  : canResend
                    ? "Resend email"
                    : "Email sent — wait 60s to resend"}
              </Button>
              <Link
                href="/login"
                className="block text-sm text-muted hover:text-ink"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-danger">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  {...register("password")}
                />
                <p className="text-xs text-faint">
                  8+ characters, including at least one number.
                </p>
                {errors.password && (
                  <p className="text-xs text-danger">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  {...register("confirm")}
                />
                {errors.confirm && (
                  <p className="text-xs text-danger">
                    {errors.confirm.message}
                  </p>
                )}
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button
                type="submit"
                size="lg"
                className="w-full shadow-sm"
                disabled={loading}
              >
                {loading ? "Creating account…" : "Create account"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <p className="text-xs text-faint text-center mt-4 leading-relaxed">
              By signing up you agree to our{" "}
              <Link href="/terms" className="underline hover:text-muted">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-muted">
                Privacy Policy
              </Link>
              . You&apos;ll be asked to acknowledge our{" "}
              <Link
                href="/disclaimer"
                className="underline hover:text-muted"
              >
                research-only disclaimer
              </Link>{" "}
              next.
            </p>

            <p className="text-sm text-muted text-center mt-6">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[var(--color-primary)] font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </AuthSplit>
  );
}
