# ProofPath — experimental public AI activation

Prepared 2026-10-23. Owner authorized experimental public AI, contingent on Rp0/no payment method/no paid plans. **Code preparation complete; activation BLOCKED pending actual free-account/environment/firewall verification and an approved deployment.** No inference, deployment, push, Cloudflare settings/billing change or Vercel settings change was performed during preparation.

This release decision supersedes earlier sample-only deployment instructions; it does not erase the recorded semantic failures or certify the original full reliability gates. Scope, model, prompt, evidence verifier, grammar safety guard and document limits are unchanged. The prior untracked `ai-demo-runbook.md` is preserved separately, not included in this code checkpoint.

## Dashboard identifier follow-up

The owner reports the Hobby rule has been created: display name `proofpath-compare`, WAF resource ID `rule_proofpath_compare_B67HTY`, path `/api/compare`, six requests per 60 seconds per IP, HTTP 429. This is owner-verified dashboard evidence; the agent has not inspected or changed the dashboard.

The SDK does **not** look up an arbitrary WAF resource by its generated resource ID. Its first argument must equal the configured **Rate limit ID in an @vercel/firewall condition**, as specified by the [official SDK instructions](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting-sdk). We now intentionally use the owner's supplied identifier `rule_proofpath_compare_B67HTY` as that SDK key; the display name is never passed. Confirm the dashboard condition contains this exact string. Merely displaying it as the WAF resource ID is not sufficient.

**Activation remains blocked until that SDK condition and enforcement are confirmed.** The reported `/api/compare` path filter alone protects the upload route at the edge, but cannot match the SDK's separate GET `/.well-known/vercel/rate-limit-api/rule_proofpath_compare_B67HTY`. Review/update the existing included rule's condition to `@vercel/firewall` with the exact SDK key, rather than buying/adding another rate-limit rule. Do not combine the SDK condition with an AND path `/api/compare` or POST condition. No platform rule was edited during this correction. Missing/mismatched SDK rules continue to block inference with 503; there is no fallback to trusting a display name, path rule or local counter.

Offline regression checks assert the exact identifier passed to the checker and the actual installed SDK's outgoing URL, GET method and `x-vercel-rate-limit-api` header. All existing fail-closed and source-verification tests remain in place. This is local wiring evidence, not deployed enforcement evidence.

## Implemented safeguards and runtime audit

- `enforceComparisonRateLimit` checks Vercel's native firewall SDK Rate limit ID `rule_proofpath_compare_B67HTY` (display name `proofpath-compare`) before multipart parsing/extraction whenever deployed analysis is enabled. `@vercel/firewall` 1.2.6 is pinned, an open-source SDK with no additional runtime dependencies. No new paid service/account, storage or per-instance counter.
- A missing rule, blocked/invalid service response, check exception/timeout (2 seconds), unavailable platform variables or malformed/missing platform IP fails closed with generic HTTP 503 and **zero model requests**. A limited request returns HTTP 429, Retry-After 60 and zero model requests. SDK missing-rule behavior alone is permissive; the app explicitly rejects its error field.
- The firewall URL uses the platform-provided production hostname, never the caller's Host/X-Forwarded-Host. Only the platform client IP and trusted host are passed into the SDK; incoming cookies and Authorization are not forwarded. Vercel is trusted to supply x-real-ip. These headers are not a trust boundary on arbitrary non-Vercel hosting; enabled local production fails closed. Local development bypasses the platform check and must not be exposed publicly with AI enabled.
- Configure **six comparisons per 60 seconds per IP** using the one included Hobby SDK rate-limit rule. Counters are distributed across instances within a region, **not globally across regions**. No exact global quota, authentication, daily reservation, cross-request idempotency or bot-proof claim. Manual retry/duplicate HTTP requests remain new comparisons and consume capacity.
- One accepted comparison POST calls the existing generator once, which performs one nonstreamed REST fetch with redirect:error. No automatic retries, model/provider fallback, output repair or paid fallback. Client in-flight guard suppresses double-clicks within an attempt; a new manual attempt can issue another call. There are two outbound operations on an allowed non-identical request: a firewall check and at most one model inference request.
- Identical canonical text bypasses inference. When public analysis is enabled it still passes through the firewall, so it can be used to test throttling without spending inference quota. With analysis disabled, existing sample/validation/identical flows do not require the firewall or Cloudflare credentials.
- Original uploads are re-extracted before comparison. Existing 2,000,000-byte/file, 30,000 extracted code points/file, 10 PDF pages, 4,100,000-byte multipart and 1,000,000-byte output/stream limits remain. Oversize input/output is rejected, never silently clipped.
- Node runtime, compare maxDuration 120s, route deadline 100s, provider deadline 60s, PDF task deadline 15s and browser request timeout 110s remain. Validation route maxDuration 30s. Use Node 22.x (PDF.js requires >=22.13.0); Vercel Fluid Compute supports the configured durations. Payloads fit the documented 4.5 MB platform limit. These are compatible settings, not proof of actual production execution.
- Provider 429, HTTP/service errors, interruption, invalid schema/finish/evidence and truncated streams produce explicit errors or existing truthful incomplete/withheld states; they do not open the sample or invent findings. A local timeout/disconnect does not prove upstream cancellation or quota refund.
- Account ID/token are read only in server provider code. Neither is included in browser variables, responses or application logging. Existing literal provider endpoint and fixed model are retained. The SDK can log its fixed rule ID when missing, never the Cloudflare credentials.
- Added an upfront experimental-classification warning. Exact quote occurrence is not proof of correct classification, exhaustive detection, authenticity or eligibility. Repeated equivalence failures remain known; the finite grammar guard does not solve general semantic equivalence.

