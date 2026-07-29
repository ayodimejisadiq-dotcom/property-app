// Orchestrates the three area-data sources (postcodes.io, Land Registry,
// ONS census) behind a shared Supabase cache so each postcode sector hits
// the slow public APIs at most once every 30 days.

import type { SupabaseClient } from "@supabase/supabase-js";
import { lookupPostcodeArea, type PostcodeArea } from "@/lib/geo/postcodeArea";
import {
  fetchHpiSeries,
  fetchSoldComps,
  medianPrice,
  type HpiPoint,
} from "@/lib/data/landRegistry";
import { fetchCensusTenure, type CensusTenure } from "@/lib/data/census";

const CACHE_TTL_DAYS = 30;
// Hard ceiling on live fetching so a slow SPARQL query can't push the
// analyse request past the serverless function limit.
const FETCH_BUDGET_MS = 14_000;

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

  if (cached?.payload) {
    return cached.payload as AreaStats;
  }

  const hpiRegion = area.adminDistrict ?? area.region ?? area.country;

  const [hpiPoints, compsResult, tenure] = await Promise.all([
    hpiRegion
      ? withTimeout(fetchHpiSeries(hpiRegion), FETCH_BUDGET_MS)
      : Promise.resolve(null),
    withTimeout(
      fetchSoldComps({
        sector: area.sector,
        outcode: area.outcode,
        propertyType,
      }),
      FETCH_BUDGET_MS,
    ),
    area.adminDistrictCode
      ? withTimeout(fetchCensusTenure(area.adminDistrictCode), FETCH_BUDGET_MS)
      : Promise.resolve(null),
  ]);

  // District-level HPI can be missing (e.g. slug mismatch) — retry once at
  // region level, which always exists for England & Wales.
  let hpi = hpiPoints ? summariseHpi(hpiPoints) : null;
  if (!hpi && area.region && area.adminDistrict) {
    const regionPoints = await withTimeout(
      fetchHpiSeries(area.region),
      FETCH_BUDGET_MS,
    );
    hpi = regionPoints ? summariseHpi(regionPoints) : null;
  }

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

  // Only cache when at least one source produced data, so transient
  // failures retry on the next analysis rather than sticking for 30 days.
  if (hpi || comps || tenure) {
    await supabase
      .from("area_stats")
      .upsert(
        { key: cacheKey, payload: stats, fetched_at: stats.fetchedAt },
        { onConflict: "key" },
      );
  }

  return stats;
}
