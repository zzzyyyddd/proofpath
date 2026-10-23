# Equivalent-requirements classification failure

Status: genuine live semantic FAIL. Prompt-only mitigation implemented; model effectiveness NOT VERIFIED. No live inference executed during this investigation. Scope, PRD, architecture, document limits, model, sampling parameters and deadline unchanged.

## Evidence and cause

Learner report at checkpoint 420b5ef: equivalent fixture returned HTTP 200 after 15,756 ms, one local fetch invocation, valid schema, source quotation verification PASS, semantic FAIL, Added 1 + Removed 1 instead of zero candidates; FIXTURE_ASSERTION_FAILED, temperature 0, no interruption. This is not a timeout or successful analysis. The earlier interrupted removal attempt and successful removal retest remain separate observations.

Old: `Teams may have no more than three members.`
New: `The maximum team size is three members.`

Both express the same upper limit. The expected controlled answer is candidates [], analysis_complete true. The supplied text is not identical, so equality bypass is inapplicable.

Confirmed from code:

- The hosted model generates candidates in one call. The adapter parses the native response and strict schema; it does not invent or split Added/Removed candidates downstream.
- The schema constrains fields, enum and types, not meaning. It cannot establish whether two obligations are equivalent.
- The verifier matches each quote to extracted text and checks required/null sides. An Added quote existing in New and a Removed quote existing in Old can each pass independently. Null is not independently proven absence.
- The result builder retains model classifications after evidence checks. It does not semantically align requirements across candidates. The equivalent evaluation oracle correctly rejected the result rather than repairing it into a pass.
- The prior prompt already told the model to omit equivalent rules and consider paraphrases. The live result demonstrates those instructions were insufficient for this run, not that they were absent.

High confidence: the reported false split originated in model candidate classification, not text extraction or result construction. Likely explanation: failure to align paraphrased counterparts before classifying absence. Unknown: the model's actual internal reasoning, exact raw candidate descriptions/quote boundaries, or whether inference settings contributed. No hidden reasoning trace is available and none is invented. Prompt weakness is a supported mitigation target, not a uniquely proven causal explanation.

## Smallest implemented mitigation

Strengthened the existing system prompt to require semantic counterpart alignment before classification and a final cross-check of Added/Removed pairs. It compares subject, scope, obligations, quantities/units, dates, negation, conditions and exceptions. Equivalent constraints with different wording must be omitted; changed constraints must remain Modified with both passages. If a found pair's relationship is unresolved, use the existing Needs Review state rather than force equivalence, absence or replacement.

The example uses a presentation-duration paraphrase, not the failing team fixture. No exact-string bypass or fixture answer is embedded in application logic. No additional model call, service, schema field or architecture is introduced. No source-matching relaxation, number removal, synonym-based blanket suppression, similarity cutoff or deterministic claim of general equivalence is added. Such shortcuts could erase genuine limit/modality changes or conflate different tracks/exceptions.

New prompt SHA-256: `276e9cf46f2bddb81b89c53e478af300a610ffd9567800627831192e1a50ea8b`.
Schema unchanged: `1829532a611d2bc73268e573f939ea00ceab9f30156c4df4b1e8d5145ac12cc4`.

Earlier live passes remain historical evidence for their previous prompt version; they do not certify this revision. Added prompt text also changes maximum-context token budgeting, which remains unverified.

## Downstream limitation and safe handling

YES: semantically incorrect or mutually inconsistent classifications can pass the current structural and source checks. This incident demonstrates that limitation. The app presents them as Classified Findings with a **Source passage verified** indicator, not as verified changes/classifications. Existing overview/disclaimer explicitly says classification and interpretation can be wrong; category counts are assignments. Those safeguards remain, but do not make false classifications acceptable for the release evaluation gate.

Needs Review is the approved safe state when both source passages exist and their relationship is unresolved. The revised prompt directs that behavior. The backend cannot independently guarantee the model chose this safety state; the risk remains explicit. It does not silently relabel every Added/Removed pair or hide apparent paraphrases, because unrelated obligations can legitimately be added/removed and common wording can conceal different values/scopes. A source-verification failure remains withheld/incomplete, distinct from semantic uncertainty with valid quotations.

Judge-facing safety: keep public live AI disabled while the semantic gate is failed. Static sample remains explicitly curated, never evidence that live semantics passed. Do not claim matching quotations prove changes. If the revised live evaluation fails again, stop and revisit the chosen mitigation before public release. A semantic verifier/alignment schema or second model pass would be a separate reviewed design decision, not silently added infrastructure.

## Offline regressions and their limits

Synthetic failure-shape tests reproduce a false Added/Removed pair with real quotes for two paraphrase pairs (team limits and public-source-code requirement). They verify the independent oracle rejects it even though source checks can pass; they do not assert that the model emitted those exact raw candidates.

Nearby negative cases require Modified for three versus five members, minimum versus maximum of three, and optional versus mandatory video. Empty/split results fail those expected semantics. Genuine video addition and slide-deck removal remain valid expected outcomes. Existing ambiguity, unchanged, evidence, error, cancellation and full-size fixtures remain intact.

All 72 offline deterministic tests, typecheck, offline evaluation, production build and PDF bundle checks PASS. This verifies oracle coverage and application mechanics, not prompt effectiveness or universal semantic accuracy. No evaluation assertion was relaxed. No live reliability gate is marked passed by these tests.

## Proposed bounded live validation — approval required

Recommend authorizing the original equivalent fixture first, ONE request only. If it passes, separately approve the remaining regression subset; alternatively explicitly approve the full seven-request ceiling below. No request in this table has run with the new prompt.

| Order | Fixture selector | Requests | Exact semantic expectation |
| --- | --- | ---: | --- |
| 1 | equivalent | 1 | Zero candidates; analysis_complete true; no withheld/incomplete status |
| 2 | equivalentrepository | 1 | Zero candidates for public-code paraphrases |
| 3 | teamchange | 1 | One Modified, three versus five; no split pair |
| 4 | boundchange | 1 | One Modified, minimum versus maximum; not equivalent |
| 5 | optional | 1 | One Modified, optional video becomes required |
| 6 | main | 1 | One Added video, two Modified deadline/team; unchanged repository omitted |
| 7 | removal | 1 | One Removed slide-deck rule; New quote null |

Every invocation requires --confirm-free-plan --max-calls=1, fixed Qwen model/temperature/output/deadline, full schema validation and exact quotation/location checks. No redirect, retry, paid fallback, provider switch or public activation. Stop immediately on any HTTP/schema/quote/semantic/incomplete/interruption failure. Do not replace a failed run with a lucky retry. Check actual remaining Workers Free allowance first; do not estimate neuron cost from previous runs. Preserve all reports with prompt/schema fingerprints. Public ANALYSIS_ENABLED=false remains unchanged; only a future standalone process gets enable overrides.

Prepared first command, NOT EXECUTED:

```bash
cd ~/proofpath
ANALYSIS_ENABLED=true CLOUDFLARE_FREE_PLAN_CONFIRMED=true \
node --env-file=.env.local --import tsx scripts/evaluate-model.ts \
  --confirm-free-plan --max-calls=1 --fixture=equivalent
```

Seven single passes would be an initial regression check, not the approved three-consecutive-run repeatability gate, ambiguity coverage or maximum-context feasibility. Those need separately approved bounded runs after this mitigation shows initial evidence. No request budget is approved merely by documenting this plan.
