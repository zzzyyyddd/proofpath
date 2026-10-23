# Repeated semantic failure — conservative deterministic safety gate

Status: bounded safety mitigation implemented and offline-verified. General semantic reliability remains BLOCKED. No additional live inference, deployment or public activation. Checkpoint eb47b33 retained; approved scope/PRD, provider, inference parameters and document limits unchanged.

## Failed live observation and available artifacts

The revised-prompt equivalent test failed again: HTTP 200, one request, 2,918 ms, schema PASS, quotation verification PASS, semantic FAIL. Actual 0 Added, 1 Removed, 0 Modified, 0 Needs Review; expected no candidates. FIXTURE_ASSERTION_FAILED. Prompt fingerprint 276e9cf46f2bddb81b89c53e478af300a610ffd9567800627831192e1a50ea8b.

Old text: `Teams may have no more than three members.`
New text: `The maximum team size is three members.`

The project artifact inventory contains no saved raw candidate for this live attempt. The probe reports counts/status but intentionally does not persist raw model content. Actual title, selected quotation boundaries, impact and suggested action are unavailable; do not invent them or imply synthetic regression payloads are captured responses. No private credential file or terminal history is inspected for model output. No exact neuron use is available.

Confirmed: another live requirement-alignment failure despite the prompt mitigation. Not a timeout, not a schema failure and not successful semantic validation. Neither source occurrence nor a structurally valid enum proves a Removed classification. Prior failures remain recorded.

## Removed path before the new guard

1. Qwen returns an object with kind removed, old_quote and new_quote null.
2. The closed candidate schema accepts the field types/enum and required properties, not semantic correctness.
3. parseCloudflareResponse checks provider/model/envelope/finish and parses that schema. It does not create new candidates or infer relationships.
4. verifyCandidate resolves the Old quote uniquely to canonical text and a location and confirms the absent-side field is null. It does not prove that no semantic counterpart exists in New.
5. buildResult previously retained the model's Removed category in classified findings/counts. The route streamed it; the client validated stream/attempt/result; the Inspector showed the Old passage with “Source passage verified” and an absent-side notice.
6. The UI's disclaimer separated classification from source matching, but could still show this false Removed claim as an AI-classified finding. The wording did not make the claim reliable. The raw semantic evaluation correctly failed.

## Comparison of safeguards

| Safeguard | What it can establish | What it cannot establish / decision |
| --- | --- | --- |
| Bidirectional requirement alignment | A proposed counterpart can be cited on each side and checked for occurrence; explicit alignment may reduce unilateral absence mistakes. | Model-proposed alignment is itself fallible; arbitrary paraphrase equivalence is not deterministic. A second call/schema redesign needs separate review. Not silently introduced. |
| Deterministic structured-constraint recognition | Specific fully recognized single-clause forms can be mapped to a typed subject, bound/modality and integer. Matching subjects justify presenting both passages for review. | Not a general parser; cannot interpret arbitrary clauses, exceptions, tracks, units, dates, headings or unknown wording. Implemented only as a conservative rerouting guard, never a universal equivalence claim. |
| Conservative uncertainty handling | Existing Needs Review can preserve two real, located passages and avoid an unsupported definitive change label. | Needs Review requires both reliable source passages; do not invent a counterpart. Withheld remains for failed required evidence/traceability, not a generic count of semantic doubts. Unknown syntax remains a release blocker. |

## Implemented gate and exact limits

File: `src/lib/server/evidence/structured-constraints.ts`.

The grammar consumes the ENTIRE trimmed document, with no internal newline or leftover clause. It recognizes these bounded families:

- Team/group member counts expressed as up-to/no-more-than, at-least, or a maximum/minimum size. The subject is explicitly team or group; units explicitly members. Values are nonnegative safe integers, decimal digits without ambiguous formatting, or spelled zero through twenty. Minimum/maximum and numeric values are kept distinct.
- A single artifact noun phrase with explicit optional/required modality; the literal subject is retained. No noun-phrase similarity or synonym inference.

