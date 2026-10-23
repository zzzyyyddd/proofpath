# ProofPath — Feasibility Review

As of 2026-10-23. No new live inference or deployment performed during this review. Existing scope, PRD and public disabled state preserved. PASS is limited to the evidence named; NOT VERIFIED is not an inferred failure or pass.

| Gate | Status | Evidence / remaining blocker |
| --- | --- | --- |
| Cloudflare zero-cost account configuration | PASS | Learner dashboard: Workers Free active; Paid not subscribed; no payment method. Reconfirm if account state changes. |
| First real full-contract Qwen comparison | PASS | Learner probe #1: HTTP 200, exactly one request, schema/quotes/controlled 1 Added + 2 Modified semantics pass. |
| Exact per-request neuron consumption | NOT VERIFIED | Dashboard 32.50 → 59.26; 26.76 observed delta only, not exact attribution. |
| Removal completion within 60-second deadline, test #3 | FAIL / INCONCLUSIVE | Interrupted at 60,006 ms, HTTP null; schema/quotes/semantics NOT EVALUATED. See timeout-investigation.md; no follow-up inference without approval. |
| Equivalent-requirement live semantics | FAIL | Genuine Added+Removed false split; prompt mitigation implemented but not live-validated. See semantic-investigation.md. |
| Short-fixture semantic repeatability | NOT VERIFIED | Proposed main/optional/removal/equivalent/ambiguous: 3 fresh runs each, no calls yet; approval required. |
| Single-request/no-retry/no-redirect probe controls | PASS | Offline guard checks second calls blocked after success/failure; CLI rejects conflicting budgets; no alternate provider or paid fallback. |
| Input and deterministic evidence boundary checks | PASS | Local extraction/quote/location/schema tests; maximum English pair exactly 30,000 each; identical real route/client parser tested and browser retest passed. |
| Full-size English live detection/context | NOT VERIFIED | Fixture prepared with changes at beginning/middle/end; accurate tokenizer/template/schema/output headroom and live execution pending. No truncation or limit reduction. |
| Token-dense/Unicode model context | NOT VERIFIED | Offline Unicode counting/serialization pass, but no exact complete-input tokenizer proof or corresponding live gate. |
| Complete serialized response budget | PASS | Local maximum English synthetic stream 68,514 bytes; existing Unicode/escape/line-map terminal and real-route boundary tests pass. No universal response-size guarantee. |
| Local PDF.js server extraction | PASS | Installed PDF.js tests extract real multipage PDF and map quotes; bad/page-limit/signature failures tested. Does not prove detection of every malformed/scanned structure. |
| PDF.js local production packaging | PASS after repair and trace verification | Initial worker omission found and repaired with explicit tracing include. Check using `node --import tsx scripts/check-build-traces.ts` after build. Deployed execution remains unverified. |
| Vercel deployed PDF/resource runtime | NOT VERIFIED | No deployment. Need accepted/rejected PDF and source-location checks on actual Hobby Node runtime. |
| Vercel Hobby comparison-only six/minute/IP rule | NOT VERIFIED | Official documentation describes an included Hobby rule; actual account configuration, free terms and seventh-request rejection not checked. No in-memory replacement or additional service adopted. |
| Public signed-out/laptop-off workflow | NOT VERIFIED | Not deployed; public live must remain disabled pending release gates. |
| Browser automation | NOT VERIFIED | Chrome manual sample/context/alignment/identical tests passed; Playwright not executed, no Chromium downloaded. |

No current unrepairable product/provider failure was found. The PDF worker packaging omission was an internal build correction, not a change to architecture, formats or limits. The maximum-fixture generator initially hit CJS top-level-await incompatibility; corrected to synchronous fixture writing, then generated and tested successfully.

## Deployment review

Official Vercel [function limits](https://vercel.com/docs/functions/limitations) currently document 4.5 MB request/response bodies, Hobby 2 GB memory, 250 MB ordinary uncompressed function size, and a 300-second maximum with Fluid Compute. The application's 4,100,000-byte multipart cap and 1,000,000-byte stream cap fit beneath those documented payload limits; route maxima are 30/120 seconds and comparison deadline 100 seconds. Actual account/runtime configuration and deployed measurements are still required, especially any legacy execution configuration. Documentation is not an account audit.

The [rate-limit limits table](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting) documents one Hobby rule per project, IP keys, fixed windows, and 1,000,000 included allowed requests. Account evidence remains required. In the intended existing Hobby project, inspect Firewall → Rules without deploying or accepting paid terms. Confirm a free rule can match method POST and path `/api/compare`, count by IP, use 6/60 seconds, and return 429. Validation/sample/static paths must not match. Stop at any paywall or unclear pricing dialog. Do not publish a rule, deploy or activate live traffic during this review. Seventh-request behavior requires later authorized deployed testing without inference quota.

PDF.js uses the Node runtime, parses original bytes, blocks detected extraction problems, and does not promise complete extraction. Both API traces must include `legacy/build/pdf.mjs` and its dynamically imported `pdf.worker.mjs`; only a real deployed PDF check can close the hosting gate. No native canvas, OCR, Worker deployment, or new PDF service is introduced.

## Smallest next step

Approve or revise the explicit live sequence in `live-test-plan.md`: 15 short-fixture requests, reviewed one at a time, plus one maximum-English request only after accurate context preflight. Maximum ceiling 16 additional requests; stop on first failure. In parallel, inspect actual Vercel Hobby rule availability without accepting paid terms. Keep `ANALYSIS_ENABLED=false` in application/deployment configuration. Public launch remains blocked on the context, repeatability and hosted-account/runtime gates.

Timeout investigation update: optional live test #2 passed once; removal test #3 was interrupted, not semantically evaluated. All 63 current offline tests and build checks pass after diagnostic/error-normalization repairs, but live repeatability remains blocked. Earlier statement that no unresolved failure was found predates test #3 and does not supersede this interruption evidence.

Semantic update: equivalent live fixture failed classification despite schema and source passes. Public live release remains blocked; revised alignment prompt is unverified. Prior first-pass results are retained for their old prompt version, not reused as certification of this revision.
