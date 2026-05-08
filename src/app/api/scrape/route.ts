import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  ListingFetchError,
  UnsupportedListingError,
  scrapeListing,
} from "@/lib/scrapers";

const Body = z.object({ url: z.string().url() });

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

  try {
    const result = await scrapeListing(parsed.data.url);
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
