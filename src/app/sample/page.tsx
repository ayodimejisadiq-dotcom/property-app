import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { Logo } from "@/components/app/Logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Sample deal — Capora",
};

const FACTORS = [
  { label: "Yield", score: 80 },
  { label: "Area growth", score: 65 },
  { label: "Demand", score: 70 },
  { label: "Refinance potential", score: 78 },
  { label: "Below market value", score: 50 },
  { label: "Tenant stability", score: 75 },
  { label: "Licensing risk", score: 60 },
];

const TILES = [
  { label: "Gross yield", value: "7.5%", sub: "£13.8k/yr" },
  { label: "Net yield", value: "5.9%", sub: "after costs" },
  { label: "Monthly cashflow", value: "£716", sub: "post-mortgage" },
  { label: "Stamp duty", value: "£7,450", sub: "incl. BTL surcharge" },
  { label: "Cash ROI", value: "12.1%", sub: "year 1" },
  { label: "Total acquisition", value: "£192,450", sub: "incl. fees" },
];

function bandFor(score: number) {
  if (score >= 70) return "STRONG" as const;
  if (score >= 40) return "MODERATE" as const;
  return "WEAK" as const;
}

function bandClass(band: "STRONG" | "MODERATE" | "WEAK") {
  return band === "STRONG"
    ? "bg-[var(--color-success)]"
    : band === "MODERATE"
      ? "bg-[var(--color-warning)]"
      : "bg-[var(--color-danger)]";
}

export default async function SamplePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const backHref = user ? "/dashboard" : "/";

  return (
    <div className="min-h-screen bg-fill">
      <header className="border-b border-line bg-white">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={backHref} className="flex items-center gap-2 text-sm text-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" />
            {user ? "Back to dashboard" : "Back to home"}
          </Link>
          <Logo size="sm" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
          Sample report — illustrative only
        </div>

        <div className="rounded-xl border border-line bg-white shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-line flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Levenshulme, Manchester · M19 3PT</p>
              <h1 className="text-2xl font-bold text-ink mt-1">
                3-bed terraced · £185,000
              </h1>
              <p className="text-sm text-muted mt-1">
                £1,150 pcm · 25% deposit · 5.25% interest-only · 25-year term
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)]">
                Score band: Strong
              </span>
              <div className="text-right">
                <p className="text-4xl font-bold text-ink leading-none">72</p>
                <p className="text-[10px] text-muted uppercase tracking-wider mt-1">
                  Score
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 border-b border-line">
            <p className="text-xs uppercase tracking-wider text-muted mb-4">
              Financials
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TILES.map((t) => (
                <div
                  key={t.label}
                  className="rounded-md border-l-4 border-[var(--color-success)] bg-card px-3 py-2.5"
                >
                  <p className="text-[11px] text-muted">{t.label}</p>
                  <p className="text-base font-bold text-ink">{t.value}</p>
                  <p className="text-[10px] text-muted">{t.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8 border-b border-line">
            <p className="text-xs uppercase tracking-wider text-muted mb-4">
              Investment factors
            </p>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
              {FACTORS.map((f) => {
                const band = bandFor(f.score);
                return (
                  <div key={f.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-body">{f.label}</span>
                      <span className="text-ink font-medium">{f.score}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-fill overflow-hidden">
                      <div
                        className={`h-full rounded-full ${bandClass(band)}`}
                        style={{ width: `${f.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted mb-3">
                Strengths
              </p>
              <ul className="space-y-2 text-sm text-body">
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] mt-0.5 shrink-0" />
                  Yield well above the UK BTL average.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] mt-0.5 shrink-0" />
                  Refinance unlocks 142% of original deposit by year 5.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] mt-0.5 shrink-0" />
                  Postcode shows steady 5-year price growth.
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted mb-3">
                Concerns
              </p>
              <ul className="space-y-2 text-sm text-body">
                <li className="flex gap-2">
                  <ShieldAlert className="h-4 w-4 text-[var(--color-warning)] mt-0.5 shrink-0" />
                  Selective licensing scheme covers M19.
                </li>
                <li className="flex gap-2">
                  <ShieldAlert className="h-4 w-4 text-[var(--color-warning)] mt-0.5 shrink-0" />
                  Comps suggest asking price is at the area median, not below.
                </li>
              </ul>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-card border-t border-line">
            <p className="text-xs uppercase tracking-wider text-muted mb-2">
              Summary
            </p>
            <p className="text-sm text-body leading-relaxed">
              The deal shows strong yield and refinance potential, with steady
              area growth and demand indicators above the regional average.
              Selective licensing and an asking price near the area median are
              the main concerns. Review with a qualified broker before
              proceeding.
            </p>
          </div>
        </div>

        <p className="text-xs italic text-faint text-center mt-4">
          Illustrative example. Real analyses use live data and your own
          assumptions.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <Link href={user ? "/analyse" : "/signup"}>
            <Button size="lg">
              {user ? "Analyse a real deal" : "Get started free"}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
