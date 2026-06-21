# REPLICATION.md — VAHDAM Mailer Studio

> Auto-generated replication baseline (2026-06-20). Lets a developer or AI agent clone this project to its current state. **Verify and enrich** the sections marked ⚠️ by reading the source — this baseline is extracted from package.json/README/structure only.

- **Last updated:** 2026-06-20 (auto-baseline)
- **Stack (detected):** Vercel
- **Part of:** Anchit's AI Hustle

---

## 1. Purpose
VAHDAM Mailer Studio — static HTML SPA with Vercel serverless functions for OpenAI server-side calls.

## 2. Current-state snapshot
- **Top-level structure:**
  - `CLAUDE.md`
  - `OPTIMISATION_NOTES.md`
  - `README.md`
  - `Vahdam Product Catalog RegionWise/`
  - `api/`
  - `data/`
  - `docs/`
  - `favicon.png`
  - `memory/`
  - `package-lock.json`
  - `package.json`
  - `playwright.config.js`
  - `scripts/`
  - `supabase/`
  - `test-results/`
  - `tests/`
  - `update.ps1`
  - `vahdam_mailer_architect_v34.html`
  - `vercel.json`
- ⚠️ Routes/pages/endpoints + what works now: inspect source and fill in.

## 3. Clone-to-exact-state runbook
```bash
npm install
```
**Scripts:**
- `npm run build` — `node scripts/build-catalog.js`
- `npm run dev` — `node -e "require('http').createServer().listen(3001)"`
- `npm run deploy` — `vercel --prod`
- `npm run test` — `playwright test`
- `npm run test:ui` — `playwright test --ui`
- `npm run test:install` — `playwright install`

⚠️ Confirm the exact build/run/deploy sequence against README + CI config. "Replicated at the same level" = the app builds, runs, and all routes/features above work.

## 4. Environment variables
- `OPENAI_API_KEY`
- `OPENAI_API_KEY_2`
- `OPENAI_API_KEY_3`
- `OPENAI_TEXT_MODEL`
- `OPENAI_IMAGE_MODEL`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_TEXT_MODEL`
- `GEMINI_API_KEY`
- `GEMINI_TEXT_MODEL`
- `XAI_API_KEY`
- `GROK_TEXT_MODEL`

## 5. Master prompt / Knowledge base
⚠️ If this is an AI/LLM/content app, document its master-prompt contract + domain knowledge here (model the structure on Vahdam-LifeCycle-OS/REPLICATION.md §4–5). Otherwise capture the core domain config a cloner must know.

## 6. Common pitfalls
⚠️ Fill in project-specific gotchas. General: never hardcode secrets (use env), keep deploy config in sync, develop from a non-iCloud git clone (iCloud corrupts .git).

## 7. Where to look next
- README and package.json scripts are the source of truth for setup.
- This project is slated for consolidation into **Vahdam-Lifecycle-OS** — see that repo's `docs/UNIFIED-ARCHITECTURE.md`.
