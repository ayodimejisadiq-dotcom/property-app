import data from "@/lib/data/licensing.json";

type Scheme = "SELECTIVE" | "ADDITIONAL" | "HMO" | "NONE";

interface CityEntry {
  city: string;
  prefixes: string[];
  schemes: Scheme[];
  source: string;
}

const CITIES = (data.cities as CityEntry[]) ?? [];

export interface LicensingResult {
  /** 0–100, or null when the postcode isn't in our top-20 dataset */
  score: number | null;
  /** Human label for badge */
  band: "STRONG" | "MODERATE" | "WEAK" | "CHECK_MANUALLY";
  city: string | null;
  schemes: Scheme[];
  reasoning: string;
  source: string | null;
}

function outwardCode(postcode: string): string {
  return postcode.trim().toUpperCase().split(/\s+/)[0] ?? "";
}

export function scoreLicensingRisk(postcode: string): LicensingResult {
  const outward = outwardCode(postcode);
  if (!outward) {
    return {
      score: null,
      band: "CHECK_MANUALLY",
      city: null,
      schemes: [],
      reasoning:
        "Postcode missing — we couldn't check the local licensing register.",
      source: null,
    };
  }

  const match = CITIES.find((c) => c.prefixes.includes(outward));
  if (!match) {
    return {
      score: null,
      band: "CHECK_MANUALLY",
      city: null,
      schemes: [],
      reasoning: `Outside our top-20 city dataset (${outward}). Check the council's licensing pages directly.`,
      source: "https://www.gov.uk/find-licences/private-rented-property",
    };
  }

  // Score by combination of schemes
  const schemes = match.schemes.filter((s) => s !== "NONE");
  let score: number;
  if (schemes.length === 0) score = 90;
  else if (schemes.length === 1 && schemes[0] === "SELECTIVE") score = 60;
  else if (schemes.length === 1) score = 40;
  else if (schemes.length === 2) score = 35;
  else score = 20;

  const band: LicensingResult["band"] =
    score >= 70 ? "STRONG" : score >= 40 ? "MODERATE" : "WEAK";

  return {
    score,
    band,
    city: match.city,
    schemes,
    reasoning: explain(match.city, schemes),
    source: `https://${match.source}`,
  };
}

function explain(city: string, schemes: Scheme[]): string {
  if (schemes.length === 0) {
    return `No additional licensing schemes flagged for ${city} — only mandatory HMO rules apply.`;
  }
  const parts: string[] = [];
  if (schemes.includes("SELECTIVE"))
    parts.push("selective licensing covers most PRS lets");
  if (schemes.includes("ADDITIONAL"))
    parts.push("additional licensing applies to smaller HMOs");
  if (schemes.includes("HMO")) parts.push("mandatory HMO licensing applies");
  return `In ${city}: ${parts.join("; ")}. Factor licence fees and conditions into your due diligence.`;
}
