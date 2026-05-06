/**
 * Best-effort HTML fetch with realistic browser headers.
 *
 * NOTE: Rightmove and Zoopla actively block scrapers via Cloudflare. From
 * Vercel's IPs this will start returning 403/challenge pages within days.
 * For production reliability switch to a paid proxy (ScraperAPI etc.) or to
 * the PropertyData API. See AGENTS.md.
 */

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

export async function fetchListingHtml(url: string): Promise<string> {
  const proxy = process.env.SCRAPERAPI_KEY;
  const target = proxy
    ? `https://api.scraperapi.com/?api_key=${encodeURIComponent(
        proxy,
      )}&url=${encodeURIComponent(url)}&country_code=uk`
    : url;

  const res = await fetch(target, {
    headers: {
      "User-Agent": UA,
      "Accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-GB,en;q=0.9",
    },
    // 8s should beat Vercel's serverless timeout but still abandon dead requests
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(
      `Listing fetch returned HTTP ${res.status}. The site may be blocking scrapers.`,
    );
  }
  return await res.text();
}
