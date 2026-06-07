"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthSplit } from "@/components/app/AuthSplit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormData) {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword(values);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthSplit variant="login">
      <div className="rounded-2xl bg-white border border-line shadow-sm p-7 md:p-8">
        <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
        <p className="text-sm text-muted mt-1">
          Sign in to your Capora account.
        </p>

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
              <p className="text-xs text-danger">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                onClick={() => setResetOpen(true)}
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-danger">
                {errors.password.message}
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
            {loading ? "Signing in…" : "Sign in"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>

        <p className="text-sm text-muted text-center mt-6">
          New to Capora?{" "}
          <Link
            href="/signup"
            className="text-[var(--color-primary)] font-medium hover:underline"
          >
            Create a free account
          </Link>
        </p>
      </div>

      <p className="text-xs text-faint text-center mt-6">
        By continuing you agree to our{" "}
        <Link href="/terms" className="hover:text-muted underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="hover:text-muted underline">
          Privacy Policy
        </Link>
        .
      </p>

      <ResetPasswordDialog open={resetOpen} onOpenChange={setResetOpen} />
    </AuthSplit>
  );
}

function ResetPasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!email) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : undefined,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setSent(false);
          setEmail("");
          setError(null);
        }
      }}
    >
      <DialogContent>
        {sent ? (
          <div className="text-center py-4">
            <CheckCircle2 className="h-10 w-10 text-[var(--color-success)] mx-auto mb-3" />
            <DialogTitle>Reset link sent</DialogTitle>
            <DialogDescription>
              Check {email} for a link to reset your password.
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              We&apos;ll email you a link to set a new one.
            </DialogDescription>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button
                onClick={send}
                disabled={!email || loading}
                className="w-full"
              >
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
