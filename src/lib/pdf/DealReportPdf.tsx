/* eslint-disable jsx-a11y/alt-text */
import * as React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Svg,
  Text,
  View,
  Circle,
  Line,
} from "@react-pdf/renderer";

const colours = {
  primary: "#4F46E5",
  accent: "#14B8A6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  ink: "#111827",
  body: "#374151",
  muted: "#6B7280",
  faint: "#9CA3AF",
  line: "#E5E7EB",
  card: "#FAFAFA",
};

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    color: colours.body,
    fontFamily: "Helvetica",
  },
  band: {
    marginBottom: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: colours.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  brandMark: {
    width: 18,
    height: 18,
    backgroundColor: colours.primary,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  brandText: {
    fontSize: 11,
    fontWeight: "bold",
    color: colours.ink,
  },
  reportMeta: {
    fontSize: 8,
    color: colours.muted,
    textAlign: "right",
  },
  hero: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colours.line,
  },
  heroLeft: { flex: 1 },
  postcode: { color: colours.muted, fontSize: 8, marginBottom: 2 },
  address: {
    fontSize: 14,
    fontWeight: "bold",
    color: colours.ink,
    marginBottom: 2,
  },
  meta: { color: colours.muted, fontSize: 8 },
  scoreCol: { alignItems: "flex-end" },
  scoreBig: { fontSize: 32, fontWeight: "bold", color: colours.ink },
  scoreSub: {
    fontSize: 7,
    color: colours.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  bandPill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    fontSize: 7,
    marginTop: 6,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 8,
    color: colours.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  twoCol: { flexDirection: "row", gap: 12, marginBottom: 14 },
  col: { flex: 1 },
  tileRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tile: {
    width: "48%",
    padding: 8,
    backgroundColor: colours.card,
    borderLeftWidth: 3,
    borderLeftColor: colours.success,
    borderRadius: 3,
  },
  tileLabel: { fontSize: 7, color: colours.muted },
  tileValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: colours.ink,
    marginTop: 1,
  },
  tileSub: { fontSize: 6, color: colours.muted, marginTop: 1 },
  factorRow: { marginBottom: 6 },
  factorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    marginBottom: 2,
  },
  factorBarTrack: {
    height: 3,
    backgroundColor: colours.line,
    borderRadius: 2,
  },
  factorBarFill: { height: 3, borderRadius: 2 },
  bullet: {
    flexDirection: "row",
    marginBottom: 3,
    fontSize: 8,
    lineHeight: 1.4,
  },
  bulletDot: { width: 6, color: colours.success },
  summary: {
    fontSize: 9,
    lineHeight: 1.5,
    color: colours.body,
    marginBottom: 10,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colours.line,
    fontSize: 7,
    color: colours.muted,
    lineHeight: 1.4,
    fontStyle: "italic",
  },
});

interface DealLike {
  address: string;
  postcode: string;
  price: number;
  bedrooms: number;
  property_type: string;
  monthly_rent: number;
  deposit_percent: number;
  mortgage_rate: number;
  mortgage_term_years: number;
  composite_score: number | null;
  yield_score: number | null;
  area_growth_score: number | null;
  demand_score: number | null;
  refinance_score: number | null;
  bmv_score: number | null;
  tenant_profile_score: number | null;
  licensing_risk_score: number | null;
  gross_yield_bps: number | null;
  net_yield_bps: number | null;
  monthly_cashflow: number | null;
  stamp_duty: number | null;
  cash_roi_bps: number | null;
  total_acquisition_cost: number | null;
  ai_report_summary: string | null;
  ai_report_strengths: string[] | null;
  ai_report_risks: string[] | null;
  ai_report_score_band: string | null;
  created_at: string;
}

function band(score: number | null) {
  if (score == null) return null;
  if (score >= 70) return "STRONG" as const;
  if (score >= 40) return "MODERATE" as const;
  return "WEAK" as const;
}

function bandColour(b: ReturnType<typeof band>) {
  switch (b) {
    case "STRONG":
      return colours.success;
    case "MODERATE":
      return colours.warning;
    case "WEAK":
      return colours.danger;
    default:
      return colours.faint;
  }
}

function bandLabel(b: ReturnType<typeof band>) {
  switch (b) {
    case "STRONG":
      return "Strong";
    case "MODERATE":
      return "Moderate";
    case "WEAK":
      return "Weak";
    default:
      return "Insufficient data";
  }
}

function gbp(pence: number | null | undefined, signed = false) {
  if (pence == null) return "—";
  const v = pence / 100;
  const abs = Math.abs(v).toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  });
  if (signed && v < 0) return `-${abs}`;
  if (signed && v > 0) return `+${abs}`;
  return v < 0 ? `-${abs}` : abs;
}

function pct(bps: number | null | undefined, dp = 1) {
  if (bps == null) return "—";
  return `${(bps / 100).toFixed(dp)}%`;
}

function pretty(t: string) {
  switch (t) {
    case "terraced":
      return "terraced";
    case "semi":
      return "semi-detached";
    case "detached":
      return "detached";
    case "flat":
      return "flat";
    case "bungalow":
      return "bungalow";
    default:
      return "property";
  }
}

const FACTOR_LABELS: { key: keyof DealLike; label: string }[] = [
  { key: "yield_score", label: "Yield" },
  { key: "refinance_score", label: "Refinance potential" },
  { key: "licensing_risk_score", label: "Licensing risk" },
  { key: "area_growth_score", label: "Area growth" },
  { key: "demand_score", label: "Demand" },
  { key: "bmv_score", label: "Below market value" },
  { key: "tenant_profile_score", label: "Tenant stability" },
];

