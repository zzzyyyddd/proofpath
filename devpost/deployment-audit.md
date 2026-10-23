# ProofPath deployment audit — 2026-10-23

Decision: ready for a user-approved **sample-only deployment attempt**, subject to the account checks below. Not deployed, not fully judge-ready, and not a reliable live AI comparison release. Budget Rp0. No inference, paid services, billing changes or deployment performed during this audit. Resume checkpoint: 41810a0.

## Verification evidence

- Node v22.23.3; package engines 22.x. Installed PDF.js 6.4.299 requires >=22.13.0 or >=24; verify Vercel build uses a sufficiently recent Node 22 patch.
- 79/79 deterministic tests PASS; typecheck PASS; offline evaluation PASS. Synthetic fixtures do not establish model quality. Maximum synthetic 30,000 + 30,000-character stream: 68,514 bytes; live token headroom unverified.
- Production build PASS. Both API traces include PDF.js legacy main and worker: 5,374,670 / 5,374,692 traced bytes. Local HTTP production tests PASS: home and sample assets, exact sample source text, TXT validation, generated text PDF extraction/page mapping, identical-text result, and different-document PROVIDER_NOT_CONFIGURED terminal error without a result event. Server forced ANALYSIS_ENABLED=false and CLOUDFLARE_FREE_PLAN_CONFIRMED=false.
- Sample requires only bundled JSON/TXT assets, not credentials or provider readiness. Three curated findings have checked source locations. Persistent banner, Inspector and source viewer identify sample mode. Opening it is explicit; failures never auto-open sample findings.
- Upload validation means extracted input is ready, not that analysis succeeded. Disabled-AI error retains valid uploads and suggests manual review or explicit sample exploration. Added upfront disclosure of this distinction. Exact identical text bypasses inference honestly.
- Existing Chrome preflight FAIL: no Linux Chrome at /opt/google/chrome/chrome. No download. Automated desktop/mobile execution remains NOT VERIFIED. Earlier learner manual UI checks remain separate evidence.
- Secret-value comparison against tracked files and built browser assets found zero matches; credential values never printed. Targeted private-key/token pattern scan found zero matches. .env.local and learner profile are ignored/untracked; .env.example alone is tracked. No console/stdout/stderr logging in src. Server credentials are read only in the server provider module; no NEXT_PUBLIC secrets or next.config env export. No database, paid SDK, hosted font dependency or alternate provider; production external inference uses only the explicitly gated Cloudflare endpoint, no retry/redirect/fallback.
- Added .vercelignore to explicitly omit local environment files, private context/config directories, generated output and local key files from CLI uploads. This does not replace Git history review before making a repository public.
- On entry next-env.d.ts differed because the dev server generated development paths; production build regenerated its production paths. No learner edits discarded.

## Prioritized release checklist

P0 — before approving the first sample deployment:

- [ ] Confirm the target Vercel account/project is Hobby, personal/noncommercial use, sufficient remaining quota, no Pro trial, card, upgrade or paid integration. Account state has not been inspected here. Stop if setup asks for payment.
- [ ] Review this diff, save a checkpoint, and review the intended public repository and history for private context/secrets. Existing build slices remain unchecked because feasibility gates failed or remain unverified; do not mark them done for a sample demo.
- [ ] Confirm deployment environment has ANALYSIS_ENABLED=false and CLOUDFLARE_FREE_PLAN_CONFIRMED=false for build and runtime. Leave both Cloudflare credentials unset in Vercel; do not copy .env.local or import development secrets.
- [ ] Confirm Next.js preset, repository root, npm ci, npm run build, Node 22.x and Fluid Compute. Existing route maxDuration values are 120s compare / 30s validation; non-Fluid legacy Hobby limits may differ.
- [ ] User approves deployment separately. Use the free generated vercel.app domain; no domain purchase or paid build machine.

P1 — after deployment, before sharing with judges:

