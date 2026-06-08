import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  DealsListClient,
  type DealListItem,
} from "@/components/app/DealsListClient";

export default async function DealsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("deals")
    .select(
      "id, address, postcode, composite_score, gross_yield_bps, monthly_cashflow, created_at",
    )
    .order("created_at", { ascending: false });

  const deals = (data ?? []) as DealListItem[];

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-ink">Saved deals</h1>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-fill text-muted">
              {deals.length} {deals.length === 1 ? "deal" : "deals"}
            </span>
          </div>
          <p className="text-muted mt-1">
            Every property you&apos;ve scored. Search, filter, and revisit any
            of them.
          </p>
        </div>
        <Link href="/analyse">
          <Button>
            <Plus className="h-4 w-4" />
            Analyse new deal
          </Button>
        </Link>
      </div>

      <DealsListClient deals={deals} />
    </div>
  );
}
