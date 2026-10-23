# Qwen test #3 — timeout investigation

Status: live attempt FAILED / INCONCLUSIVE due to interruption. Schema, source quotes and semantic correctness were NOT EVALUATED; this is not a semantic classification failure. No further live inference performed during investigation.

## Recorded evidence

Learner report at checkpoint f7e1197: fixture removal; HTTP status null; local fetch counter 1; duration 60,006 ms; failure code ANALYSIS_INTERRUPTED; Old 69 characters, New 30. Neurons consumed, provider acceptance/completion and raw provider output are unknown. Earlier test #2 remains a valid optional-fixture pass; the failed attempt is retained and cannot be discarded from repeatability evidence.

Prompt SHA-256: `382f55abe88e9bc02e464fe40f5d41c74894ba4fdac3474c4d827cdfd2e48772`.

Schema SHA-256: `1829532a611d2bc73268e573f939ea00ceab9f30156c4df4b1e8d5145ac12cc4`.

Both match the current local prompt/schema. Neither was changed in this investigation.

## Immediate cause and confidence

High confidence: our application enforces a local 60,000 ms provider deadline via AbortSignal.timeout. The standalone probe passes no caller signal; generateCandidates therefore creates this timeout signal directly. Its fetch catch emits ANALYSIS_INTERRUPTED only when that signal is aborted. The reported 60,006 ms and no observed HTTP response match this code path. The exact historical AbortSignal.reason was not recorded, so a retrospective wire-level/provider root cause is not established.

Verified code facts:

- `src/lib/server/limits.ts`: providerTimeoutMs 60,000, output cap 4,096 tokens.
- `src/lib/server/ai/cloudflare.ts`: constructs timeout before fetch; production calls with a caller signal combine signals using AbortSignal.any, so whichever fires first interrupts. AbortSignal.timeout covers the network wait and body consumption, not a server-reported processing duration.
- `scripts/evaluate-model.ts`: invokes generator directly; elapsed duration includes fixture preparation, fetch and checks. It supplies no Next.js/browser caller signal and has no separate 60-second timer.
- `scripts/single-request.ts`: increments its counter immediately before calling fetch; observes HTTP status only once fetch resolves with response headers. It adds no deadline and forces redirects off. No application retry/fallback exists.
- Production comparison route has a separate 100-second request deadline and maxDuration 120; browser comparison has 110 seconds. These do not execute in the standalone probe. Vercel limits cannot explain the standalone CLI's internal timeout path.

Unknown: why no response was received before the deadline. DNS/TLS/connectivity, provider queueing, model generation/reasoning, output buffering or another upstream stall remain possible. No provider HTTP error/timeout was observed. A local timeout is not evidence of a Cloudflare-imposed 60-second timeout. No confirmed direct REST timeout contract was found in the reviewed Workers AI limits page; AI Gateway retry/timeout documentation concerns a different path and must not be applied here.

## Abort and counting semantics

The guard proves one local fetch invocation and no application-issued second fetch. It does not prove one provider execution, successful delivery, remote completion, exact network exchanges or a billing event. A null HTTP status means no Response headers were obtained by this wrapper; it is not HTTP 0 and does not prove the provider never received the request.

Node abort stops local request/response consumption. No explicit remote job-cancellation acknowledgment is received. Cloudflare might continue processing after a disconnect; provider cancellation behavior and any consumed neurons are unknown. Do not claim the aborted request used zero quota, and do not immediately replay it. Usage-dashboard deltas are not exact per-request metering. No new billing or payment configuration is involved.

## Fixture, prompt and generation review

The fixture is short and unambiguous: an Old slide-deck obligation is absent in New; the public-repository obligation is identical. Expected: one Removed candidate with exact Old quote `A presentation slide deck is required.` and New quote null. Returning an unchanged repository finding would be incorrect. The prompt gives explicit removal/null-side rules and asks for a schema result, not a tool loop. No application-side iterative reasoning, automatic continuation or inference retry occurs.

