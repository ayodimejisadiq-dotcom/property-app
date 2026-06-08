import OpenAI from "openai";
import { z } from "zod";
import {
  type ScrapedProperty,
  normaliseType,
  extractPostcode,
} from "./types";
import {
  geocodeAddress,
  reverseGeocodePostcode,
} from "@/lib/geo/reverseGeocode";
import { extractListingCoords } from "./extractCoords";

const PROPERTY_TYPES = [
  "terraced",
  "semi",
  "detached",
  "flat",
  "bungalow",
  "other",
] as const;

const ResponseSchema = z.object({
  found: z.boolean(),
  address: z.string().nullable(),
  postcode: z.string().nullable(),
  pricePounds: z.number().int().nullable(),
  bedrooms: z.number().int().nullable(),
  propertyType: z.enum(PROPERTY_TYPES).nullable(),
  monthlyRentPounds: z.number().int().nullable(),
  isRental: z.boolean().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  notes: z.string().nullable(),
});

const MODEL = "gpt-4o-mini";

const SYSTEM = `You extract structured data from UK property listings (Rightmove, Zoopla, OnTheMarket).

Use the web_search tool to fetch the URL and read the page contents. Then return ONLY a JSON object that matches this exact shape — no extra text, no markdown fences:

{
  "found": boolean,
  "address": string | null,
  "postcode": string | null,
  "pricePounds": integer | null,
  "bedrooms": integer | null,
  "propertyType": "terraced" | "semi" | "detached" | "flat" | "bungalow" | "other" | null,
  "monthlyRentPounds": integer | null,
  "isRental": boolean | null,
  "latitude": number | null,
  "longitude": number | null,
  "notes": string | null
}

Rules:
- found = true only if you actually loaded the listing and read property data. If the page didn't load, was a search/index page, or didn't contain a single property, found = false.
- pricePounds: asking price in whole pounds. For 'Offers in excess of £185,000' → 185000.
- monthlyRentPounds: only if it's clearly a rental listing (URL contains '/to-rent/' on Zoopla, or a 'pcm'/'pw' price). Convert pcw → pcm by * 4.33.
- isRental: true for to-rent listings, false for sale listings.
- propertyType: map 'Terraced' → 'terraced', 'Semi-Detached' → 'semi', 'Detached' → 'detached', 'Flat'/'Apartment'/'Maisonette' → 'flat', 'Bungalow' → 'bungalow', anything else → 'other'.
- postcode: full UK postcode (e.g. 'M19 3PT'), uppercase. Listings usually only show the outward code ('M19') — that's fine, return what's visible. Use null if you can't find one.
- latitude / longitude: extract the property's coordinates if present. Rightmove embeds them in JSON on the page (look for "latitude", "longitude" fields, or a static map URL like 'maps.googleapis.com/maps/api/staticmap?center=53.44,-2.18'). Zoopla embeds them similarly. Return null if not found. These are critical — we use them to look up the full postcode.
- Never invent data. Use null for any field you can't verify on the page.
- notes: short string explaining anything unusual (e.g. 'price is guide only', 'leasehold', 'shared ownership'). Null if nothing to flag.

Return ONLY the JSON object.`;

export async function scrapeWithOpenAI(
  url: string,
): Promise<ScrapedProperty | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const client = new OpenAI({ apiKey });

  const response = await client.responses.create({
    model: MODEL,
    tools: [{ type: "web_search_preview" }],
    input: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Extract data from this UK property listing: ${url}`,
      },
    ],
  });

  const text = (response.output_text ?? "").trim();
  if (!text) return null;

  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Sometimes the model includes prose around the JSON; grab the first JSON block
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return null;
    }
  }

  const validated = ResponseSchema.safeParse(parsed);
  if (!validated.success || !validated.data.found) return null;

  const d = validated.data;
  const source: "rightmove" | "zoopla" = url.toLowerCase().includes("zoopla")
    ? "zoopla"
    : "rightmove";

  const rawPostcode = d.postcode
    ? d.postcode.trim().toUpperCase()
    : extractPostcode(d.address ?? null);

  // Listings hide the inward part of the postcode. Three escalating attempts
  // to recover the full code:
  //   1. coords the AI extracted (rare — search snippets usually omit them)
  //   2. fetch the listing HTML ourselves and regex the embedded lat/lng
  //   3. geocode the visible address via Nominatim
  let postcode = rawPostcode;
  const hasInward = rawPostcode && /\s\d[A-Z]{2}$/.test(rawPostcode);
  if (!hasInward) {
    let coords: { lat: number; lon: number } | null =
      d.latitude != null && d.longitude != null
        ? { lat: d.latitude, lon: d.longitude }
        : null;

    if (!coords) coords = await extractListingCoords(url);
    if (!coords && d.address) coords = await geocodeAddress(d.address);

    if (coords) {
      const resolved = await reverseGeocodePostcode(coords.lat, coords.lon);
      if (resolved) postcode = resolved;
    }
  }

  return {
    source,
    sourceUrl: url,
    address: d.address ?? "",
    postcode,
    pricePounds: d.isRental ? null : d.pricePounds,
    monthlyRentPounds: d.isRental ? d.monthlyRentPounds : d.monthlyRentPounds,
    bedrooms: d.bedrooms,
    propertyType: d.propertyType ?? normaliseType(null),
  };
}
