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

Preconditions: independently confirm the actual Cloudflare account is Workers Free, has remaining daily allowance, and no paid fallback/billing upgrade is enabled. Configure server-only values locally in ignored `.env.local`; never share the file or credentials. The live command requires `ANALYSIS_ENABLED=true` and `CLOUDFLARE_FREE_PLAN_CONFIRMED=true`. These are operator confirmations, not automatic verification of account billing status. Keep public live deployment disabled until its account/protection gates pass.

Run only this first probe initially; do not launch a loop or the whole suite:

```bash
cd ~/proofpath
node --env-file=.env.local --import tsx scripts/evaluate-model.ts --confirm-free-plan --max-calls=1 --fixture=main
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