The request is non-streamed, temperature 0, max_tokens 4,096, closed JSON schema. It has no enable_thinking, chat_template_kwargs, reasoning_effort or thinking_budget option. Saying “no reasoning” in the output instructions is not proof that hidden reasoning is disabled. The output cap is an upper bound, not a guarantee of quick generation; no output was received to establish excessive reasoning, repetition, actual token use or a pathological model loop.

[Cloudflare's model-specific page](https://developers.cloudflare.com/workers-ai/models/qwen3-30b-a3b-fp8/) labels the model reasoning-capable and documents temperature, max_tokens and response_format, but no explicit thinking toggle. Generic fields or support on another hosting provider are not proof of native Cloudflare REST support. The separate REST-reference fetch failed during research; its complete schema remains unverified. No undocumented request option was added.

[Qwen's official model card](https://huggingface.co/Qwen/Qwen3-30B-A3B-FP8) documents an upstream chat-template hard switch and prompt-level `/no_think` soft control, and warns against greedy decoding because of repetition risk. That is evidence to investigate the current temperature-0 choice, not proof of this incident's cause or that Cloudflare accepts a matching hard-switch field. The soft prompt control changes the prompt fingerprint and is not an independently guaranteed server-side switch. None was applied. A sampling/prompt change needs learner approval and a fresh affected-fixture evaluation budget.

## Repairs made without changing the deadline or model settings

- Added safe probe diagnostics: configured deadline, observed signal-aborted flag, whitelisted TimeoutError/AbortError/Other category and whether response headers were received. Arbitrary error/abort content is never printed. Existing networkCalls is explicitly described as local fetch invocations.
- Normalized response-body aborts to ANALYSIS_INTERRUPTED; previously only the initial fetch await had this normalization. Non-abort transport failures remain PROVIDER_UNAVAILABLE rather than becoming schema/semantic failures. No partial output is accepted.
- Check pre-aborted signals before invoking fetch, avoiding unnecessary counted calls.
- Explicit redirect:error in the production client closes a transport inconsistency; the probe guard already enforced this. No provider/model request parameter or 60-second limit changed.
- Added offline controlled-signal tests for the unchanged 60-second timeout, pre-header and post-header cancellation, zero fetch for pre-cancelled input, safe reason reporting, single-call/no-retry enforcement and no redirects. Tests do not wait 60 seconds or contact Cloudflare.

## Smallest safe next action — approval required before inference

First inspect any available Workers AI request/usage history for the original attempt's time without running another model. Record whether there is a completion/error record; absence of a record is inconclusive. Do not enable paid logging/analytics to obtain it.

Then, only with explicit learner approval, run **one new diagnostic removal probe**, with the same fixture, prompt/schema, temperature 0, max_tokens 4,096 and 60-second deadline, using the new abort/header diagnostics. This is a separately authorized experiment, not an automatic retry or a replacement for the failed observation. Request ceiling one total; no redirects/retries/fallback; stop on any failure. Public application stays ANALYSIS_ENABLED=false, Workers Free only. This isolates transient behavior with better observability without changing several variables at once; it does not fix proven provider latency or complete repeatability.

If the next diagnostic probe also times out, stop again. Seek a separate decision on an evidence-based nonzero sampling setting or upstream-supported prompt soft control; do not raise the deadline, silently add unsupported fields, switch providers or increase output limits. Changing parameters would require rerunning affected semantic cases under a separately approved budget. No such change is currently authorized.

Prepared command, do not run until explicitly authorized:

```bash
cd ~/proofpath
ANALYSIS_ENABLED=true CLOUDFLARE_FREE_PLAN_CONFIRMED=true \
node --env-file=.env.local --import tsx scripts/evaluate-model.ts \
  --confirm-free-plan --max-calls=1 --fixture=removal
```

Expected success: HTTP 200, exactly one fetch, full schema/source verification and one Removed classification; otherwise preserve failure/inconclusive result and stop. Neither timeout nor malformed output is evidence that a source requirement was correctly/incorrectly classified.

References: [Node AbortSignal](https://nodejs.org/api/globals.html#class-abortsignal), [Workers AI limits](https://developers.cloudflare.com/workers-ai/platform/limits/). No additional service or paid logging is adopted.
