import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const firstName = user?.email?.split("@")[0] ?? "there";

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            Welcome back, {firstName}
          </h1>
          <p className="text-muted">
            Here&apos;s your deal analysis activity.
          </p>
        </div>
        <Link href="/analyse">
          <Button size="lg">+ Analyse New Deal</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {[
          { label: "Total Deals Analysed", value: "0" },
          { label: "Average Score", value: "—" },
          { label: "Last Analysis", value: "Never" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted">{s.label}</p>
              <p className="text-3xl font-bold text-ink mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Deals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-ink font-medium">No deals yet.</p>
            <p className="text-muted text-sm mt-1">
              Run your first analysis to get started.
            </p>
            <Link href="/analyse" className="inline-block mt-4">
              <Button>+ Analyse New Deal</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
