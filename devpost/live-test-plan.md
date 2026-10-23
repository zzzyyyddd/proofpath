# ProofPath — Controlled TXT and Qwen Checks

Prepared, not executed live. No approval or completion of the remaining feasibility gates is implied.

## 1. Real TXT uploads without inference

Leave `ANALYSIS_ENABLED=false`. Start the app from normal WSL:

```bash
cd ~/proofpath
npm run dev -- --hostname 0.0.0.0
```

In Windows Chrome at `http://localhost:3000`, upload `public/samples/old-rules.txt` as both Old Version and New Version. Compare. Expect the identical-text message, zero findings, original filenames and no inference. Replace only New Version with `public/samples/new-rules.txt`: comparison must require a new click. With inference still disabled, expect an explicit unavailability error, retained valid uploads, and no fabricated result.

Optional direct check from a second normal WSL terminal (no secrets involved):

```bash
cd ~/proofpath
curl --fail-with-body --no-buffer \
  -F 'old=@public/samples/old-rules.txt;type=text/plain' \
  -F 'new=@public/samples/old-rules.txt;type=text/plain' \
  -F 'attemptId=manual-identical-txt' \
  http://localhost:3000/api/compare
```

Expect four real stages with started/done events and a terminal `result` with state `identical`. HTTP 200 alone does not prove a result: the stream must end with the appropriate typed terminal event. This uses the actual originals and extraction route, not the static sample result.

## 2. First bounded live Qwen probe

Preconditions: independently confirm the actual Cloudflare account is Workers Free, has remaining daily allowance, and no paid fallback/billing upgrade is enabled. Configure server-only values locally in ignored `.env.local`; never share the file or credentials. The standalone live process requires `ANALYSIS_ENABLED=true` and `CLOUDFLARE_FREE_PLAN_CONFIRMED=true`; supply these only as one-command environment overrides, leaving application configuration disabled. These are operator confirmations, not automatic verification of account billing status. Keep public live deployment disabled until its account/protection gates pass.

Run only this first probe initially; do not launch a loop or the whole suite:

```bash
cd ~/proofpath
ANALYSIS_ENABLED=true CLOUDFLARE_FREE_PLAN_CONFIRMED=true node --env-file=.env.local --import tsx scripts/evaluate-model.ts --confirm-free-plan --max-calls=1 --fixture=main
```

Maximum: one inference request, 4,096 output tokens, 60-second provider timeout, zero automatic retries, no fallback. The complete production candidate schema, native REST response parser, deterministic quotation/location verifier, and independent semantic oracle are used. Expected: one Added video finding, two Modified findings (deadline/team size), no unchanged repository finding, and no withheld or unresolved items. The oracle requires the fixture's exact minimal quotations; different quote boundaries fail conservatively and require inspection, never automatic expectation changes.

Record pass/fail, date, model ID, duration and actual neuron usage from the Cloudflare dashboard without document contents or credentials. Do not infer consumption from an earlier tiny test. A failed request can still consume allowance. Stop on quota, timeout, malformed/schema/envelope errors, semantic mismatch or evidence failure; preserve the failed outcome and investigate before another call. No hidden retry until success.

## 3. Remaining deliberate semantic checks

After reviewing the first outcome and remaining free allowance, the same single-call command accepts one fixture at a time:

| Fixture flag | Required outcome |
| --- | --- |
| `--fixture=removal` | One Removed slide-deck requirement; no fabricated New quotation |
| `--fixture=equivalent` | No findings for equivalent team limits |
| `--fixture=ambiguous` | Needs Review with both passages; no forced replacement/conflict claim |
| `--fixture=optional` | Optional-to-required video is Modified, not Added |

These are prepared selectors, not evidence of model reliability. The approved repeatability gate requires three consecutive independent passes for each specified main/removal/equivalent/ambiguous fixture with fixed prompt/schema/settings; unsuccessful runs remain in the record. Bound any later batch explicitly before starting and check free quota first. Identical-text bypass, fabricated quotes, malformed responses and API failure injection are tested offline without spending inference quota.

## 4. Maximum-context gate remains separate

The 30,000-code-point per-document input limit is unchanged. Offline input and Unicode serialization tests do not establish model context headroom. Before claiming full-size live support, measure complete tokenized system/user messages and production schema against the actual deployed model's context budget, reserving output tokens and any applicable template/reasoning overhead. Character/4 estimates are insufficient. Include ordinary English, token-dense Unicode, escaping-heavy text, and full approved pairs without truncation.

