import { scrapeWithOpenAI } from "./openai";
import type { ScrapedProperty } from "./types";

export type { ScrapedProperty } from "./types";

export class UnsupportedListingError extends Error {
  constructor() {
    super("URL must be a Rightmove, Zoopla or OnTheMarket listing.");
  }
}

export class ListingFetchError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const SUPPORTED_HOST_RE =
  /^https?:\/\/(www\.)?(rightmove\.co\.uk|zoopla\.co\.uk|onthemarket\.com)\//i;

export async function scrapeListing(url: string): Promise<ScrapedProperty> {
  if (!SUPPORTED_HOST_RE.test(url)) {
    throw new UnsupportedListingError();
  }
  try {
    const result = await scrapeWithOpenAI(url);
    if (!result) {
      throw new ListingFetchError(
        "Couldn't read this listing. Switch to manual entry.",
      );
    }
    return result;
  } catch (err) {
    if (err instanceof ListingFetchError || err instanceof UnsupportedListingError) {
      throw err;
    }
    const message =
      err instanceof Error
        ? err.message
        : "Couldn't fetch this listing. Try manual entry.";
    throw new ListingFetchError(message);
  }
}
