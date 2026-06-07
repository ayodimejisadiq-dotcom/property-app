import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  ListingFetchError,
  UnsupportedListingError,
  scrapeListing,
} from "@/lib/scrapers";
import { FREE_TIER_MONTHLY_DEALS } from "@/lib/constants";

const Body = z.object({ url: z.string().url() });

// Free-tier scrape cap. Set 4x the deal quota so users can preview a few
// listings without burning their 5/month report quota.
const FREE_TIER_MONTHLY_SCRAPES = FREE_TIER_MONTHLY_DEALS * 4;

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Per-tier monthly cap on scrapes — protects OpenAI spend from abuse.
  // Reuses the same monthly reset window as the deal quota.
  const { data: profile } = await supabase
    .from("users")
    .select("tier, scrapes_used_this_month, deals_quota_resets_at")
    .eq("id", user.id)
    .single();

  let used = profile?.scrapes_used_this_month ?? 0;
  const resetsAt = profile?.deals_quota_resets_at
    ? new Date(profile.deals_quota_resets_at)
    : null;
  if (resetsAt && resetsAt <= new Date()) {
    used = 0; // window expired; /api/analyse will roll the deal counter too.
  }

  if ((profile?.tier ?? "free") === "free" && used >= FREE_TIER_MONTHLY_SCRAPES) {
    return NextResponse.json(
      {
        error: `You've used all ${FREE_TIER_MONTHLY_SCRAPES} URL fetches for this month. Paid tiers will lift this cap.`,
        code: "QUOTA_EXCEEDED",
      },
      { status: 429 },
    );
  }

  try {
    const result = await scrapeListing(parsed.data.url);
    // Increment only on success so failed/blocked fetches don't burn quota.
    await supabase
      .from("users")
      .update({ scrapes_used_this_month: used + 1 })
      .eq("id", user.id);
    return NextResponse.json({ data: result });
  } catch (err) {
    if (err instanceof UnsupportedListingError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof ListingFetchError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    const message =
      err instanceof Error ? err.message : "Couldn't fetch this listing.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
