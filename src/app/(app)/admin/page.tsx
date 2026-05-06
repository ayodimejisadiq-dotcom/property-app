import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  Clock,
  FileSearch,
  UserPlus,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

interface AuditEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user_email?: string | null;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

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
    year: "numeric",
  });
}

function eventVerb(e: AuditEvent) {
  switch (e.event_type) {
    case "signup":
      return "signed up";
    case "disclaimer_accepted":
      return "accepted the disclaimer";
    case "deal_created":
      return "scored a deal";
    case "login":
      return "signed in";
    case "tier_changed":
      return "changed tier";
    default:
      return e.event_type.replace(/_/g, " ");
  }
}

function eventIcon(type: string) {
  switch (type) {
    case "signup":
    case "disclaimer_accepted":
      return UserPlus;
    case "deal_created":
      return FileSearch;
    case "login":
      return Activity;
    default:
      return Clock;
  }
}

function eventTone(type: string) {
  switch (type) {
    case "signup":
      return "text-[var(--color-primary)]";
    case "deal_created":
      return "text-[var(--color-success)]";
    default:
      return "text-muted";
  }
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: me } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!me?.is_admin) notFound();

  // Stats
  const { count: signupCount } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true });

  const { count: dealCount } = await supabase
    .from("deals")
    .select("id", { count: "exact", head: true });

  const sevenDaysAgo = new Date(Date.now() - SEVEN_DAYS_MS).toISOString();
  const { data: activeRows } = await supabase
    .from("audit_log")
    .select("user_id")
    .gte("created_at", sevenDaysAgo);

  const activeUsers = new Set(
    (activeRows ?? [])
      .map((r) => r.user_id as string | null)
      .filter((u): u is string => !!u),
  ).size;

  // Recent activity
  const { data: events } = await supabase
    .from("audit_log")
    .select("id, user_id, event_type, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const userIds = Array.from(
    new Set((events ?? []).map((e) => e.user_id).filter(Boolean) as string[]),
  );
  const emailMap = new Map<string, string>();
  if (userIds.length) {
    const { data: u } = await supabase
      .from("users")
      .select("id, email")
      .in("id", userIds);
    for (const row of u ?? []) emailMap.set(row.id, row.email);
  }

  const enrichedEvents: AuditEvent[] = (events ?? []).map((e) => ({
    ...e,
    user_email: e.user_id ? (emailMap.get(e.user_id) ?? null) : null,
  })) as AuditEvent[];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-ink">Admin</h1>
          <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            Read only
          </span>
        </div>
        <p className="text-muted mt-1">
          A snapshot of who&apos;s signing up, what they&apos;re analysing, and
          who&apos;s active.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <StatCard
          icon={UserPlus}
          label="Signups"
          value={(signupCount ?? 0).toString()}
          sub="all time"
        />
        <StatCard
          icon={FileSearch}
          label="Total deals scored"
          value={(dealCount ?? 0).toString()}
          sub="all time"
        />
        <StatCard
          icon={Users}
          label="Active users"
          value={activeUsers.toString()}
          sub="last 7 days"
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink">Recent activity</h2>
            <span className="text-xs text-muted">last 50 events</span>
          </div>
          {enrichedEvents.length === 0 ? (
            <p className="text-sm text-muted py-8 text-center">
              No activity yet.
            </p>
          ) : (
            <ol className="divide-y divide-line">
              {enrichedEvents.map((e) => {
                const Icon = eventIcon(e.event_type);
                const tone = eventTone(e.event_type);
                const meta = e.metadata as
                  | { postcode?: string; deal_id?: string }
                  | null;
                return (
                  <li
                    key={e.id}
                    className="flex items-start gap-3 py-3"
                  >
                    <div
                      className={`h-8 w-8 rounded-full bg-fill flex items-center justify-center shrink-0 ${tone}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink">
                        <span className="font-medium">
                          {e.user_email ?? "Unknown user"}
                        </span>{" "}
                        <span className="text-muted">{eventVerb(e)}</span>
                        {meta?.postcode && (
                          <>
                            {" "}
                            <span className="text-muted">in</span>{" "}
                            {meta.deal_id ? (
                              <Link
                                href={`/deals/${meta.deal_id}`}
                                className="text-[var(--color-primary)] hover:underline"
                              >
                                {meta.postcode}
                              </Link>
                            ) : (
                              <span className="text-ink">{meta.postcode}</span>
                            )}
                          </>
                        )}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {relativeTime(e.created_at)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">{label}</p>
          <Icon className="h-4 w-4 text-faint" />
        </div>
        <p className="text-3xl font-bold text-ink mt-1">{value}</p>
        {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}
