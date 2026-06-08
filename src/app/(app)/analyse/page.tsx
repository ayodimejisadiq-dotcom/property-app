"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertTriangle,
  ArrowRight,
  Info,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const PROPERTY_TYPES = [
  { value: "terraced", label: "Terraced" },
  { value: "semi", label: "Semi-detached" },
  { value: "detached", label: "Detached" },
  { value: "flat", label: "Flat / apartment" },
  { value: "bungalow", label: "Bungalow" },
  { value: "other", label: "Other" },
] as const;

const POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

const Schema = z.object({
  address: z.string().min(3, "Please enter the full address"),
  postcode: z
    .string()
    .min(1, "Postcode required")
    .regex(POSTCODE_RE, "Enter a valid UK postcode"),
  pricePounds: z
    .number({ message: "Enter the asking price" })
    .int("Use whole pounds")
    .min(10_000, "Minimum £10,000")
    .max(10_000_000, "Maximum £10,000,000"),
  bedrooms: z.number().int().min(1).max(10),
  propertyType: z.enum([
    "terraced",
    "semi",
    "detached",
    "flat",
    "bungalow",
    "other",
  ]),
  monthlyRentPounds: z
    .number({ message: "Enter the expected monthly rent" })
    .int("Use whole pounds")
    .min(100, "Minimum £100")
    .max(50_000, "Maximum £50,000"),
  depositPercent: z.number().min(0).max(100),
  mortgageRate: z.number().min(0).max(20),
  mortgageTermYears: z.number().int().min(1).max(40),
});

type FormData = z.infer<typeof Schema>;

