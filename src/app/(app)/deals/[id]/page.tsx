import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Lock, ShieldAlert, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { cn, scoreBand, bandColor } from "@/lib/utils";

const FACTOR_LABELS: Record<string, string> = {
  yield_score: "Yield",
  area_growth_score: "Area growth",
  demand_score: "Demand",
  refinance_score: "Refinance potential",
  bmv_score: "Below market value",
  tenant_profile_score: "Tenant stability",
  licensing_risk_score: "Licensing risk",
};

function formatGBP(pence: number | null | undefined): string {
  if (pence == null) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(pence / 100);
}

function formatPercent(bps: number | null | undefined, dp = 1): string {
  if (bps == null) return "—";
  return `${(bps / 100).toFixed(dp)}%`;
}

interface DealRow {
  id: string;
  address: string;
  postcode: string;
  price: number;
  bedrooms: number;
  property_type: string;
  monthly_rent: number;
  deposit_percent: number;
  mortgage_rate: number;
  mortgage_term_years: number;
  composite_score: number | null;
  yield_score: number | null;
  area_growth_score: number | null;
  demand_score: number | null;
  refinance_score: number | null;
  bmv_score: number | null;
  tenant_profile_score: number | null;
  licensing_risk_score: number | null;
  gross_yield_bps: number | null;
  net_yield_bps: number | null;
  monthly_cashflow: number | null;
  stamp_duty: number | null;
  cash_roi_bps: number | null;
  total_acquisition_cost: number | null;
  ai_report_summary: string | null;
  ai_report_strengths: string[] | null;
  ai_report_risks: string[] | null;
  ai_report_score_band: string | null;
  ai_report_generated_at: string | null;
  created_at: string;
}

function bandClass(b: ReturnType<typeof scoreBand>) {
  switch (b) {
    case "STRONG":
      return "bg-[var(--color-success)]";
    case "MODERATE":
      return "bg-[var(--color-warning)]";
    case "WEAK":
      return "bg-[var(--color-danger)]";
    default:
      return "bg-faint";
  }
}

function bandPillClass(b: ReturnType<typeof scoreBand>) {
  switch (b) {
    case "STRONG":
      return "bg-[var(--color-success)]/10 text-[var(--color-success)]";
    case "MODERATE":
      return "bg-[var(--color-warning)]/10 text-[var(--color-warning)]";
    case "WEAK":
      return "bg-[var(--color-danger)]/10 text-[var(--color-danger)]";
    default:
      return "bg-fill text-muted";
  }
}

function bandLabel(b: ReturnType<typeof scoreBand>) {
  switch (b) {
    case "STRONG":
      return "Strong";
    case "MODERATE":
      return "Moderate";
    case "WEAK":
      return "Weak";
    default:
      return "Insufficient data";
  }
}

