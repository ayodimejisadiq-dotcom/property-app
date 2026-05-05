export type PropertyType =
  | "terraced"
  | "semi"
  | "detached"
  | "flat"
  | "bungalow"
  | "other";

export type ScoreBand = "STRONG" | "MODERATE" | "WEAK" | "INSUFFICIENT_DATA";

export type Tier = "free" | "investor" | "pro" | "portfolio";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  disclaimer_accepted_at: string | null;
  disclaimer_version: string | null;
  tier: Tier;
  deals_used_this_month: number;
}
