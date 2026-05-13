"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Logo } from "@/components/app/Logo";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CURRENT_DISCLAIMER_VERSION } from "@/lib/constants";

const POINTS = [
  {
    title: "It's not financial advice",
    body:
      "Scores and reports are for research only — not a recommendation to buy, sell or finance any property.",
  },
  {
    title: "Always do your own due diligence",
    body:
      "Commission a survey, valuation and legal review. Talk to a qualified mortgage broker before you commit.",
  },
  {
    title: "The data has limits",
    body:
      "Estimates use Land Registry, ONS and council sources that can be incomplete or delayed. We cite them so you can verify.",
  },
  {
    title: "Your decisions are yours",
    body:
      "Surge and Daramola Consulting accept no liability for investment outcomes based on use of this tool.",
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
    <div className="min-h-screen flex items-center justify-center bg-fill px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-xl border border-line shadow-sm p-6 md:p-10">
        <div className="flex justify-center mb-6">
          <Logo size="md" />
        </div>
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-12 w-12 rounded-full bg-[var(--color-warning)]/15 text-[var(--color-warning)] flex items-center justify-center mb-3">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-ink">
            One thing before you start
          </h1>
          <p className="text-muted mt-2">
            Surge is an analytical tool — not a financial adviser. Please
            read and acknowledge.
          </p>
        </div>

        <ol className="space-y-4 mb-8">
          {POINTS.map((p, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-semibold">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-ink">{p.title}</p>
                <p className="text-sm text-muted">{p.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <Checkbox
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-sm text-ink">
            I understand this is not financial advice and I will do my own due
            diligence.
          </span>
        </label>

        {error && <p className="text-sm text-danger mb-3">{error}</p>}

        <Button
          onClick={accept}
          disabled={!checked || loading}
          size="lg"
          className="w-full"
        >
          {loading ? "Saving…" : "I understand — take me in"}
        </Button>
      </div>
    </div>
  );
}
