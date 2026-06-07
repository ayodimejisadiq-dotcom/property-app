import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FREE_TIER_MONTHLY_DEALS } from "@/lib/constants";

const INK = "var(--color-ink-deep)";
const ACCENT = "var(--color-accent)";

interface SearchParams {
  reason?: string;
}

const TIERS = [
  {
    key: "free",
    name: "Free",
    price: "£0",
    cadence: "forever",
    blurb: "Run a few deals a month. No card needed.",
    features: [
      `${FREE_TIER_MONTHLY_DEALS} deal reports a month`,
      "All seven factor scores",
      "Pre-tax cashflow + basic-rate post-tax estimate",
      "5-year capital-growth projection",
      "AI-written analyst's note",
      "PDF export",
    ],
  },
  {
    key: "investor",
    name: "Investor",
    price: "£39",
    cadence: "/mo",
    blurb: "For active landlords sourcing more than a few deals.",
    features: [
      "25 deal reports a month",
      "Tunable cost assumptions (insurance, maintenance %, voids)",
      "Mortgage product fee in acquisition costs",
      "Refurb scan (photos → cost estimate)",
      "Save deal comparisons",
      "Priority email support",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "£99",
    cadence: "/mo",
    blurb: "For pros and small portfolios doing volume.",
    features: [
      "Unlimited deal reports",
      "Full Section 24 tax model (basic / higher / additional rate)",
      "Sensitivity analysis (rate shocks, rent drops, voids)",
      "Mortgage stress-testing",
      "Drill-down factor reasoning with raw inputs",
      "Bulk URL import",
    ],
  },
  {
    key: "portfolio",
    name: "Portfolio",
    price: "£199",
    cadence: "/mo",
    blurb: "Teams managing 10+ properties.",
    features: [
      "Everything in Pro",
      "Portfolio-level cashflow & equity dashboard",
      "Multi-deal comparisons + ranking",
      "What-if scenario builder",
      "Up to 5 team seats",
      "API access (read-only)",
    ],
  },
] as const;

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { reason } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("users")
    .select("tier, deals_used_this_month, deals_quota_resets_at")
    .eq("id", user!.id)
    .single();

  const currentTier = profile?.tier ?? "free";
  const used = profile?.deals_used_this_month ?? 0;
  const resetsAt = profile?.deals_quota_resets_at
    ? new Date(profile.deals_quota_resets_at)
    : null;

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
      <div className="flex items-center justify-between text-[10px] tracking-[0.18em] uppercase" style={{ color: INK }}>
        <span>Capora · Plans & billing</span>
        <span className="capitalize">{currentTier} tier</span>
      </div>
      <div className="mt-3 rule" />

      <header className="pt-10 pb-12 grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-8">
          <p className="eyebrow">Plans</p>
          <h1
            className="display mt-4 leading-[1.05]"
            style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", color: INK }}
          >
            Free during early access.
          </h1>
          <p className="mt-6 text-sm text-[var(--color-body)] max-w-xl">
            The Free tier is fully active. Paid tiers — Investor, Pro,
            Portfolio — are <strong>coming soon</strong>. Register interest
            below and we&apos;ll email you the moment they go live.
          </p>
        </div>
      </header>

      {reason === "quota" && (
        <div className="mb-10 border border-[var(--color-ink-deep)] bg-[var(--color-paper-deep)] p-5">
          <p className="eyebrow" style={{ color: "var(--color-warning)" }}>Quota notice</p>
          <p className="mt-2 text-sm" style={{ color: INK }}>
            You&apos;ve used all {FREE_TIER_MONTHLY_DEALS} free reports this month.
            Quota resets on{" "}
            <strong>
              {resetsAt
                ? resetsAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                : "the 1st of next month"}
            </strong>
            . Paid tiers with bigger quotas are coming soon.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-0 border-t border-[var(--color-ink-deep)]">
        {TIERS.map((t, i) => {
          const isCurrent = t.key === currentTier;
          const isFree = t.key === "free";
          return (
            <div
              key={t.key}
              className={cn(
                "p-8 border-b border-[var(--color-line)] flex flex-col",
                i < TIERS.length - 1 && "xl:border-r xl:border-[var(--color-line)]",
                !isFree && "bg-[var(--color-paper-deep)]/40",
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="eyebrow">{t.name}</p>
                {isFree ? (
                  <span
                    className="text-[10px] tracking-[0.14em] uppercase font-semibold"
                    style={{ color: "#2D6A3E" }}
                  >
                    Available
                  </span>
                ) : (
                  <span
                    className="text-[10px] tracking-[0.14em] uppercase font-semibold"
                    style={{ color: ACCENT }}
                  >
                    Coming soon
                  </span>
                )}
              </div>
              <div className="mt-4">
                <span
                  className={cn(
                    "display tnum leading-none",
                    !isFree && "opacity-60",
                  )}
                  style={{ fontSize: "clamp(2.5rem, 5vw, 3.25rem)", color: INK }}
                >
                  {t.price}
                </span>
                <span className="text-sm ml-2 text-[var(--color-muted)]">{t.cadence}</span>
              </div>
              <p className={cn("mt-4 text-sm leading-relaxed", !isFree && "text-[var(--color-muted)]", isFree && "text-[var(--color-body)]")}>
                {t.blurb}
              </p>

              <ul className="mt-6 space-y-2.5 text-sm flex-1">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className="grid grid-cols-[auto_1fr] gap-x-3"
                    style={{ color: isFree ? "var(--color-body)" : "var(--color-muted)" }}
                  >
                    <span style={{ color: isFree ? "#2D6A3E" : "var(--color-faint)" }}>+</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {isFree ? (
                  <Button
                    variant="outline"
                    disabled={isCurrent}
                    className="w-full"
                  >
                    {isCurrent ? "You're on this plan" : "Downgrade"}
                  </Button>
                ) : (
                  <Link href={`/billing/waitlist?tier=${t.key}`} className="block">
                    <Button variant="outline" className="w-full">
                      Notify me →
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 border-t border-[var(--color-line)] pt-6 text-xs text-[var(--color-muted)] max-w-3xl">
        <p>
          <span style={{ color: INK }} className="font-semibold">Used this month:</span>{" "}
          <span className="tnum">{used} of {FREE_TIER_MONTHLY_DEALS}</span> free reports
          {resetsAt && (
            <>
              {" · resets "}
              {resetsAt.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
            </>
          )}
          .
        </p>
        <p className="mt-2">
          Registered for a paid plan? We&apos;ll email you onboarding details
          when it launches. There&apos;s nothing to pay yet.
        </p>
      </div>
    </div>
  );
}
