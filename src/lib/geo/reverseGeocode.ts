// Reverse-geocode a UK lat/lng to its full postcode via postcodes.io.
// Free, official ONS data, no API key. Used because Rightmove/Zoopla
// listings hide the inward part of the postcode on the page itself.

interface PostcodesIoResult {
  status: number;
  result: Array<{ postcode: string; distance: number }> | null;
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
    const res = await fetch(url, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as PostcodesIoResult;
    if (json.status !== 200 || !json.result?.length) return null;
    return json.result[0].postcode.toUpperCase();
  } catch {
    return null;
  }
}