Unsupported forms return no recognition: extra sentences, scoped prefixes, exceptions, decimal/unsafe/unsupported numbers, internal line breaks, unknown operators or different subjects. Nothing is trimmed out of the middle of a document or quote. This is a finite syntax grammar over variable values, not exact matching of the known fixture texts or answers; tests include group limits and multiple unseen quantities. Canonical source text is never rewritten.

File: `src/lib/server/evidence/verify.ts`.

Evidence verification runs FIRST. Fabricated/missing/non-unique required evidence is still withheld/incomplete, never rescued by the semantic guard. If both entire documents are recognized for the same subject, a model Added/Removed finding is rerouted to existing Needs Review with both FULL exact source passages and their deterministic locations. It does not assert same/different requirements, absence, conflict or replacement. The unsupported original title, interpretation and action are replaced with cautious review copy, not displayed as established change analysis. A Modified proposal with structurally equal constraints or identical short evidence despite differing full constraints is also routed for review. A valid Modified proposal with genuinely different recognized bounds/values/modality remains Modified.

File: `src/lib/server/results.ts`.

Rerouted one-sided candidates for the same complete recognized pair become one review item; they do not inflate Added/Removed totals. Only safety-gate reroutes are deduplicated this way; unrelated model Needs Review items are not silently merged by the new rule. No recognized case is silently discarded as “unchanged.” A genuine possible change remains visible for manual inspection rather than suppressed.

No new result state/category, JSON field, provider request, model parameter or service is added. Existing Inspector and source viewer render the Needs Review item through the unchanged result contract. The static sample remains explicitly curated and separate.

## Would the false Removed finding reach the UI?

For the EXACT reported Old/New documents and a source-valid Removed candidate: **not as Removed**. Their complete clauses are recognized. Even a valid partial Old quotation is checked before rerouting; the gate uses both original document clauses as review evidence. Offline real-route/client-parser integration proves the result is 0 Added/Removed/Modified and 1 Needs Review, with both quote locations and no unsupported original interpretation. No raw live response was captured, so this is not a retrospective replay of the exact original object.

It remains visible as **Needs Review**, NOT as “no changes detected” and NOT as verified semantic equivalence. The raw model result remains an equivalent-test FAIL. This safety handling does not meet or replace the fixture's intended raw zero-candidate result and does not certify the model.

For OTHER equivalent prose, including the public-source-code paraphrase, an unsupported one-sided model claim can STILL reach classified findings. No blanket Added/Removed suppression was added because it would hide genuine differences. General semantic equivalence is unresolved. Public live analysis MUST stay disabled until a release decision addresses this blocker; source-verified is never semantically verified. This is a bounded, demonstrated safety improvement, not a claim of production semantic reliability.

## Verification

Regression coverage includes the original paraphrase pair, source-valid partial Old quotation, false split-pair rerouting, different team/group quantities, digit/word numbers, 3-to-5, minimum-to-maximum, optional-to-required, valid additions/removals, unknown scopes/exceptions/syntax, invented evidence, and a real route → production client parser → Needs Review integration with a synthetic provider response. The integration confirms unsupported original interpretation/title are not exposed and the raw-output oracle STILL rejects the false classification.

The probe now reports rawModelCounts separately from displayed counts. Source safety rerouting never changes raw semantic evaluation into a pass. No test expectations for live Qwen were loosened, and no missing output was fabricated.

## Smallest next plan — requires separate approval

No live inference now. First inspect/commit this offline gate and review its documented limits. Proposed next budget: **ONE new equivalent-fixture diagnostic request**, unchanged prompt/model/schema/settings/deadline, fixed one-fetch/no-redirect guard and no automatic retry. Record rawModelCounts, displayed counts and raw semantic result separately. If model output is empty, the raw test passes once; if it returns Removed, the expected safety outcome is a Needs Review item but the model's semantic test STILL FAILS and evaluation stops. Never count a safety reroute as zero-change detection success.

Only after that result is reviewed should any genuine-addition/removal/modification regressions receive a separate explicit budget. The broader unsupported-paraphrase blocker and repeatability/context/hosting gates remain open regardless of one successful diagnostic. No provider switch, second pass, scope reduction or universal parsing promise is adopted. Keep Workers Free and public application ANALYSIS_ENABLED=false, no paid fallback, no new infrastructure, and no deployment.
