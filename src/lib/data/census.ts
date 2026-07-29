// ONS Census 2021 tenure mix (table TS054) via the Nomis API — free, no
// key. Keyed by local-authority GSS code (from postcodes.io). Feeds the
// tenant-profile factor and the demand proxy.
//
// Returns null on any failure; callers treat missing data as "factor not
// scorable". Scotland/NI local authorities aren't covered by the England &
// Wales census tables and will simply return null.

const NOMIS_TS054_URL =
  "https://www.nomisweb.co.uk/api/v01/dataset/NM_2072_1.data.json";

export interface CensusTenure {
  /** Percentage of households, 0–100 */
  privateRentedPct: number;
  socialRentedPct: number;
  ownedPct: number;
  totalHouseholds: number;
}

interface NomisObs {
  obs_value?: { value?: number | null };
  [dimension: string]:
    | { value?: number | string | null; description?: string }
    | undefined;
}

export async function fetchCensusTenure(
  gssCode: string,
): Promise<CensusTenure | null> {
  if (!/^[EW]\d{8}$/.test(gssCode)) return null;
  const url = `${NOMIS_TS054_URL}?geography=${gssCode}&measures=20100`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Capora/1.0 (capora.co.uk)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { obs?: NomisObs[] };
    if (!json.obs?.length) return null;

    let total = 0;
    let owned = 0;
    let social = 0;
    let privateRented = 0;

    for (const row of json.obs) {
      const value = row.obs_value?.value;
      if (typeof value !== "number") continue;
      // The tenure dimension key varies by dataset version — find it by
      // prefix and read the category description.
      const dimKey = Object.keys(row).find((k) =>
        k.toLowerCase().startsWith("c2021_tenure"),
      );
      const desc = dimKey
        ? String(
            (row[dimKey] as { description?: string })?.description ?? "",
          ).toLowerCase()
        : "";
      if (!desc) continue;
      if (desc.startsWith("total")) total = value;
      else if (desc.startsWith("owned") || desc.startsWith("shared ownership"))
        owned += value;
      else if (desc.startsWith("social rented")) social += value;
      else if (desc.startsWith("private rented") || desc.startsWith("lives rent free"))
        privateRented += value;
    }

    if (total <= 0) return null;
    const pct = (n: number) => Math.round((n / total) * 1000) / 10;
    return {
      privateRentedPct: pct(privateRented),
      socialRentedPct: pct(social),
      ownedPct: pct(owned),
      totalHouseholds: total,
    };
  } catch {
    return null;
  }
}
