// HM Land Registry open data — two sources, both via the public SPARQL
// endpoint (no API key, OGL-licensed):
//
//   1. UK House Price Index (ukhpi) — monthly average price + sales volume
//      per local authority. Feeds the area-growth and demand factors.
//   2. Price Paid Data (ppi) — individual sold transactions. Filtered by
//      postcode sector + property type to build BMV comparables.
//
// Every function returns null on any failure — callers treat missing data
// as "factor not scorable", never as an error.

const SPARQL_ENDPOINT = "https://landregistry.data.gov.uk/landregistry/query";

// Browser-like UA — the landregistry.data.gov.uk WAF has been seen
// rejecting obviously non-browser agents.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

interface SparqlBinding {
  [variable: string]: { type: string; value: string; datatype?: string };
}

async function runSparql(
  query: string,
  label: string,
  timeoutMs: number,
): Promise<SparqlBinding[] | null> {
  try {
    const res = await fetch(SPARQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/sparql-results+json",
        "User-Agent": UA,
      },
      body: `query=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(
        `SPARQL ${label} failed: HTTP ${res.status} ${body.slice(0, 200)}`,
      );
      return null;
    }
    const json = (await res.json()) as {
      results?: { bindings?: SparqlBinding[] };
    };
    return json.results?.bindings ?? null;
  } catch (err) {
    const e = err as Error;
    console.error(`SPARQL ${label} failed: ${e.name}: ${e.message}`);
    return null;
  }
}

// UKHPI region URIs are slugified local-authority / region names,
// e.g. "Manchester" → …/id/region/manchester,
//      "City of Westminster" → …/id/region/city-of-westminster.
export function toRegionSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface HpiPoint {
  /** "YYYY-MM" */
  month: string;
  averagePricePounds: number;
  salesVolume: number | null;
}

/**
 * Monthly HPI series for a local authority (or region as fallback),
 * newest first, up to ~6.5 years — enough for 5-year growth plus a
 * 24-month sales-volume window.
 */
export async function fetchHpiSeries(
  regionName: string,
): Promise<HpiPoint[] | null> {
  const slug = toRegionSlug(regionName);
  if (!slug) return null;
  const query = `
prefix ukhpi: <http://landregistry.data.gov.uk/def/ukhpi/>
SELECT ?month ?price ?volume WHERE {
  ?obs ukhpi:refRegion <http://landregistry.data.gov.uk/id/region/${slug}> ;
       ukhpi:refMonth ?month ;
       ukhpi:averagePrice ?price .
  OPTIONAL { ?obs ukhpi:salesVolume ?volume }
}
ORDER BY DESC(?month)
LIMIT 80`;

  const bindings = await runSparql(query, `hpi:${slug}`, 15_000);
  if (!bindings || bindings.length === 0) {
    if (bindings) console.warn(`SPARQL hpi:${slug} returned 0 rows`);
    return null;
  }

  const points: HpiPoint[] = [];
  for (const b of bindings) {
    const month = (b.month?.value ?? "").slice(0, 7);
    const price = parseFloat(b.price?.value ?? "");
    if (!/^\d{4}-\d{2}$/.test(month) || !Number.isFinite(price)) continue;
    const volRaw = b.volume ? parseFloat(b.volume.value) : NaN;
    points.push({
      month,
      averagePricePounds: Math.round(price),
      salesVolume: Number.isFinite(volRaw) ? Math.round(volRaw) : null,
    });
  }
  return points.length > 0 ? points : null;
}

// PPD property-type URIs. Bungalows aren't a PPD category (they're recorded
// under their built form) and "other" is too broad — no type filter for those.
const PPD_TYPE_URI: Record<string, string | null> = {
  terraced: "http://landregistry.data.gov.uk/def/common/terraced",
  semi: "http://landregistry.data.gov.uk/def/common/semi-detached",
  detached: "http://landregistry.data.gov.uk/def/common/detached",
  flat: "http://landregistry.data.gov.uk/def/common/flat-maisonette",
  bungalow: null,
  other: null,
};

export interface SoldComp {
  pricePounds: number;
  /** "YYYY-MM-DD" */
  date: string;
}

export interface SoldCompsResult {
  comps: SoldComp[];
  level: "sector" | "outcode";
  typeFiltered: boolean;
}

/**
 * Standard (arm's-length) sold transactions in a postcode sector over the
 * last `months`, optionally filtered to the subject's property type.
 * Falls back to the whole outcode when the sector returns fewer than
 * `minComps` results.
 */
export async function fetchSoldComps(opts: {
  sector: string;
  outcode: string;
  propertyType: string;
  months?: number;
  minComps?: number;
}): Promise<SoldCompsResult | null> {
  const months = opts.months ?? 18;
  const minComps = opts.minComps ?? 5;
  const typeUri = PPD_TYPE_URI[opts.propertyType] ?? null;

  const since = new Date();
  since.setMonth(since.getMonth() - months);
  const sinceIso = since.toISOString().slice(0, 10);

  const build = (postcodePrefix: string) => `
prefix lrppi: <http://landregistry.data.gov.uk/def/ppi/>
prefix lrcommon: <http://landregistry.data.gov.uk/def/common/>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>
SELECT ?amount ?date WHERE {
  ?addr lrcommon:postcode ?pc .
  FILTER(STRSTARTS(?pc, "${postcodePrefix.replace(/"/g, "")}"))
  ?tx lrppi:propertyAddress ?addr ;
      lrppi:pricePaid ?amount ;
      lrppi:transactionDate ?date ;
      lrppi:transactionCategory <http://landregistry.data.gov.uk/def/ppi/standardPricePaidTransaction> .
  ${typeUri ? `?tx lrppi:propertyType <${typeUri}> .` : ""}
  FILTER(?date >= "${sinceIso}"^^xsd:date)
}
ORDER BY DESC(?date)
LIMIT 300`;

  const parse = (bindings: SparqlBinding[]): SoldComp[] => {
    const comps: SoldComp[] = [];
    for (const b of bindings) {
      const price = parseFloat(b.amount?.value ?? "");
      const date = (b.date?.value ?? "").slice(0, 10);
      if (Number.isFinite(price) && price > 1000 && date) {
        comps.push({ pricePounds: Math.round(price), date });
      }
    }
    return comps;
  };

  // Outward-only lookups have no inward digit — the "sector" is just the
  // outcode, so skip straight to the district-level query. The trailing
  // space in the outcode prefix stops NG3 also matching NG34.
  // The postcode-prefix scan is the endpoint's slowest query shape —
  // give it a generous timeout; results are cached for 30 days.
  if (opts.sector.includes(" ")) {
    const sectorBindings = await runSparql(
      build(opts.sector),
      `ppd:${opts.sector}`,
      25_000,
    );
    if (sectorBindings) {
      const comps = parse(sectorBindings);
      if (comps.length >= minComps) {
        return { comps, level: "sector", typeFiltered: typeUri != null };
      }
      console.warn(`SPARQL ppd:${opts.sector} returned ${comps.length} comps`);
    }
  }

  const outcodeBindings = await runSparql(
    build(`${opts.outcode} `),
    `ppd:${opts.outcode}`,
    25_000,
  );
  if (outcodeBindings) {
    const comps = parse(outcodeBindings);
    if (comps.length >= minComps) {
      return { comps, level: "outcode", typeFiltered: typeUri != null };
    }
    console.warn(`SPARQL ppd:${opts.outcode} returned ${comps.length} comps`);
  }
  return null;
}

export function medianPrice(comps: SoldComp[]): number {
  const sorted = comps.map((c) => c.pricePounds).sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}
