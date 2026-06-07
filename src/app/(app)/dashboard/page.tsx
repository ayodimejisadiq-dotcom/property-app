import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { cn, scoreBand } from "@/lib/utils";
import { FREE_TIER_MONTHLY_DEALS } from "@/lib/constants";

const INK = "var(--color-ink-deep)";
const ACCENT = "var(--color-accent)";

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

function bandFg(b: ReturnType<typeof scoreBand>) {
  switch (b) {
    case "STRONG": return "#2D6A3E";
    case "MODERATE": return "#9C6B1D";
    case "WEAK": return "#9C2A1D";
    default: return "#6B6256";
  }
}

function bandWord(b: ReturnType<typeof scoreBand>) {
  switch (b) {
    case "STRONG": return "Strong";
    case "MODERATE": return "Moderate";
    case "WEAK": return "Weak";
    default: return "—";
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

  const strongest = scoredDeals.length > 0
    ? scoredDeals.reduce((best, d) =>
        (d.composite_score ?? 0) > (best.composite_score ?? 0) ? d : best,
      )
    : null;

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
      {/* Masthead */}
      <div className="flex items-center justify-between text-[10px] tracking-[0.18em] uppercase" style={{ color: INK }}>
        <span>Capora · Dashboard</span>
        <Link href="/billing" className="hover:underline underline-offset-4">
          {used >= quota ? "Quota reached · Upgrade" : `${used}/${quota} reports used`}
        </Link>
      </div>
      <div className="mt-3 rule" />

      {/* Hero */}
      <header className="pt-10 pb-12 grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 md:col-span-8">
          <p className="eyebrow">Welcome back</p>
          <h1
            className="display mt-4 leading-[1.05] capitalize"
            style={{ fontSize: "clamp(2.5rem, 5.5vw, 4rem)", color: INK }}
          >
            {firstName}.
          </h1>
          <p className="mt-5 text-sm text-[var(--color-body)] max-w-md">
            {totalDeals === 0
              ? "Run your first analysis to see your activity here."
              : "Your deal analysis activity."}
          </p>
        </div>
        <div className="col-span-12 md:col-span-4 md:text-right">
          <Link href="/analyse">
            <Button variant="primary" size="lg">
              + Analyse new deal
            </Button>
          </Link>
        </div>
      </header>

      {/* Stats */}
      <section className="border-t border-[var(--color-ink-deep)] pt-8 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
        <Stat label="Total deals" value={totalDeals.toString()} />
        <Stat
          label="Average score"
          value={avgScore != null ? avgScore.toString() : "—"}
          colour={avgScore != null ? bandFg(scoreBand(avgScore)) : undefined}
        />
        <Stat
          label="Strongest"
          value={
            strongest && strongest.composite_score != null
              ? strongest.composite_score.toString()
              : "—"
          }
          sub={strongest ? `${strongest.postcode} · ${relativeTime(strongest.created_at)}` : "No deals yet"}
          href={strongest ? `/deals/${strongest.id}` : undefined}
        />
        <Stat
          label="This month"
          value={`${used}/${quota}`}
          sub="reports used"
        />
      </section>

      {/* Recent */}
      {totalDeals === 0 ? (
        <EmptyState />
      ) : (
        <section className="mt-16">
          <div className="flex items-baseline justify-between">
            <p className="eyebrow">Recent deals</p>
            <Link
              href="/deals"
              className="text-[11px] tracking-[0.14em] uppercase font-semibold hover:underline underline-offset-4"
              style={{ color: INK }}
            >
              View all →
            </Link>
          </div>
          <div className="mt-3 rule" />
          <ul className="mt-2 divide-y divide-[var(--color-line)]">
            {recent.map((d) => {
              const band = scoreBand(d.composite_score);
              return (
                <li key={d.id}>
                  <Link
                    href={`/deals/${d.id}`}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-6 py-5 group"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm" style={{ color: INK }}>
                        {d.address}
                      </p>
                      <p className="text-[11px] tracking-[0.12em] uppercase mt-1 text-[var(--color-muted)]">
                        {d.postcode} · {relativeTime(d.created_at)}
                      </p>
                    </div>
                    <span
                      className="text-[10px] tracking-[0.14em] uppercase font-semibold"
                      style={{ color: bandFg(band) }}
                    >
                      {bandWord(band)}
                    </span>
                    <span
                      className="display tnum text-3xl w-14 text-right group-hover:underline underline-offset-4"
                      style={{ color: bandFg(band) }}
                    >
                      {d.composite_score ?? "—"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  colour,
  href,
}: {
  label: string;
  value: string;
  sub?: string;
  colour?: string;
  href?: string;
}) {
  const inner = (
    <div>
      <p className="eyebrow">{label}</p>
      <p
        className="display tnum mt-2"
        style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", color: colour ?? INK, lineHeight: 1 }}
      >
        {value}
      </p>
      {sub && (
        <p className="mt-2 text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)]">
          {sub}
        </p>
      )}
    </div>
  );
  return href ? <Link href={href} className="block group">{inner}</Link> : inner;
}

function EmptyState() {
  return (
    <section className="mt-16 border-t border-[var(--color-ink-deep)] pt-10 grid md:grid-cols-3 gap-x-10 gap-y-8">
      <div className="md:col-span-2">
        <p className="eyebrow">Get started</p>
        <h2
          className="display mt-4 leading-[1.05]"
          style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", color: INK }}
        >
          Score your first deal.
        </h2>
        <p className="mt-4 text-sm text-[var(--color-body)] max-w-lg">
          Paste a Rightmove or Zoopla URL — or type the property details — and
          you&apos;ll have a 0–100 score in under a minute.
        </p>
        <ol className="mt-7 space-y-3 text-sm text-[var(--color-body)]">
          {[
            "Paste a property URL or fill the form.",
            "We score the seven factors using real UK data.",
            "Read the analyst's note, save it, or export a PDF.",
          ].map((step, i) => (
            <li key={i} className="grid grid-cols-[auto_1fr] gap-x-4">
              <span className="tnum text-xs tracking-[0.14em]" style={{ color: ACCENT }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <Link href="/analyse" className="inline-block mt-8">
          <Button variant="primary" size="lg">Analyse new deal →</Button>
        </Link>
      </div>
      <div className="md:border-l md:border-[var(--color-line)] md:pl-10">
        <p className="eyebrow">Sample</p>
        <p className="mt-4 text-sm text-[var(--color-body)]">
          Browse a sample report on a fictional Manchester deal. No quota
          spent.
        </p>
        <Link href="/sample" className="inline-block mt-6">
          <Button variant="outline">View sample →</Button>
        </Link>
      </div>
    </section>
  );
}
