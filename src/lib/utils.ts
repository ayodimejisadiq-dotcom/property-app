import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function scoreBand(score: number | null | undefined):
  | "STRONG"
  | "MODERATE"
  | "WEAK"
  | "INSUFFICIENT_DATA" {
  if (score == null) return "INSUFFICIENT_DATA";
  if (score >= 70) return "STRONG";
  if (score >= 40) return "MODERATE";
  return "WEAK";
}

export function bandColor(
  band: "STRONG" | "MODERATE" | "WEAK" | "INSUFFICIENT_DATA",
) {
  switch (band) {
    case "STRONG":
      return "text-success";
    case "MODERATE":
      return "text-warning";
    case "WEAK":
      return "text-danger";
    default:
      return "text-faint";
  }
}

export function formatGBP(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(pence / 100);
}
