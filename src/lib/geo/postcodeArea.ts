// Resolve a full UK postcode to the geographic identifiers the area-data
// integrations key on: outcode/sector for Land Registry price-paid comps,
// the local-authority GSS code for census + house-price-index lookups, and
// the region for rent estimates.

export interface PostcodeArea {
  postcode: string;
  /** e.g. "M19" */
  outcode: string;
  /** e.g. "M19 2" — outcode + first inward digit */
  sector: string;
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

export async function lookupPostcodeArea(
  postcode: string,
): Promise<PostcodeArea | null> {
  const cleaned = postcode.trim().toUpperCase();
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
      adminDistrict: r.admin_district ?? null,
      adminDistrictCode: r.codes?.admin_district ?? null,
      region: r.region ?? null,
      country: r.country ?? null,
    };
  } catch {
    return null;
  }
}
