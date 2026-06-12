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
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
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
      
      
      <div className="relative max-w-6xl mx-auto px-5 sm:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-white shadow-sm border border-line text-[var(--color-primary)]">
            <Sparkles className="h-3 w-3" />
            Know if a property is worth it · early access
          </span>
          <h1 className="mt-4 text-[2.5rem] sm:text-5xl md:text-6xl font-bold text-ink tracking-tight leading-[1.05]">
            Is this property{" "}
            <span style={{ color: "var(--color-primary)" }}>
              a good buy?
            </span>
          </h1>
          <p className="mt-5 text-lg text-body leading-relaxed max-w-lg">
            Paste a Rightmove or Zoopla link — or just type the details — and
            we&apos;ll score the property out of 100 across the seven things
            that actually matter. Plain English. No spreadsheets. For first-time
            buyers, landlords, and anyone who&apos;s ever stared at a listing
            wondering &quot;is this the one?&quot;
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
            5 free reports a month. No card. Takes under a minute.
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
      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-10 text-center">
        <p className="text-lg md:text-xl text-ink leading-relaxed">
          Buying a home is the biggest decision most people ever make — and
          most of us go in with gut feel and a calculator from 2014.{" "}
          <span className="text-muted">
            Capora gives you a clear, honest read on any property in the UK,
            backed by real data.
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
      title: "A score out of 100",
      body: "One number that captures yield, area growth, demand, value, and risk — so you know at a glance whether to look closer or walk away.",
      tone: "primary" as const,
    },
    {
      icon: ScrollText,
      title: "A report in plain English",
      body: "Strengths, concerns, and what to ask the agent — written for humans, not spreadsheets. Share it with your partner, broker, or parents.",
      tone: "accent" as const,
    },
    {
      icon: Database,
      title: "Backed by real UK data",
      body: "Land Registry, ONS Census, council licensing registers. Every source cited. Nothing made up.",
      tone: "warning" as const,
    },
  ];
  return (
    <section className="border-b border-line">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)] mb-3">
            What you get
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-ink tracking-tight">
            One score. Plain English. No fluff.
          </h2>
        </div>
        <div className="mt-12 flex md:grid md:grid-cols-3 gap-6 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 pb-3 md:overflow-visible md:mx-0 md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                className="group relative snap-center shrink-0 w-[78vw] md:w-auto rounded-xl bg-white border border-line p-6 hover:shadow-md transition-shadow"
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
      name: "Rental yield",
      blurb: "What it would earn as a rental, compared to the UK average.",
    },
    {
      icon: BarChart3,
      name: "Area growth",
      blurb: "How prices in this area have moved over the last 5 years.",
    },
    {
      icon: Users,
      name: "Local demand",
      blurb: "How easily homes here get rented or sold versus the rest of the country.",
    },
    {
      icon: KeyRound,
      name: "Future equity",
      blurb: "Roughly how much value you could unlock in 5 years if prices hold.",
    },
    {
      icon: Building2,
      name: "Value for money",
      blurb: "Whether the asking price is fair compared to what just sold nearby.",
    },
    {
      icon: MapPin,
      name: "Neighbourhood strength",
      blurb: "Jobs, household stability, and other signals from ONS Census data.",
    },
    {
      icon: ShieldAlert,
      name: "Licensing & rules",
      blurb: "Council schemes (selective, additional, HMO) that could affect renting it out.",
    },
  ];
  return (
    <section className="border-b border-line bg-card">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-ink">
            The seven things we check
          </h2>
          <p className="mt-3 text-body">
            Each one gets a score:{" "}
            <span className="text-[var(--color-success)] font-medium">Strong</span>{" "}
            ·{" "}
            <span className="text-[var(--color-warning)] font-medium">
              Moderate
            </span>{" "}
            ·{" "}
            <span className="text-[var(--color-danger)] font-medium">Weak</span>
            . Tap any factor to see exactly how we worked it out.
          </p>
        </div>
        <div className="mt-10 flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 pb-3 sm:overflow-visible sm:mx-0 sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {factors.map(({ icon: Icon, name, blurb }) => (
            <div
              key={name}
              className="snap-center shrink-0 w-[78vw] sm:w-auto rounded-lg border border-line bg-white p-5 flex gap-4"
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
        <p className="mt-3 text-center text-xs text-muted sm:hidden">
          Swipe to see all seven →
        </p>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "1",
      title: "Paste or type",
      body: "Drop in a Rightmove or Zoopla link — or just type the address, price, and rooms.",
    },
    {
      n: "2",
      title: "We do the maths",
      body: "We pull the data, score the seven factors, and write the report so you don't have to.",
    },
    {
      n: "3",
      title: "Read, save, share",
      body: "Download as a PDF to send to your partner, broker, parents, or anyone helping you decide.",
    },
  ];
  return (
    <section id="how-it-works" className="border-b border-line">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-ink">
            Three steps. Under a minute.
          </h2>
        </div>
        <div className="mt-10 flex md:grid md:grid-cols-3 gap-6 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 pb-3 md:overflow-visible md:mx-0 md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {steps.map(({ n, title, body }) => (
            <div
              key={n}
              className="snap-center shrink-0 w-[78vw] md:w-auto rounded-lg border border-line p-6 bg-white"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-semibold text-sm">
                {n}
              </span>
              <h3 className="mt-4 font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm text-body leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-muted md:hidden">
          Swipe →
        </p>
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
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-ink">
            What a Capora report looks like
          </h2>
          <p className="mt-3 text-body">
            A real property, scored — straight to the point, every source
            shown, no &quot;you should buy this&quot;.
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
      title: "We're not financial advisers",
      body: "We don't tell you what to buy. We show you the numbers so you can decide.",
    },
    {
      title: "We're not a survey",
      body: "Always get a proper structural survey and a solicitor before you exchange.",
    },
    {
      title: "We're not a mortgage broker",
      body: "Talk to a qualified broker for lending — rates change weekly.",
    },
    {
      title: "We're not perfect",
      body: "Public data has gaps and delays. We show our sources so you can double-check anything.",
    },
  ];
  return (
    <section className="border-b border-line">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-ink">
            What we&apos;re not
          </h2>
          <p className="mt-3 text-body">
            We&apos;d rather under-promise than help anyone into a bad
            decision.
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
      <div className="max-w-4xl mx-auto px-5 sm:px-6 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-ink">
          Free while we&apos;re in early access
        </h2>
        <p className="mt-3 text-body max-w-xl mx-auto">
          5 full reports a month. No card needed. Paid plans — unlimited
          reports, refurb scan, mortgage stress-testing — coming soon.
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
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-12 md:py-16">
        <div
          className="relative rounded-2xl overflow-hidden text-center px-5 sm:px-6 py-12 sm:py-16 md:py-20 text-white"
          style={{ background: "var(--color-primary)" }}
        >
          
          
          <div className="relative">
            <FileText className="h-10 w-10 mx-auto mb-4 opacity-90" />
            <h2 className="text-[1.75rem] sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              Check your next property with Capora first.
            </h2>
            <p className="mt-4 text-white/80 max-w-md mx-auto">
              Five free reports a month. No card. Two minutes to set up.
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
                  className="!bg-transparent !border-white/50 !text-white hover:!bg-white/10"
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
  const columns = [
    {
      heading: "Product",
      links: [
        { href: "/#how-it-works", label: "How it works" },
        { href: "/sample", label: "Sample report" },
        { href: "/signup", label: "Get started" },
        { href: "/login", label: "Sign in" },
      ],
    },
    {
      heading: "Company",
      links: [
        { href: "/about", label: "About" },
        { href: "mailto:hello@capora.co.uk", label: "Contact" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { href: "/terms", label: "Terms" },
        { href: "/privacy", label: "Privacy" },
        { href: "/disclaimer", label: "Disclaimer" },
      ],
    },
  ];

  return (
    <footer className="bg-white border-t border-line">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Logo size="sm" />
            <p className="mt-4 text-sm text-muted leading-relaxed max-w-xs">
              A clear, honest read on any UK property. Scored across seven
              factors, backed by real data.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink mb-3">
                {col.heading}
              </p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-body hover:text-[var(--color-primary)] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-line flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-sm text-muted">© 2026 Capora · Built in Manchester</p>
          <p className="text-xs text-muted">
            UK property scoring · early access
          </p>
        </div>

        <p className="mt-6 text-xs italic text-faint leading-relaxed">
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
