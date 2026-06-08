// Fetch a Rightmove/Zoopla listing's HTML and regex out the property's
// lat/lng. OpenAI's web_search returns snippets, not the page source where
// these coordinates are embedded as JSON.

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const PATTERNS: RegExp[] = [
  // Rightmove PAGE_MODEL: "latitude":53.4567,"longitude":-2.1234
  /"latitude"\s*:\s*(-?\d+(?:\.\d+)?)\s*,\s*"longitude"\s*:\s*(-?\d+(?:\.\d+)?)/,
  // Zoopla / generic: "lat":53.45,"lng":-2.12 or "lon":-2.12
  /"lat"\s*:\s*(-?\d+(?:\.\d+)?)\s*,\s*"(?:lng|lon|longitude)"\s*:\s*(-?\d+(?:\.\d+)?)/,
  // Static map URL fallback: center=53.45,-2.12
  /center=(-?\d+\.\d+),(-?\d+\.\d+)/,
];

export async function extractListingCoords(
  url: string,
): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    for (const re of PATTERNS) {
      const m = html.match(re);
      if (!m) continue;
      const lat = parseFloat(m[1]);
      const lon = parseFloat(m[2]);
      if (
        Number.isFinite(lat) &&
        Number.isFinite(lon) &&
        lat > 49 &&
        lat < 61 &&
        lon > -8 &&
        lon < 2
      ) {
        return { lat, lon };
      }
    }
    return null;
  } catch {
    return null;
  }
}
