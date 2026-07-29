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
    // Outside the top-20 city dataset. Most English councils run no scheme
    // beyond mandatory HMO licensing, so score a cautious neutral rather
    // than dropping the factor — but keep the check-manually band so the
    // UI tells the user to verify with the council.
    return {
      score: 70,
      band: "CHECK_MANUALLY",
      city: null,
      schemes: [],
      reasoning: `${outward} isn't in our licensing dataset of the 20 largest rental markets. Most councils only apply mandatory HMO licensing, so we've assumed a cautious neutral score — verify selective/additional schemes on the council's licensing pages.`,
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