## What was actually verified

| Check | Status / scope |
| --- | --- |
| Deterministic tests | 86/86 PASS, synthetic network only. New tests exercise actual SDK response handling and real compare route/client parser. |
| Protection errors | Missing rule, 403, unexpected HTTP, simulated timeout/network failure, missing/invalid platform configuration and IP block inference. 429 includes Retry-After. |
| Allowed protected result | One synthetic firewall success + exactly one synthetic model request; real original-text extraction, source verifier, NDJSON and production client parser yield 1 Added + 2 Modified with exact quotation offsets. Distinct provider-path titles prove no curated result substitution. |
| Provider failure behavior | Protected route propagates quota/service/interruption errors, one model fetch per attempt, no result fabricated. Existing provider timeout/body/schema and semantic-safety regressions remain passing. |
| Typecheck / production build | PASS. Both API traces include PDF.js main and worker. |
| Browser UI | Added a desktop/mobile test of provider-path Overview/Inspector/context rendering, explicitly synthetic. Fourteen total cases discovered. Chrome preflight FAIL: no Linux Chrome installed. Browser tests NOT EXECUTED; no browser downloaded. Source and route/parser checks do not replace a browser test. |
| Current local credentials | Presence/account-ID format checked without values; saved flags remain false. Token permissions/validity not authenticated here. |
| Production credentials/network/model | NOT VERIFIED during preparation; no linked Vercel configuration or account connector was available. Prior owner-reported main probe HTTP 200/source PASS supports this REST integration historically, not this deployed revision. |
| Cloudflare/Vercel Free state, remaining quota, real firewall rule | Owner reports the Hobby path rule exists with the details above. SDK condition/enforcement and remaining quota are not independently verified; confirm before activation. |
| Security scan | Exact configured credential values checked against intended code/docs and built client assets without printing values. No match. No new unsafe application logger or client environment export. |

## Exact Production environment checklist

Set these four **manual server-side Production** variables using Vercel's secure dashboard. Do not paste values into chat, terminal commands, screenshots, URLs, Git or NEXT_PUBLIC variables. Leave local files and Preview/Development disabled unless separately intended.

| Variable | Production value |
| --- | --- |
| ANALYSIS_ENABLED | true, only in the final approved activation deployment |
| CLOUDFLARE_FREE_PLAN_CONFIRMED | true, only after verifying the actual credential's account is Workers Free |
| CLOUDFLARE_ACCOUNT_ID | existing secret account identifier, copied privately |
| CLOUDFLARE_API_TOKEN | existing secret token with minimum necessary Workers AI permission |