The current harness does not measure that complete tokenizer/context gate. Do not label it passed after a short successful probe, lower the input limit, add a tokenizer service/provider, or pay for additional quota silently. A confirmed capacity failure or required architecture/provider/scope change stops for the learner's decision.

## 5. Real non-identical browser comparison

Once live configuration and the first controlled probe are reviewed, deliberately submit the old/new sample TXT files once through the actual upload UI. This is a separate inference request. Inspect all three findings and source context against the uploaded files; ensure the unchanged repository rule is omitted and the result is not labeled static sample. Record actual output rather than substituting the curated sample if analysis fails. Restore `ANALYSIS_ENABLED=false` after local evaluation and restart the server to apply configuration changes. No public live rollout before Vercel free-protection verification.

## Account verification stop — 2026-10-23

Actual account plan is unverified: no connected Cloudflare account tool and no local credentials/configuration are available to the agent. No inference is authorized by a local confirmation flag alone. The main probe now reads and validates the actual `public/samples/old-rules.txt` and `public/samples/new-rules.txt` files, checks they match the controlled semantic fixture before inference, and has a one-fetch guard with HTTP redirects disabled. It never changes account plans or activates a public application.

Manual verification, without running a model:

1. Sign in to https://dash.cloudflare.com/ and select the same account intended for the server-side token. Do not share its ID/token here.
2. Open account Billing (use dashboard search if its navigation differs), then the subscriptions/active-products view. Inspect the **Workers** subscription specifically. A Free website/domain plan is not proof of Workers Free. Confirm Workers Free and no Workers Paid subscription/trial for this account. Do not upgrade, subscribe, activate billing, or purchase credits.
3. Open Workers & Pages and Workers AI. Confirm the plan agrees with Workers Free. On Workers AI usage, inspect today's neuron consumption and remaining free allocation; do not click Run in the playground for this check. Cloudflare documents a 10,000-neuron daily free allocation. A paid account can also show this allocation, so the usage counter alone is insufficient.
4. Check that the Qwen model `@cf/qwen/qwen3-30b-a3b-fp8` is accessible without an upgrade/paywall. Inspect its model page/dashboard listing without inference. Stop if it requires Workers Paid, prepaid credits, or an upgrade.
5. This application uses the direct Cloudflare REST endpoint, not AI Gateway. Do not add Gateway unified billing, prepaid credits, paid fallback, another provider, or a new service. If the account is paid or its billing state is ambiguous, stop rather than assuming a remaining allowance prevents charges. Budget alerts alone are not a spending cap.
6. Report only: Workers plan label, whether Workers Paid/trial is present, approximate neurons used/remaining today, and whether Qwen asks for an upgrade. Do not send tokens, account IDs, payment details, or unredacted billing screenshots.

Keep `ANALYSIS_ENABLED=false` in the application while checking. After these facts are reviewed, configure credentials privately and prepare a one-off standalone-process evaluation; do not activate the public route. The proposed initial maximum remains one inference request in total, not one per retry. A failure does not authorize rerunning the command.

