# Strip repo down to a static marketing site

**Date:** 2026-07-10
**Status:** Approved (design), pending implementation plan

## Goal

Reduce this repo from a full working product (Next.js app + API backend +
Supabase + Python microservice) down to just the public marketing/landing
site — to cut repo bloat and complexity. No database, no auth, no server
functions: a fully static site.

## Why

The current repo bundles the entire DASES product (teacher/student/admin
portals, 61 API routes, Gemini AI integration, a Python FastAPI booklet
service, a committed Python venv, generated PDF artifacts, and internal
docs) alongside its marketing pages. Going forward this repo should only
contain what's needed to present the product publicly.

## Safety: preserve the full app first

Before any deletion, create a `full-app` branch from the current `main`
HEAD. This is a complete, clearly labeled snapshot of the working product.
All stripping-down work happens on `main` afterward, so `main` becomes the
lean marketing repo and `full-app` remains the recoverable source of truth
for the real product.

## Scope

### Delete

**App portals**
- `src/app/teacher/`
- `src/app/student/`
- `src/app/admin/`
- `src/app/SignIn/`
- `src/app/unauthorized/`

**Backend**
- `src/app/api/` (all 61 routes)
- `src/app/reports/[submissionId]/` (its UI is folded into `/sample-report`, see below)
- `src/app/view-pdf/` (generic PDF viewer, unused once `/sample-report` is self-contained)
- `src/middleware.js` (role-based auth gate — no longer needed with no portals/auth)

**App business logic**
- `src/lib/gemini.js`
- `src/lib/gemini-functions.js`
- `src/lib/bloom-classifier.js`
- `src/lib/paperStore.js`
- `src/utils/pdfGenerator.js`
- `src/utils/completePdfGenerator.js`

**Python services**
- `python_backend/` (including generated `output_booklets/`)
- `scripts/` (including generated `out/`)

**Dev/build artifacts and internal docs**
- `myenv/` (committed Python virtualenv — should never have been committed)
- `Archive.zip` (89MB, unidentified archive)
- `gemini_eval.log`
- `output.txt`
- `supabase_migration_share_syllabus.sql`
- `report_template.tex` (LaTeX template used only by the Python booklet service)
- `DASES_Stakeholder_Report.md`
- `DASES_User_Journey.md`
- `vercel.json` (only existed to extend timeouts for AI/upload API routes)
- Dead component stubs confirmed unused via grep before deletion: `src/components/HeaderFinal.js` (empty file), `src/components/Headersample.js` (draft/alternate header, if grep confirms no imports)

All of the above remain fully intact on the `full-app` branch.

### Keep

- Public marketing pages: homepage (`src/app/page.js` + `LandingPage.jsx`),
  `about`, `pricing`, `solutions`, `products/dases`, `products/qp-moderation`,
  `blog` (+ `blog/[slug]`), `DASESLanding`, plus `layout.js`, `sitemap.js`,
  `robots.js`
- `sample-report` (reworked — see below)
- All marketing components under `src/components/`: `landing/`, `shared/`,
  `products/`, `solutions/`, `about/`, `blog/`, `pricing/`, and the
  standalone Header/Hero/Feature/Review/FAQ/BookDemoForm components
- `public/` static assets, including existing `public/samples/question_paper.pdf`
  and `answer_sheet.pdf` (already static, no change needed)
- `MARKETING_OVERVIEW.md`, `README.md` (copy may later be lightly edited to
  stop describing removed backend features — not a blocker for this pass)

### Rework: `/sample-report`

Current behavior:
- "Question Paper" and "Answer Sheet" tabs already iframe static PDFs from
  `public/samples/` — no change needed.
- "Evaluation Report" tab iframes the live `/reports/[submissionId]` page,
  which fetches `/api/reports/[id]` (Supabase-backed) and renders a
  detailed score/criteria breakdown, and offers a "Download Report PDF"
  button that calls `/api/generate-pdf`.

New behavior:
- Delete the iframe-to-another-route approach. Render the report UI
  (question/criteria/score breakdown, currently in
  `src/app/reports/[submissionId]/page.js`) directly inside the
  `sample-report` page component.
- Feed that UI from a static JSON fixture (e.g.
  `public/samples/report-data.json`, or inlined in the component) matching
  the exact shape the current report page already expects
  (`report.results[]`, `submission`, `paperData`, `detectionResult`).
- Replace the "Download Report PDF" button's `/api/generate-pdf` call with
  a direct link to a pre-baked static file, `public/samples/evaluation_report.pdf`,
  following the same static-file pattern already used for the other two tabs.

**Deferred decision (explicitly left open by the user):** whether the
fixture's content is real anonymized data pulled from Supabase later, or
synthetic placeholder data written now. This design builds the component
against a synthetic-but-realistic fixture in the correct data shape, so
swapping in real data later is a one-file change with no component rework.
Student-answer images in the fixture will use placeholder images (or the
existing static PDFs) rather than live Supabase storage URLs, keeping the
site fully independent of Supabase.

## Config & dependency changes

- `next.config.mjs`: switch to `output: 'export'`; drop the Supabase image
  remote-pattern config and native-binary bundler exclusions (no longer
  relevant without Supabase/sharp/canvas/pdfjs-dist).
- `package.json`: remove Supabase (`@supabase/auth-helpers-nextjs`,
  `@supabase/supabase-js`), `@google/genai`, `bcryptjs`, PDF-generation
  libs (`jspdf`, `pdf-to-img`, `pdf2pic`, `sharp`, `canvas`,
  `@napi-rs/canvas`, `svg2pdf.js`, `path2d`, `dommatrix`, `jsonrepair`),
  `xlsx`, `pdfjs-dist`, `mathjax` — final removal list confirmed by
  grepping the surviving `src/` tree for imports before deleting each
  entry, not assumed blind.
  Confirmed keeps: `next`, `react`, `react-dom`, `framer-motion`,
  `react-icons`, `lucide-react`, `react-slick`/`slick-carousel`,
  `canvas-confetti`, `three`, `@react-three/fiber`,
  `@react-three/postprocessing`, `react-markdown`, `remark-gfm`,
  `react-latex-next` (report question text uses LaTeX).
- Delete `vercel.json`.
- Keep `eslint.config.mjs`, `jsconfig.json` unchanged.
- Regenerate `package-lock.json` after the dependency prune.

## Verification

- `npm run build` succeeds with `output: 'export'` and zero API routes.
- `npm run dev` + manual browser check of every kept route, including all
  three `/sample-report` tabs.
- Grep the final `src/` tree for leftover references to `supabase`,
  `@google/genai`, `/api/` to catch dead imports or broken links.

## Out of scope for this pass

- Editing README/MARKETING_OVERVIEW copy to remove mentions of features
  that no longer exist in this repo (teacher portal, AI evaluation, etc.)
- Sourcing real anonymized demo data from Supabase (deferred per above)