- [ ] Verify production domain opens signed out/on another device with laptop server off. Standard Protection can protect preview URLs while allowing production domains; use the production domain in submission, not an authenticated deployment URL.
- [ ] Repeat sample selection/context, mobile layout, keyboard focus, TXT/PDF validation and page mapping, invalid/scanned PDF errors, identical comparison, different-document unavailable error, replacement/reset/refresh. Record actual deployed results separately from local passes. No Cloudflare credentials needed.
- [ ] Configure/verify the included comparison-only WAF rule if available on the confirmed free account: method POST AND path /api/compare, IP key, fixed 60 seconds, six requests, blocking 429 action. Test with identical documents while AI disabled. Document per-region counter limitations. If free rule unavailable, retain disabled AI and seek user decision before weakening the approved release gate.
- [ ] Inspect /api/documents/validate traffic too: it has bounded uploads/PDF parsing but no application rate limiter or origin guard. Compare's origin check is browser request hygiene, not authentication; Origin can be absent/spoofed by direct clients. Platform DDoS mitigation does not guarantee protection from quota exhaustion. Do not claim either endpoint is comprehensively abuse-proof.
- [ ] Check Usage before submission and during judging; Hobby exhaustion can pause availability. No paid fallback.
- [ ] Prepare the short demo video showing the curated sample and explicitly disclosing disabled public AI and semantic failures. Add tested public URL and public GitHub link; learner writes their own Devpost submission. Verify current hackathon submission requirements before submitting; no submission compliance asserted by this technical audit.
- [ ] Resolve saved Final Review / Code Tour and App Map items with learner evidence. Do not invent completion from tests or bypass them merely to call the project shipped.

P2 — blockers to a future live release (not required to inspect a labeled sample):

- Semantic equivalence failed twice, including revised prompt. Conservative grammar only reroutes recognized cases to Needs Review; no broad semantic correctness claim. No live retest authorized here.
- Repeated controlled semantic gate, maximum model context/output capacity, actual free account throttling/enforcement and deployed runtime remain separate gates. No scope/architecture/provider change proposed.

## Platform requirements checked against official documentation

Documentation checked 2026-10-23; account evidence and deployed runtime still pending.

- [Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions): 22.x supported, major-version selection receives rolling patches. package.json pins the major.
- [Function limits](https://vercel.com/docs/functions/limitations): with Fluid Compute Hobby maximum 300s, memory 2 GB, standard uncompressed bundle 250 MB; request/response payload maximum 4.5 MB. App multipart cap 4,100,000 bytes (two files <=2,000,000 each), response/stream budget 1,000,000 bytes, below platform limits. Traces prove local inclusion only, not platform packaging or execution.
- [Hobby](https://vercel.com/docs/plans/hobby): personal noncommercial use; monthly included 100 GB fast data transfer, 10 GB fast origin transfer, 1 million CDN requests, 1 million function invocations, 4 CPU-hours, 360 GB-hours provisioned memory; 100 deployments/day. Exhaustion generally requires waiting for reset rather than buying overage. Check the real account's remaining usage.
- [WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting): one Hobby rate-limit rule per project, fixed window, IP counting, 1 million allowed requests included. Up to three total custom firewall rules. Counters are per region; six/minute is not a global inference budget. Review any pricing dialog against the actual free account; do not consent to paid usage.
- [Deployment Protection](https://vercel.com/docs/deployment-protection): Standard Protection excludes production domains. Signed-out production-domain test is mandatory.
- [Environment variables](https://vercel.com/docs/environment-variables): configure platform variables for intended environments and redeploy after changes. Only two false flags needed; no provider credentials for this sample deployment.

## Exact next deployment commands — prepared, NOT executed

Run from normal WSL only after approval and the P0 account checks. Installed CLI help was inspected (64.7.0); its update checker cannot write its cache in this sandbox. No deployment/authentication/account mutation was attempted.

```bash
cd ~/proofpath
vercel login
vercel link
```

Select only the confirmed Hobby scope/project. Review .vercel/project.json locally to ensure correct target; never publish account configuration. In dashboard set both false flags for Preview and Production, leave Cloudflare secrets unset, confirm settings above. Then inspect upload filenames without deployment:

```bash
vercel deploy --dry --json > /tmp/proofpath-vercel-inputs.json
```

Review that file locally for accidental private files. After final user approval to publish:

```bash
vercel deploy --prod \
  --build-env ANALYSIS_ENABLED=false \
  --build-env CLOUDFLARE_FREE_PLAN_CONFIRMED=false \
  --env ANALYSIS_ENABLED=false \
  --env CLOUDFLARE_FREE_PLAN_CONFIRMED=false
```

Do not use --yes, --temporary, --turbo, paid integrations, or --prebuilt with ordinary .next output. Stop at any paid-plan prompt. A successful command is not proof that signed-out access, PDF handling, or submission readiness passed.
