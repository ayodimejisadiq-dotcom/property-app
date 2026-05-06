// Zoopla ToS prohibit scraping. Same caveat as Rightmove — for production
// use a proxy or licensed API.

import * as cheerio from "cheerio";
import { fetchListingHtml } from "./fetchHtml";
import {
  type ScrapedProperty,
  extractPostcode,
  normaliseType,
  parsePoundsString,
} from "./types";

const URL_RE = /^https?:\/\/(www\.)?zoopla\.co\.uk\/(for-sale|to-rent)\/details\/\d+/i;

export function isZooplaUrl(url: string): boolean {
  return URL_RE.test(url);
}

export async function scrapeZoopla(
  url: string,
): Promise<ScrapedProperty | null> {
  if (!isZooplaUrl(url)) return null;

  const html = await fetchListingHtml(url);
  const $ = cheerio.load(html);

  // Try Zoopla's __NEXT_DATA__ first
  const nextDataRaw = $("script#__NEXT_DATA__").first().html();
  let listing: Record<string, unknown> | null = null;
  if (nextDataRaw) {
    try {
      const root = JSON.parse(nextDataRaw) as Record<string, unknown>;
      const props = (root.props as Record<string, unknown>)?.pageProps;
      const candidate =
        (props as Record<string, unknown> | undefined)?.listingDetails ??
        (props as Record<string, unknown> | undefined)?.listing ??
        (props as Record<string, unknown> | undefined)?.data;
      if (candidate && typeof candidate === "object") {
        listing = candidate as Record<string, unknown>;
      }
    } catch {
      // fall through to JSON-LD
    }
  }

  // Fallback: parse the JSON-LD product/property block
  let address: string | null = null;
  let postcode: string | null = null;
  let pricePounds: number | null = null;
  let bedrooms: number | null = null;
  let propertyType: string | null = null;

  if (listing) {
    address =
      (listing.displayAddress as string | undefined) ??
      (listing.title as string | undefined) ??
      null;
    const addr = listing.address as Record<string, unknown> | undefined;
    if (addr?.postalCode && typeof addr.postalCode === "string") {
      postcode = addr.postalCode.toUpperCase();
    }
    pricePounds =
      typeof listing.price === "number"
        ? Math.round(listing.price)
        : parsePoundsString(listing.price as string | undefined);
    bedrooms =
      typeof listing.bedrooms === "number"
        ? Math.trunc(listing.bedrooms)
        : null;
    propertyType =
      (listing.propertyType as string | undefined) ??
      (listing.category as string | undefined) ??
      null;
  }

  if (!address) {
    address =
      $("h1").first().text().trim() ||
      $('[data-testid="address-label"]').first().text().trim() ||
      "";
  }
  if (!postcode) postcode = extractPostcode(address);
  if (pricePounds == null) {
    const rawPrice = $('[data-testid="price"]').first().text().trim();
    pricePounds = parsePoundsString(rawPrice);
  }

  const isRental = /\/to-rent\//i.test(url);

  return {
    source: "zoopla",
    sourceUrl: url,
    address: address ?? "",
    postcode,
    pricePounds: isRental ? null : pricePounds,
    monthlyRentPounds: isRental ? pricePounds : null,
    bedrooms,
    propertyType: normaliseType(propertyType),
  };
}
