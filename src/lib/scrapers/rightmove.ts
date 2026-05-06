// Rightmove ToS prohibit scraping. This is a known limitation. For
// production reliability, set SCRAPERAPI_KEY or migrate to PropertyData API.

import * as cheerio from "cheerio";
import { fetchListingHtml } from "./fetchHtml";
import {
  type ScrapedProperty,
  extractPostcode,
  normaliseType,
} from "./types";

const URL_RE = /^https?:\/\/(www\.)?rightmove\.co\.uk\/properties\/\d+/i;

export function isRightmoveUrl(url: string): boolean {
  return URL_RE.test(url);
}

export async function scrapeRightmove(
  url: string,
): Promise<ScrapedProperty | null> {
  if (!isRightmoveUrl(url)) return null;

  const html = await fetchListingHtml(url);
  const $ = cheerio.load(html);

  const nextDataRaw = $("script#__NEXT_DATA__").first().html();
  if (!nextDataRaw) return null;

  let payload: unknown;
  try {
    payload = JSON.parse(nextDataRaw);
  } catch {
    return null;
  }

  // Rightmove rotates payload shape. Probe the most common paths.
  const property = pickPropertyData(payload);
  if (!property) return null;

  const address =
    (property.address as Record<string, unknown> | undefined)?.displayAddress ??
    property.displayAddress ??
    null;

  const outcode =
    (property.address as Record<string, unknown> | undefined)?.outcode;
  const incode =
    (property.address as Record<string, unknown> | undefined)?.incode;
  let postcode: string | null = null;
  if (typeof outcode === "string" && typeof incode === "string") {
    postcode = `${outcode.toUpperCase()} ${incode.toUpperCase()}`;
  } else if (typeof address === "string") {
    postcode = extractPostcode(address);
  }

  const price =
    pickNumber(
      (property.prices as Record<string, unknown> | undefined)?.primaryPrice,
    ) ??
    pickNumber(property.price) ??
    pickNumber(
      (property.prices as Record<string, unknown> | undefined)?.displayPrice,
    );

  const bedrooms = pickInt(property.bedrooms);

  const propertyType = normaliseType(
    typeof property.propertySubType === "string"
      ? property.propertySubType
      : typeof property.propertyType === "string"
        ? (property.propertyType as string)
        : null,
  );

  return {
    source: "rightmove",
    sourceUrl: url,
    address: typeof address === "string" ? address : "",
    postcode,
    pricePounds: price,
    bedrooms,
    propertyType,
    monthlyRentPounds: null, // Rightmove sale listings don't include rent estimates
  };
}

function pickPropertyData(p: unknown): Record<string, unknown> | null {
  if (!p || typeof p !== "object") return null;
  const root = p as Record<string, unknown>;
  const props = (root.props as Record<string, unknown>)?.pageProps;
  if (!props || typeof props !== "object") return null;
  const pp = props as Record<string, unknown>;
  if (pp.propertyData && typeof pp.propertyData === "object") {
    return pp.propertyData as Record<string, unknown>;
  }
  if (pp.property && typeof pp.property === "object") {
    return pp.property as Record<string, unknown>;
  }
  return null;
}

function pickNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.round(v);
  if (typeof v === "string") {
    const cleaned = v.replace(/[£,\s]/g, "");
    const n = parseInt(cleaned, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function pickInt(v: unknown): number | null {
  const n = pickNumber(v);
  return n != null ? Math.trunc(n) : null;
}
