export type PropertyType =
  | "terraced"
  | "semi"
  | "detached"
  | "flat"
  | "bungalow"
  | "other";

export interface ScrapedProperty {
  source: "rightmove" | "zoopla";
  sourceUrl: string;
  address: string;
  postcode: string | null;
  pricePounds: number | null;
  bedrooms: number | null;
  propertyType: PropertyType | null;
  monthlyRentPounds: number | null;
}

export function normaliseType(raw: string | null | undefined): PropertyType {
  if (!raw) return "other";
  const s = raw.toLowerCase();
  if (s.includes("terrace")) return "terraced";
  if (s.includes("semi")) return "semi";
  if (s.includes("detached")) return "detached";
  if (s.includes("flat") || s.includes("apartment") || s.includes("maisonette"))
    return "flat";
  if (s.includes("bungalow")) return "bungalow";
  return "other";
}

const POSTCODE_RE = /\b([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})\b/i;

export function extractPostcode(text: string | null | undefined): string | null {
  if (!text) return null;
  const m = text.match(POSTCODE_RE);
  if (!m) return null;
  return `${m[1].toUpperCase()} ${m[2].toUpperCase()}`;
}

export function parsePoundsString(s: string | null | undefined): number | null {
  if (!s) return null;
  const cleaned = s.replace(/[£,\s]/g, "");
  const n = parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : null;
}
