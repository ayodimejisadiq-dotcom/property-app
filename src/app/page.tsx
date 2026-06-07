import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/app/Logo";

const ACCENT = "var(--color-accent)";
const INK = "var(--color-ink-deep)";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink-deep)]">
      <PublicNav />
      <Hero />
      <Strapline />
      <WhatYouGet />
      <SevenFactors />
      <HowItWorks />
      <SampleQuote />
      <HonestLimits />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function PublicNav() {
  return (
    <header className="border-b border-[var(--color-line)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Logo size="md" />
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-[11px] tracking-[0.14em] uppercase font-semibold hover:underline underline-offset-4"
            style={{ color: INK }}
          >
            Sign in
          </Link>
          <Link href="/signup">
            <Button size="sm" variant="primary">
              Get started
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="border-b border-[var(--color-line)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 md:pt-24 pb-20 md:pb-28 grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-8">
          <p className="eyebrow">
            UK BTL deal analyser
            <span className="inline-block w-1.5 h-1.5 mx-3 align-middle" style={{ background: "var(--color-accent)" }} />
            Early access
          </p>
          <h1
            className="display mt-6 leading-[0.98]"
            style={{
              fontSize: "clamp(2.75rem, 7vw, 5.25rem)",
              color: INK,
            }}
          >
            Score property
            <br />
            deals{" "}
            <span style={{ color: ACCENT }}>in seconds.</span>
          </h1>
          <p className="mt-8 text-lg leading-relaxed max-w-xl text-[var(--color-body)]">
            A second opinion on every UK BTL deal. Paste a Rightmove link, get
            a 0–100 score across the seven factors that actually matter — plus
            a plain-English analyst&apos;s note you can take to your broker.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link href="/signup">
              <Button size="lg" variant="primary">
                Get started free →
              </Button>
            </Link>
            <Link
              href="#how"
              className="text-[11px] tracking-[0.14em] uppercase font-semibold hover:underline underline-offset-4"
              style={{ color: INK }}
            >
              See how scoring works
            </Link>
          </div>
          <p className="mt-5 text-xs text-[var(--color-muted)]">
            5 deal reports a month, free. No card required.
          </p>
        </div>

        <aside className="col-span-12 md:col-span-4 md:pl-6 md:border-l md:border-[var(--color-line-strong)]">
          <p className="eyebrow">Sample report</p>
          <p className="text-xs mt-3 text-[var(--color-muted)]">
            Levenshulme · M19 3PT
          </p>
          <p className="text-sm mt-1" style={{ color: INK }}>
            3-bed terraced · <span className="tnum">£185,000</span>
          </p>
          <div
            className="display tnum mt-6 leading-none"
            style={{
              fontSize: "clamp(4rem, 8vw, 6rem)",
              color: "#2D6A3E",
            }}
          >
            72
          </div>
          <p
            className="mt-3 text-xs tracking-[0.14em] uppercase font-semibold"
            style={{ color: "#2D6A3E" }}
          >
            Strong
          </p>
          <div className="mt-8 space-y-3">
            {[
              { label: "Yield", value: 80 },
              { label: "Refinance", value: 78 },
              { label: "Tenant stability", value: 75 },
              { label: "Licensing", value: 60 },
            ].map((f) => (
              <div key={f.label} className="grid grid-cols-[1fr_auto] text-xs items-baseline">
                <span style={{ color: INK }}>{f.label}</span>
                <span className="tnum" style={{ color: INK }}>{f.value}</span>
                <div
                  className="col-span-2 h-px mt-1.5"
                  style={{ background: "var(--color-line)" }}
                >
                  <div
                    className="h-px"
                    style={{ width: `${f.value}%`, background: INK }}
                  />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function Strapline() {
  return (
    <section className="border-b border-[var(--color-line)] bg-[var(--color-paper-deep)]">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14 text-center">
        <p
          className="display leading-snug"
          style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.875rem)", color: INK }}
        >
          Most BTL investors decide on gut feel, an asking price and a
          calculator from 2014.{" "}
          <span style={{ color: "var(--color-muted)" }}>
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
      n: "01",
      title: "A 0–100 deal score.",
      body: "Weighted across yield, growth, demand, refinance potential, BMV, tenant stability, and licensing risk.",
    },
    {
      n: "02",
      title: "An analyst's note.",
      body: "Strengths and concerns written for humans, not spreadsheets. Take it to your broker or partner.",
    },
    {
      n: "03",
      title: "Real UK data.",
      body: "Land Registry, ONS Census, council licensing registers. Sources cited, never invented.",
    },
  ];
  return (
    <section className="border-b border-[var(--color-line)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <p className="eyebrow">What you get</p>
        <h2
          className="display mt-4 leading-[1.05] max-w-3xl"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: INK }}
        >
          One score. Seven factors. No fluff.
        </h2>
        <div className="mt-14 grid md:grid-cols-3 gap-x-10 gap-y-12">
          {items.map((i) => (
            <div key={i.n}>
              <p
                className="display tnum text-3xl"
                style={{ color: "var(--color-accent)" }}
              >
                {i.n}
              </p>
              <div className="mt-4 rule" />
              <h3
                className="display text-2xl mt-5 leading-snug"
                style={{ color: INK }}
              >
                {i.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-body)]">
                {i.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SevenFactors() {
  const factors = [
    { name: "Yield", blurb: "Gross + net yield against the UK BTL benchmark." },
    { name: "Area growth", blurb: "5-year price trend vs the national average (Land Registry)." },
    { name: "Demand", blurb: "Rent-to-price ratio vs the regional rental index." },
    { name: "Refinance potential", blurb: "Equity unlocked at year 5 under current LTV rules." },
    { name: "Below market value", blurb: "Asking price vs sold comps within 0.5 miles." },
    { name: "Tenant stability", blurb: "Local employment + household indicators (ONS Census)." },
    { name: "Licensing risk", blurb: "Selective, additional or HMO schemes for this postcode." },
  ];
  return (
    <section className="border-b border-[var(--color-line)] bg-[var(--color-paper-deep)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="flex items-baseline justify-between flex-wrap gap-4">
          <div>
            <p className="eyebrow">The seven factors</p>
            <h2
              className="display mt-4 leading-[1.05] max-w-3xl"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: INK }}
            >
              Score band:{" "}
              <span style={{ color: "#2D6A3E" }}>Strong</span> ·{" "}
              <span style={{ color: "#9C6B1D" }}>Moderate</span> ·{" "}
              <span style={{ color: "#9C2A1D" }}>Weak</span>.
            </h2>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
          {factors.map((f, i) => (
            <div key={f.name} className="border-t border-[var(--color-ink-deep)] pt-5">
              <p className="eyebrow tnum">{String(i + 1).padStart(2, "0")}</p>
              <h3
                className="display text-xl mt-3"
                style={{ color: INK }}
              >
                {f.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-body)]">
                {f.blurb}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "I", title: "Paste or type.", body: "Rightmove or Zoopla URL, or just type the property details." },
    { n: "II", title: "Run the analysis.", body: "We fetch the data, score the seven factors, write the note." },
    { n: "III", title: "Read, save, share.", body: "Export the report as a PDF for your broker, partner or accountant." },
  ];
  return (
    <section id="how" className="border-b border-[var(--color-line)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <p className="eyebrow">How it works</p>
        <h2
          className="display mt-4 leading-[1.05]"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: INK }}
        >
          Three steps. Under a minute.
        </h2>
        <div className="mt-14 grid md:grid-cols-3 gap-x-10 gap-y-10">
          {steps.map((s) => (
            <div key={s.n}>
              <p
                className="display"
                style={{
                  fontSize: "clamp(3rem, 6vw, 5rem)",
                  color: INK,
                  lineHeight: 1,
                }}
              >
                {s.n}
              </p>
              <h3
                className="display text-2xl mt-4"
                style={{ color: INK }}
              >
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-body)]">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SampleQuote() {
  return (
    <section className="border-b border-[var(--color-line)] bg-[var(--color-paper-deep)]">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20">
        <p className="eyebrow">From a sample report</p>
        <blockquote
          className="display mt-8 leading-[1.25]"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", color: INK }}
        >
          &ldquo;The deal shows strong yield and refinance potential, with steady
          area growth and demand indicators above the regional average.
          Selective licensing and an asking price near the area median are
          the main concerns. Review with a qualified broker before proceeding.&rdquo;
        </blockquote>
        <p className="mt-8 text-xs tracking-[0.14em] uppercase text-[var(--color-muted)]">
          Capora analyst&apos;s note · Levenshulme M19 3PT · score 72
        </p>
        <div className="mt-10">
          <Link href="/sample">
            <Button variant="outline">
              View the sample report →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function HonestLimits() {
  const items = [
    { t: "Not financial advice.", b: "We don't tell you what to buy. We surface the numbers so you can decide." },
    { t: "Not a survey.", b: "Always commission a RICS survey and legal review before you exchange." },
    { t: "Not a mortgage broker.", b: "Talk to a qualified broker about lending — rates change weekly." },
    { t: "Not perfect.", b: "Third-party data has gaps and lag. We cite our sources so you can verify anything." },
  ];
  return (
    <section className="border-b border-[var(--color-line)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <p className="eyebrow">Honest about the limits</p>
        <h2
          className="display mt-4 leading-[1.05] max-w-3xl"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: INK }}
        >
          We&apos;d rather under-promise than ship a tool that gets people into
          bad deals.
        </h2>
        <div className="mt-14 grid md:grid-cols-2 gap-x-10 gap-y-10">
          {items.map((i) => (
            <div key={i.t} className="border-t border-[var(--color-ink-deep)] pt-5">
              <p
                className="display text-xl"
                style={{ color: INK }}
              >
                {i.t}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-body)]">
                {i.b}
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
    <section className="border-b border-[var(--color-line)] bg-[var(--color-paper-deep)]">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20 text-center">
        <p className="eyebrow">Pricing</p>
        <h2
          className="display mt-4 leading-[1.05]"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: INK }}
        >
          Free while we&apos;re in early access.
        </h2>
        <p className="mt-5 text-sm max-w-xl mx-auto text-[var(--color-body)]">
          5 full deal reports a month. No card required. Paid tiers — unlimited
          deals, refurb scan, mortgage stress-testing — coming soon.
        </p>
        <div className="mt-10">
          <Link href="/signup">
            <Button variant="primary" size="lg">
              Create your free account →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="border-b border-[var(--color-line)]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-24 md:py-32 text-center">
        <h2
          className="display leading-[0.98]"
          style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", color: INK }}
        >
          Run your next deal
          <br />
          through{" "}
          <span style={{ color: ACCENT }}>Capora</span> first.
        </h2>
        <p className="mt-8 text-sm text-[var(--color-body)]">
          Five reports a month, free. No card. Two minutes to set up.
        </p>
        <div className="mt-10 flex justify-center gap-5 flex-wrap">
          <Link href="/signup">
            <Button variant="primary" size="lg">Get started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">Sign in</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[var(--color-paper)]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <Logo size="sm" />
            <p className="mt-3 text-xs text-[var(--color-muted)]">
              © 2026 Daramola Consulting · Built in Manchester
            </p>
          </div>
          <nav className="flex gap-6 text-[11px] tracking-[0.14em] uppercase font-semibold">
            <Link href="/terms" className="hover:underline underline-offset-4" style={{ color: INK }}>Terms</Link>
            <Link href="/privacy" className="hover:underline underline-offset-4" style={{ color: INK }}>Privacy</Link>
            <Link href="/login" className="hover:underline underline-offset-4" style={{ color: INK }}>Sign in</Link>
          </nav>
        </div>
        <div className="rule-faint" />
        <p className="mt-6 text-[11px] italic leading-relaxed text-[var(--color-muted)] max-w-3xl">
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
