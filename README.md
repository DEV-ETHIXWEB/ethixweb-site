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
