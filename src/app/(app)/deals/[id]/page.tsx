import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cn, scoreBand } from "@/lib/utils";
import {
  DEFAULT_LEGAL_COST,
  DEFAULT_SURVEY_COST,
} from "@/lib/constants";
import { computeFinancials } from "@/lib/financials";

/**
 * Editorial / financial-press proof-of-concept rendering.
 * No gradients, no rounded cards, no blobs, no shadows.
 * Hairline rules, off-white paper canvas, serif headlines, tabular numerals.
 */

const FACTOR_LABELS: Record<string, string> = {
  yield_score: "Yield",
  area_growth_score: "Area growth",
  demand_score: "Demand",
  refinance_score: "Refinance potential",
  bmv_score: "Below market value",
  tenant_profile_score: "Tenant stability",
  licensing_risk_score: "Licensing risk",
};

const ACCENT = "var(--color-accent-signal)";
const INK = "var(--color-ink-deep)";

function fmtGBP(
  pence: number | null | undefined,
  opts?: { signed?: boolean; whole?: boolean },
) {
  if (pence == null) return "—";
  const value = pence / 100;
  const formatted = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: opts?.whole === false ? 2 : 0,
  }).format(Math.abs(value));
  if (opts?.signed && value < 0) return `−${formatted}`;
  if (opts?.signed && value > 0) return `+${formatted}`;
  return value < 0 ? `−${formatted}` : formatted;
}

