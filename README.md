# Dealscope

> Score property deals in seconds.

A UK BTL deal-analysis web app. Investors paste a Rightmove/Zoopla URL or fill the form manually and receive a 0–100 composite score across seven investment factors plus an AI-written deal report.

**Important:** Dealscope is an analytical tool, **not financial advice**. Every output must carry the disclaimer.

## Stack

- Next.js 16 (App Router) · TypeScript (strict)
- Tailwind v4 · custom UI primitives (shadcn-style)
- Supabase (Postgres + Auth via `@supabase/ssr`)
- Anthropic SDK (Claude Sonnet 4)
- `cheerio` for scraping · optional ScraperAPI proxy
- Deployed on Vercel

## Phase 1 status

Foundation only:

- ✅ Next.js + Tailwind + UI primitives
- ✅ Supabase client/server/middleware
- ✅ Middleware: auth + disclaimer + admin gating
- ✅ `/login`, `/signup`, `/disclaimer`, `/dashboard`
- ✅ SQL migration (`supabase/migrations/0001_initial_schema.sql`)
- ⏳ Phases 2–6 (analyse, scoring, AI report, scrapers, admin, PDF) — not yet built

## Local setup

```bash
pnpm install
cp .env.example .env.local      # then fill in Supabase + Anthropic keys
pnpm dev
```

Open <http://localhost:3000>.

## Supabase setup

1. Create a project on Supabase.
2. Run `supabase/migrations/0001_initial_schema.sql` in the SQL editor.
3. Copy the URL + anon key into `.env.local`.
4. Sign up via `/signup`, confirm email, then visit `/disclaimer` to activate the account.
5. To make a user an admin, in Supabase: `update public.users set is_admin = true where email = 'you@example.com';`.

## Deployment

Vercel project: `prj_oETp89kpcWZ4ZK5RmC22ZQTZsLlS` (already created).

1. Connect the GitHub repo to that project.
2. Set env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, optional `SCRAPERAPI_KEY`).
3. Push to `main` (or merge `claude/dealscope-v1-setup-6yJHm`) to deploy.

## Folder layout

```
src/
  app/
    (auth)/     login, signup, disclaimer
    (app)/      dashboard, analyse, deals, admin (protected)
    api/        analyse, scrape, report
  components/
    ui/         button, input, label, card, checkbox
    app/        custom domain components (DisclaimerFooter, …)
  lib/
    supabase/   client, server, middleware
    scoring/    7 factor scorers + composite
    scrapers/   rightmove, zoopla
    ai/         dealReport, prompts
    financials/ mortgage, yields, stampDuty, cashflow
    data/       static lookup tables (licensing, growth, …)
supabase/migrations/
```

## Disclaimer

Dealscope is an analytical tool, not a financial adviser. Scores and reports are for research only and must not be treated as a recommendation to buy, sell or finance any property. Always commission a survey, valuation and legal review before any property transaction. Consult a qualified mortgage broker.

© 2026 Daramola Consulting.
