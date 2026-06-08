// Resolve a UK lat/lng or street address to a full postcode.
// Used because Rightmove/Zoopla hide the inward part of the postcode on
// listing pages.

interface PostcodesIoResult {
  status: number;
  result: Array<{ postcode: string; distance: number }> | null;
}

interface NominatimHit {
  lat: string;
  lon: string;
}

export async function reverseGeocodePostcode(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < 49 ||
    latitude > 61 ||
    longitude < -8 ||
    longitude > 2
  ) {
    return null;
  }

  const url = `https://api.postcodes.io/postcodes?lon=${longitude}&lat=${latitude}&limit=1&radius=500`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const json = (await res.json()) as PostcodesIoResult;
    if (json.status !== 200 || !json.result?.length) return null;
    return json.result[0].postcode.toUpperCase();
  } catch {
    return null;
  }
}

// Free-text address → lat/lng via Nominatim (OpenStreetMap). UK-biased.
export async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lon: number } | null> {
  if (!address.trim()) return null;
  const q = encodeURIComponent(`${address}, United Kingdom`);
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&countrycodes=gb&limit=1`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Capora/1.0 (capora.co.uk)" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const hits = (await res.json()) as NominatimHit[];
    if (!hits.length) return null;
    const lat = parseFloat(hits[0].lat);
    const lon = parseFloat(hits[0].lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon };
  } catch {
    return null;
  }
}
