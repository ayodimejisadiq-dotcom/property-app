import { LegalSection, LegalShell } from "@/components/app/LegalShell";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Capora.",
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" lastUpdated="8 May 2026">
      <p>
        This policy explains what personal data we collect when you use
        Capora, how we use it, and the rights you have under UK GDPR.
        Daramola Consulting Ltd is the data controller.
      </p>

      <LegalSection id="data-we-collect" title="1. Data we collect">
        <p>We collect the following categories of personal data:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>
            <strong>Account data:</strong> email address, password (hashed
            by Supabase Auth), full name if provided, the version of the
            disclaimer you accepted and when.
          </li>
          <li>
            <strong>Deal data:</strong> the property details you enter or
            paste (address, postcode, price, rent, mortgage assumptions),
            and the scores and figures we compute from them.
          </li>
          <li>
            <strong>Usage data:</strong> a log of events on your account —
            sign-up, disclaimer acceptance, deals created, referrals applied,
            waitlist joins. Used to count quota, prevent abuse, and to give
            an admin view of activity.
          </li>
          <li>
            <strong>Technical data:</strong> IP address, user-agent, and
            cookies necessary for login and rate-limiting.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="how-we-use" title="2. How we use your data">
        <p>We use the data above to:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Operate the Service and provide the features you ask for.</li>
          <li>
            Enforce the monthly report quota and detect abusive usage
            (legitimate interest).
          </li>
          <li>
            Send transactional emails (sign-up confirmation, password
            reset). We won&apos;t send marketing emails without your
            consent.
          </li>
          <li>
            Improve the Service — for example, analysing anonymised usage
            patterns to fix bugs.
          </li>
          <li>
            Comply with our legal obligations (tax, anti-fraud).
          </li>
        </ul>
      </LegalSection>

      <LegalSection
        id="processors"
        title="3. Who processes your data on our behalf"
      >
        <p>
          We use the following sub-processors. Each is a reputable provider
          with appropriate data-protection terms in place.
        </p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>
            <strong>Supabase</strong> — database hosting (EU-West-2,
            London) and authentication.
          </li>
          <li>
            <strong>Vercel</strong> — application hosting and edge
            functions.
          </li>
          <li>
            <strong>Anthropic</strong> — AI deal report generation. We send
            the property fields and scores but not your email or account
            identifiers.
          </li>
          <li>
            <strong>OpenAI</strong> — extracting property details from a URL
            you paste. Only the URL is sent.
          </li>
        </ul>
        <p>
          We don&apos;t sell your data, and we don&apos;t share it with
          advertisers.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="4. How long we keep your data">
        <p>
          We keep account and deal data for as long as your account is open.
          When you close your account, we delete your deals within 30 days
          and your account record within 90 days, except where we need to
          retain limited records to meet legal obligations (e.g. accounting
          records) or to defend legal claims.
        </p>
      </LegalSection>

      <LegalSection id="your-rights" title="5. Your rights">
        <p>Under UK GDPR you have the right to:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Access a copy of the data we hold about you.</li>
          <li>Correct data that&apos;s inaccurate or incomplete.</li>
          <li>Have your data deleted (the &quot;right to be forgotten&quot;).</li>
          <li>Restrict or object to certain processing.</li>
          <li>Receive your data in a portable format.</li>
          <li>
            Complain to the UK Information Commissioner&apos;s Office (ICO)
            if you think we&apos;re not handling your data properly.
          </li>
        </ul>
        <p>
          To exercise any of these rights, email{" "}
          <a
            href="mailto:privacy@capora.co.uk"
            className="text-[var(--color-primary)] hover:underline"
          >
            privacy@capora.co.uk
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="6. Cookies">
        <p>
          Capora uses only strictly-necessary cookies, set by Supabase
          Auth, to keep you signed in. We don&apos;t use third-party
          advertising or tracking cookies. If we add product analytics in
          the future we&apos;ll update this policy and ask for consent
          where required.
        </p>
      </LegalSection>

      <LegalSection id="security" title="7. Security">
        <p>
          Data is encrypted in transit (HTTPS) and at rest (Supabase Postgres
          with AES-256). Access to the database is limited to named team
          members with audit logging. We don&apos;t store payment-card
          details — when paid plans launch, those will be handled by a PCI
          DSS Level 1 payment provider.
        </p>
      </LegalSection>

      <LegalSection id="children" title="8. Children">
        <p>
          Capora is not intended for users under 18. We don&apos;t
          knowingly collect personal data from children. If you believe a
          child has signed up, please contact us and we&apos;ll delete the
          account.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="9. Changes to this policy">
        <p>
          We may update this policy from time to time. We&apos;ll show the
          updated date at the top, and for material changes we&apos;ll
          notify you by email or in-app banner.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="10. Contact">
        <p>
          Daramola Consulting Ltd, registered in England and Wales.
          <br />
          Data Protection contact:{" "}
          <a
            href="mailto:privacy@capora.co.uk"
            className="text-[var(--color-primary)] hover:underline"
          >
            privacy@capora.co.uk
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
