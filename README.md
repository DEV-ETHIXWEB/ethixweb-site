# Ethixweb Site

**Client:** Ethixweb (internal)

## What this project is

The official marketing website for [Ethixweb](https://ethixweb.com), a digital operations agency specializing in websites, AI automation, CRM integrations, SEO, and digital marketing for US-based businesses. The site covers services, industries, portfolio, pricing, careers (with an online application flow), and the main contact/lead-gen forms.

## Tech Stack

- **Framework** — [TanStack Start](https://tanstack.com/start) (React + Vite)
- **Styling** — [Tailwind CSS v4](https://tailwindcss.com)
- **Animations** — [Framer Motion](https://www.framer.com/motion)
- **UI Components** — [Radix UI](https://www.radix-ui.com)
- **Icons** — [Lucide React](https://lucide.dev)
- **Email** — [Resend](https://resend.com)
- **File storage** — [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- **Deployment** — [Vercel](https://vercel.com)

## Project Structure

```
src/
  routes/                 File-based routes (TanStack Router) - filenames define URLs, do not rename
  components/
    layout/               Site chrome on every page (SiteLayout, Navbar, Footer, ThemeProvider, ...)
    shared/               Cross-page building blocks (Container, Reveal, PageHero, hero web system, ...)
    home/                 Homepage-only sections (SystemShift, PipelineDiagram, GlobalNetwork)
    portfolio/            Portfolio-only (CaseStudyCard, AnimatedStat)
    careers/              Careers pages (JobCard, SystemConstellation)
    policies/             Policy pages (PolicySection)
    assessment/           Careers assessment exam UI
    gads/                 Standalone Google Ads assessment UI
  lib/
    assessment/           Assessment domain: Gemini generation, scoring, session, report
    gads/                 Google Ads assessment domain: questions, scoring, PDF, store
    screening/            Screening domain: Anthropic client, rubrics, tokens
    *.ts                  Cross-cutting: supabase, email, clickup, leads, rate-limit, json-ld, ...
  hooks/                  React hooks
  assets/                 Bundled images (hashed at build)
public/                   Static files served by URL (fonts, og-image, emblem-3d.html, careers images)
```

Components are grouped by the pages that use them; a component moves to `shared/` only once a second page needs it. `public/emblem-3d.html` contains a minified three.js bundle and is deliberately excluded from Prettier (see `.prettierignore`).

## Local Setup

1. **Prerequisites** — Node.js v20.19+ or v22.12+, npm v10+
2. **Clone the repo**
   ```bash
   git clone https://github.com/DEV-ETHIXWEB/ethixweb-site.git
   cd ethixweb-site
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Set up environment variables** — copy the example file and fill in real values (see below)
   ```bash
   cp .env.example .env
   ```
5. **Start the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Defined in `.env` (never committed — see `.env.example` for the template):

- `RESEND_API_KEY` — email delivery for the contact form
- `VITE_SITE_URL` — production domain, used for sitemap/canonical URLs/email templates
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob storage, used for careers/resume uploads

## Candidate Questionnaire ("Let's Get to Know You")

A 15-question candidate questionnaire (10 about the person, then the working terms and 5 about fit), sent as one private link per candidate.

- **Candidate page:** `/questionnaire#<token>`. The token sits in the URL fragment, so it never reaches server logs or Referer headers.
- **Admin:** `/admin/questionnaire`, signed in with `GADS_ADMIN_PASSWORD`. Create an invitation (name + email), copy the link (it is shown once; use "New link" to issue a replacement, which kills the old one), revoke or expire unused links, read answers, reopen a submission for correction (with a reason, kept in the audit trail), resend the email, and export CSV.
- **Flow:** landing → candidate details (name, phone, email, college, optional LinkedIn; the email must match the invitation) → questions 1–10 → working terms → questions 11–15 → review → submit. Progress is saved to the server on every step, so a refresh or a different device resumes in place.
- **One submission per candidate** is enforced in Postgres, not the browser: a partial unique index allows one live invitation per normalized email, another allows one live response per invitation, and `submit_questionnaire()` locks the row, inserts the response and marks it submitted in a single transaction. A failed insert leaves the invitation unused.
- **Email:** every accepted submission is emailed in full to `QUESTIONNAIRE_REPORT_EMAIL` (default `info@ethixweb.com`) via Resend. A failed send never blocks the submission; it shows as `email failed` in the audit trail and can be resent from the dashboard.
- **Setup:** run `supabase/migrations/0011_candidate_questionnaire.sql`, then set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` and `GADS_ADMIN_PASSWORD` (and optionally `QUESTIONNAIRE_REPORT_EMAIL`) in Vercel. Locally, without Supabase, it runs on an in-memory store that resets on restart; it refuses to do that on a Vercel deployment.
- **Follow-ups:** a question with `showIf` is only asked (and only required) when an earlier answer matches. Question 13a, the Delhi in-person meet on 30–31 October, appears only after a yes (option A or B) to the compensation question; the server drops it otherwise.
- **Content:** questions and option text live in `src/lib/questionnaire/questions.ts`; the working-terms cards are in `src/components/questionnaire/WorkTerms.tsx`.

## Deployment Notes

- Hosted on **Vercel**, auto-deploys from the `main` branch.
- Framework preset: Vite · Build command: `npm run build` · Output directory: `dist` · Node.js version: 22.x
- Environment variables must be added separately in **Vercel Dashboard → Project → Settings → Environment Variables** — they are not read from `.env` in production.
- After adding/rotating a Vercel Blob store, pull the token locally with `npx vercel env pull`.

## Branching & Workflow

- `main` is protected — no direct commits/pushes.
- All work happens on `feat/<clickup-task-slug>` branches (e.g. `feat/contact-form-fix`), one branch per task, merged via PR.

## Key Contacts

- **Client:** Ethixweb (internal project)
- **Account/PM:** Amar
- **Lead Developer:** Akash (akash@ethixweb.com)
