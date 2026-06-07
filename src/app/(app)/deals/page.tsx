import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  DealsListClient,
  type DealListItem,
} from "@/components/app/DealsListClient";

const INK = "var(--color-ink-deep)";

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
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
      <div className="flex items-center justify-between text-[10px] tracking-[0.18em] uppercase" style={{ color: INK }}>
        <span>Capora · Saved deals</span>
        <span className="tnum">{deals.length} {deals.length === 1 ? "deal" : "deals"}</span>
      </div>
      <div className="mt-3 rule" />

      <header className="pt-10 pb-10 grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 md:col-span-8">
          <p className="eyebrow">Archive</p>
          <h1
            className="display mt-4 leading-[1.05]"
            style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", color: INK }}
          >
            Every deal you&apos;ve scored.
          </h1>
          <p className="mt-5 text-sm text-[var(--color-body)] max-w-md">
            Search, filter, and revisit any of them.
          </p>
        </div>
        <div className="col-span-12 md:col-span-4 md:text-right">
          <Link href="/analyse">
            <Button variant="primary" size="lg">+ Analyse new deal</Button>
          </Link>
        </div>
      </header>

      <DealsListClient deals={deals} />
    </div>
  );
}