function ScoreGauge({
  score,
  size = 140,
}: {
  score: number | null;
  size?: number;
}) {
  const band = scoreBand(score);
  const stroke = score ?? 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-label={`Score ${score ?? "unavailable"} of 100`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="var(--color-line)"
          strokeWidth="10"
          fill="none"
        />
        {score != null && (
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={
              band === "STRONG"
                ? "stroke-[var(--color-success)]"
                : band === "MODERATE"
                  ? "stroke-[var(--color-warning)]"
                  : "stroke-[var(--color-danger)]"
            }
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${(stroke / 100) * circumference} ${circumference}`}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-4xl font-bold", bandColor(band))}>
          {score ?? "—"}
        </span>
        <span className="text-[10px] text-muted uppercase tracking-wider mt-1">
          Score
        </span>
      </div>
    </div>
  );
}

export default async function DealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: deal } = await supabase
    .from("deals")
    .select("*")
    .eq("id", id)
    .single<DealRow>();

  if (!deal) notFound();

  const band = scoreBand(deal.composite_score);

  const factors: { key: keyof DealRow; label: string; score: number | null }[] =
    (
      [
        "yield_score",
        "area_growth_score",
        "demand_score",
        "refinance_score",
        "bmv_score",
        "tenant_profile_score",
        "licensing_risk_score",
      ] as const
    ).map((k) => ({
      key: k,
      label: FACTOR_LABELS[k],
      score: deal[k] as number | null,
    }));

  const scoredFactors = factors.filter((f) => f.score != null).length;

  const tiles = [
    {
      label: "Gross yield",
      value: formatPercent(deal.gross_yield_bps),
      sub: deal.monthly_rent
        ? `${formatGBP(deal.monthly_rent * 12)}/yr`
        : undefined,
      tone: "success" as const,
    },
    {
      label: "Net yield",
      value: formatPercent(deal.net_yield_bps),
      sub: "after costs",
      tone: "success" as const,
    },
    {
      label: "Monthly cashflow",
      value: formatGBP(deal.monthly_cashflow),
      sub: "post-mortgage",
      tone:
        (deal.monthly_cashflow ?? 0) >= 0
          ? ("success" as const)
          : ("danger" as const),
    },
    {
      label: "Stamp duty",
      value: formatGBP(deal.stamp_duty),
      sub: "incl. BTL surcharge",
      tone: "neutral" as const,
    },
    {
      label: "Cash ROI",
      value: formatPercent(deal.cash_roi_bps),
      sub: "year 1",
      tone:
        (deal.cash_roi_bps ?? 0) >= 800
          ? ("success" as const)
          : ("neutral" as const),
    },
    {
      label: "Total acquisition",
      value: formatGBP(deal.total_acquisition_cost),
      sub: "incl. fees",
      tone: "neutral" as const,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="rounded-xl border border-line bg-white shadow-sm overflow-hidden">
        {/* Top section */}
        <div className="p-6 md:p-8 border-b border-line flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm text-muted">{deal.postcode}</p>
            <h1 className="text-2xl font-bold text-ink mt-1">
              {deal.address}
            </h1>
            <p className="text-sm text-muted mt-1">
              {deal.bedrooms} bed {prettyType(deal.property_type)} ·{" "}
              {formatGBP(deal.price)} ·{" "}
              {formatGBP(deal.monthly_rent)} pcm
            </p>
          </div>
          <div className="flex items-center gap-5">
            <ScoreGauge score={deal.composite_score} />
            <div>
              <span
                className={cn(
                  "text-xs font-medium px-2.5 py-1 rounded-full",
                  bandPillClass(band),
                )}
              >
                Score band: {bandLabel(band)}
              </span>
              <p className="text-xs text-muted mt-2 max-w-[14ch]">
                {scoredFactors} of 7 factors scored
              </p>
            </div>
          </div>
        </div>

        {/* Financials */}
        <div className="p-6 md:p-8 border-b border-line">
          <p className="text-xs uppercase tracking-wider text-muted mb-4">
            Financials
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {tiles.map((t) => (
              <div
                key={t.label}
                className={cn(
                  "rounded-md border-l-4 bg-card px-3 py-2.5",
                  t.tone === "success" && "border-[var(--color-success)]",
                  t.tone === "danger" && "border-[var(--color-danger)]",
                  t.tone === "neutral" && "border-line",
                )}
              >
                <p className="text-[11px] text-muted">{t.label}</p>
                <p className="text-base font-bold text-ink">{t.value}</p>
                {t.sub && (
                  <p className="text-[10px] text-muted">{t.sub}</p>
                )}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-faint mt-3">
            Mortgage: {deal.deposit_percent}% deposit ·{" "}
            {deal.mortgage_rate}% interest-only · {deal.mortgage_term_years}-yr
            term · operating costs include 10% letting fees, 1% maintenance, £300
            insurance, 1-month void allowance.
          </p>
        </div>

        {/* Factors */}
        <div className="p-6 md:p-8">
          <div className="flex items-end justify-between mb-4">
            <p className="text-xs uppercase tracking-wider text-muted">
              Investment factors
            </p>
            <p className="text-[11px] text-faint">
              Tap any row for the inputs we used (V1.2).
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
            {factors.map((f) => {
              const fb = scoreBand(f.score);
              return (
                <div key={f.key as string}>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-body">{f.label}</span>
                    {f.score != null ? (
                      <span className="text-ink font-medium">{f.score}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-faint uppercase tracking-wider">
                        <Lock className="h-3 w-3" />
                        Insufficient data
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 rounded-full bg-fill overflow-hidden">
                    {f.score != null ? (
                      <div
                        className={`h-full rounded-full ${bandClass(fb)}`}
                        style={{ width: `${f.score}%` }}
                      />
                    ) : (
                      <div
                        className="h-full rounded-full bg-faint/30"
                        style={{
                          width: "100%",
                          backgroundImage:
                            "repeating-linear-gradient(45deg, var(--color-line), var(--color-line) 4px, transparent 4px, transparent 8px)",
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded-md bg-[var(--color-primary-light)]/50 border border-[var(--color-primary)]/20 px-4 py-3 text-sm">
            <p className="text-ink font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
              More factors coming soon
            </p>
            <p className="text-muted mt-1">
              Area growth, demand, BMV, tenant stability and licensing risk
              ship with Phase 3 — once Land Registry, ONS Census and council
              licensing data are wired in.
            </p>
          </div>
        </div>

        {/* AI report */}
        <div className="p-6 md:p-8 border-t border-line bg-card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-wider text-muted">
              AI deal report
            </p>
            {deal.ai_report_score_band && (
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  bandPillClass(
                    deal.ai_report_score_band as
                      | "STRONG"
                      | "MODERATE"
                      | "WEAK",
                  ),
                )}
              >
                Score band: {bandLabel(
                  deal.ai_report_score_band as
                    | "STRONG"
                    | "MODERATE"
                    | "WEAK",
                )}
              </span>
            )}
          </div>

          {deal.ai_report_summary ? (
            <>
              <p className="text-sm text-body leading-relaxed">
                {deal.ai_report_summary}
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted mb-2">
                    Strengths
                  </p>
                  {deal.ai_report_strengths?.length ? (
                    <ul className="text-sm text-body space-y-1.5">
                      {deal.ai_report_strengths.map((s, i) => (
                        <li key={i} className="flex gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] mt-0.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted italic">None flagged.</p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted mb-2">
                    Concerns
                  </p>
                  {deal.ai_report_risks?.length ? (
                    <ul className="text-sm text-body space-y-1.5">
                      {deal.ai_report_risks.map((r, i) => (
                        <li key={i} className="flex gap-2">
                          <ShieldAlert className="h-4 w-4 text-[var(--color-warning)] mt-0.5 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted italic">None flagged.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted mb-2">
                  Strengths
                </p>
                {deal.yield_score != null && deal.yield_score >= 60 ? (
                  <ul className="text-sm text-body space-y-1.5">
                    <li className="flex gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] mt-0.5 shrink-0" />
                      Gross yield of {formatPercent(deal.gross_yield_bps)} sits
                      at or above the UK BTL benchmark.
                    </li>
                  </ul>
                ) : (
                  <p className="text-sm text-muted italic">
                    AI report unavailable for this deal — refer to the factor
                    scores above.
                  </p>
                )}
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted mb-2">
                  Concerns
                </p>
                <ul className="text-sm text-body space-y-1.5">
                  {7 - scoredFactors > 0 && (
                    <li className="flex gap-2">
                      <ShieldAlert className="h-4 w-4 text-[var(--color-warning)] mt-0.5 shrink-0" />
                      {7 - scoredFactors} factor
                      {7 - scoredFactors === 1 ? "" : "s"} couldn&apos;t be
                      scored without Phase 3 data — treat the composite as
                      provisional.
                    </li>
                  )}
                  {(deal.monthly_cashflow ?? 0) < 0 && (
                    <li className="flex gap-2">
                      <ShieldAlert className="h-4 w-4 text-[var(--color-warning)] mt-0.5 shrink-0" />
                      Monthly cashflow is negative on these assumptions; the
                      deal relies on capital growth alone.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          <p className="text-xs italic text-faint mt-5">
            Not financial advice. Do your own due diligence. Always commission a
            survey, valuation and legal review before any property transaction.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button disabled>Export PDF (Phase 5)</Button>
        <Button variant="outline" disabled>
          Share link (V1.05)
        </Button>
        <Link href="/analyse" className="ml-auto">
          <Button variant="ghost">Analyse another</Button>
        </Link>
      </div>
    </div>
  );
}

function prettyType(t: string) {
  switch (t) {
    case "terraced":
      return "terraced";
    case "semi":
      return "semi-detached";
    case "detached":
      return "detached";
    case "flat":
      return "flat";
    case "bungalow":
      return "bungalow";
    default:
      return "property";
  }
}
