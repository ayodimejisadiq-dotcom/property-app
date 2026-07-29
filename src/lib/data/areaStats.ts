// Orchestrates the three area-data sources (postcodes.io, Land Registry,
// ONS census) behind a shared Supabase cache so each postcode sector hits
// the slow public APIs at most once every 30 days.

import type { SupabaseClient } from "@supabase/supabase-js";
import { lookupPostcodeArea, type PostcodeArea } from "@/lib/geo/postcodeArea";
import {
  fetchHpiSeries,
  fetchSoldComps,
  medianPrice,
  sleep,
  type HpiPoint,
} from "@/lib/data/landRegistry";
import { fetchCensusTenure, type CensusTenure } from "@/lib/data/census";

const CACHE_TTL_DAYS = 30;
// Hard ceiling on the whole Land Registry sequence so slow SPARQL queries
// can't push the analyse request past the serverless function limit
// (maxDuration 60s, minus ~15s for the AI report and DB work).
const LAND_REGISTRY_BUDGET_MS = 40_000;
const CENSUS_BUDGET_MS = 8_000;

export interface HpiStats {
  latestMonth: string;
  latestAvgPricePounds: number;
  fiveYearAgoMonth: string | null;
  fiveYearAgoAvgPricePounds: number | null;
  growth5yPct: number | null;
  /** Sales in the most recent 12 months with volume data */
  salesVolume12m: number | null;
  /** Sales in the 12 months before that */
  salesVolumePrev12m: number | null;
}

export interface CompsStats {
  medianPricePounds: number;
  count: number;
  windowMonths: number;
  level: "sector" | "outcode";
  typeFiltered: boolean;
}

export interface AreaStats {
  area: PostcodeArea;
  hpi: HpiStats | null;
  comps: CompsStats | null;
  tenure: CensusTenure | null;
  fetchedAt: string;
}

function summariseHpi(points: HpiPoint[]): HpiStats | null {
  if (points.length === 0) return null;
  // points are newest-first
  const latest = points[0];

  const [ly, lm] = latest.month.split("-").map(Number);
  const targetYear = ly - 5;
  const target = `${targetYear}-${String(lm).padStart(2, "0")}`;
  const fiveAgo =
    points.find((p) => p.month === target) ??
    points.find((p) => p.month <= target) ??
    null;

  const growth5yPct =
    fiveAgo && fiveAgo.averagePricePounds > 0
      ? Math.round(
          ((latest.averagePricePounds - fiveAgo.averagePricePounds) /
            fiveAgo.averagePricePounds) *
            1000,
        ) / 10
      : null;

  // Volume data lags and recent months can be unbound — use the newest 24
  // months that actually have volumes.
  const withVolume = points.filter((p) => p.salesVolume != null);
  let salesVolume12m: number | null = null;
  let salesVolumePrev12m: number | null = null;
  if (withVolume.length >= 18) {
    salesVolume12m = withVolume
      .slice(0, 12)
      .reduce((s, p) => s + (p.salesVolume ?? 0), 0);
    salesVolumePrev12m = withVolume
      .slice(12, 24)
      .reduce((s, p) => s + (p.salesVolume ?? 0), 0);
    if (withVolume.length < 24) {
      // Scale a short prior window up to 12 months for a fair comparison.
      const prevMonths = withVolume.length - 12;
      salesVolumePrev12m = Math.round((salesVolumePrev12m / prevMonths) * 12);
    }
  }

  return {
    latestMonth: latest.month,
    latestAvgPricePounds: latest.averagePricePounds,
    fiveYearAgoMonth: fiveAgo?.month ?? null,
    fiveYearAgoAvgPricePounds: fiveAgo?.averagePricePounds ?? null,
    growth5yPct,
    salesVolume12m,
    salesVolumePrev12m,
  };
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    p,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

/**
 * Area statistics for a postcode + property type, cache-first.
 * Returns null only when the postcode itself can't be resolved.
 */
export async function getAreaStats(
  supabase: SupabaseClient,
  postcode: string,
  propertyType: string,
): Promise<AreaStats | null> {
  const area = await lookupPostcodeArea(postcode);
  if (!area) return null;

  const cacheKey = `${area.sector}|${propertyType}`;
  const minFetchedAt = new Date(
    Date.now() - CACHE_TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: cached } = await supabase
    .from("area_stats")
    .select("payload, fetched_at")
    .eq("key", cacheKey)
    .gte("fetched_at", minFetchedAt)
    .maybeSingle();

  // Serve the cache only when the Land Registry data is present — a
  // payload cached during a transient SPARQL failure would otherwise pin
  // "insufficient data" on this sector for the whole TTL.
  if (cached?.payload) {
    const p = cached.payload as AreaStats;
    if (p.hpi && p.comps) return p;
  }

  // The Land Registry endpoint rate-limits per IP, so its two queries run
  // SEQUENTIALLY with spacing. The census (Nomis) call is a different host
  // and can safely run alongside.
  const landRegistrySequence = (async () => {
    const hpiPoints = await fetchHpiSeries([
      area.adminDistrict,
      area.region,
      area.country,
    ]);
    await sleep(600);
    const compsResult = await fetchSoldComps({
      sector: area.sector,
      outcode: area.outcode,
      propertyType,
    });
    return { hpiPoints, compsResult };
  })();

  const [lr, tenure] = await Promise.all([
    withTimeout(landRegistrySequence, LAND_REGISTRY_BUDGET_MS),
    area.adminDistrictCode
      ? withTimeout(fetchCensusTenure(area.adminDistrictCode), CENSUS_BUDGET_MS)
      : Promise.resolve(null),
  ]);

  const hpiPoints = lr?.hpiPoints ?? null;
  const compsResult = lr?.compsResult ?? null;
  const hpi = hpiPoints ? summariseHpi(hpiPoints) : null;

  const comps: CompsStats | null = compsResult
    ? {
        medianPricePounds: medianPrice(compsResult.comps),
        count: compsResult.comps.length,
        windowMonths: 18,
        level: compsResult.level,
        typeFiltered: compsResult.typeFiltered,
      }
    : null;

  const stats: AreaStats = {
    area,
    hpi,
    comps,
    tenure: tenure ?? null,
    fetchedAt: new Date().toISOString(),
  };

  console.warn(
    `area_stats ${cacheKey}: hpi=${hpi ? "ok" : "none"} comps=${comps ? comps.count : "none"} tenure=${tenure ? "ok" : "none"}`,
  );

  // Cache only complete Land Registry results — partial payloads (e.g. a
  // transient SPARQL failure) must retry on the next analysis, not stick
  // for 30 days. Tenure is cheap to refetch, so it doesn't gate caching.
  if (hpi && comps) {
    await supabase
      .from("area_stats")
      .upsert(
        { key: cacheKey, payload: stats, fetched_at: stats.fetchedAt },
        { onConflict: "key" },
      );
  }

  return stats;
}
