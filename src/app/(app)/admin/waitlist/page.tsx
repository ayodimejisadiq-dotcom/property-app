import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  deleteWaitlistSignup,
  toggleWaitlistMode,
} from "./actions";

interface Signup {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  created_at: string;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminWaitlistPage() {
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

  const { data: settings } = await supabase
    .from("site_settings")
    .select("waitlist_mode, updated_at")
    .eq("id", true)
    .maybeSingle();

  const { data: rows, count } = await supabase
    .from("waitlist_signups")
    .select("id, email, name, source, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(500);

  const signups = (rows ?? []) as Signup[];
  const isWaitlistMode = settings?.waitlist_mode ?? true;

  // Simple CSV via data URL — no server round trip.
  const csv = [
    "email,name,source,created_at",
    ...signups.map((s) =>
      [
        s.email,
        s.name?.replace(/[",\n]/g, " ") ?? "",
        s.source ?? "",
        s.created_at,
      ]
        .map((v) => `"${v}"`)
        .join(","),
    ),
  ].join("\n");
  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 py-8">
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Admin overview
        </Link>
        <h1 className="text-2xl font-bold text-ink mt-2">Waitlist</h1>
        <p className="text-sm text-muted mt-1">
          Manage the pre-launch email capture and see who&apos;s signed up.
        </p>
      </div>

      {/* Site mode toggle */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-ink">Website mode</p>
                <span
                  className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isWaitlistMode
                      ? "bg-[var(--color-warning)]/15 text-[var(--color-warning)]"
                      : "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                  }`}
                >
                  {isWaitlistMode ? "Waitlist" : "Live"}
                </span>
              </div>
              <p className="text-sm text-muted mt-1">
                {isWaitlistMode
                  ? "The public landing page shows an email capture form. New signups can't reach the app."
                  : "The public landing page shows the full marketing site and signup is open."}
              </p>
              {settings?.updated_at && (
                <p className="text-xs text-faint mt-1">
                  Last changed {fmtDate(settings.updated_at)}
                </p>
              )}
            </div>
            <form action={toggleWaitlistMode}>
              <input
                type="hidden"
                name="mode"
                value={isWaitlistMode ? "off" : "on"}
              />
              <Button type="submit" variant={isWaitlistMode ? "primary" : "outline"}>
                {isWaitlistMode ? "Go live" : "Switch back to waitlist"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Signups list */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">
                Waitlist signups
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {count ?? signups.length} total · showing {signups.length}
              </p>
            </div>
            {signups.length > 0 && (
              <a
                href={csvHref}
                download={`capora-waitlist-${new Date()
                  .toISOString()
                  .slice(0, 10)}.csv`}
                className="inline-flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:underline"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </a>
            )}
          </div>

          {signups.length === 0 ? (
            <p className="text-sm text-muted py-8 text-center">
              No signups yet.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted uppercase tracking-wider">
                    <th className="font-medium pb-2 px-6">Email</th>
                    <th className="font-medium pb-2 px-3">Name</th>
                    <th className="font-medium pb-2 px-3">Source</th>
                    <th className="font-medium pb-2 px-3">Joined</th>
                    <th className="font-medium pb-2 px-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {signups.map((s) => (
                    <tr key={s.id} className="hover:bg-fill">
                      <td className="py-2.5 px-6 text-ink truncate max-w-[280px]">
                        {s.email}
                      </td>
                      <td className="py-2.5 px-3 text-body">
                        {s.name ?? "—"}
                      </td>
                      <td className="py-2.5 px-3 text-muted text-xs">
                        {s.source ?? "—"}
                      </td>
                      <td className="py-2.5 px-3 text-muted text-xs">
                        {fmtDate(s.created_at)}
                      </td>
                      <td className="py-2.5 px-6 text-right">
                        <form action={deleteWaitlistSignup}>
                          <input type="hidden" name="id" value={s.id} />
                          <button
                            type="submit"
                            aria-label="Remove signup"
                            className="text-muted hover:text-[var(--color-danger)]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
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
  );
}
