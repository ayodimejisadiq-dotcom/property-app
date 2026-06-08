import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Database,
  FileText,
  Gauge,
  KeyRound,
  LineChart,
  MapPin,
  ScrollText,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/app/Logo";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <Hero />
      <ProblemStrip />
      <WhatYouGet />
      <SevenFactors />
      <HowItWorks />
      <SampleDeal />
      <HonestLimits />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function PublicNav() {
  return (
    <header className="border-b border-line">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Logo size="md" />
        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      className="relative border-b border-line overflow-hidden"
      style={{ background: "var(--color-primary-light)" }}
    >
      
      
      <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-white shadow-sm border border-line text-[var(--color-primary)]">
            <Sparkles className="h-3 w-3" />
            UK BTL deal analyser · early access
          </span>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold text-ink tracking-tight leading-[1.05]">
            Score property deals{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ color: "var(--color-primary)" }}
            >
              in seconds.
            </span>
          </h1>
          <p className="mt-5 text-lg text-body leading-relaxed max-w-lg">
            A second opinion on every UK BTL deal. Paste a Rightmove link, get
            a 0–100 score across the seven factors that actually matter — plus
            a plain-English report you can take to your broker.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup">
              <Button size="lg" className="shadow-md">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline">
                See how scoring works
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted">
            5 deal reports a month, free. No card required.
          </p>
        </div>
        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative">
      <div className="rounded-xl border border-line bg-white shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted">Levenshulme · M19 3PT</p>
            <p className="text-sm font-semibold text-ink">
              3-bed terraced · £185,000
            </p>
          </div>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)]">
            Strong
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative h-28 w-28 shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="var(--color-line)"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="var(--color-success)"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(72 / 100) * 264} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-ink">72</span>
              <span className="text-[10px] text-muted uppercase tracking-wider">
                Score
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-2.5">
            {[
              { label: "Yield", value: 80 },
              { label: "Area growth", value: 65 },
              { label: "Demand", value: 70 },
              { label: "Refinance", value: 78 },
            ].map((f) => (
              <div key={f.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-body">{f.label}</span>
                  <span className="text-muted">{f.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-fill overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-success)] rounded-full"
                    style={{ width: `${f.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProblemStrip() {
  return (
    <section className="border-b border-line bg-card">
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-lg md:text-xl text-ink leading-relaxed">
          Most BTL investors decide on gut feel, an asking price, and a
          calculator from 2014.{" "}
          <span className="text-muted">
            Capora replaces all three with seven measurable factors and the
            data to back them up.
          </span>
        </p>
      </div>
    </section>
  );
}

function WhatYouGet() {
  const items = [
    {
      icon: Gauge,
      title: "A 0–100 deal score",
      body: "Weighted across yield, growth, demand, refinance potential, BMV, tenant stability, and licensing risk.",
      tone: "primary" as const,
    },
    {
      icon: ScrollText,
      title: "A plain-English report",
      body: "Strengths and concerns written for humans, not spreadsheets. Take it to your broker or partner.",
      tone: "accent" as const,
    },
    {
      icon: Database,
      title: "Real UK data",
      body: "Land Registry, ONS Census, council licensing registers. Sources cited, never invented.",
      tone: "warning" as const,
    },
  ];
  return (
    <section className="border-b border-line">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)] mb-3">
            What you get
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-ink tracking-tight">
            One score. Seven factors. No fluff.
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {items.map(({ icon: Icon, title, body, tone }) => {
            const ringColour =
              tone === "primary"
                ? "from-[var(--color-primary)] to-[var(--color-accent)]"
                : tone === "accent"
                  ? "from-[var(--color-accent)] to-[var(--color-primary)]"
                  : "from-[var(--color-warning)] to-[var(--color-primary)]";
            const iconBg =
              tone === "primary"
                ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                : tone === "accent"
                  ? "bg-[var(--color-accent-light)] text-[var(--color-accent-dark)]"
                  : "bg-[var(--color-warning-light)] text-[var(--color-warning)]";
            return (
              <div
                key={title}
                className="group relative rounded-xl bg-white border border-line p-6 hover:shadow-md transition-shadow"
              >
                <div
                  className={`absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-r ${ringColour} opacity-70`}
                  aria-hidden
                />
                <div
                  className={`h-11 w-11 rounded-xl flex items-center justify-center ${iconBg}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-semibold text-ink text-lg">{title}</h3>
                <p className="mt-2 text-sm text-body leading-relaxed">{body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SevenFactors() {
  const factors = [
    {
      icon: LineChart,
      name: "Yield",
      blurb: "Gross + net yield against the UK BTL benchmark.",
    },
    {
      icon: BarChart3,
      name: "Area growth",
      blurb: "5-year price trend vs the national average (Land Registry).",
    },
    {
      icon: Users,
      name: "Demand",
      blurb: "Rent-to-price ratio vs the regional rental index.",
    },
    {
      icon: KeyRound,
      name: "Refinance potential",
      blurb: "Equity unlocked at year 5 under current LTV rules.",
    },
    {
      icon: Building2,
      name: "Below market value",
      blurb: "Asking price vs sold comps within 0.5 miles.",
    },
    {
      icon: MapPin,
      name: "Tenant stability",
      blurb: "Local employment + household indicators (ONS Census).",
    },
    {
      icon: ShieldAlert,
      name: "Licensing risk",
      blurb: "Selective, additional or HMO schemes that affect this postcode.",
    },
  ];
  return (
    <section className="border-b border-line bg-card">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-ink">
            The seven factors
          </h2>
          <p className="mt-3 text-body">
            Score band: <span className="text-[var(--color-success)] font-medium">Strong</span>{" "}
            ·{" "}
            <span className="text-[var(--color-warning)] font-medium">
              Moderate
            </span>{" "}
            ·{" "}
            <span className="text-[var(--color-danger)] font-medium">Weak</span>
            . Each factor explains itself with the inputs and sources we used.
          </p>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {factors.map(({ icon: Icon, name, blurb }) => (
            <div
              key={name}
              className="rounded-lg border border-line bg-white p-5 flex gap-4"
            >
              <div className="h-9 w-9 rounded-md bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="font-semibold text-ink">{name}</p>
                <p className="text-sm text-muted mt-1 leading-relaxed">
                  {blurb}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "1",
      title: "Paste or type",
      body: "Rightmove or Zoopla URL, or just type the property details.",
    },
    {
      n: "2",
      title: "Run analysis",
      body: "We fetch the data, score the seven factors, write the report.",
    },
    {
      n: "3",
      title: "Read, save, share",
      body: "Export the report as a PDF for your broker, partner, or accountant.",
    },
  ];
  return (
    <section id="how-it-works" className="border-b border-line">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-ink">
            Three steps. Under a minute.
          </h2>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {steps.map(({ n, title, body }) => (
            <div key={n} className="rounded-lg border border-line p-6">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-semibold text-sm">
                {n}
              </span>
              <h3 className="mt-4 font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm text-body leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SampleDeal() {
  const factorRows = [
    { label: "Yield", score: 80, band: "STRONG" as const },
    { label: "Area growth", score: 65, band: "MODERATE" as const },
    { label: "Demand", score: 70, band: "STRONG" as const },
    { label: "Refinance", score: 78, band: "STRONG" as const },
    { label: "Below market value", score: 50, band: "MODERATE" as const },
    { label: "Tenant stability", score: 75, band: "STRONG" as const },
    { label: "Licensing risk", score: 60, band: "MODERATE" as const },
  ];
  const tiles = [
    { label: "Gross yield", value: "7.5%", sub: "£13.8k/yr" },
    { label: "Net yield", value: "5.9%", sub: "after costs" },
    { label: "Monthly cashflow", value: "£716", sub: "post-mortgage" },
    { label: "Cash ROI", value: "12.1%", sub: "year 1" },
  ];

  return (
    <section className="border-b border-line bg-card">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-ink">
            What a Capora report looks like
          </h2>
          <p className="mt-3 text-body">
            A scored deal — straight to the point, sources cited, no
            recommendations.
          </p>
        </div>

        <div className="mt-10 rounded-xl border border-line bg-white shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-line flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-sm text-muted">
                Levenshulme, Manchester · M19 3PT
              </p>
              <h3 className="text-xl font-bold text-ink mt-1">
                3-bed terraced · £185,000
              </h3>
              <p className="text-sm text-muted mt-1">
                £1,150 pcm · 25% deposit · 5.25% interest-only
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)]">
                Score band: Strong
              </span>
              <div className="text-right">
                <p className="text-3xl font-bold text-ink leading-none">72</p>
                <p className="text-[10px] text-muted uppercase tracking-wider mt-1">
                  Score
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2">
            <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-line">
              <p className="text-xs uppercase tracking-wider text-muted mb-4">
                Investment factors
              </p>
              <div className="space-y-3">
                {factorRows.map((f) => (
                  <div key={f.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-body">{f.label}</span>
                      <span className="text-ink font-medium">{f.score}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-fill overflow-hidden">
                      <div
                        className={
                          "h-full rounded-full " +
                          (f.band === "STRONG"
                            ? "bg-[var(--color-success)]"
                            : f.band === "MODERATE"
                              ? "bg-[var(--color-warning)]"
                              : "bg-[var(--color-danger)]")
                        }
                        style={{ width: `${f.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted mb-3">
                  Financials
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {tiles.map((t) => (
                    <div
                      key={t.label}
                      className="rounded-md border-l-4 border-[var(--color-success)] bg-card px-3 py-2.5"
                    >
                      <p className="text-[11px] text-muted">{t.label}</p>
                      <p className="text-base font-bold text-ink">{t.value}</p>
                      <p className="text-[10px] text-muted">{t.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted mb-2">
                  Strengths
                </p>
                <ul className="text-sm text-body space-y-1.5">
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] mt-0.5 shrink-0" />
                    Yield well above the UK BTL average.
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] mt-0.5 shrink-0" />
                    Refinance unlocks 142% of original deposit by year 5.
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-muted mb-2">
                  Concerns
                </p>
                <ul className="text-sm text-body space-y-1.5">
                  <li className="flex gap-2">
                    <ShieldAlert className="h-4 w-4 text-[var(--color-warning)] mt-0.5 shrink-0" />
                    Selective licensing scheme covers M19.
                  </li>
                  <li className="flex gap-2">
                    <ShieldAlert className="h-4 w-4 text-[var(--color-warning)] mt-0.5 shrink-0" />
                    Comps suggest asking price is at the area median, not below.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs italic text-faint text-center mt-4">
          Illustrative example. Real analyses use live data and your own
          assumptions.
        </p>
      </div>
    </section>
  );
}

function HonestLimits() {
  const items = [
    {
      title: "Not financial advice",
      body: "We don't tell you what to buy. We surface the numbers so you can decide.",
    },
    {
      title: "Not a survey",
      body: "Always commission a structural survey and legal review before you exchange.",
    },
    {
      title: "Not a mortgage broker",
      body: "Talk to a qualified broker about lending — rates change weekly.",
    },
    {
      title: "Not perfect",
      body: "Third-party data has gaps and lag. We cite our sources so you can verify anything.",
    },
  ];
  return (
    <section className="border-b border-line">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-ink">
            Honest about the limits
          </h2>
          <p className="mt-3 text-body">
            We&apos;d rather under-promise than ship a tool that gets people
            into bad deals.
          </p>
        </div>
        <div className="mt-10 grid md:grid-cols-2 gap-4">
          {items.map((i) => (
            <div
              key={i.title}
              className="rounded-lg border border-line p-5 bg-white"
            >
              <p className="font-semibold text-ink">{i.title}</p>
              <p className="text-sm text-body mt-1.5 leading-relaxed">
                {i.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="border-b border-line bg-card">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-ink">
          Free while we&apos;re in early access
        </h2>
        <p className="mt-3 text-body max-w-xl mx-auto">
          5 full deal reports a month. No card required. Paid tiers — unlimited
          deals, refurb scan, mortgage stress-testing — coming soon.
        </p>
        <div className="mt-6">
          <Link href="/signup">
            <Button size="lg">
              Create your free account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="border-b border-line">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div
          className="relative rounded-2xl overflow-hidden text-center px-6 py-16 md:py-20 text-white"
          style={{ background: "var(--color-primary)" }}
        >
          
          
          <div className="relative">
            <FileText className="h-10 w-10 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Run your next deal through Capora first.
            </h2>
            <p className="mt-4 text-white/80 max-w-md mx-auto">
              Five reports a month, free. No card. Two minutes to set up.
            </p>
            <div className="mt-8 flex justify-center gap-3 flex-wrap">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-white text-[var(--color-primary)] hover:bg-white/90 shadow-md"
                >
                  Get started
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10"
                >
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <Logo size="sm" />
          <p className="text-sm text-muted">
            © 2026 Daramola Consulting · Built in Manchester
          </p>
        </div>
        <p className="text-xs italic text-faint leading-relaxed">
          Capora is an analytical tool, not a financial adviser. Scores and
          reports are for research only and must not be treated as a
          recommendation to buy, sell or finance any property. Always commission
          a survey, valuation and legal review before any property transaction.
          Consult a qualified mortgage broker. Estimates rely on third-party
          data that may be incomplete or delayed.
        </p>
      </div>
    </footer>
  );
}
