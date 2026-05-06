import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TIER_NAMES: Record<string, string> = {
  investor: "Investor",
  pro: "Pro",
  portfolio: "Portfolio",
};

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const { tier } = await searchParams;
  const tierName = (tier && TIER_NAMES[tier]) || "Paid";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && tier && TIER_NAMES[tier]) {
    await supabase.from("audit_log").insert({
      user_id: user.id,
      event_type: "waitlist_joined",
      metadata: { tier },
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <Card>
        <CardContent className="pt-10 pb-10 text-center">
          <div className="h-12 w-12 rounded-full bg-[var(--color-success)]/15 text-[var(--color-success)] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-ink">
            You&apos;re on the {tierName} waitlist
          </h1>
          <p className="text-muted mt-3 max-w-md mx-auto">
            We&apos;ll email{" "}
            <span className="text-ink font-medium">{user?.email}</span> the
            moment paid plans go live. No card needed yet.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/dashboard">
              <Button>Back to dashboard</Button>
            </Link>
            <Link href="/billing">
              <Button variant="outline">View other plans</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