The original provider needs exactly these four. The added firewall also requires Vercel's **automatic system variables**: VERCEL=1, NODE_ENV=production and VERCEL_PROJECT_PRODUCTION_URL set to this project's production hostname. Keep access to system environment variables enabled. Do not manually spoof system variables on another host. No extra manual application secret, database URL, Redis or CAPTCHA configuration is required.

The installed SDK optionally reads VERCEL_AUTOMATION_BYPASS_SECRET, RATE_LIMIT_SECRET, PUBLIC_VERCEL_FIREWALL_PATH_PREFIX and NEXT_PUBLIC_VERCEL_FIREWALL_PATH_PREFIX. None is required or newly configured here. Do not add them for the basic public production deployment; leave custom path prefixes unset. Protected previews may need automation bypass configuration and are outside this public-production procedure. Cloudflare secrets must never be put in any of these variables.

## Ordered deployment steps — prepared, NOT executed

1. Read-only account checks: verify Cloudflare Workers Free still active on the credential's actual account, no Workers Paid/payment method/paid gateway and sufficient allowance remaining. Verify actual Vercel Hobby project eligibility and remaining free usage. Stop on any paid/trial/upgrade prompt. Local confirmation flags cannot enforce account billing state.
2. In Vercel Firewall, use the **one included Hobby rate-limit rule**. If occupied, review/replace the existing comparison-only rule rather than buying another. Select condition **@vercel/firewall**, Rate limit ID **rule_proofpath_compare_B67HTY**, fixed 60-second window, limit **6**, default/blocking 429 action (not Log). Use default IP bucketing. Do not add a path=/api/compare or method=POST condition to the SDK rule: the internal check is GET /.well-known/vercel/rate-limit-api/rule_proofpath_compare_B67HTY, not the upload URL. Review that the rule is included at Rp0, then publish only when this configuration step is approved. No configuration was changed in preparation.
3. Review the local code checkpoint and source/secret exclusions. Updating the connected Git branch may auto-deploy, so **do not push merely to save work**. Keep local `.env.local` and private context excluded. Scope/PRD and safety checks stay unchanged.
4. Link the correct existing Hobby project from normal WSL only when approved:

   ```bash
   cd ~/proofpath
   vercel login
   vercel link
   ```

   Confirm this is the existing ProofPath project. No new project, paid build machine or service. In dashboard verify Next.js preset, Node 22.x, npm ci / npm run build, Fluid Compute, system variables, public production domain and Production secrets. Keep Preview AI disabled.
5. For a **no-inference deployment smoke pass**, after separate deployment approval, use the same reviewed source but override the enable flag false:

   ```bash
   vercel deploy --prod \
     --build-env ANALYSIS_ENABLED=false \
     --build-env CLOUDFLARE_FREE_PLAN_CONFIRMED=false \
     --env ANALYSIS_ENABLED=false \
     --env CLOUDFLARE_FREE_PLAN_CONFIRMED=false
   ```

   Check signed-out home, sample, PDF/TXT upload and identical-text behavior. This does not test the SDK gate (it is intentionally bypassed when AI is disabled).
6. After the free-account/rule/settings gates and **explicit approval to activate**, deploy the reviewed source with the four Production dashboard variables set as above, overriding only the two nonsecret flags:

   ```bash
   vercel deploy --prod \
     --build-env ANALYSIS_ENABLED=true \
     --build-env CLOUDFLARE_FREE_PLAN_CONFIRMED=true \
     --env ANALYSIS_ENABLED=true \
     --env CLOUDFLARE_FREE_PLAN_CONFIRMED=true
   ```

   No credentials on the command line. Existing source includes the favicon commit. Do not use --yes/--turbo or a paid upgrade. An env edit affects new deployments, not the already-running snapshot. Successful deployment is not evidence that model semantics or protection passed.
