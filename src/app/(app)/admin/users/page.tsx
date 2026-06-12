import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, RotateCcw, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { changeTier, deleteDeal, resetQuota } from "./actions";

const TIERS = ["free", "investor", "pro", "portfolio"] as const;

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  tier: string;
  deals_used_this_month: number;
  scrapes_used_this_month: number | null;
  deals_quota_resets_at: string | null;
  referral_code: string | null;
  referred_by_user_id: string | null;
  created_at: string;
}

interface DealRow {
  id: string;
  address: string | null;
  postcode: string | null;
  price_pence: number | null;
  composite_score: number | null;
  created_at: string;
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtPrice(pence: number | null) {
  if (pence == null) return "—";
  return `£${Math.round(pence / 100).toLocaleString("en-GB")}`;
}

function scoreTone(score: number | null) {
  if (score == null) return "text-muted";
  if (score >= 70) return "text-[var(--color-success)]";
  if (score >= 50) return "text-[var(--color-warning)]";
  return "text-[var(--color-danger)]";
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string; q?: string }>;
}) {
  const { u: selectedId, q } = await searchParams;

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

  let listQuery = supabase
    .from("users")
    .select(
      "id, email, full_name, is_admin, tier, deals_used_this_month, scrapes_used_this_month, deals_quota_resets_at, referral_code, referred_by_user_id, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (q) listQuery = listQuery.ilike("email", `%${q}%`);

  const { data: usersData } = await listQuery;
  const users = (usersData ?? []) as UserRow[];

  const selected =
    users.find((x) => x.id === selectedId) ??
    (selectedId
      ? ((
          await supabase
            .from("users")
            .select(
              "id, email, full_name, is_admin, tier, deals_used_this_month, scrapes_used_this_month, deals_quota_resets_at, referral_code, referred_by_user_id, created_at",
            )
            .eq("id", selectedId)
            .single()
        ).data as UserRow | null)
      : users[0] ?? null);

  let deals: DealRow[] = [];
  let referrer: { email: string; id: string } | null = null;
  let referralCount = 0;

  if (selected) {
    const { data: dealsData } = await supabase
      .from("deals")
      .select("id, address, postcode, price_pence, composite_score, created_at")
      .eq("user_id", selected.id)
      .order("created_at", { ascending: false })
      .limit(100);
    deals = (dealsData ?? []) as DealRow[];

    if (selected.referred_by_user_id) {
      const { data: r } = await supabase
        .from("users")
        .select("id, email")
        .eq("id", selected.referred_by_user_id)
        .single();
      referrer = (r as { id: string; email: string } | null) ?? null;
    }

    const { count } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("referred_by_user_id", selected.id);
    referralCount = count ?? 0;
  }

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Admin overview
          </Link>
          <h1 className="text-2xl font-bold text-ink mt-2">Users</h1>
          <p className="text-sm text-muted mt-1">
            {users.length} {users.length === 1 ? "user" : "users"} shown.
            Click a row to see their searches and details.
          </p>
        </div>
        <form className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search email…"
            className="h-9 rounded-md border border-line bg-white px-3 text-sm w-48 sm:w-64"
          />
          {selected && (
            <input type="hidden" name="u" value={selected.id} />
          )}
          <Button type="submit" size="sm" variant="outline">
            Search
          </Button>
        </form>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Users list */}
        <Card className="h-fit lg:sticky lg:top-20">
          <CardContent className="p-0">
            <ol className="divide-y divide-line max-h-[70vh] overflow-y-auto">
              {users.length === 0 && (
                <li className="p-6 text-sm text-muted text-center">
                  No users match.
                </li>
              )}
              {users.map((u) => {
                const isActive = selected?.id === u.id;
                const params = new URLSearchParams();
                params.set("u", u.id);
                if (q) params.set("q", q);
                return (
                  <li key={u.id}>
                    <Link
                      href={`/admin/users?${params.toString()}`}
                      className={`block px-4 py-3 hover:bg-fill transition-colors ${
                        isActive ? "bg-fill" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-ink truncate">
                          {u.email}
                        </p>
                        <span
                          className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            u.tier === "free"
                              ? "bg-fill text-muted"
                              : "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                          }`}
                        >
                          {u.tier}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        {fmtDate(u.created_at)} · {u.deals_used_this_month}/mo
                        {u.is_admin && " · admin"}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>

        {/* Selected user detail */}
        {selected ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-ink">
                      {selected.full_name || selected.email}
                    </h2>
                    <p className="text-sm text-muted mt-0.5">
                      {selected.email}
                    </p>
                    <p className="text-xs text-faint mt-1">
                      Joined {fmtDate(selected.created_at)} · ID{" "}
                      <code className="text-[11px]">{selected.id}</code>
                    </p>
                  </div>
                  {selected.is_admin && (
                    <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] self-start">
                      Admin
                    </span>
                  )}
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-line">
                  <Stat
                    label="Current tier"
                    value={selected.tier}
                  />
                  <Stat
                    label="Reports this month"
                    value={String(selected.deals_used_this_month)}
                  />
                  <Stat
                    label="Scrapes this month"
                    value={String(selected.scrapes_used_this_month ?? 0)}
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mt-4">
                  <Stat
                    label="Quota resets"
                    value={fmtDate(selected.deals_quota_resets_at)}
                  />
                  <Stat
                    label="Referral code"
                    value={selected.referral_code ?? "—"}
                  />
                  <Stat
                    label="People they referred"
                    value={String(referralCount)}
                  />
                </div>

                {referrer && (
                  <p className="text-sm text-muted mt-4">
                    Referred by{" "}
                    <Link
                      href={`/admin/users?u=${referrer.id}`}
                      className="text-[var(--color-primary)] hover:underline"
                    >
                      {referrer.email}
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Admin actions */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
                  Admin actions
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 flex-wrap">
                  <form action={changeTier} className="flex items-end gap-2">
                    <input type="hidden" name="userId" value={selected.id} />
                    <div>
                      <label className="block text-xs text-muted mb-1">
                        Change tier
                      </label>
                      <select
                        name="tier"
                        defaultValue={selected.tier}
                        className="h-9 rounded-md border border-line bg-white px-2 text-sm"
                      >
                        {TIERS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button type="submit" size="sm" variant="outline">
                      Save
                    </Button>
                  </form>

                  <form action={resetQuota}>
                    <input type="hidden" name="userId" value={selected.id} />
                    <Button type="submit" size="sm" variant="outline">
                      <RotateCcw className="h-4 w-4" />
                      Reset monthly quota
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>

            {/* Searches / deals */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-ink">
                    Searches &amp; scores
                  </h3>
                  <span className="text-xs text-muted">
                    {deals.length} {deals.length === 1 ? "deal" : "deals"}
                  </span>
                </div>
                {deals.length === 0 ? (
                  <p className="text-sm text-muted py-6 text-center">
                    No deals scored yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-muted uppercase tracking-wider">
                          <th className="font-medium pb-2 px-6">Address</th>
                          <th className="font-medium pb-2 px-3">Postcode</th>
                          <th className="font-medium pb-2 px-3">Price</th>
                          <th className="font-medium pb-2 px-3">Score</th>
                          <th className="font-medium pb-2 px-3">Scored</th>
                          <th className="font-medium pb-2 px-6"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {deals.map((d) => (
                          <tr key={d.id} className="hover:bg-fill">
                            <td className="py-2.5 px-6 text-ink truncate max-w-[260px]">
                              {d.address ?? "—"}
                            </td>
                            <td className="py-2.5 px-3 text-body">
                              {d.postcode ?? "—"}
                            </td>
                            <td className="py-2.5 px-3 text-body">
                              {fmtPrice(d.price_pence)}
                            </td>
                            <td
                              className={`py-2.5 px-3 font-semibold ${scoreTone(d.composite_score)}`}
                            >
                              {d.composite_score ?? "—"}
                            </td>
                            <td className="py-2.5 px-3 text-muted text-xs">
                              {fmtDate(d.created_at)}
                            </td>
                            <td className="py-2.5 px-6">
                              <div className="flex items-center gap-2 justify-end">
                                <Link
                                  href={`/deals/${d.id}`}
                                  className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
                                >
                                  Open
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                                <form action={deleteDeal}>
                                  <input
                                    type="hidden"
                                    name="dealId"
                                    value={d.id}
                                  />
                                  <button
                                    type="submit"
                                    aria-label="Delete deal"
                                    className="text-xs text-muted hover:text-[var(--color-danger)]"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </form>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center text-sm text-muted">
              Select a user to see their details.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-medium text-ink mt-0.5 capitalize">{value}</p>
    </div>
  );
}
