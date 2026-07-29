// Resolve a full UK postcode to the geographic identifiers the area-data
// integrations key on: outcode/sector for Land Registry price-paid comps,
// the local-authority GSS code for census + house-price-index lookups, and
// the region for rent estimates.

export interface PostcodeArea {
  postcode: string;
  /** e.g. "M19" */
  outcode: string;
  /** e.g. "M19 2" — outcode + first inward digit; just the outcode when only the outward code is known */
  sector: string;
  /** True when the lookup was outward-code-only (listing hid the full postcode) */
  outwardOnly: boolean;
  /** Local authority name, e.g. "Manchester" */
  adminDistrict: string | null;
  /** Local authority GSS code, e.g. "E08000003" */
  adminDistrictCode: string | null;
  /** e.g. "North West" (null outside England) */
  region: string | null;
  /** "England" | "Scotland" | "Wales" | "Northern Ireland" */
  country: string | null;
}

interface PostcodesIoLookup {
  status: number;
  result: {
    postcode: string;
    outcode: string;
    incode: string;
    admin_district: string | null;
    region: string | null;
    country: string | null;
    codes?: { admin_district?: string | null };
  } | null;
}

const OUTWARD_ONLY_RE = /^[A-Z]{1,2}\d[A-Z\d]?$/i;

export async function lookupPostcodeArea(
  postcode: string,
): Promise<PostcodeArea | null> {
  const cleaned = postcode.trim().toUpperCase();
  if (OUTWARD_ONLY_RE.test(cleaned)) {
    return lookupOutcodeArea(cleaned);
  }
  const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(cleaned)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const json = (await res.json()) as PostcodesIoLookup;
    if (json.status !== 200 || !json.result) return null;
    const r = json.result;
    const outcode = r.outcode.toUpperCase();
    const sector = r.incode ? `${outcode} ${r.incode[0]}` : outcode;
    return {
      postcode: r.postcode.toUpperCase(),
      outcode,
      sector,
      outwardOnly: !r.incode,
      adminDistrict: r.admin_district ?? null,
      adminDistrictCode: r.codes?.admin_district ?? null,
      region: r.region ?? null,
      country: r.country ?? null,
    };
  } catch {
    return null;
  }
}

interface OutcodeLookup {
  status: number;
  result: { outcode: string; latitude: number | null; longitude: number | null } | null;
}

interface NearestPostcodesLookup {
  status: number;
  result: Array<{
    postcode: string;
    admin_district: string | null;
    region: string | null;
    country: string | null;
    codes?: { admin_district?: string | null };
  }> | null;
}

/**
 * Listings often expose only the outward code (e.g. "NG3"). Resolve the
 * outcode centroid, then borrow district/region identifiers from the
 * nearest full postcode — enough for every district-level factor.
 */
async function lookupOutcodeArea(outcode: string): Promise<PostcodeArea | null> {
  try {
    const res = await fetch(
      `https://api.postcodes.io/outcodes/${encodeURIComponent(outcode)}`,
      { signal: AbortSignal.timeout(4000) },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as OutcodeLookup;
    const centroid = json.result;
    if (json.status !== 200 || !centroid?.latitude || !centroid.longitude) {
      return null;
    }

    const nearRes = await fetch(
      `https://api.postcodes.io/postcodes?lon=${centroid.longitude}&lat=${centroid.latitude}&limit=1&radius=2000`,
      { signal: AbortSignal.timeout(4000) },
    );
    if (!nearRes.ok) return null;
    const near = (await nearRes.json()) as NearestPostcodesLookup;
    const rep = near.status === 200 ? near.result?.[0] : null;
    if (!rep) return null;

    return {
      postcode: outcode,
      outcode,
      sector: outcode, // no inward digit known — comps run at district level
      outwardOnly: true,
      adminDistrict: rep.admin_district ?? null,
      adminDistrictCode: rep.codes?.admin_district ?? null,
      region: rep.region ?? null,
      country: rep.country ?? null,
    };
  } catch {
    return null;
  }
}