7. Before model use, test **identical** TXT pairs from the production domain: accepted protected comparisons return the identical state and make zero inference calls. In one fixed window, the seventh comparison from the same IP should return HTTP 429. Check firewall evidence; rate-window boundaries can affect observation. Missing protection must instead return 503 with no inference. Wait for reset before judging; do not bypass/disable protection if this fails.
8. Only after separate approval for **one public browser inference**, perform the controlled test below. Observe actual Cloudflare usage read-only before/after; no exact per-call claim from aggregate differences. Preserve both success and failure. Do not rerun automatically.

No commands above have been executed during preparation. Production remains unchanged. A later Git push is a separate publishing action; the CLI path avoids an accidental push-triggered deployment during preparation.

## One public browser comparison — ready as a test procedure, not yet verified

Use https://proofpath-ten.vercel.app signed out, after steps 1–7. Upload public/samples/old-rules.txt as Old and new-rules.txt as New. These are original synthetic inputs; do not select Explore Sample Analysis. Confirm both filenames and validation, then click Compare Documents **once**. This can consume real model quota.

Record continuous actual processing, then Comparison Overview and Evidence Inspector. Expected fixture counts are one Added and two Modified, not a promised outcome. Select a finding, verify the exact Old/New quotation against the uploaded text, open Source Context and compare the highlighted location. Inspect separate interpretation/action/uncertainty. Genuine results must use the upload attempt, have no static-sample banner, and never use static-controlled-sample as the attempt ID. Loading curated findings afterward is a separate labeled mode.

If the result is incomplete, semantically wrong, quota-limited or interrupted, keep it as an unsuccessful test. A quoted passage can exist while a change label is wrong. Do not record a sample as the real outcome, edit away failure, weaken evidence checks or auto-retry. A passing single browser example proves that observation only.

## Risks and rollback

- Per-IP regional throttling is not user authentication or a global spending cap. Many IPs/regions and deliberate duplicate requests can drain Free allowance and deny judging availability. The upload-validation endpoint remains bounded but is not covered by the comparison SDK rule; PDF/extraction traffic can consume Hobby compute. A rule can be removed or weakened later; only a missing/erroring rule is detected by this code, not an incorrectly permissive rate window/threshold. Recheck real dashboard settings and enforcement.
- No global daily in-app quota is claimed. Under actual Workers Free, Cloudflare documents 10,000 neurons/day, then rejection; only the provider/account configuration provides that zero-paid-overage boundary. Account changes outside this code can invalidate the assumption. Vercel free resource exhaustion can pause availability. No zero-cost/uptime guarantee without actual plan evidence.
- Model repeatability and full 30,000-character input context are unverified; previous semantic failures persist. Owner's experimental-release decision is not a semantic acceptance pass. No automatic eligibility, complete-detection, accuracy or authenticity claim.
- Production credentials, deployed SDK/rule behavior and genuine browser UI path still need testing. Prepared source is compatible with Node/REST; it is not proof of successful production inference.
- Emergency stop: set ANALYSIS_ENABLED=false for Production and deploy that disabled configuration **with user approval**, or restore the known disabled deployment through the platform. Existing deployments retain old variable snapshots, so changing a dashboard value alone is not an immediate kill switch. No rollback was executed here.

## Official references checked

- [Vercel SDK and timeout](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting-sdk): ID-based check, custom key semantics, regional counters and bounded timeout.
- [WAF Hobby limits](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting): one Hobby rule, fixed-window IP keys, one million allowed requests included. Actual account eligibility/settings remain to verify.
- [Vercel system variables](https://vercel.com/docs/environment-variables/system-environment-variables) and [request headers](https://vercel.com/docs/headers/request-headers): runtime/platform hostname and IP source.
- [Function limits](https://vercel.com/docs/functions/limitations): Fluid Hobby 300s ceiling, 2 GB and 4.5 MB payload limits.
- [Cloudflare pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/): Free daily allowance resets 00:00 UTC, over-limit operations fail; paid overage requires paid configuration.
- [Qwen model](https://developers.cloudflare.com/workers-ai/models/qwen3-30b-a3b-fp8/): existing model and REST integration. No Playground/inference was contacted.