export function DealReportPdf({ deal }: { deal: DealLike }) {
  const b = band(deal.composite_score);
  const bColour = bandColour(b);

  const tiles = [
    {
      label: "Gross yield",
      value: pct(deal.gross_yield_bps),
      sub:
        deal.monthly_rent != null
          ? `${gbp(deal.monthly_rent * 12)}/yr`
          : undefined,
    },
    { label: "Net yield", value: pct(deal.net_yield_bps), sub: "after costs" },
    {
      label: "Monthly cashflow",
      value: gbp(deal.monthly_cashflow, true),
      sub: "post-mortgage",
    },
    {
      label: "Stamp duty",
      value: gbp(deal.stamp_duty),
      sub: "incl. 3% BTL",
    },
    { label: "Cash ROI (yr 1)", value: pct(deal.cash_roi_bps), sub: "" },
    {
      label: "Total acquisition",
      value: gbp(deal.total_acquisition_cost),
      sub: "incl. fees",
    },
  ];

  return (
    <Document
      title={`Capora · ${deal.postcode} · ${deal.composite_score ?? "—"}`}
      author="Capora"
    >
      <Page size="A4" style={styles.page}>
        <View style={[styles.band, { backgroundColor: bColour }]} />
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Svg viewBox="0 0 24 24" width="11" height="11">
                <Circle
                  cx="10"
                  cy="10"
                  r="6"
                  stroke="white"
                  strokeWidth="2.4"
                  fill="none"
                />
                <Line
                  x1="14.5"
                  y1="14.5"
                  x2="20"
                  y2="20"
                  stroke="white"
                  strokeWidth="2.4"
                />
              </Svg>
            </View>
            <Text style={styles.brandText}>capora</Text>
          </View>
          <View style={styles.reportMeta}>
            <Text>Deal report</Text>
            <Text>
              {new Date(deal.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroLeft}>
            <Text style={styles.postcode}>{deal.postcode}</Text>
            <Text style={styles.address}>{deal.address}</Text>
            <Text style={styles.meta}>
              {deal.bedrooms} bed · {pretty(deal.property_type)} ·{" "}
              {gbp(deal.price)} · {gbp(deal.monthly_rent)} pcm ·{" "}
              {deal.deposit_percent}% deposit · {deal.mortgage_rate}% IO
            </Text>
          </View>
          <View style={styles.scoreCol}>
            <Text style={[styles.scoreBig, { color: bColour }]}>
              {deal.composite_score ?? "—"}
            </Text>
            <Text style={styles.scoreSub}>score / 100</Text>
            <Text
              style={[
                styles.bandPill,
                { backgroundColor: bColour, color: "white" },
              ]}
            >
              {bandLabel(b)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Financials</Text>
        <View style={styles.tileRow}>
          {tiles.map((t) => (
            <View key={t.label} style={styles.tile}>
              <Text style={styles.tileLabel}>{t.label}</Text>
              <Text style={styles.tileValue}>{t.value}</Text>
              {t.sub ? <Text style={styles.tileSub}>{t.sub}</Text> : null}
            </View>
          ))}
        </View>

        <View style={{ height: 12 }} />

        <Text style={styles.sectionTitle}>Investment factors</Text>
        <View style={styles.twoCol}>
          {[0, 1].map((col) => (
            <View key={col} style={styles.col}>
              {FACTOR_LABELS.filter((_, i) => i % 2 === col).map((f) => {
                const v = deal[f.key] as number | null;
                const fb = band(v);
                const fc = bandColour(fb);
                return (
                  <View key={f.key} style={styles.factorRow}>
                    <View style={styles.factorHeader}>
                      <Text>{f.label}</Text>
                      <Text style={{ color: v == null ? colours.faint : colours.ink }}>
                        {v ?? "—"}
                      </Text>
                    </View>
                    <View style={styles.factorBarTrack}>
                      {v != null && (
                        <View
                          style={[
                            styles.factorBarFill,
                            { width: `${v}%`, backgroundColor: fc },
                          ]}
                        />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {deal.ai_report_summary ? (
          <>
            <Text style={styles.sectionTitle}>Deal report</Text>
            <Text style={styles.summary}>{deal.ai_report_summary}</Text>
            <View style={styles.twoCol}>
              <View style={styles.col}>
                <Text style={[styles.sectionTitle, { color: colours.success }]}>
                  Strengths
                </Text>
                {(deal.ai_report_strengths ?? []).map((s, i) => (
                  <View key={i} style={styles.bullet}>
                    <Text style={styles.bulletDot}>{"+ "}</Text>
                    <Text style={{ flex: 1 }}>{s}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.col}>
                <Text style={[styles.sectionTitle, { color: colours.warning }]}>
                  Concerns
                </Text>
                {(deal.ai_report_risks ?? []).map((r, i) => (
                  <View key={i} style={styles.bullet}>
                    <Text style={[styles.bulletDot, { color: colours.warning }]}>
                      {"! "}
                    </Text>
                    <Text style={{ flex: 1 }}>{r}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : null}

        <View style={styles.footer} fixed>
          <Text>
            Capora is an analytical tool, not a financial adviser. Scores
            and reports are for research only and must not be treated as a
            recommendation to buy, sell or finance any property. Always
            commission a survey, valuation and legal review before any
            property transaction. Consult a qualified mortgage broker.
          </Text>
          <Text style={{ marginTop: 4 }}>
            © {new Date().getFullYear()} Capora
          </Text>
        </View>
      </Page>
    </Document>
  );
}
