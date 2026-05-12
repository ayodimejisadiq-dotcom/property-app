import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Lock,
  PoundSterling,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { cn, scoreBand, bandColor } from "@/lib/utils";
import {
  DEFAULT_LEGAL_COST,
  DEFAULT_SURVEY_COST,
} from "@/lib/constants";
import { computeFinancials } from "@/lib/financials";

const FACTOR_LABELS: Record<string, string> = {
  yield_score: "Yield",
  area_growth_score: "Area growth",
  demand_score: "Demand",
  refinance_score: "Refinance potential",
  bmv_score: "Below market value",
  tenant_profile_score: "Tenant stability",
  licensing_risk_score: "Licensing risk",
};

function formatGBP(pence: number | null | undefined, opts?: { signed?: boolean }) {
  if (pence == null) return "—";
  const value = pence / 100;
  const formatted = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
  if (opts?.signed && value < 0) return `−${formatted}`;
  if (opts?.signed && value > 0) return `+${formatted}`;
  return value < 0 ? `−${formatted}` : formatted;
}

function formatPercent(bps: number | null | undefined, dp = 1): string {
  if (bps == null) return "—";
  return `${(bps / 100).toFixed(dp)}%`;
}

interface DealRow {
  id: string;
  source_url: string | null;
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
  size = 160,
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
          strokeWidth="9"
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
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${(stroke / 100) * circumference} ${circumference}`}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-5xl font-bold", bandColor(band))}>
          {score ?? "—"}
        </span>
        <span className="text-[10px] text-muted uppercase tracking-wider mt-1">
          Score / 100
        </span>
      </div>
    </div>
  );
}

function prettyType(t: string) {
  switch (t) {
    case "terraced":
      return "Terraced";
    case "semi":
      return "Semi-detached";
    case "detached":
      return "Detached";
    case "flat":
      return "Flat / apartment";
    case "bungalow":
      return "Bungalow";
    default:
      return "Other";
  }
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

  const fin = computeFinancials({
    pricePence: deal.price,
    monthlyRentPence: deal.monthly_rent,
    depositPercent: deal.deposit_percent,
    mortgageRate: deal.mortgage_rate,
    mortgageTermYears: deal.mortgage_term_years,
  });

  const annualRent = deal.monthly_rent * 12;
  const annualOpCosts = fin.annualOperatingCosts;
  const lettingFees = Math.round(annualRent * 0.1);
  const insurance = 30_000;
  const maintenance = Math.round(deal.price * 0.01);
  const voidAllowance = deal.monthly_rent;
  const annualMortgage = fin.monthlyMortgagePayment * 12;
  const annualCashflow = fin.monthlyCashflow * 12;

  const loanPence = Math.round(deal.price * (1 - deal.deposit_percent / 100));
  const depositPence = deal.price - loanPence;

  const ANNUAL_GROWTH = 0.03;
  const projection = [1, 3, 5].map((year) => {
    const value = Math.round(deal.price * Math.pow(1 + ANNUAL_GROWTH, year));
    const equityFromGrowth = value - deal.price;
    const equityIncOriginal = value - loanPence;
    const cumulativeCashflow = annualCashflow * year;
    const totalReturn =
      cumulativeCashflow + equityFromGrowth - depositPence + depositPence;
    return {
      year,
      value,
      equityIncOriginal,
      equityFromGrowth,
      cumulativeCashflow,
      totalReturn,
    };
  });

  const band = scoreBand(deal.composite_score);

  const factors: { key: keyof DealRow; label: string; score: number | null }[] =
    (
      [
        "yield_score",
        "refinance_score",
        "licensing_risk_score",
        "area_growth_score",
        "demand_score",
        "bmv_score",
        "tenant_profile_score",
      ] as const
    ).map((k) => ({
      key: k,
      label: FACTOR_LABELS[k],
      score: deal[k] as number | null,
    }));

  const scoredFactors = factors.filter((f) => f.score != null).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10 space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="rounded-xl border border-line bg-white shadow-sm overflow-hidden">
        <div
          className="h-1.5 w-full"
          style={{ background: "var(--gradient-primary)" }}
          aria-hidden
        />
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="min-w-0">
            <p className="text-sm text-muted">{deal.postcode}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-ink mt-1 break-words">
              {deal.address}
            </h1>
            <p className="text-sm text-muted mt-2">
              {deal.bedrooms} bed · {prettyType(deal.property_type)} ·{" "}
              {formatGBP(deal.price)} ·{" "}
              {formatGBP(deal.monthly_rent)} pcm
            </p>
            {deal.source_url && (
              <a
                href={deal.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline mt-2"
              >
                <ExternalLink className="h-3 w-3" />
                View original listing
              </a>
            )}
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
                {bandLabel(band)}
              </span>
              <p className="text-xs text-muted mt-2 max-w-[14ch]">
                {scoredFactors} of 7 factors scored
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Headline
          icon={PoundSterling}
          label="Monthly cashflow"
          value={formatGBP(fin.monthlyCashflow, { signed: true })}
          tone={fin.monthlyCashflow >= 0 ? "success" : "danger"}
        />
        <Headline
          icon={TrendingUp}
          label="Cash ROI (yr 1)"
          value={formatPercent(fin.cashRoiBps)}
          tone={fin.cashRoiBps >= 800 ? "success" : "neutral"}
        />
        <Headline
          icon={Building2}
          label="Gross yield"
          value={formatPercent(fin.grossYieldBps)}
          tone={fin.grossYieldBps >= 700 ? "success" : "neutral"}
        />
        <Headline
          icon={Sparkles}
          label="Net yield"
          value={formatPercent(fin.netYieldBps)}
          tone={fin.netYieldBps >= 500 ? "success" : "neutral"}
        />
      </div>

      <Section title="Property & mortgage assumptions">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <KV label="Asking price" value={formatGBP(deal.price)} />
          <KV
            label="Monthly rent (pcm)"
            value={formatGBP(deal.monthly_rent)}
          />
          <KV label="Bedrooms" value={String(deal.bedrooms)} />
          <KV label="Property type" value={prettyType(deal.property_type)} />
          <KV label="Postcode" value={deal.postcode} />
          <KV
            label="Analysed"
            value={new Date(deal.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          />
          <KV
            label="Deposit"
            value={`${deal.deposit_percent}% (${formatGBP(depositPence)})`}
          />
          <KV
            label="Mortgage"
            value={`${deal.mortgage_rate}% interest-only`}
          />
          <KV label="Term" value={`${deal.mortgage_term_years} years`} />
        </div>
      </Section>

      <Section title="Annual cashflow breakdown">
        <div className="space-y-2">
          <Row
            label="Rental income"
            sub={`${formatGBP(deal.monthly_rent)}/mo × 12`}
            value={formatGBP(annualRent, { signed: true })}
            tone="positive"
          />
          <Group label="Operating costs">
            <SubRow
              label="Letting agent (10% of rent)"
              value={formatGBP(-lettingFees, { signed: true })}
            />
            <SubRow
              label="Insurance"
              value={formatGBP(-insurance, { signed: true })}
            />
            <SubRow
              label="Maintenance reserve (1% of price)"
              value={formatGBP(-maintenance, { signed: true })}
            />
            <SubRow
              label="Void allowance (1 month)"
              value={formatGBP(-voidAllowance, { signed: true })}
            />
            <SubRow
              label="Total"
              value={formatGBP(-annualOpCosts, { signed: true })}
              bold
            />
          </Group>
          <Row
            label="Mortgage interest"
            sub={`${formatGBP(loanPence)} loan × ${deal.mortgage_rate}%`}
            value={formatGBP(-annualMortgage, { signed: true })}
            tone="negative"
          />
          <div className="border-t border-line pt-3 mt-2">
            <Row
              label="Net annual cashflow"
              value={formatGBP(annualCashflow, { signed: true })}
              tone={annualCashflow >= 0 ? "positive" : "negative"}
              bold
            />
            <p className="text-[11px] text-muted mt-1">
              ≈ {formatGBP(fin.monthlyCashflow, { signed: true })} per month.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Cash needed to acquire">
        <div className="space-y-2">
          <Row
            label={`Deposit (${deal.deposit_percent}%)`}
            value={formatGBP(depositPence)}
          />
          <Row
            label="Stamp Duty Land Tax"
            sub="Includes 3% additional-property surcharge"
            value={formatGBP(fin.stampDuty)}
          />
          <Row
            label="Survey (estimate)"
            value={formatGBP(DEFAULT_SURVEY_COST)}
          />
          <Row
            label="Legal fees (estimate)"
            value={formatGBP(DEFAULT_LEGAL_COST)}
          />
          <div className="border-t border-line pt-3 mt-2">
            <Row
              label="Total cash required"
              value={formatGBP(fin.totalAcquisitionCost)}
              bold
            />
            <p className="text-[11px] text-muted mt-1">
              Year-1 cash ROI = annual cashflow ÷ total cash required ={" "}
              {formatPercent(fin.cashRoiBps)}.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="5-year projection"
        hint="Assumes 3%/yr capital growth and constant operating costs. Illustrative."
      >
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm min-w-[480px] sm:min-w-0">
            <thead className="text-[11px] uppercase tracking-wider text-muted">
              <tr>
                <th className="text-left font-medium px-4 sm:px-0 py-2">Year</th>
                <th className="text-right font-medium py-2">
                  Projected value
                </th>
                <th className="text-right font-medium py-2">
                  Equity (incl. growth)
                </th>
                <th className="text-right font-medium py-2 pr-4 sm:pr-0">
                  Cumulative cashflow
                </th>
              </tr>
            </thead>
            <tbody>
              {projection.map((p) => (
                <tr key={p.year} className="border-t border-line">
                  <td className="py-3 px-4 sm:px-0 text-ink font-medium">
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-faint" />
                      Year {p.year}
                    </span>
                  </td>
                  <td className="py-3 text-right text-ink">
                    {formatGBP(p.value)}
                  </td>
                  <td className="py-3 text-right text-ink">
                    {formatGBP(p.equityIncOriginal)}
                  </td>
                  <td
                    className={cn(
                      "py-3 text-right pr-4 sm:pr-0 font-medium",
                      p.cumulativeCashflow >= 0
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-danger)]",
                    )}
                  >
                    {formatGBP(p.cumulativeCashflow, { signed: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Investment factors"
        hint="Tap any row for the inputs we used (V1.2)."
      >
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
                      className="h-full rounded-full"
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
        {scoredFactors < 7 && (
          <div className="mt-5 rounded-md bg-[var(--color-primary-light)]/50 border border-[var(--color-primary)]/20 px-4 py-3 text-sm">
            <p className="text-ink font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
              {7 - scoredFactors} more factor
              {7 - scoredFactors === 1 ? "" : "s"} coming soon
            </p>
            <p className="text-muted mt-1">
              Area growth, demand, BMV and tenant stability ship once Land
              Registry and ONS Census data are wired in.
            </p>
          </div>
        )}
      </Section>

      <div className="rounded-xl border border-line bg-card p-6 md:p-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
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
          <p className="text-sm text-muted italic">
            AI report unavailable for this deal — refer to the figures and
            factor scores above.
          </p>
        )}

        <p className="text-xs italic text-faint mt-6">
          Not financial advice. Do your own due diligence. Always commission a
          survey, valuation and legal review before any property transaction.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={`/api/report/${deal.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button>Export PDF</Button>
        </a>
        <Button variant="outline" disabled>
          Share link (V1.05)
        </Button>
        <Link href="/analyse" className="ml-auto">
          <Button variant="ghost">
            Analyse another
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-white p-6 md:p-8">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Headline({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: "success" | "danger" | "neutral";
}) {
  const valueClass =
    tone === "success"
      ? "text-[var(--color-success)]"
      : tone === "danger"
        ? "text-[var(--color-danger)]"
        : "text-ink";
  const borderClass =
    tone === "success"
      ? "border-l-[var(--color-success)]"
      : tone === "danger"
        ? "border-l-[var(--color-danger)]"
        : "border-l-line";
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-white px-4 py-3 border-l-4",
        borderClass,
      )}
    >
      <div className="flex items-center justify-between text-muted">
        <p className="text-[11px] uppercase tracking-wider">{label}</p>
        <Icon className="h-3.5 w-3.5 text-faint" />
      </div>
      <p className={cn("text-2xl font-bold mt-1.5", valueClass)}>{value}</p>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="text-ink font-medium mt-0.5">{value}</p>
    </div>
  );
}

function Row({
  label,
  sub,
  value,
  tone = "neutral",
  bold = false,
}: {
  label: string;
  sub?: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
  bold?: boolean;
}) {
  const valueClass =
    tone === "positive"
      ? "text-[var(--color-success)]"
      : tone === "negative"
        ? "text-[var(--color-danger)]"
        : "text-ink";
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm",
            bold ? "font-semibold text-ink" : "text-body",
          )}
        >
          {label}
        </p>
        {sub && <p className="text-[11px] text-muted">{sub}</p>}
      </div>
      <p className={cn("text-sm tabular-nums", bold && "font-bold", valueClass)}>
        {value}
      </p>
    </div>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-line bg-card px-4 py-3">
      <p className="text-sm text-body mb-2">{label}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function SubRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4",
        bold && "border-t border-line pt-1.5 mt-1",
      )}
    >
      <p
        className={cn(
          "text-xs",
          bold ? "font-semibold text-ink" : "text-muted",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "text-xs tabular-nums",
          bold ? "font-bold text-ink" : "text-body",
        )}
      >
        {value}
      </p>
    </div>
  );
}
