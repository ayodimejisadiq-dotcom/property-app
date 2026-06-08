"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/app/Logo";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CURRENT_DISCLAIMER_VERSION } from "@/lib/constants";

const POINTS = [
  {
    n: "I",
    title: "It is not financial advice.",
    body: "Scores and reports are for research only — not a recommendation to buy, sell or finance any property.",
  },
  {
    n: "II",
    title: "Always do your own due diligence (DYOD).",
    body: "Commission a RICS survey, instruct a solicitor, and speak to a qualified mortgage broker before you commit. Capora is a starting point, not a replacement.",
  },
  {
    n: "III",
    title: "The data has limits.",
    body: "Estimates use Land Registry, ONS and council sources that can be incomplete or delayed. We cite them so you can verify.",
  },
  {
    n: "IV",
    title: "Your decisions are yours.",
    body: "Capora accepts no liability for investment outcomes based on use of this tool.",
  },
];

export default function DisclaimerPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      router.push("/login");
      return;
    }
    const { error: updErr } = await supabase
      .from("users")
      .update({
        disclaimer_accepted_at: new Date().toISOString(),
        disclaimer_version: CURRENT_DISCLAIMER_VERSION,
      })
      .eq("id", user.id);

    if (updErr) {
      setError(updErr.message);
      setLoading(false);
      return;
    }

    await supabase.from("audit_log").insert({
      user_id: user.id,
      event_type: "disclaimer_accepted",
      metadata: { version: CURRENT_DISCLAIMER_VERSION },
    });

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-12">
          <Logo size="md" />
        </div>
        <p className="eyebrow text-center">Before you start</p>
        <h1
          className="display mt-5 leading-[1.05] text-center"
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            color: "var(--color-ink-deep)",
          }}
        >
          One thing first.
        </h1>
        <p className="mt-6 text-center text-sm text-[var(--color-body)] max-w-xl mx-auto">
          Capora is an analytical tool — not a financial adviser. Please read
          and acknowledge.
        </p>

        <ol className="mt-14 space-y-8">
          {POINTS.map((p) => (
            <li key={p.n} className="border-t border-[var(--color-ink-deep)] pt-5 grid grid-cols-[auto_1fr] gap-x-5">
              <p
                className="display text-2xl"
                style={{ color: "var(--color-accent)" }}
              >
                {p.n}
              </p>
              <div>
                <p
                  className="display text-xl"
                  style={{ color: "var(--color-ink-deep)" }}
                >
                  {p.title}
                </p>
                <p className="mt-2 text-sm text-[var(--color-body)] leading-relaxed">
                  {p.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-14 border-t border-[var(--color-line)] pt-8">
          <label className="flex items-start gap-3 mb-6 cursor-pointer">
            <Checkbox
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-[var(--color-ink-deep)] leading-relaxed">
              I understand this is not financial advice and I agree to{" "}
              <strong>Do My Own Due Diligence (DYOD)</strong> on every
              property — including a RICS survey, solicitor, and qualified
              mortgage broker — before acting on any Capora output.
            </span>
          </label>

          {error && (
            <p className="text-sm mb-4" style={{ color: "var(--color-danger)" }}>
              {error}
            </p>
          )}

          <Button
            onClick={accept}
            disabled={!checked || loading}
            size="lg"
            variant="primary"
            className="w-full"
          >
            {loading ? "Saving…" : "I understand — take me in →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