References: [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), [Qwen model](https://developers.cloudflare.com/workers-ai/models/qwen3-30b-a3b-fp8/). Public documentation cannot verify the learner's account subscription.


## Ready for a manual one-shot run — learner plan evidence received

Learner confirmed Workers Free Active, Workers Paid not subscribed, no payment method, approximately 32.5/10,000 neurons used. These replace the earlier missing manual account evidence; agent credentials are still unavailable. No live request has run here.

In normal WSL, preserve any existing `.env.local`. If absent, create a private copy and edit locally:

```bash
cd ~/proofpath
test -f .env.local || (umask 077; cp .env.example .env.local)
chmod 600 .env.local
nano .env.local
```

Set the Cloudflare account ID and API token privately. Keep `ANALYSIS_ENABLED=false`; do not export an enabled value to the application shell. The public application must remain disabled. Do not paste this file or credentials into chat.

Verify configuration without revealing values or contacting Cloudflare:

```bash
node --env-file=.env.local --input-type=module <<'JS'
const checks = {
  accountIdConfigured: /^[a-f\d]{32}$/i.test(process.env.CLOUDFLARE_ACCOUNT_ID ?? ''),
  tokenConfigured: Boolean(process.env.CLOUDFLARE_API_TOKEN?.trim()),
  applicationLiveDisabled: process.env.ANALYSIS_ENABLED === 'false',
};
console.log(checks);
if (Object.values(checks).some(value => !value)) process.exitCode = 1;
JS
```

Only if all checks are true, execute the single initial probe command in section 2 **once**. Flags are process-scoped and do not modify `.env.local`, a running app, or deployment settings. Do not run a browser comparison during this one-request evaluation. If the report fails, stop and share only the safe structured report; no rerun is authorized. Expected schema/quote/semantic success requires actual production response validity, all required source matches, and the exact three fixture classifications. It is not universal accuracy.

Record HTTP status and request count from the report. Neuron consumption is reported as unavailable when not exposed by the harness; compare the actual dashboard reading before/after, with no concurrent requests and allowance for dashboard lag, rather than estimating from token counts or earlier tests. An unchanged/rounded dashboard reading does not prove zero consumption.

## Verified initial live result — learner report

Probe #1: HTTP 200; exactly 1 request; production JSON schema PASS; deterministic source quotes PASS; controlled semantics PASS (1 Added video, 2 Modified deadline/team size, 0 Removed, 0 Needs Review). Workers Free confirmed, Workers Paid not subscribed, no payment method. Dashboard approximately 32.50 → 59.26 neurons: observed difference 26.76 neurons, not an exact per-request measurement. Public live analysis remains disabled. This does not complete repeatability or maximum-context testing. No additional requests approved by this record.

## Proposed next live sequence — awaiting explicit approval

No requests below have been run. Proposed ceiling: **16 additional requests**, sequential, never automatic. Each invocation retains `--confirm-free-plan --max-calls=1`, command-scoped enable flags only, and a single `--fixture` selector. No application/public enablement. Check remaining free allocation before each invocation; stop at the first failure, incomplete result, timeout, non-200 response, schema error, evidence failure, or semantic mismatch. Do not retry a failed run or replace it with a later lucky pass. No redirects, alternate provider or paid fallback.

| Order | Selector | Independent requests | Required outcome |
| --- | --- | ---: | --- |
| 1–3 | `--fixture=main` | 3 | Modified deadline; Modified team size; Added new mandatory video; unchanged repository omitted |
| 4–6 | `--fixture=optional` | 3 | Existing optional video becoming required is Modified |
| 7–9 | `--fixture=removal` | 3 | One Removed requirement; absent New quote is null |
| 10–12 | `--fixture=equivalent` | 3 | No findings for equivalent requirement wording |
| 13–15 | `--fixture=ambiguous` | 3 | Needs Review, both quotes located; no forced relationship |
| 16 | `--fixture=maximum` | 1, conditional | Same three classifications at offsets 0, 15,000 and 29,900; no missing late change or incomplete result |

The three fresh main runs avoid assuming the earlier report contains the newly recorded settings/fingerprints. Probe #1 remains valid single-pass evidence. Compare model ID, prompt/schema/message/document SHA-256 fingerprints and settings across repeated runs of the same fixture; any changed prompt/schema requires a separately agreed affected rerun budget. Never estimate future neuron costs from the observed dashboard difference of 26.76.

Command template, execute only after explicit approval and only once for each authorized position in the table:

```bash
ANALYSIS_ENABLED=true CLOUDFLARE_FREE_PLAN_CONFIRMED=true \
node --env-file=.env.local --import tsx scripts/evaluate-model.ts \
  --confirm-free-plan --max-calls=1 --fixture=main
```

Replace only the fixture selector for the relevant authorized position. No loop is supplied. Keep the application `.env.local` value `ANALYSIS_ENABLED=false`; the overrides affect the standalone process only. Each report includes elapsed time, hashes, counts and actual serialized terminal-response bytes, but not credentials or raw model output. Reports retain failed outcomes. The CLI rejects contradictory/duplicate budget arguments.

### Maximum fixture and precondition

Files: `tests/fixtures/maximum/old-rules.txt` and `tests/fixtures/maximum/new-rules.txt`. Both are original synthetic English text, exactly 30,000 code points/bytes each, 60,000 total. The Old/New deadline is at offset 0, team limit at 15,000, and new video at 29,900. All surrounding background is synthetic. Regenerate offline with `node --import tsx scripts/prepare-maximum-fixture.ts`. Source inputs are not truncated or their limits reduced.

Offline checks validate full file extraction, expected exact evidence positions, production result schema/client stream parsing, and the complete synthetic stream budget (68,514 bytes). These are not model-context tests. Before request 16, accurate tokenization must account for the full message payload, system prompt, production schema, model/template overhead and 4,096-token output reserve within the documented context. This preflight is NOT VERIFIED and is a blocker to request 16; do not use character/4 as proof. If accurate local preflight cannot yet be established, stop after the approved short-fixture subset and return for a decision rather than running the maximum request speculatively.

A normal-English boundary pass would still not establish token-dense Unicode/all-input context capacity. No token-dense live request is included in this ceiling; prepare that separately with an explicit approved budget. A confirmed systematic capacity failure requires learner review, never smaller silent input limits or a provider change.

## Next requested preparation: optional-to-mandatory, one request only

The learner selected `optional` as the next proposed bounded semantic check, superseding `main` as the next selector in the earlier proposed order. No additional live budget is approved by preparation; do not execute yet. Exact command for later explicit authorization:

```bash
ANALYSIS_ENABLED=true CLOUDFLARE_FREE_PLAN_CONFIRMED=true \
node --env-file=.env.local --import tsx scripts/evaluate-model.ts \
  --confirm-free-plan --max-calls=1 --fixture=optional
```

Expected: HTTP 200, exactly one network call, schema PASS, quotation/source-location verification PASS, semantic fixture PASS; counts Added 0, Removed 0, Modified 1, Needs Review 0, no withheld candidates or incomplete result. Old source is exactly `A demo video is optional.` (25 characters); New source is exactly `A demo video is required.` (25 characters). Both quotes must match those complete sentences with their source locations. Added or Removed is a failed classification. One pass is not the three-run repeatability gate. Neurons remain unavailable unless measured independently; do not estimate consumption. Any failure stops evaluation with no retry/redirect/fallback.

The two environment overrides apply only to the standalone probe process; the application's `ANALYSIS_ENABLED=false` remains unchanged. No deploy or public activation.

Maximum fixtures were regenerated to replace space padding with neutral punctuation, eliminating trailing-whitespace warnings without changing 30,000 characters per file or semantic locations. Their document/message hashes necessarily change; no prior maximum live result exists to invalidate. Production prompt/schema and small semantic fixtures are unchanged.

## Verified test #2 and next proposed removal check

Learner reports `optional` PASS at checkpoint f7e1197: HTTP 200; one network request; schema, exact quotations and controlled semantics PASS; 0 Added, 0 Removed, 1 Modified, 0 Needs Review; duration 5,439 ms; response 1,233 bytes. Neuron consumption not directly measured. No inference was performed by the agent when recording this result. A single fixture pass does not complete repeatability.

Next proposed check is `removal`, prepared only, not executed. Old document:

```text
The repository must be public.
A presentation slide deck is required.
```

New document:

```text
The repository must be public.
```

Exact expectation: one **Removed** finding; `old_quote` must be `A presentation slide deck is required.` and match its derived source location; `new_quote` must be JSON `null`, not an invented New quotation. No unchanged repository finding, no Added/Modified/Needs Review items, no withheld candidates and no incomplete result. A missing matching New passage is not exhaustive proof of absence.

For normal WSL, only after authorization to execute the next one-request check:

```bash
cd ~/proofpath
ANALYSIS_ENABLED=true CLOUDFLARE_FREE_PLAN_CONFIRMED=true \
node --env-file=.env.local --import tsx scripts/evaluate-model.ts \
  --confirm-free-plan --max-calls=1 --fixture=removal
```

Expected report: HTTP 200; exactly one network call; schema/quote/semantic PASS; counts Added 0, Removed 1, Modified 0, Needs Review 0. The existing CLI rejects conflicting budget flags; one-shot fetch guard blocks a second fetch even after failure and disables redirects. Model/provider are fixed; no fallback. Stop on any HTTP/schema/quote/semantic/incomplete failure, with no rerun. The environment overrides enable only this standalone process; keep application/deployment ANALYSIS_ENABLED=false and Workers Free unchanged. Do not deploy or enable public inference. Record actual duration/response size and leave neurons unavailable unless measured; do not reuse test #2 values as predictions.

## Test #3 interruption — live evaluation paused

Learner reported removal FAILED / INCONCLUSIVE: HTTP null, local fetch count 1, duration 60,006 ms, ANALYSIS_INTERRUPTED, source lengths 69/30. Schema, quotations and semantic classifications NOT EVALUATED. No semantic failure or pass inferred. Neuron consumption and remote completion unknown. Full hashes, timeout-layer audit, reasoning/sampling evidence and proposed single-request diagnostic are in [timeout investigation](timeout-investigation.md). The failed attempt remains in the record; earlier proposed repeatability sequence must not continue automatically. No further live request or parameter/timeout change authorized. Public application remains disabled.

## Removal diagnostic retest PASS; equivalent test prepared

Learner reports successful removal retest at checkpoint 420b5ef: HTTP 200, one local fetch invocation, duration 5,270 ms; schema, exact source quotation verification and semantic classification PASS; counts Added 0, Removed 1, Modified 0, Needs Review 0. Provider timeout unchanged at 60,000 ms, abort signal false, response headers received true. Neuron consumption not directly measured. The earlier 60,006 ms interruption remains separately recorded as FAILED / INCONCLUSIVE, with schema/quotes/semantics NOT EVALUATED. This retest does not resolve the original upstream-delay cause or complete repeatability.

Next proposed fixture is `equivalent`:

- Old: `Teams may have no more than three members.`
- New: `The maximum team size is three members.`

These are non-identical texts expressing the same maximum of three team members. Exact expected model result: `candidates: []`, `analysis_complete: true`. Final counts Added 0, Removed 0, Modified 0, Needs Review 0; withheld count 0; incomplete false; result state no_supported_changes. Do not invent findings or quotations. This is not the identical-text bypass: the supplied texts differ and a live model request is needed to evaluate semantic equivalence. Zero candidates makes source quotation checking vacuous, not proof of source completeness or model correctness beyond this controlled fixture.

Prepared single-request command for normal WSL; no inference performed during preparation:

```bash
cd ~/proofpath
ANALYSIS_ENABLED=true CLOUDFLARE_FREE_PLAN_CONFIRMED=true \
node --env-file=.env.local --import tsx scripts/evaluate-model.ts \
  --confirm-free-plan --max-calls=1 --fixture=equivalent
```

Expected report: HTTP 200, one local fetch invocation, schema PASS, semantic fixture PASS, zero category counts and no incomplete result. There are no candidate quotes to verify. Any returned candidate, incomplete result, API/schema failure or interruption fails this bounded check and stops further tests; no automatic retry or rerun. The environment overrides affect the standalone process only. Keep public application ANALYSIS_ENABLED=false, Workers Free, no redirects/alternate provider/paid fallback. No deployment, billing change or payment method.

## Equivalent live fixture — semantic FAIL

Learner report at checkpoint 420b5ef: HTTP 200, exactly one local fetch invocation, duration 15,756 ms; schema/source-quote checks PASS; semantic classification FAIL with Added 1, Removed 1, Modified 0, Needs Review 0 instead of zero findings. Failure FIXTURE_ASSERTION_FAILED; model @cf/qwen/qwen3-30b-a3b-fp8, temperature 0, no interruption. This is a genuine classification failure, independent of the prior timeout. Raw candidate details beyond the reported counts are unavailable; do not invent them. No exact neuron measurement reported. Prior failed and successful observations remain in the record. Live semantic validation is paused for the mitigation review; no automatic retry.

## Semantic mitigation revision — live approval required

Prompt-only alignment mitigation and offline regressions are documented in [semantic investigation](semantic-investigation.md). Revised prompt SHA-256 276e9cf46f2bddb81b89c53e478af300a610ffd9567800627831192e1a50ea8b; schema/model/parameters unchanged. All 72 offline tests and build checks PASS, but revised live semantics NOT VERIFIED. Earlier passes apply to the previous prompt; the equivalent failure remains a genuine failed observation. Proposed next budget: original equivalent fixture once, then only with explicit approval up to six further single-call regression fixtures (maximum seven new requests total). No live inference currently authorized/executed. Stop on first failure; no retries, redirects, provider fallback or public enablement. Full repeatability/context and ambiguity gates remain pending.
