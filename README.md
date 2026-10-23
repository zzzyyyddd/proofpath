# ProofPath

Evidence-first comparison of two versions of hackathon rules. Built from the approved Devpost Learn planning documents in `devpost/`.

## Current implementation

The application now includes TXT/Markdown/PDF server validation, original-file re-extraction during Compare, strict candidate contracts, exact evidence locations, truthful stage streaming, classified/Needs Review/withheld states, a responsive Evidence Inspector and Source Context Viewer, and an explicitly labeled static sample. Retry, replacement, reset and refresh are session-only. These paths have offline route/unit checks; browser checks and public deployment are separate gates.

Live Qwen has **failed semantic-equivalence checks**, including after prompt mitigation. The conservative safety gate handles only recognized clauses; general semantic reliability remains blocked. Public AI stays disabled. Maximum token/context capacity, Vercel Hobby account/rate-limit availability, and deployed PDF runtime behavior remain **unverified**. See the [prioritized deployment audit](devpost/deployment-audit.md) for the sample-only release checklist and approval-required commands. Public demo: https://proofpath-ten.vercel.app — public AI intentionally disabled. The learner reports deployed sample, TXT/PDF upload and identical-document checks passed; this audit independently confirmed anonymous home/sample access. The static sample is curated demonstration data, never a substitute for live inference.

## Run locally

Use Node.js 22 and npm in Ubuntu WSL:

```bash
npm ci --no-audit --no-fund
npm run dev
```

Open http://localhost:3000. No API credentials are required for the foundation or offline tests.

For manual Windows Chrome testing from WSL, run `npm run dev -- --hostname 0.0.0.0`, then open http://localhost:3000 in Windows Chrome. Cross-OS browser automation is not required. See [deployment readiness and manual checks](devpost/deployment-readiness.md) for the review sequence and pending public deployment gates.

```bash
npm run typecheck
npm test
npm run eval:offline
npm run build
npm run start
```

`npm test` runs the native Node test harness in-process through the installed TypeScript loader. Tests inject synthetic provider responses and do not make inference calls. The offline evaluation uses explicitly synthetic candidate fixtures; it does not measure model quality.

## Browser verification without inference

Use the existing Google Chrome installation; no browser download is required or performed by these commands:

```bash
npm run browser:check
npm run test:e2e
```

Both projects use Playwright's `chrome` channel. Linux Playwright normally discovers Linux Chrome, not Windows Chrome. To explicitly test the existing Windows executable from normal WSL:

```bash
export PLAYWRIGHT_CHROME_EXECUTABLE_PATH='/mnt/c/Program Files/Google/Chrome/Application/chrome.exe'
npm run browser:check
# Run only if the browser check succeeds:
npm run test:e2e
```

The preflight launches an isolated temporary browser profile and checks a local page without contacting any AI provider. Cross-OS browser launching may fail even when the executable exists; report the preflight error before choosing another browser setup. In the agent sandbox, Windows Chrome failed with `WSL ERROR: UtilBindVsockAnyPort:317: socket failed 1`; the default channel found no Linux Chrome at `/opt/google/chrome/chrome`. No browser was downloaded. A normal WSL check is still required.

Stop any other server using port 3000 first. The test runner starts its own application server with live inference forcibly disabled, so it cannot call a paid or free model. It checks desktop/mobile uploads, identical-document comparison, exact sample context, replacement, refresh, disabled-provider errors, and interrupted streams. Browser screenshots/traces go to ignored `test-results/`. Browser tests do not prove live Qwen semantics or deployed Vercel behavior.

## PDF support

PDF.js 6.4.299 parses original bytes on the server. Unsupported scanned/image-containing pages, unreadable content, suspicious order, encrypted documents, parser failures, or exceeded limits produce explicit blocking errors. Simple extracted PDFs retain a visible layout/completeness limitation. Page references are derived from extraction, never model output. The detector is deliberately conservative and cannot detect every possible lost/reordered element.

## Cloudflare readiness

Copy the secret-free `.env.example` to an ignored `.env.local` and configure credentials locally. Never put keys in chat, Git, client-side variables, screenshots, or logs. Next.js loads this file for the application; the standalone live evaluation expects environment variables in its process. Leave live analysis disabled until Workers Free is confirmed and deliberate testing is intended.

The live probe is opt-in and makes at most **one** call per invocation, with no retries or fallback:

```bash
node --env-file=.env.local --import tsx scripts/evaluate-model.ts --confirm-free-plan --max-calls=1
```

This checks one controlled main fixture with the full application schema and an independent exact semantic oracle. Optional `--fixture=removal`, `--fixture=equivalent`, `--fixture=ambiguous`, or `--fixture=optional` selects one different fixture; each invocation still makes at most one call, never an automatic suite or retry. Exact expected quotes are intentionally strict: a mismatch fails rather than silently relaxing the gate. These commands require separate approval; prior learner-run probes include passes and semantic failures recorded in `devpost/checklist.md`. A single pass does **not** complete the three-run/multiple-fixture repeatability gate or maximum-context gate. A successful HTTP response, valid schema, or exact quotation is not proof of correct semantics. No paid plan or billing activation is authorized.

## Reliability boundaries

- Source matching checks exact quotations against a fixed canonical extraction and derives locations itself.
- Required missing, fabricated, wrong-source, or ambiguous-location evidence withholds the candidate.
- Needs Review is distinct from withheld evidence. Withheld candidates mark analysis incomplete.
- No automatic eligibility or authenticity judgments; no exhaustive-detection guarantee.
- Historical learner-run provider probes include successes and repeated semantic failures. Maximum context and actual Vercel Hobby protection remain unverified. Deployed PDF validation is learner-verified; automated browser coverage remains unverified.

No database, persistent user-document storage, alternate model/provider fallback, VPS, Docker, or application background jobs are part of the approved architecture.

## Submission evidence

Public repository: https://github.com/zzzyyyddd/proofpath. See [submission readiness](devpost/submission-readiness.md) for mandatory requirements, evidence limits and the recording plan. The 79 deterministic tests use synthetic provider responses; neither they nor the static sample prove live model accuracy.

The Devpost Learn Skill Pack is pre-existing development tooling; see [third-party notices](THIRD_PARTY_NOTICES.md). Original ProofPath development is recorded in October 22–23, 2026 commits. No open-source license for the original application has been selected.