export default function AnalysePage() {
  const router = useRouter();
  const [tab, setTab] = useState("url");
  const [submitting, setSubmitting] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [scrapeNotice, setScrapeNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: {
      bedrooms: 3,
      propertyType: "terraced",
      depositPercent: 25,
      mortgageRate: 5.25,
      mortgageTermYears: 25,
    },
  });

  function applyScraped(d: {
    address?: string;
    postcode?: string | null;
    pricePounds?: number | null;
    bedrooms?: number | null;
    propertyType?: FormData["propertyType"] | null;
    monthlyRentPounds?: number | null;
  }) {
    if (d.address) setValue("address", d.address, { shouldValidate: true });
    if (d.postcode) setValue("postcode", d.postcode, { shouldValidate: true });
    if (d.pricePounds != null)
      setValue("pricePounds", d.pricePounds, { shouldValidate: true });
    if (d.bedrooms != null)
      setValue("bedrooms", d.bedrooms, { shouldValidate: true });
    if (d.propertyType)
      setValue("propertyType", d.propertyType, { shouldValidate: true });
    if (d.monthlyRentPounds != null)
      setValue("monthlyRentPounds", d.monthlyRentPounds, {
        shouldValidate: true,
      });
  }

  async function onSubmit(values: FormData) {
    setTopError(null);
    setSubmitting(true);
    const res = await fetch("/api/analyse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, sourceUrl }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      if (j.code === "QUOTA_EXCEEDED") {
        router.push("/billing?reason=quota");
        return;
      }
      setTopError(j.error ?? "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }
    const { id } = (await res.json()) as { id: string };
    router.push(`/deals/${id}`);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-10">
      <div
        className="mb-6 rounded-xl text-white p-6 md:p-7 relative overflow-hidden shadow-md"
        style={{ background: "var(--color-primary)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/15 blur-2xl"
        />
        <div className="relative">
          <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 mb-2">
            New deal
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Analyse a deal
          </h1>
          <p className="text-white/85 mt-1.5 max-w-xl text-sm md:text-base">
            Paste a Rightmove or Zoopla URL — or enter the property details
            manually. We&apos;ll score the deal across seven factors and write
            a plain-English report.
          </p>
          <div className="mt-3 flex items-center gap-3 flex-wrap text-xs text-white/80">
            <span className="inline-flex items-center gap-1">
              ⚡ ~30 seconds
            </span>
            <span className="opacity-50">·</span>
            <span>Free tier: 5 reports / month</span>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="url">Paste URL</TabsTrigger>
          <TabsTrigger value="manual">Manual entry</TabsTrigger>
        </TabsList>

        <TabsContent value="url">
          <UrlPasteTab
            onUseManual={() => setTab("manual")}
            onScraped={(data) => {
              setSourceUrl(data.sourceUrl ?? null);
              applyScraped({
                address: data.address ?? undefined,
                postcode: data.postcode ?? undefined,
                pricePounds: data.pricePounds ?? undefined,
                bedrooms: data.bedrooms ?? undefined,
                propertyType: data.propertyType ?? undefined,
                monthlyRentPounds: data.monthlyRentPounds ?? undefined,
              });
              setScrapeNotice(
                "Pre-filled from listing — review and add anything missing.",
              );
              setTab("manual");
            }}
          />
        </TabsContent>

        <TabsContent value="manual">
          {scrapeNotice && (
            <div className="mb-4 flex items-start gap-2 text-sm text-ink bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 rounded-md p-3">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-[var(--color-primary)]" />
              <span>{scrapeNotice}</span>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <SectionHeader
                  title="Property details"
                  hint="What you're looking at, in plain numbers."
                />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field
                    label="Address"
                    error={errors.address?.message}
                    className="lg:col-span-2"
                  >
                    <Input
                      placeholder="21 Albert Road, Levenshulme, Manchester"
                      {...register("address")}
                    />
                  </Field>
                  <Field label="Postcode" error={errors.postcode?.message}>
                    <Input placeholder="M19 3PT" {...register("postcode")} />
                  </Field>
                  <Field
                    label="Asking price (£)"
                    error={errors.pricePounds?.message}
                  >
                    <Input
                      type="number"
                      placeholder="185000"
                      step="1"
                      {...register("pricePounds", { valueAsNumber: true })}
                    />
                  </Field>
                  <Field
                    label="Bedrooms"
                    error={errors.bedrooms?.message}
                  >
                    <Select {...register("bedrooms", { valueAsNumber: true })}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field
                    label="Property type"
                    error={errors.propertyType?.message}
                  >
                    <Select {...register("propertyType")}>
                      {PROPERTY_TYPES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field
                    label="Monthly rent (£)"
                    error={errors.monthlyRentPounds?.message}
                    hint="Achievable rent, not optimistic."
                  >
                    <Input
                      type="number"
                      placeholder="1150"
                      step="1"
                      {...register("monthlyRentPounds", { valueAsNumber: true })}
                    />
                  </Field>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <SectionHeader
                  title="Mortgage assumptions"
                  badge="V1.2 module"
                  hint="Defaults are typical UK BTL terms. Full stress-testing comes in V1.2."
                />
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field
                    label="Deposit (%)"
                    error={errors.depositPercent?.message}
                  >
                    <Input
                      type="number"
                      step="0.5"
                      {...register("depositPercent", { valueAsNumber: true })}
                    />
                  </Field>
                  <Field
                    label="Mortgage rate (%)"
                    error={errors.mortgageRate?.message}
                  >
                    <Input
                      type="number"
                      step="0.05"
                      {...register("mortgageRate", { valueAsNumber: true })}
                    />
                  </Field>
                  <Field
                    label="Term (years)"
                    error={errors.mortgageTermYears?.message}
                  >
                    <Input
                      type="number"
                      step="1"
                      {...register("mortgageTermYears", { valueAsNumber: true })}
                    />
                  </Field>
                </div>
              </CardContent>
            </Card>

            {topError && (
              <div className="flex items-start gap-2 text-sm text-danger bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/20 rounded-md p-3">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{topError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-faint flex items-start gap-1.5 max-w-md">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>
                  Some factors (area growth, BMV, licensing) need real UK data
                  sources that ship in Phase 3. Until then they&apos;ll show
                  &quot;insufficient data&quot;.
                </span>
              </p>
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? "Running analysis…" : "Run analysis"}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>

            <p className="text-xs italic text-faint">
              Not financial advice. Do your own due diligence.
            </p>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ScrapedPayload {
  source: "rightmove" | "zoopla";
  sourceUrl: string;
  address: string;
  postcode: string | null;
  pricePounds: number | null;
  bedrooms: number | null;
  propertyType:
    | "terraced"
    | "semi"
    | "detached"
    | "flat"
    | "bungalow"
    | "other"
    | null;
  monthlyRentPounds: number | null;
}

function UrlPasteTab({
  onUseManual,
  onScraped,
}: {
  onUseManual: () => void;
  onScraped: (data: ScrapedPayload) => void;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function autofill(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^https?:\/\//i.test(url)) {
      setError("Paste a full URL starting with https://");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(
        j.error ??
          "Couldn't auto-fetch this property. Switch to manual entry to continue.",
      );
      return;
    }
    const { data } = (await res.json()) as { data: ScrapedPayload };
    onScraped(data);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
            <LinkIcon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-ink">Auto-fill from URL</h2>
            <p className="text-sm text-muted mt-1 max-w-xl">
              Paste a Rightmove, Zoopla or OnTheMarket link. Our AI reads the
              listing and pre-fills address, postcode, price, beds and property
              type. Takes about 5–10 seconds.
            </p>
            <form onSubmit={autofill} className="mt-4 flex flex-col sm:flex-row gap-3">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.rightmove.co.uk/properties/…"
                className="flex-1"
                inputMode="url"
                autoComplete="url"
              />
              <Button type="submit" disabled={!url || loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching…
                  </>
                ) : (
                  <>
                    Auto-fill
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
            {error && (
              <div className="mt-3 flex items-start gap-2 text-sm text-danger bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/20 rounded-md p-3">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <p className="text-xs text-faint mt-3 leading-relaxed">
              If the listing&apos;s behind a login or auto-fill misreads
              anything, switch to manual — it&apos;s only six fields.
            </p>
            <button
              type="button"
              onClick={onUseManual}
              className="text-sm text-[var(--color-primary)] font-medium hover:underline mt-4 inline-flex items-center gap-1"
            >
              Use manual entry instead
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionHeader({
  title,
  hint,
  badge,
}: {
  title: string;
  hint?: string;
  badge?: string;
}) {
  return (
    <div className="flex items-start justify-between mb-4 gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="font-semibold text-ink">{title}</h2>
          {badge && (
            <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              {badge}
            </span>
          )}
        </div>
        {hint && <p className="text-xs text-muted mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const id = React.useId();
  return (
    <div className={"space-y-1.5 " + (className ?? "")}>
      <Label htmlFor={id}>{label}</Label>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<{ id?: string }>, {
            id,
          })
        : children}
      {hint && !error && <p className="text-xs text-faint">{hint}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={
        "flex h-10 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] " +
        (className ?? "")
      }
      {...props}
    >
      {children}
    </select>
  );
}
