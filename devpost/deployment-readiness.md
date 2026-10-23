# ProofPath — Deployment Readiness

Status: see [the current prioritized audit](deployment-audit.md) for the sample-only release path and exact commands. Local offline checks pass; live semantic equivalence has failed. Public deployment remains unverified. This record does not change the approved scope, PRD, or specification.

## Local manual review in Windows Chrome

From normal Ubuntu WSL:

```bash
cd ~/proofpath
npm run dev -- --hostname 0.0.0.0
```

Open `http://localhost:3000` in Windows Chrome. Keep the terminal running; Ctrl+C stops the local server. This local review is distinct from the required laptop-independent public deployment. Do not change firewall settings or expose the local server publicly for this check.

1. Open the clearly labeled static sample. Confirm three classified findings, exact Old/New evidence, separate AI interpretation, and persistent sample labeling.
2. Select the deadline or team-size finding. Open each source context, inspect surrounding text, and close it. Selection and list position should remain intact.
3. Return to live uploads. Upload `public/samples/old-rules.txt` into both panels. Compare: identical extracted text must produce the identical-document state without inference.
4. Replace one file with an invalid or empty file. The other valid file stays selected; comparison is disabled with a specific error. Replacement must not start analysis automatically.
5. With live analysis disabled, compare the different sample files. Expect an explicit configuration/unavailability error, retained uploads, and an optional static sample action. Sample results must never appear automatically as live output.
6. Use New Comparison and refresh. Both clear the live workspace. Try narrow viewport and keyboard Tab/Enter/Escape navigation, including the source viewer.
7. Upload a short text-based PDF. Check validation and limitations; use identical copies to inspect the no-inference flow. Invalid, scanned, or unsupported PDFs must fail explicitly.

To review the production build instead, stop the development server first:

```bash
npm run typecheck
npm test
npm run build
npm run start -- --hostname 0.0.0.0
```

No browser download or AI call is required for these checks. Browser automation remains optional/pending; manual review does not count as an executed Playwright test.

## Free deployment preparation

- Use only the learner's existing confirmed Vercel Hobby account. Do not enable a paid trial, upgrade, billing, or paid add-on. Stop if the dashboard requires any of these.
- Import the intended Git repository and use the existing Next.js framework detection, Node 22.x, the committed lockfile, and `npm run build`. No custom VPS, container, database, or Worker deployment is needed.
- Initially set `ANALYSIS_ENABLED=false`. Do not configure secrets using client-prefixed environment variables. A disabled deployment can demonstrate the sample, upload validation, and identical-text path without model use.
- Keep original files, extracted content, responses, credentials, and private environment files out of Git and application logs. No document-retention service is configured. Cloudflare data handling still applies when live inference is enabled.
- Confirm the actual account's free comparison-only throttling is available before public live analysis. Match POST `/api/compare`, six requests/minute/IP. Record the dashboard plan/rule evidence without secrets. Verify validation, static pages, and sample assets are excluded. Test enforcement without spending inference quota; do not leave a test bypass in production.
- If that free rule is unavailable, STOP for the learner's decision. In-memory counters are not a replacement for distributed enforcement; Turnstile has not been authorized.
- Keep live analysis disabled until the actual Cloudflare Workers Free account, bounded live evaluation, maximum-context headroom, and public protection gates are verified. No automatic retries, alternative provider, or paid fallback.
- Set server-side Cloudflare account/token environment variables only in the secure platform settings when needed. Never paste secrets into chat, screenshots, Git, or browser code.

## Required deployment evidence

- Public URL opens signed out and works with the development laptop/server off.
- Actual Vercel Hobby plan, request-body limits, execution limits, and free rule behavior verified for this account; documentation alone is insufficient.
- Deployed validation and compare endpoints accept approved boundary fixtures without truncation; PDF.js imports and per-page mapping work in the deployed Node runtime.
- Exact-identical uploads bypass inference; failure states remain errors. Streaming stages reflect completed work, and interrupted streams never yield completed results.
- Controlled live Qwen fixtures pass the specified repeated semantic gate; provider schema validity alone is insufficient. Maximum-size token/context gate is separately recorded.
- Every displayed quote/location matches its exact comparison extraction. Unicode response budget tests cover actual serialized UTF-8 output, not character estimates.
- Manual desktop/mobile/keyboard review and automated browser execution are recorded separately. Do not report pending checks as passed.

## Current external blockers

Cloudflare live access/free-plan confirmation, full production-schema live evaluations and maximum-context headroom, actual Vercel Hobby account throttling, deployed PDF/runtime behavior, and public signed-out testing remain pending. No failed gate has been silently bypassed. Windows Chrome exists, but this sandbox cannot launch it through WSL interop; browser automation remains unverified and no Chromium download is authorized.
