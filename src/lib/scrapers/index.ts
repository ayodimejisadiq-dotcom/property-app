import { isRightmoveUrl, scrapeRightmove } from "./rightmove";
import { isZooplaUrl, scrapeZoopla } from "./zoopla";
import type { ScrapedProperty } from "./types";

export type { ScrapedProperty } from "./types";

export class UnsupportedListingError extends Error {
  constructor() {
    super("URL must be a Rightmove or Zoopla listing.");
  }
}

export class ListingFetchError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export async function scrapeListing(url: string): Promise<ScrapedProperty> {
  if (isRightmoveUrl(url)) {
    const result = await scrapeRightmove(url);
    if (!result) throw new ListingFetchError("Couldn't read this Rightmove listing.");
    return result;
  }
  if (isZooplaUrl(url)) {
    const result = await scrapeZoopla(url);
    if (!result) throw new ListingFetchError("Couldn't read this Zoopla listing.");
    return result;
  }
  throw new UnsupportedListingError();
}
