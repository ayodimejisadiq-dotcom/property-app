import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Eye,
  FileText,
  Gauge,
  Plus,
  Sparkles,
  Trophy,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PromoCard } from "@/components/app/PromoCard";
import { cn, scoreBand, bandColor } from "@/lib/utils";
import { FREE_TIER_MONTHLY_DEALS } from "@/lib/constants";

interface Deal {
  id: string;
  address: string;
  postcode: string;
  composite_score: number | null;
  ai_report_score_band: string | null;
  created_at: string;
}

function relativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function bandPillClass(band: ReturnType<typeof scoreBand>) {
  switch (band) {
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

function bandLabel(band: ReturnType<typeof scoreBand>) {
  switch (band) {
    case "STRONG":
      return "Strong";
    case "MODERATE":
      return "Moderate";
    case "WEAK":
      return "Weak";
    default:
      return "—";
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const firstName = user?.email?.split("@")[0] ?? "there";

  const { data: profile } = await supabase
    .from("users")
    .select("deals_used_this_month")
    .eq("id", user!.id)
    .single();

  const used = profile?.deals_used_this_month ?? 0;
  const quota = FREE_TIER_MONTHLY_DEALS;

  const { data: deals } = await supabase
    .from("deals")
    .select("id, address, postcode, composite_score, ai_report_score_band, created_at")
    .order("created_at", { ascending: false });

  const allDeals: Deal[] = deals ?? [];
  const totalDeals = allDeals.length;
  const recent = allDeals.slice(0, 5);

  const scoredDeals = allDeals.filter((d) => d.composite_score != null);
  const avgScore = scoredDeals.length
    ? Math.round(
        scoredDeals.reduce((s, d) => s + (d.composite_score ?? 0), 0) /
          scoredDeals.length,
      )
    : null;

  const strongest =
    scoredDeals.length > 0
      ? scoredDeals.reduce((best, d) =>
          (d.composite_score ?? 0) > (best.composite_score ?? 0) ? d : best,
        )
      : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-ink">
              Welcome back, {firstName}
            </h1>
            <UsageChip used={used} quota={quota} />
          </div>
          <p className="text-muted mt-1">
            {totalDeals === 0
              ? "Run your first analysis to see your activity here."
              : "Here's your deal analysis activity."}
          </p>
        </div>
        <Link href="/analyse">
          <Button size="lg">
            <Plus className="h-4 w-4" />
            Analyse new deal
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          icon={FileText}
          label="Total deals"
          value={totalDeals.toString()}
        />
        <StatCard
          icon={Gauge}
          label="Average score"
          value={avgScore != null ? avgScore.toString() : "—"}
          valueClassName={
            avgScore != null
              ? bandColor(scoreBand(avgScore))
              : "text-muted"
          }
        />
        <StatCard
          icon={Trophy}
          label="Strongest deal"
          value={
            strongest && strongest.composite_score != null
              ? strongest.composite_score.toString()
              : "—"
          }
          sub={
            strongest
              ? `${strongest.postcode} · ${relativeTime(strongest.created_at)}`
              : "No deals yet"
          }
          href={strongest ? `/deals/${strongest.id}` : undefined}
        />
        <StatCard
          icon={Sparkles}
          label="This month"
          value={`${used} / ${quota}`}
          sub="reports used"
        />
      </div>

      {totalDeals === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          <RecentDeals deals={recent} />
          {totalDeals > 0 && totalDeals < 3 && (
            <PromoCard
              eyebrow="Spread the word"
              title="Refer a fellow landlord, both win."
              body="Share your code from your profile. When paid plans launch, every referral earns you a credit on top of your tier."
              ctaLabel="Get your link"
              ctaHref="/profile"
              tone="accent"
            />
          )}
        </div>
      )}
    </div>
  );
}

function UsageChip({ used, quota }: { used: number; quota: number }) {
  const ratio = used / quota;
  const tone =
    ratio >= 1
      ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/15"
      : ratio >= 0.8
        ? "bg-[var(--color-warning)]/10 text-[var(--color-warning)] hover:bg-[var(--color-warning)]/15"
        : "bg-fill text-muted hover:bg-line";
  const label =
    ratio >= 1
      ? `Quota reached — upgrade for more`
      : `${used} of ${quota} free reports used this month`;
  return (
    <Link
      href="/billing"
      className={cn(
        "text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition-colors",
        tone,
      )}
    >
      {label}
    </Link>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  valueClassName,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  valueClassName?: string;
  href?: string;
}) {
  const inner = (
    <Card
      className={cn(
        "h-full",
        href && "hover:border-[var(--color-primary)]/40 transition-colors",
      )}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">{label}</p>
          <Icon className="h-4 w-4 text-faint" />
        </div>
        <p
          className={cn(
            "text-3xl font-bold mt-1",
            valueClassName ?? "text-ink",
          )}
        >
          {value}
        </p>
        {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function EmptyState() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2 bg-gradient-to-br from-[var(--color-primary-light)]/40 to-white">
        <CardContent className="pt-8 pb-8">
          <div className="h-12 w-12 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center mb-5">
            <Plus className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-ink">
            Score your first deal
          </h2>
          <p className="text-body mt-2 max-w-md">
            Paste a Rightmove or Zoopla URL — or type the property details — and
            you&apos;ll have a 0–100 score in under a minute.
          </p>
          <ol className="mt-5 space-y-2 text-sm text-body">
            {[
              "Paste a property URL or fill the form",
              "We score the seven factors using real UK data",
              "Read your report, save it, or export a PDF",
            ].map((step, i) => (
              <li key={i} className="flex gap-2.5 items-start">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white border border-line text-muted text-xs font-semibold shrink-0">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <Link href="/analyse" className="inline-block mt-6">
            <Button size="lg">
              Analyse new deal
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-8 pb-8">
          <div className="h-12 w-12 rounded-xl bg-fill text-[var(--color-primary)] flex items-center justify-center mb-5">
            <Eye className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-ink">See what you&apos;ll get</h3>
          <p className="text-sm text-body mt-2">
            Browse a sample report on a fictional Manchester deal. No signup
            data spent.
          </p>
          <Link href="/sample" className="inline-block mt-5">
            <Button variant="outline">
              View sample deal
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function RecentDeals({ deals }: { deals: Deal[] }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink">Recent deals</h2>
          <Link
            href="/deals"
            className="text-sm text-[var(--color-primary)] font-medium hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-line">
          {deals.map((d) => {
            const band = scoreBand(d.composite_score);
            return (
              <Link
                key={d.id}
                href={`/deals/${d.id}`}
                className="flex items-center justify-between py-3 hover:bg-fill -mx-2 px-2 rounded-md"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink truncate">{d.address}</p>
                  <p className="text-xs text-muted">
                    {d.postcode} · {relativeTime(d.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      bandPillClass(band),
                    )}
                  >
                    {bandLabel(band)}
                  </span>
                  <span
                    className={cn(
                      "text-lg font-bold w-10 text-right",
                      bandColor(band),
                    )}
                  >
                    {d.composite_score ?? "—"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