function fmtPct(bps: number | null | undefined, dp = 1) {
  if (bps == null) return "—";
  return `${(bps / 100).toFixed(dp)}%`;
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

function bandWord(b: ReturnType<typeof scoreBand>) {
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

function bandFgFor(b: ReturnType<typeof scoreBand>) {
  // Muted, paper-friendly band colours
  switch (b) {
    case "STRONG":
      return "#2D6A3E"; // ivy
    case "MODERATE":
      return "#9C6B1D"; // ochre
    case "WEAK":
      return "#9C2A1D"; // brick
    default:
      return "#6B6256"; // warm grey
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
  const annualOp = fin.annualOperatingCosts;
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
    return {
      year,
      value,
      equityIncOriginal: value - loanPence,
      cumulativeCashflow: annualCashflow * year,
    };
  });

  const band = scoreBand(deal.composite_score);
  const bandFg = bandFgFor(band);

  const factors = (
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

  const issuedAt = new Date(deal.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="editorial min-h-screen">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
        {/* Masthead */}
        <div className="flex items-center justify-between text-[10px] tracking-[0.18em] uppercase text-[#0F1419]">
          <Link
            href="/dashboard"
            className="hover:underline underline-offset-4"
          >
            ← Capora dashboard
          </Link>
          <span style={{ color: INK }}>
            Deal report &nbsp;·&nbsp; {deal.postcode} &nbsp;·&nbsp; {issuedAt}
          </span>
        </div>
        <div className="mt-3 rule" />

        {/* Hero */}
        <header className="pt-10 pb-12 grid grid-cols-12 gap-6 items-start">
          <div className="col-span-12 md:col-span-8">
            <p className="eyebrow">{deal.postcode}</p>
            <h1
              className="display mt-3 leading-[1.05]"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                color: INK,
              }}
            >
              {deal.address}
            </h1>
            <p
              className="mt-5 text-sm tnum"
              style={{ color: INK }}
            >
              {deal.bedrooms} bed &nbsp;·&nbsp;{" "}
              {prettyType(deal.property_type)} &nbsp;·&nbsp;{" "}
              <strong>{fmtGBP(deal.price)}</strong>
              &nbsp;·&nbsp; {fmtGBP(deal.monthly_rent)} pcm
            </p>
            {deal.source_url && (
              <a
                href={deal.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-[11px] tracking-[0.12em] uppercase hover:underline underline-offset-4"
                style={{ color: ACCENT }}
              >
                View original listing →
              </a>
            )}
          </div>
          <div className="col-span-12 md:col-span-4 md:pl-6 md:border-l md:border-[#0F1419]">
            <p className="eyebrow">Capora score</p>
            <div
              className="display tnum mt-2 leading-none"
              style={{
                fontSize: "clamp(4rem, 8vw, 6rem)",
                color: bandFg,
              }}
            >
              {deal.composite_score ?? "—"}
            </div>
            <p
              className="mt-3 text-xs tracking-[0.12em] uppercase"
              style={{ color: bandFg }}
            >
              {bandWord(band)}
            </p>
            <p className="mt-1 text-[11px] text-[#6B6256]">
              {scoredFactors} of 7 factors scored
            </p>
          </div>
        </header>

        {/* Headline metrics */}
        <Section title="At a glance">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-7">
            <Lockup
              eyebrow="Monthly cashflow"
              value={fmtGBP(fin.monthlyCashflow, { signed: true })}
              tone={fin.monthlyCashflow >= 0 ? "good" : "bad"}
            />
            <Lockup
              eyebrow="Cash ROI · yr 1"
              value={fmtPct(fin.cashRoiBps)}
            />
            <Lockup
              eyebrow="Gross yield"
              value={fmtPct(fin.grossYieldBps)}
            />
            <Lockup
              eyebrow="Net yield"
              value={fmtPct(fin.netYieldBps)}
            />
          </div>
        </Section>

        {/* Property & mortgage */}
        <Section title="Property & mortgage assumptions">
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-8 text-sm">
            <KV label="Asking price" value={fmtGBP(deal.price)} />
            <KV label="Monthly rent" value={fmtGBP(deal.monthly_rent)} />
            <KV label="Bedrooms" value={String(deal.bedrooms)} />
            <KV
              label="Property type"
              value={prettyType(deal.property_type)}
            />
            <KV label="Postcode" value={deal.postcode} />
            <KV label="Analysed" value={issuedAt} />
            <KV
              label="Deposit"
              value={`${deal.deposit_percent}% · ${fmtGBP(depositPence)}`}
            />
            <KV
              label="Mortgage"
              value={`${deal.mortgage_rate}% interest-only`}
            />
            <KV label="Term" value={`${deal.mortgage_term_years} years`} />
          </dl>
        </Section>

        {/* Cashflow */}
        <Section title="Annual cashflow">
          <Table>
            <Row label="Rental income" sub={`${fmtGBP(deal.monthly_rent)} × 12`} value={fmtGBP(annualRent, { signed: true })} positive />
            <RowGroup label="Operating costs">
              <Row label="Letting agent (10% of rent)" value={fmtGBP(-lettingFees, { signed: true })} sub="" />
              <Row label="Insurance" value={fmtGBP(-insurance, { signed: true })} />
              <Row label="Maintenance reserve (1% of price)" value={fmtGBP(-maintenance, { signed: true })} />
              <Row label="Void allowance (1 month)" value={fmtGBP(-voidAllowance, { signed: true })} />
              <Row label="Subtotal" value={fmtGBP(-annualOp, { signed: true })} bold />
            </RowGroup>
            <Row
              label="Mortgage interest"
              sub={`${fmtGBP(loanPence)} loan × ${deal.mortgage_rate}%`}
              value={fmtGBP(-annualMortgage, { signed: true })}
              negative
            />
            <RowTotal
              label="Net annual cashflow"
              value={fmtGBP(annualCashflow, { signed: true })}
              positive={annualCashflow >= 0}
              caption={`≈ ${fmtGBP(fin.monthlyCashflow, { signed: true })} per month.`}
            />
          </Table>
        </Section>

        {/* Acquisition */}
        <Section title="Cash needed to acquire">
          <Table>
            <Row
              label={`Deposit (${deal.deposit_percent}%)`}
              value={fmtGBP(depositPence)}
            />
            <Row
              label="Stamp Duty Land Tax"
              sub="Includes 3% additional-property surcharge"
              value={fmtGBP(fin.stampDuty)}
            />
            <Row label="Survey (estimate)" value={fmtGBP(DEFAULT_SURVEY_COST)} />
            <Row label="Legal fees (estimate)" value={fmtGBP(DEFAULT_LEGAL_COST)} />
            <RowTotal
              label="Total cash required"
              value={fmtGBP(fin.totalAcquisitionCost)}
              caption={`Year-1 cash ROI = ${fmtPct(fin.cashRoiBps)} of cash deployed.`}
            />
          </Table>
        </Section>

        {/* Projection */}
        <Section
          title="5-year projection"
          eyebrow="Assumes 3%/yr capital growth and constant operating costs. Illustrative."
        >
          <div className="overflow-x-auto -mx-5 sm:mx-0">
            <table className="w-full text-sm min-w-[520px] tnum">
              <thead>
                <tr className="text-[10px] tracking-[0.12em] uppercase">
                  <th className="text-left font-semibold py-3 pl-5 sm:pl-0" style={{ color: INK }}>Year</th>
                  <th className="text-right font-semibold py-3" style={{ color: INK }}>Projected value</th>
                  <th className="text-right font-semibold py-3" style={{ color: INK }}>Equity (incl. growth)</th>
                  <th className="text-right font-semibold py-3 pr-5 sm:pr-0" style={{ color: INK }}>Cumulative cashflow</th>
                </tr>
              </thead>
              <tbody>
                {projection.map((p, i) => (
                  <tr key={p.year} className={cn("border-t", i === 0 ? "border-[#0F1419]" : "border-[#E2DBCC]")}>
                    <td className="py-4 pl-5 sm:pl-0" style={{ color: INK }}>
                      Year {p.year}
                    </td>
                    <td className="py-4 text-right" style={{ color: INK }}>
                      {fmtGBP(p.value)}
                    </td>
                    <td className="py-4 text-right" style={{ color: INK }}>
                      {fmtGBP(p.equityIncOriginal)}
                    </td>
                    <td
                      className="py-4 text-right pr-5 sm:pr-0 font-semibold"
                      style={{
                        color:
                          p.cumulativeCashflow >= 0 ? "#2D6A3E" : "#9C2A1D",
                      }}
                    >
                      {fmtGBP(p.cumulativeCashflow, { signed: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Factors */}
        <Section title={`Investment factors · ${scoredFactors} of 7 scored`}>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-5">
            {factors.map((f) => {
              const fb = scoreBand(f.score);
              const fg = bandFgFor(fb);
              return (
                <div
                  key={f.key as string}
                  className="grid grid-cols-[1fr_auto] items-baseline gap-x-4"
                >
                  <span className="text-sm" style={{ color: INK }}>
                    {f.label}
                  </span>
                  {f.score != null ? (
                    <span className="display tnum text-2xl" style={{ color: fg }}>
                      {f.score}
                    </span>
                  ) : (
                    <span className="text-[10px] tracking-[0.12em] uppercase" style={{ color: "#6B6256" }}>
                      Insufficient data
                    </span>
                  )}
                  <div className="col-span-2 h-px mt-2" style={{ background: "#E2DBCC" }}>
                    {f.score != null && (
                      <div
                        className="h-px"
                        style={{ width: `${f.score}%`, background: fg }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {scoredFactors < 7 && (
            <p
              className="mt-8 text-[11px] tracking-[0.12em] uppercase"
              style={{ color: ACCENT }}
            >
              Area growth, demand, BMV and tenant stability ship with Phase 3
              (Land Registry &amp; ONS Census).
            </p>
          )}
        </Section>

        {/* AI report */}
        <Section title="Analyst's note">
          {deal.ai_report_summary ? (
            <>
              <p
                className="display text-lg md:text-xl leading-[1.55] max-w-2xl"
                style={{ color: INK }}
              >
                &ldquo;{deal.ai_report_summary}&rdquo;
              </p>
              <div className="grid md:grid-cols-2 gap-x-10 gap-y-6 mt-10">
                <div>
                  <p className="eyebrow">Strengths</p>
                  <ul className="mt-3 space-y-2 text-sm" style={{ color: INK }}>
                    {(deal.ai_report_strengths ?? []).map((s, i) => (
                      <li key={i} className="grid grid-cols-[auto_1fr] gap-x-3">
                        <span style={{ color: "#2D6A3E" }}>+</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="eyebrow">Concerns</p>
                  <ul className="mt-3 space-y-2 text-sm" style={{ color: INK }}>
                    {(deal.ai_report_risks ?? []).map((r, i) => (
                      <li key={i} className="grid grid-cols-[auto_1fr] gap-x-3">
                        <span style={{ color: "#9C6B1D" }}>!</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm italic" style={{ color: "#6B6256" }}>
              AI report unavailable for this deal — refer to the figures and
              factor scores above.
            </p>
          )}
        </Section>

        {/* Actions */}
        <div className="mt-12 rule" />
        <div className="mt-6 flex flex-wrap items-center gap-6 text-xs tracking-[0.12em] uppercase">
          <a
            href={`/api/report/${deal.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline underline-offset-4"
            style={{ color: ACCENT, fontWeight: 600 }}
          >
            Export PDF
          </a>
          <span style={{ color: "#6B6256" }}>Share link — coming soon</span>
          <Link
            href="/analyse"
            className="ml-auto hover:underline underline-offset-4"
            style={{ color: INK }}
          >
            Analyse another →
          </Link>
        </div>

        <p
          className="mt-12 text-[11px] italic leading-relaxed max-w-2xl"
          style={{ color: "#6B6256" }}
        >
          This report is not financial advice. Figures are computed from the
          inputs you supplied and the published Capora methodology. You
          acknowledge under our{" "}
          <Link href="/terms" className="underline">terms</Link> that you will
          perform your own due diligence — including a RICS survey, solicitor,
          and qualified mortgage broker — before acting on this report.
        </p>

        <p
          className="mt-6 text-[10px] tracking-[0.18em] uppercase"
          style={{ color: "#6B6256" }}
        >
          Capora · Deal report · {issuedAt}
        </p>
      </div>
    </div>
  );
}

/* ────────── primitives ────────── */

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14">
      <div className="flex items-baseline justify-between gap-4">
        <h2
          className="eyebrow"
          style={{ fontSize: "12px", letterSpacing: "0.18em" }}
        >
          {title}
        </h2>
        {eyebrow && (
          <p
            className="text-[10px] tracking-[0.12em] uppercase max-w-md text-right"
            style={{ color: "#6B6256" }}
          >
            {eyebrow}
          </p>
        )}
      </div>
      <div className="mt-3 rule" />
      <div className="mt-7">{children}</div>
    </section>
  );
}

function Lockup({
  eyebrow,
  value,
  tone,
}: {
  eyebrow: string;
  value: string;
  tone?: "good" | "bad";
}) {
  const colour =
    tone === "good"
      ? "#2D6A3E"
      : tone === "bad"
        ? "#9C2A1D"
        : "var(--color-ink-deep)";
  return (
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <p
        className="display tnum mt-2 leading-none"
        style={{ fontSize: "clamp(1.6rem, 3vw, 2.25rem)", color: colour }}
      >
        {value}
      </p>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt
        className="text-[10px] tracking-[0.12em] uppercase"
        style={{ color: "#6B6256" }}
      >
        {label}
      </dt>
      <dd className="mt-1 tnum" style={{ color: INK }}>
        {value}
      </dd>
    </div>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-[#E2DBCC]">{children}</div>;
}

function Row({
  label,
  sub,
  value,
  bold,
  positive,
  negative,
}: {
  label: string;
  sub?: string;
  value: string;
  bold?: boolean;
  positive?: boolean;
  negative?: boolean;
}) {
  const colour = positive ? "#2D6A3E" : negative ? "#9C2A1D" : INK;
  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 py-3">
      <div>
        <p
          className={cn("text-sm", bold && "font-semibold")}
          style={{ color: INK }}
        >
          {label}
        </p>
        {sub && (
          <p className="text-[11px] mt-0.5" style={{ color: "#6B6256" }}>
            {sub}
          </p>
        )}
      </div>
      <p
        className={cn("tnum text-sm tabular-nums", bold && "font-semibold")}
        style={{ color: colour }}
      >
        {value}
      </p>
    </div>
  );
}

function RowGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-1">
      <p
        className="text-[10px] tracking-[0.12em] uppercase mt-2"
        style={{ color: "#6B6256" }}
      >
        {label}
      </p>
      <div className="mt-1 pl-4 border-l border-[#E2DBCC]">{children}</div>
    </div>
  );
}

function RowTotal({
  label,
  value,
  caption,
  positive,
}: {
  label: string;
  value: string;
  caption?: string;
  positive?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 pt-5 mt-2 border-t border-[#0F1419]">
      <div>
        <p className="display text-base" style={{ color: INK }}>
          {label}
        </p>
        {caption && (
          <p className="text-[11px] mt-1.5" style={{ color: "#6B6256" }}>
            {caption}
          </p>
        )}
      </div>
      <p
        className="display tnum text-xl"
        style={{
          color: positive === false ? "#9C2A1D" : INK,
        }}
      >
        {value}
      </p>
    </div>
  );
}
