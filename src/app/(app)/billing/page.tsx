import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FREE_TIER_MONTHLY_DEALS } from "@/lib/constants";

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
    cta: "Current plan",
    features: [
      `${FREE_TIER_MONTHLY_DEALS} deal reports a month`,
      "All seven factor scores",
      "AI-written deal report",
      "PDF export",
    ],
    highlight: false,
  },
  {
    key: "investor",
    name: "Investor",
    price: "£39",
    cadence: "per month",
    blurb: "For active landlords sourcing more than a few deals.",
    cta: "Join waitlist",
    features: [
      "25 deal reports a month",
      "Refurb scan (photos → cost estimate)",
      "Save deal comparisons",
      "Priority email support",
    ],
    highlight: true,
  },
  {
    key: "pro",
    name: "Pro",
    price: "£99",
    cadence: "per month",
    blurb: "For pros and small portfolios doing volume.",
    cta: "Join waitlist",
    features: [
      "Unlimited deal reports",
      "Mortgage stress-testing",
      "Drill-down factor reasoning",
      "Bulk URL import",
    ],
    highlight: false,
  },
  {
    key: "portfolio",
    name: "Portfolio",
    price: "£199",
    cadence: "per month",
    blurb: "Teams managing 10+ properties.",
    cta: "Join waitlist",
    features: [
      "Everything in Pro",
      "Up to 5 team seats",
      "Portfolio dashboard",
      "API access (read-only)",
    ],
    highlight: false,
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
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-ink">Plans &amp; billing</h1>
        <p className="text-muted mt-1">
          You&apos;re on the{" "}
          <span className="text-ink font-medium capitalize">
            {currentTier}
          </span>{" "}
          plan. Paid tiers are launching soon — join the waitlist and we&apos;ll
          email you the moment they&apos;re live.
        </p>
      </div>

      {reason === "quota" && (
        <div className="mb-6 rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 p-4 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-[var(--color-warning)] mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-ink">
              You&apos;ve used all {FREE_TIER_MONTHLY_DEALS} free reports this
              month
            </p>
            <p className="text-sm text-body mt-1">
              Quota resets on{" "}
              {resetsAt
                ? resetsAt.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "the 1st of next month"}
              {`. Need more before then? Join a paid waitlist below and we'll be in touch.`}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TIERS.map((t) => {
          const isCurrent = t.key === currentTier;
          return (
            <div
              key={t.key}
              className={cn(
                "rounded-xl border bg-white p-6 flex flex-col",
                t.highlight
                  ? "border-[var(--color-primary)] shadow-md"
                  : "border-line",
              )}
            >
              {t.highlight && (
                <span className="self-start text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white mb-3">
                  Most popular
                </span>
              )}
              <h2 className="text-lg font-bold text-ink">{t.name}</h2>
              <div className="mt-2">
                <span className="text-3xl font-bold text-ink">{t.price}</span>
                <span className="text-sm text-muted ml-1">{t.cadence}</span>
              </div>
              <p className="text-sm text-body mt-3 leading-relaxed">
                {t.blurb}
              </p>

              <ul className="mt-5 space-y-2 text-sm flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2 text-body">
                    <Check className="h-4 w-4 text-[var(--color-success)] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {t.key === "free" ? (
                  <Button
                    variant="outline"
                    disabled={isCurrent}
                    className="w-full"
                  >
                    {isCurrent ? "Current plan" : "Downgrade"}
                  </Button>
                ) : (
                  <Link
                    href={`/billing/waitlist?tier=${t.key}`}
                    className="block"
                  >
                    <Button
                      variant={t.highlight ? "primary" : "outline"}
                      className="w-full"
                    >
                      {t.cta}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-lg border border-line bg-card p-5 max-w-3xl">
        <p className="text-sm text-body">
          <span className="font-medium text-ink">Used this month:</span>{" "}
          {used} of {FREE_TIER_MONTHLY_DEALS} free reports
          {resetsAt && (
            <>
              {" "}
              · resets{" "}
              {resetsAt.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
              })}
            </>
          )}
          .
        </p>
        <p className="text-xs text-muted mt-2">
          Already on a paid waitlist? We&apos;ll email you with onboarding
          instructions when paid plans go live.
        </p>
      </div>
    </div>
  );
}
