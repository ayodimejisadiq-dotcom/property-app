import { headers } from "next/headers";
import { Sparkles, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { ReferralBlock } from "./profile-client";

async function resolveOrigin(): Promise<string> {
  const raw = process.env.NEXT_PUBLIC_APP_URL;
  if (raw) {
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  }
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "https://dealscope.app";
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: me } = await supabase
    .from("users")
    .select(
      "email, full_name, tier, referral_code, referred_by_user_id, created_at",
    )
    .eq("id", user!.id)
    .single();

  const { count: referralCount } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("referred_by_user_id", user!.id);

  let referrerEmail: string | null = null;
  if (me?.referred_by_user_id) {
    const { data: r } = await supabase
      .from("users")
      .select("email")
      .eq("id", me.referred_by_user_id)
      .single();
    referrerEmail = r?.email ?? null;
  }

  const origin = await resolveOrigin();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Your profile</h1>
        <p className="text-muted mt-1">
          Account details and referral programme.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-ink mb-4">Account</h2>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <Row label="Email" value={me?.email ?? user!.email ?? "—"} />
            <Row
              label="Plan"
              value={
                <span className="capitalize">{me?.tier ?? "free"}</span>
              }
            />
            <Row
              label="Member since"
              value={
                me?.created_at
                  ? new Date(me.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"
              }
            />
            <Row
              label="Invited by"
              value={referrerEmail ?? <span className="text-muted">—</span>}
            />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
                <Users className="h-5 w-5 text-[var(--color-primary)]" />
                Refer a fellow investor
              </h2>
              <p className="text-sm text-muted mt-1 max-w-xl">
                Share your code with another UK landlord. When paid plans go
                live, every referral earns you a bonus on top of whatever
                tier you&apos;re on.
              </p>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] whitespace-nowrap inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Bonus accruing
            </span>
          </div>

          {me?.referral_code ? (
            <ReferralBlock
              code={me.referral_code}
              origin={origin}
              referralCount={referralCount ?? 0}
            />
          ) : (
            <p className="text-sm text-muted">
              Your referral code is being generated — refresh the page in a
              moment.
            </p>
          )}

          <div className="mt-6 rounded-md bg-card border border-line p-4 text-xs text-muted leading-relaxed">
            <p className="font-medium text-ink mb-1">How it works</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Send your link or code to a UK landlord who&apos;d benefit
                from a deal score.
              </li>
              <li>They sign up and accept the disclaimer like everyone else.</li>
              <li>
                When paid tiers launch, you both get a credit on your first
                month.
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted">
        {label}
      </dt>
      <dd className="text-ink font-medium mt-0.5">{value}</dd>
    </div>
  );
}
