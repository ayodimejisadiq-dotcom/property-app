import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { computeFinancials } from "@/lib/financials";
import { runScoring } from "@/lib/scoring";
import { generateDealReport } from "@/lib/ai/dealReport";
import { FREE_TIER_MONTHLY_DEALS } from "@/lib/constants";

const PROPERTY_TYPES = [
  "terraced",
  "semi",
  "detached",
  "flat",
  "bungalow",
  "other",
] as const;

const POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

const Body = z.object({
  sourceUrl: z.string().url().nullish(),
  address: z.string().min(3, "Address required"),
  postcode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(POSTCODE_RE, "Enter a valid UK postcode"),
  pricePounds: z.number().int().min(10_000).max(10_000_000),
  bedrooms: z.number().int().min(1).max(10),
  propertyType: z.enum(PROPERTY_TYPES),
  monthlyRentPounds: z.number().int().min(100).max(50_000),
  depositPercent: z.number().min(0).max(100).default(25),
  mortgageRate: z.number().min(0).max(20).default(5.25),
  mortgageTermYears: z.number().int().min(1).max(40).default(25),
});

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid input",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Quota check (with 30-day rolling reset)
  const { data: profile } = await supabase
    .from("users")
    .select("tier, deals_used_this_month, deals_quota_resets_at")
    .eq("id", user.id)
    .single();

  let used = profile?.deals_used_this_month ?? 0;
  const resetsAt = profile?.deals_quota_resets_at
    ? new Date(profile.deals_quota_resets_at)
    : null;
  const now = new Date();
  if (!resetsAt || resetsAt <= now) {
    used = 0;
    const next = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    await supabase
      .from("users")
      .update({
        deals_used_this_month: 0,
        deals_quota_resets_at: next.toISOString(),
      })
      .eq("id", user.id);
  }

  if ((profile?.tier ?? "free") === "free" && used >= FREE_TIER_MONTHLY_DEALS) {
    return NextResponse.json(
      {
        error: `You've used all ${FREE_TIER_MONTHLY_DEALS} free reports for this month. Paid tiers coming soon.`,
        code: "QUOTA_EXCEEDED",
      },
      { status: 429 },
    );
  }

  const pricePence = data.pricePounds * 100;
  const monthlyRentPence = data.monthlyRentPounds * 100;

  const fin = computeFinancials({
    pricePence,
    monthlyRentPence,
    depositPercent: data.depositPercent,
    mortgageRate: data.mortgageRate,
    mortgageTermYears: data.mortgageTermYears,
  });

  const { composite, factors } = runScoring({
    grossYieldBps: fin.grossYieldBps,
    pricePence,
    depositPercent: data.depositPercent,
    postcode: data.postcode,
  });

  // Best-effort AI report. Fail open — saving the deal is more important than
  // the narrative, which the user can regenerate later.
  let aiReport: Awaited<ReturnType<typeof generateDealReport>> | null = null;
  try {
    aiReport = await generateDealReport({
      property: {
        address: data.address,
        postcode: data.postcode,
        bedrooms: data.bedrooms,
        propertyType: data.propertyType,
        pricePounds: data.pricePounds,
        monthlyRentPounds: data.monthlyRentPounds,
      },
      scores: { composite, ...factors },
      financials: {
        grossYieldPct: fin.grossYieldBps / 100,
        netYieldPct: fin.netYieldBps / 100,
        monthlyCashflowPence: fin.monthlyCashflow,
        monthlyMortgagePayment: fin.monthlyMortgagePayment,
        stampDuty: fin.stampDuty,
        cashRoiPct: fin.cashRoiBps / 100,
        totalAcquisitionCost: fin.totalAcquisitionCost,
      },
    });
  } catch (e) {
    console.error("AI report failed:", e);
  }

  const { data: inserted, error: insErr } = await supabase
    .from("deals")
    .insert({
      user_id: user.id,
      source_url: data.sourceUrl ?? null,
      address: data.address,
      postcode: data.postcode,
      price: pricePence,
      bedrooms: data.bedrooms,
      property_type: data.propertyType,
      monthly_rent: monthlyRentPence,
      deposit_percent: data.depositPercent,
      mortgage_rate: data.mortgageRate,
      mortgage_term_years: data.mortgageTermYears,
      composite_score: composite,
      yield_score: factors.yield,
      area_growth_score: factors.areaGrowth,
      demand_score: factors.demand,
      refinance_score: factors.refinance,
      bmv_score: factors.bmv,
      tenant_profile_score: factors.tenantProfile,
      licensing_risk_score: factors.licensingRisk,
      gross_yield_bps: fin.grossYieldBps,
      net_yield_bps: fin.netYieldBps,
      monthly_cashflow: fin.monthlyCashflow,
      stamp_duty: fin.stampDuty,
      cash_roi_bps: fin.cashRoiBps,
      total_acquisition_cost: fin.totalAcquisitionCost,
      ai_report_summary: aiReport?.summary ?? null,
      ai_report_strengths: aiReport?.strengths ?? null,
      ai_report_risks: aiReport?.risks ?? null,
      ai_report_score_band: aiReport?.scoreBand ?? null,
      ai_report_generated_at: aiReport ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (insErr || !inserted) {
    return NextResponse.json(
      { error: insErr?.message ?? "Failed to save deal" },
      { status: 500 },
    );
  }

  // Increment the monthly counter. Use a fresh read to avoid clobbering
  // concurrent writes too aggressively.
  await supabase
    .from("users")
    .update({ deals_used_this_month: used + 1 })
    .eq("id", user.id);

  await supabase.from("audit_log").insert({
    user_id: user.id,
    event_type: "deal_created",
    metadata: { deal_id: inserted.id, postcode: data.postcode },
  });

  return NextResponse.json({ id: inserted.id });
}
