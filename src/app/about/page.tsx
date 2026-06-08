import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/app/Logo";

export const metadata = {
  title: "About — Capora",
  description:
    "Capora scores UK buy-to-let deals across seven measurable factors so investors can decide with data, not gut feel.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-line">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo size="md" />
          </Link>
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

      <main className="max-w-3xl mx-auto px-5 sm:px-6 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-ink tracking-tight">
          About Capora
        </h1>
        <p className="mt-4 text-lg text-body leading-relaxed">
          Capora is a second opinion on every UK buy-to-let deal. Paste a
          Rightmove or Zoopla link, get a 0–100 score across the seven factors
          that actually matter, plus a plain-English report you can take to your
          broker.
        </p>

        <h2 className="mt-12 text-xl font-bold text-ink">Why we built it</h2>
        <p className="mt-3 text-body leading-relaxed">
          Most BTL investors decide on gut feel, an asking price, and a
          calculator from 2014. Capora replaces all three with measurable
          factors and the data to back them up — yield, area growth, demand,
          refinance potential, below market value, tenant stability, and
          licensing risk.
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">How we score</h2>
        <p className="mt-3 text-body leading-relaxed">
          Every score is derived from a transparent formula against UK
          benchmarks — Land Registry, ONS Census, council licensing registers.
          Sources are cited on every factor. We never invent data. Where we
          can&apos;t verify a number, we say so.
        </p>

        <h2 className="mt-10 text-xl font-bold text-ink">What we won&apos;t do</h2>
        <ul className="mt-3 space-y-2 text-body leading-relaxed list-disc pl-5">
          <li>Tell you what to buy, sell, or finance.</li>
          <li>Replace a survey, a solicitor, or a mortgage broker.</li>
          <li>Hide our limits — third-party data has gaps, and we flag them.</li>
        </ul>

        <h2 className="mt-10 text-xl font-bold text-ink">Who&apos;s behind it</h2>
        <p className="mt-3 text-body leading-relaxed">
          Capora is built in Manchester by Daramola Consulting Ltd, a UK
          registered company. We&apos;re a small team that ships fast and
          listens to the investors who use the product. Got a factor you wish
          we scored? Email{" "}
          <a
            href="mailto:hello@capora.co.uk"
            className="text-[var(--color-primary)] hover:underline"
          >
            hello@capora.co.uk
          </a>
          .
        </p>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/signup">
            <Button size="lg">Create your free account</Button>
          </Link>
          <Link href="/sample">
            <Button size="lg" variant="outline">
              See a sample report
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
