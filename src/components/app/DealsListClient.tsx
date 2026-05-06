"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  Eye,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn, scoreBand, bandColor } from "@/lib/utils";

export interface DealListItem {
  id: string;
  address: string;
  postcode: string;
  composite_score: number | null;
  gross_yield_bps: number | null;
  monthly_cashflow: number | null;
  created_at: string;
}

const PAGE_SIZE = 25;

type SortKey = "newest" | "highest" | "lowest";
type ScoreFilter = "all" | "STRONG" | "MODERATE" | "WEAK" | "UNSCORED";

function relativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function bandPillClass(b: ReturnType<typeof scoreBand>) {
  switch (b) {
    case "STRONG":
      return "bg-[var(--color-success)]/10 text-[var(--color-success)]";
    case "MODERATE":
      return "bg-[var(--color-warning)]/10 text-[var(--color-warning)]";
    case "WEAK":
      return "bg-[var(--color-danger)]/10 text-[var(--color-danger)]";
    default:
      return "bg-fill text-muted";
  }
}

function bandLabel(b: ReturnType<typeof scoreBand>) {
  switch (b) {
    case "STRONG":
      return "Strong";
    case "MODERATE":
      return "Moderate";
    case "WEAK":
      return "Weak";
    default:
      return "Unscored";
  }
}

function fmtCashflow(pence: number | null) {
  if (pence == null) return "—";
  const sign = pence < 0 ? "-" : "";
  const value = Math.abs(pence) / 100;
  return `${sign}£${Math.round(value).toLocaleString("en-GB")}`;
}

function fmtYield(bps: number | null) {
  if (bps == null) return "—";
  return `${(bps / 100).toFixed(1)}%`;
}

export function DealsListClient({ deals }: { deals: DealListItem[] }) {
  const [query, setQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = deals.filter((d) => {
      if (
        q &&
        !d.address.toLowerCase().includes(q) &&
        !d.postcode.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (scoreFilter === "all") return true;
      const band = scoreBand(d.composite_score);
      if (scoreFilter === "UNSCORED") return d.composite_score == null;
      return band === scoreFilter;
    });
    if (sort === "newest") {
      list = [...list].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    } else if (sort === "highest") {
      list = [...list].sort(
        (a, b) => (b.composite_score ?? -1) - (a.composite_score ?? -1),
      );
    } else if (sort === "lowest") {
      list = [...list].sort(
        (a, b) => (a.composite_score ?? 101) - (b.composite_score ?? 101),
      );
    }
    return list;
  }, [deals, query, scoreFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
          <Input
            placeholder="Search address or postcode"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
        <SelectInline
          value={scoreFilter}
          onChange={(v) => {
            setScoreFilter(v as ScoreFilter);
            setPage(0);
          }}
          options={[
            { value: "all", label: "Score: All" },
            { value: "STRONG", label: "Score: Strong (70+)" },
            { value: "MODERATE", label: "Score: Moderate (40–69)" },
            { value: "WEAK", label: "Score: Weak (<40)" },
            { value: "UNSCORED", label: "Score: Unscored" },
          ]}
        />
        <SelectInline
          value={sort}
          onChange={(v) => setSort(v as SortKey)}
          icon={<ArrowDownUp className="h-4 w-4 text-faint" />}
          options={[
            { value: "newest", label: "Newest first" },
            { value: "highest", label: "Highest score" },
            { value: "lowest", label: "Lowest score" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        deals.length === 0 ? (
          <EmptyState />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-ink font-medium">No deals match those filters.</p>
              <p className="text-sm text-muted mt-1">
                Try clearing the search or selecting a different score band.
              </p>
            </CardContent>
          </Card>
        )
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-lg border border-line bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-card text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Property</th>
                  <th className="text-left font-medium px-4 py-3">Score</th>
                  <th className="text-right font-medium px-4 py-3">Yield</th>
                  <th className="text-right font-medium px-4 py-3">
                    Cashflow
                  </th>
                  <th className="text-left font-medium px-4 py-3">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {pageRows.map((d) => {
                  const band = scoreBand(d.composite_score);
                  return (
                    <tr
                      key={d.id}
                      className="border-t border-line hover:bg-fill cursor-pointer"
                      onClick={() => {
                        window.location.href = `/deals/${d.id}`;
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink truncate max-w-xs">
                          {d.address}
                        </div>
                        <div className="text-xs text-muted">{d.postcode}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-xs font-medium px-2 py-0.5 rounded-full",
                              bandPillClass(band),
                            )}
                          >
                            {bandLabel(band)}
                          </span>
                          <span
                            className={cn(
                              "text-base font-bold",
                              bandColor(band),
                            )}
                          >
                            {d.composite_score ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-ink">
                        {fmtYield(d.gross_yield_bps)}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 text-right font-medium",
                          d.monthly_cashflow == null
                            ? "text-muted"
                            : d.monthly_cashflow >= 0
                              ? "text-[var(--color-success)]"
                              : "text-[var(--color-danger)]",
                        )}
                      >
                        {fmtCashflow(d.monthly_cashflow)}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {relativeTime(d.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ArrowRight className="h-4 w-4 text-faint inline" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {pageRows.map((d) => {
              const band = scoreBand(d.composite_score);
              return (
                <Link
                  key={d.id}
                  href={`/deals/${d.id}`}
                  className="block rounded-lg border border-line bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-ink truncate">
                        {d.address}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {d.postcode} · {relativeTime(d.created_at)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={cn(
                          "text-2xl font-bold leading-none",
                          bandColor(band),
                        )}
                      >
                        {d.composite_score ?? "—"}
                      </p>
                      <span
                        className={cn(
                          "inline-block mt-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                          bandPillClass(band),
                        )}
                      >
                        {bandLabel(band)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted">
                        Yield
                      </p>
                      <p className="text-ink font-medium">
                        {fmtYield(d.gross_yield_bps)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted">
                        Cashflow
                      </p>
                      <p
                        className={cn(
                          "font-medium",
                          d.monthly_cashflow == null
                            ? "text-muted"
                            : d.monthly_cashflow >= 0
                              ? "text-[var(--color-success)]"
                              : "text-[var(--color-danger)]",
                        )}
                      >
                        {fmtCashflow(d.monthly_cashflow)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {pageCount > 1 && (
            <div className="flex items-center justify-between mt-6 text-sm">
              <p className="text-muted">
                Showing {safePage * PAGE_SIZE + 1}–
                {Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage === 0}
                  onClick={() => setPage(safePage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage(safePage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

function EmptyState() {
  return (
    <Card className="bg-gradient-to-br from-[var(--color-primary-light)]/40 to-white">
      <CardContent className="py-12 text-center">
        <div className="h-12 w-12 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center mx-auto mb-5">
          <Plus className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-ink">
          You haven&apos;t saved any deals yet
        </h2>
        <p className="text-body mt-2 max-w-md mx-auto">
          Run your first analysis and it&apos;ll show up here. Free tier
          includes five reports a month.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/analyse">
            <Button>
              Analyse new deal
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/sample">
            <Button variant="outline">
              <Eye className="h-4 w-4" />
              View sample
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function SelectInline({
  value,
  onChange,
  options,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
}) {
  return (
    <label className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {icon}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-10 rounded-md border border-line bg-white text-sm text-ink pr-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
          icon ? "pl-9" : "pl-3",
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

