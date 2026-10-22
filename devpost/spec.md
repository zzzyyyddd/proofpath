---
doc: spec
status: approved
---

# ProofPath — Technical Spec

## How This Works, In Plain Language

ProofPath runs as a public Next.js website on Vercel. The browser keeps the two selected documents only while the page is open. Our server checks each file and extracts its text. When Compare Documents is selected, it receives the original files again and repeats those checks: text sent back by the browser is never the authority for the analysis.

The server sends the extracted text to Cloudflare Workers AI, provisionally using Qwen3. The model suggests changes and quotations. Ordinary TypeScript checks the response structure and independently finds each quotation in the exact extracted text from that attempt. Only candidates with the required source evidence and reliable locations can reach the Inspector. Matching words does not prove that the model understood them correctly.

The browser receives checked findings and source text for inspection. Unclear relationships appear under Needs Review; candidates with uncheckable evidence are withheld and make the analysis incomplete. Refreshing or closing the page loses the workspace. No database, persistent uploads, VPS, Docker, background jobs, or paid fallback is planned.

The learner explicitly approved this technical specification and authorized the official 5-build workflow. Supporting engineering defaults are accepted within the documented boundaries. Early feasibility gates remain mandatory; approval does not claim they have passed. Provider changes, new services, architectural expansion, or scope reduction require the learner to stop and decide before proceeding.

## The Core Journey Through the System

Implements `prd.md > The Core Journey`, `Document Validation and Extraction Integrity`, and `Session-Only Workspace and Attempt Isolation`.

1. Browser selects Old/New files. Local size/extension checks give quick feedback but are not trusted validation.
2. Each file goes to POST `/api/documents/validate`. Server validates and extracts it, returns document text, locations, warnings, and a validation result. Browser retains original File objects and returned data in memory.
3. Both valid panels enable Compare. POST `/api/compare` sends the two original binary files and the current browser attempt identifier. Server independently validates and extracts both files again; no browser text, page count, or earlier validation result is trusted.
4. Within this request, an immutable pair of extracted-document records is used for equality checking, provider input, evidence matching, and the final source context. The browser replaces validation-preview text with this authoritative attempt text when results arrive.
5. Exact identical extracted texts skip inference and return the identical-text state. Otherwise call the single configured Qwen endpoint with both complete texts and the defined candidate schema.
6. Parse and validate the candidate response, match evidence, compute counts and status, and build a summary only from visible candidates. Do not reuse an unvalidated model-wide summary.
7. Return findings, unresolved items, withheld count/status, limitations, and authoritative source text. Opening context uses that returned text, never regenerated content or a fresh extraction.
8. Retry is a new attempt. Replacement/reset invalidates prior work. Obsolete responses are ignored even if server/provider cancellation is unsuccessful.

**Accepted endpoint choice:** validate each upload independently without inference; resend both original files on Compare and revalidate/re-extract server-side. Never trust browser-returned text as the evidence baseline. Revalidation failure stops before inference with actionable advice. No persistent sessions, extraction signatures, database, VPS, Docker, or background jobs. Stream only actual server-stage events; call Qwen non-streamed and validate its complete response before displaying results. Bound execution time, attempt cancellation where practical, and treat interrupted streams as explicit failures. Partial or unverified model output never becomes completed analysis.

## Stack

Learner direction: Next.js App Router, TypeScript, Tailwind CSS, Vercel, transient server extraction, and deterministic verification. Cloudflare/Qwen replaces earlier Groq exploration as the provisional provider direction. No automatic model/provider fallback.

Proposed supporting dependencies: React's built-in reducer/hooks; Zod 4 for strict runtime schemas and JSON Schema export; Mozilla `pdfjs-dist` for per-page PDF text/items; native fetch for Cloudflare; Vitest for deterministic tests; Playwright for browser behavior. No AI orchestration SDK, queue, vector database, or state library is needed.

Use Node.js 22.x consistently in WSL, package engines, and Vercel, subject to confirming compatibility of the chosen supported dependency releases. Select maintained compatible stable Next.js/React and PDF.js releases at build setup, record exact versions in `package-lock.json`, and verify deployed PDF import/runtime behavior before expanding implementation. Tailwind uses its v4 integration. Do not claim a version combination has already been installed or tested.

Documentation: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route), [React useReducer](https://react.dev/reference/react/useReducer), [TypeScript](https://www.typescriptlang.org/docs/), [Tailwind Next.js integration](https://tailwindcss.com/docs/installation/framework-guides/nextjs), [Zod](https://zod.dev/), [PDF.js](https://mozilla.github.io/pdf.js/), [PDF page API](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFPageProxy.html), [Vitest](https://vitest.dev/guide/), [Playwright](https://playwright.dev/docs/intro).

## Where It Runs and How Someone Tries It

Implements `prd.md > The Core Journey` and `Privacy and Data-Handling Statements`.

Production: public Vercel Hobby deployment with Node Route Handlers; Cloudflare Workers AI REST inference on Workers Free only. The Vercel deployment remains live with the learner's laptop off. No custom Cloudflare Worker is needed just to call the hosted model. Public use remains subject to provider and hosting quotas, not an uptime guarantee.

Planned local commands after 5-build creates the application: `npm ci`, `npm run dev`, open `http://localhost:3000`. Production verification: `npm run build`, `npm run start`, open the same address. Planned checks: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`. These scripts do not exist yet and must be created during build. Live evaluations use an explicit separate `npm run eval:live`, never ordinary tests/CI.

Deploy after implementation: connect the public GitHub repository to a Vercel personal Hobby project; configure the server environment, Node runtime, firewall rule, and public deployment access; deploy and test the HTTPS URL in a signed-out browser. Verify all features while the laptop is off. No paid upgrades or billing activation. Confirm Hobby eligibility and actual free limits before release; if unavailable, stop and revisit hosting with the learner rather than spending money.

Server secrets: `CLOUDFLARE_API_TOKEN` with minimum Workers AI permissions and `CLOUDFLARE_ACCOUNT_ID`; never `NEXT_PUBLIC_` prefixes. Nonsecret configuration: fixed model ID and `ANALYSIS_ENABLED`. If the contingency Turnstile proposal is accepted, separately configure its public site key and server-only secret; do not introduce those requirements otherwise. A secret-free `.env.example` names variables without values. Credential files remain ignored. No keys in source, browser bundles, screenshots, URLs, or error responses.

Submission still requires the short demo video and public GitHub repository. Record the real upload → findings → evidence/context → limitations loop; deployment supplements those artifacts.

## Look and Feel

Implements `prd.md > Look and Feel`, `Screens and Layout`, and `Source Context Viewer`.

Use CSS variables with Tailwind utilities: background `#0B1220`, surfaces `#152238`, accent `#2DD4BF`, text `#F1F5F9`, secondary `#94A3B8`, warning `#F59E0B`. Propose error `#FCA5A5` on dark surfaces, verified for its actual foreground/background usage. Inter or Geist for interface text; a readable monospace for references and suitable passages, with system fallbacks and no runtime font-service dependency.

Desktop: Old/New upload columns, then a narrower findings list and wider Inspector; Old/New modified evidence side by side. Mobile stacks surfaces. No theme switcher or extra screens. Use semantic buttons, keyboard-selectable cards, visible focus, status announcements, reduced-motion support, readable quotation wrapping, and text labels in addition to color. Source context is a lightweight in-app expandable panel with a focusable heading and close control; opening scrolls to the mapped quotation, closing returns focus to its opener and restores existing selection/positions. Store mobile findings-list scroll position before bringing the Inspector into view.

Use separate evidence, AI Interpretation, and Suggested Action blocks. Only quotation/source occurrence receives “Source passage verified.” Needs Review and incomplete warnings use amber with explanatory text. Avoid gradients, glowing effects, glassmorphism, and decorative motion. References remain Linear/Notion/developer-tool qualities, not copied templates.

## Components

### Workspace Controller

Implements `prd.md > Session-Only Workspace and Attempt Isolation`, `States and Boundaries`, and `Truthful Processing and Retry`.

Files: `src/components/comparison-workspace.tsx`, `src/lib/client/workspace-reducer.ts`, `src/lib/client/requests.ts`.

Reducer owns upload statuses, file references, validation previews, active attempt, processing stage, results, selected item, and source-context state. No localStorage/sessionStorage/IndexedDB or service-worker caching of content. A monotonically increasing workspace generation plus per-upload revision and comparison attempt ID guard every asynchronous update. Each replacement invalidates comparison state and the affected upload revision; reset invalidates all work. Capture generation/revision when starting work and accept a response only if still current. Use AbortController to attempt cancellation, but generation checks provide correctness if cancellation fails. Duplicate Compare is disabled/guarded; Retry clears selection/context and prior result association before showing processing. Never merge attempts.

### Upload Panels and Validation Route

Implements `prd.md > Upload Workspace` and `Document Validation and Extraction Integrity`.

Files: `src/components/upload-panel.tsx`, `src/app/api/documents/validate/route.ts`, `src/lib/server/documents/validate.ts`.

One multipart file per validation request, label Old or New, bounded filename and fields. Proposal: interpret 2 MB as 2,000,000 bytes, max PDF pages 10, max canonical extracted text 30,000 Unicode code points per document. Exactly 30,000 is allowed; 30,001 rejected. Preserve UTF-16 offsets separately for JavaScript slicing. Empty/whitespace-only extraction is unusable. Decode TXT/MD as UTF-8 with invalid-encoding rejection; remove leading BOM and canonicalize CRLF/CR to LF before counting/matching. Do not render uploaded Markdown as HTML.

Check actual bytes: PDF signature/parser acceptance; reject unsupported binary formats regardless of extension. For TXT/MD, require consistent extension/type and valid nonbinary UTF-8; MIME supplied by the browser is advisory, not proof. Text files have no magic signature; document this limitation. Accepted language policy: clearly English documents proceed normally; primarily English documents with foreign names or technical terms also proceed normally. Uncertain or mixed-language documents may proceed with a visible notice that only English is officially supported and analysis may require additional review. Clearly predominantly non-English documents are blocked before inference with an actionable message recommending an English version. Detection is conservative and must not claim certainty. Language validation is local deterministic server processing, separate from Cloudflare inference, and makes no AI calls. The detector/library and conservative thresholds must be fixture-tested during build; uncertainty alone never blocks comparison.

Validation/extraction must never invoke Cloudflare Workers AI or consume its inference quota. Return per-file error codes and actionable messages; keep the other valid upload. Limits/errors disable Compare. Use no-store caching and never write content to disk or logs.

### PDF Extraction and Quality Gate

Implements `prd.md > Document Validation and Extraction Integrity` and `Source Context Viewer`.

Files: `src/lib/server/documents/extract-pdf.ts`, `src/lib/server/documents/canonical-text.ts`.

Use PDF.js in Node, with original bytes in memory, per-page `getTextContent`, page numbers, text item coordinates, and parser error tracking. Keep page text and canonical offsets; join pages with a documented separator included in canonical text. Disable evaluation of PDF-supplied code; no execution of embedded actions, attachments, remote fetches, HTML, or links. Reject password-protected documents rather than add password handling. Destroy loading/document tasks and release buffers when done. Verify Node-compatible import/worker packaging in the deployed runtime; PDF.js's parsing worker is not an application background-job service.

Collect page-level text usability and layout indicators. Block image-only/scanned documents, missing/error pages, material partial extraction, undecodable text, and detected structures/order inadequate for traceability. Proposed conservative checks: whitespace-only pages require a reliable explanation as blank; otherwise block; text extraction with repeated replacement/control characters or apparent multiple columns/interleaved text triggers a quality warning and block pending a supported simple-text source. Compare text-item position/order to detect obvious line/column anomalies; do not claim all tables or scanned regions can be detected. No arbitrary “extraction confidence” score. The exact fixture-backed detector thresholds remain a feasibility investigation, not a guarantee.

Return distinct UNSUPPORTED_SCANNED_PDF, INCOMPLETE_EXTRACTION, EXTRACTION_FAILED, or valid-with-PDF-limitations outcomes. Include filename, known issue, page only when reliably known, and replacement advice. Never skip a bad page and treat the rest as complete. Nonblocking extraction always carries residual-layout limitations. No OCR, reconstruction, repair, or original-PDF viewer.

### Comparison Route and Orchestrator

Implements `prd.md > Truthful Processing and Retry`, `The Core Journey`, and `Partial Results, Never False Completeness`.

Files: `src/app/api/compare/route.ts`, `src/lib/server/compare.ts`, `src/lib/shared/contracts.ts`.

Node runtime only. Multipart binary fields old/new plus attempt ID; ignore or reject extra fields, never accept authoritative extracted text from the browser. Proposal: cap complete multipart body at 4,100,000 bytes (two decimal 2 MB files plus bounded overhead), under Vercel's documented 4.5 MB request limit. Count actual streamed bytes before buffering, including requests without Content-Length; enforce file and field counts. File-size choice and overhead must be boundary-tested in deployed Vercel. Never base64-wrap both files.

Re-extract both originals and freeze the attempt baseline. Return that same text/location set with results. No server-global document map or sessions. Byte identity can be a shortcut only after both documents pass validation; semantic empty state is based on extracted text identity, not filenames.

Accepted truthful stage design: use an application NDJSON event stream: stage-start/stage-done events around real server work, then exactly one final result or typed error. Cloudflare model inference remains non-streamed. Validation on upload already happened; compare extraction is genuinely repeated, so it can truthfully display its own validating/extracting stage. Never emit model token progress or fake percentages. Flush only safe metadata during processing. Client rejects malformed streams, missing final events, and outdated attempt IDs. No partial model output becomes a finding.

Proposed budgets: validation/extraction deadline 15 seconds per document, Cloudflare call deadline 60 seconds, whole comparison deadline 100 seconds; configure Vercel maxDuration 120 seconds only after confirming free-plan runtime support. Client timeout 110 seconds. Cancellation ends further processing where possible; provider work already started may still consume quota. Synchronous parser CPU work is not safely interrupted by a JavaScript timer; measure bounded-input parsing and refuse release if resource ceilings cannot be respected. Do not add hidden infrastructure as a fix.

### Qwen Candidate Generator

Implements `prd.md > Classified Findings and Source Traceability`, `Needs Review — Relationship Unresolved`, and `AI Interpretation and Suggested Action`.

Files: `src/lib/server/ai/cloudflare.ts`, `src/lib/server/ai/prompt.ts`, `src/lib/server/ai/candidate-schema.ts`.

Provisional model: `@cf/qwen/qwen3-30b-a3b-fp8`. Learner reports one four-field team-size probe passed schema, exact quotes, and Modified classification (~10.22 neurons). An earlier Qwen probe incorrectly returned Removed; Mistral failed schema checks. These are learner-reported observations, not a repeatability or full-contract evaluation. No guarantee of reliable classification or model replacement without review.

Explicit prompt definitions:

- Added: a New requirement with no corresponding Old requirement identified after comparing context, scope, exceptions, and paraphrases. A changed value is not an addition.
- Removed: an Old requirement with no corresponding New requirement identified after the same contextual comparison. A changed value is not a removal.
- Modified: corresponding requirements on the same subject/scope exist in both versions but an obligation, value, date, condition, or applicability changed. Team size five → three and a changed deadline are Modified, not Removed plus Added.
- Needs Review: potentially related requirements have verified passages on both sides, but replacement/conflict/scope/exception/change cannot be established reliably. Never force classification or assume New automatically prevails.
- Unchanged: equivalent requirement content is not a finding, even if unrelated prose differs. Absence claims are not exhaustive proof.

Treat documents as untrusted quoted data, never as instructions; disable tools/browsing and send no secrets in prompts. Ask for minimal exact passages, cautious interpretation, action, and ambiguity rationale. No chain-of-thought or confidence percentages in application output.

Proposed final wire contract: a closed root object with required `candidates` array and `analysis_complete` boolean. Each closed candidate has required `kind` enum (added/removed/modified/needs_review), `title`, `change_description`, `old_quote` and `new_quote` as string-or-null, `interpretation`, `suggested_action`, and `uncertainty` strings. Empty quotation strings do not count as evidence. Optional evidence uses explicit null, never fabricated text. This expands the test's four-field transport schema to represent the already approved product states, not new features. Export JSON Schema from the same strict Zod contract used server-side; test the provider-supported subset.

Use native REST response_format with type json_schema and the schema directly in json_schema. Set stream false, temperature 0, proposed max_tokens 4096. Do not send undocumented thinking-control options. Unexpected fences, reasoning mixed into content, or alternate keys are validation failures, not repaired successes. Global malformed/truncated output fails the attempt; candidate-local evidence failures permit checked partial results. Missing/false analysis_complete triggers incomplete analysis even if all observed candidates passed; unknown withheld count stays Unknown when enumeration is unreliable. A true flag is a model report, never proof of exhaustive detection.

Qwen context is documented as 32,768 tokens. Send full texts once; no hidden clipping/chunking or lossy summaries. Reserve prompt/schema/output headroom. Before release, validate full 30,000-character pairs including token-dense English fixtures. Context overflow produces an explicit capacity error, never fake success; a systematic inability to handle approved input bounds blocks release and requires learner review. Tokenizer choice/accurate preflight remains open; character/4 is only an estimate and must not authorize oversized requests. Reasoning/output truncation is an explicit error.

### Deterministic Evidence Verifier

Implements `prd.md > Classified Findings and Source Traceability`, `Source Context Viewer`, and `Partial Results, Never False Completeness`.

Files: `src/lib/server/evidence/verify.ts`, `src/lib/server/evidence/locations.ts`.

Use only the immutable canonical extraction supplied to Qwen in this request. Never accept model offsets/page numbers as trusted. Find each nonempty quotation by exact substring equality; derive offsets from the server's matches. No fuzzy matching, quote paraphrase, case folding, or post-model normalization. If a quotation matches multiple occurrences and its intended context cannot be disambiguated reliably, withhold rather than arbitrarily pick the first. Store start/end UTF-16 indices and derive one-based line references from the same canonical string. PDF page comes from extractor page ranges, never model output; omit page numbers for cross-page/unreliable mappings while preserving accurate offsets.

Modified/Needs Review require both quotations and locations. Added requires New evidence and a null Old side; Removed requires Old and null New. Inconsistent absent-side payloads fail evidence validation rather than being silently dropped. Missing required evidence, fabricated quotes, wrong-source matching, or unmappable locations withhold the entire candidate; never expose its unsupported title/interpretation/quote as a normal finding.

Detect obvious duplicate candidates/identical paired passages deterministically so an exact-unchanged passage pair cannot become a Modified finding. Quotation matching cannot reject every mistaken semantic classification. When a payload relationship is semantically uncertain, preserve paired valid evidence as Needs Review; do not pretend deterministic text matching establishes semantic uncertainty perfectly. Schema-valid hallucinated interpretation with real quotes remains a known residual risk addressed through prompt, labeling, and evaluation.

### Result Builder and Status Rules

Implements `prd.md > Partial Results, Never False Completeness`, `Needs Review — Relationship Unresolved`, and `States and Boundaries`.

Files: `src/lib/server/results.ts`, `src/components/comparison-overview.tsx`, `src/components/findings-list.tsx`.

Compute all counts from checked candidates. Classified totals exclude Needs Review and withheld items. A comparison summary is composed from the visible checked descriptions only, keeping interpretation separate. Use exactly:

“Comparison Overview”

“AI-assisted analysis of the supplied documents. Source passages are checked against extracted text; change classifications and interpretations may still be incorrect.”

Withheld evidence candidates make Analysis Incomplete prominent above counts/list. Known evidence-check failures are counted; if complete enumeration is unavailable, use Unknown and never zero. An explicit provider-reported incomplete response with otherwise valid candidates uses a general incomplete reason rather than falsely claiming evidence failures. Nothing missing from AI output can be inferred as a counted withheld change.

State precedence: processing/transport failure → explicit failure; any known withholding or unknown/incomplete coverage → Analysis Incomplete; otherwise Needs Review-only → “No requirement changes were classified. Some verified passages require manual review”; exact identical extracted texts → identical-text message; nonidentical/no checked findings/no unresolved/no withholding → “No supported requirement changes were identified.” All-withheld → “No findings could be verified,” never no-changes. For incomplete responses with no known candidates, say the analysis did not produce a usable complete result rather than invent counts. Distinguish “processing finished” from “all changes found.” No universal confidence score, total assessed metric, or verified-classification badge.

### Evidence Inspector and Source Context Viewer

Implements `prd.md > Results Workspace and Evidence Inspector`, `Source Context Viewer`, and `AI Interpretation and Suggested Action`.

Files: `src/components/evidence-inspector.tsx`, `src/components/source-context-viewer.tsx`.

Render only verified passage text as escaped React text nodes, with highlight spans sliced at actual offsets; never dangerouslySetInnerHTML or execute Markdown. Modified/Needs Review permit independent Old/New context opening; Added/Removed only the existing side. Absent-side wording is “No corresponding [Old/New] Version passage was identified,” never proof of absence. Source badges describe matching only. Relationship-unresolved message remains prominent.

Context displays actual canonical text, filename, label, line/offset and reliable page when available; scroll to/highlight exact cited occurrence with surrounding text and full-document scrolling. State restoration and keyboard/mobile behavior follow Workspace Controller and Look and Feel. PDF note explains extracted text is not original layout or a completeness guarantee.

### Static Sample Analysis

User-authorized addition during technical review, limited to demonstrating `prd.md > Source Context Viewer` and `prd.md > Results Workspace and Evidence Inspector` behavior when live inference is unavailable. The approved scope and PRD files remain unchanged; this is an explicit demonstration companion, not a change to live comparison acceptance requirements.

Files planned: `public/samples/old-rules.txt`, `public/samples/new-rules.txt`, `public/samples/analysis.json`, `src/components/sample-analysis-preview.tsx`. Use synthetic controlled rules, the three expected fixture changes, and an unchanged requirement. Sample findings are curated static data with truthful provenance; do not imply a model generated them unless an actual recorded run establishes that.

Provide an explicit secondary “Explore Sample Analysis” action on upload and from quota-unavailability messages. Never switch automatically. Display a persistent heading/banner: “Static sample — controlled fixtures. Not a live AI result.” Keep sample filenames and sample identity visible in the Inspector and Source Context Viewer; repeat the sample label wherever a detached evidence view could otherwise mislead.

Use the existing Inspector/context components in isolated sample-preview state; preserve the current live uploads/results/selection and restore them when closing the preview. Sample items must never merge with live results or enter a pending live attempt. New Comparison clears sample preview as well as live state. Refresh closes preview and starts fresh.

Load only bundled static sample assets; do not call `/api/compare`, validation routes, or the AI provider to open/explore them. The sample is available independently of Cloudflare inference quota while static hosting is available. It is not a guarantee of Vercel uptime. A real comparison failure remains visible and offers the sample separately, never fabricated success.

Before publishing, validate sample JSON against the result contract and deterministically verify every quotation/location against its bundled source fixture. Invalid sample mappings fail the sample check; do not publish a misleading evidence badge. Recheck after any fixture/data change. Static public synthetic fixtures are not persistent storage of user documents.

Acceptance: with live inference forced unavailable, a judge can explicitly open the labeled sample, select all three changes, inspect exact source context, and return to the preserved live workspace without any inference/validation request. Labels remain visible on mobile/keyboard flows. Sample results never satisfy a live-model evaluation or hide an analysis failure.

### Public Endpoint Protection and Privacy

Implements `prd.md > Privacy and Data-Handling Statements` and `Session-Only Workspace and Attempt Isolation`.

Use Cloudflare Workers Free only; no upgrade, prepaid Gateway credits, or paid provider fallback. Verify actual account plan and project quota before launch. Cloudflare documents 10,000 free neurons/day with daily reset at 00:00 UTC and errors at exhaustion. A public key-backed application shares that quota; malicious/ordinary traffic can make comparison unavailable for other users. Successful tiny-test neuron usage does not establish daily comparison capacity.

Accepted conditional protection: one Vercel Hobby firewall rule matching POST `/api/compare` only, fixed window per IP, initially 6 requests per 60 seconds. Do not apply this AI throttle to static pages/assets, sample exploration, local-only validation, or `/api/documents/validate`. Server validation still has byte, parsing-resource, and time bounds but makes no Cloudflare AI calls. Verify the comparison rule is actually available, configurable, and included at zero cost in the learner's account before relying on it; public documentation alone is insufficient. Local 1-in-flight UI guard plus a short retry cooldown improves UX but is not security. Body/file/time/output bounds, same-origin browser checks (not authentication), fixed provider/model/prompt, no arbitrary upstream URLs, no secret logging, and an `ANALYSIS_ENABLED=false` kill switch limit exposure. No untrusted X-Forwarded-For counters or in-memory counters described as global. Throttling is not a global neuron reservation; legitimate shared-IP users may be limited. If free platform protection is unavailable, the proposed contingency is Cloudflare Turnstile Free gating live Compare with mandatory server-side Siteverify validation, bounded requests, and the existing free-quota hard stop. This is bot mitigation, NOT an equivalent globally enforced six-per-minute IP counter. It adds no VPS, Docker, or document store but adds a challenge/service dependency; obtain learner agreement before adopting it. If equivalent numeric enforcement remains required, pause public live rollout until a genuinely free supported mechanism is agreed; do not mislabel in-memory counters as equivalent.

On quota exhaustion return explicit unavailable/retry-later guidance; honor Retry-After when available, not a fabricated reset promise. Never retry automatically, switch to paid billing, or substitute sample findings for live analysis. Vercel Hobby quota exhaustion can also interrupt access. Public accessibility does not mean guaranteed perpetual free availability. The learner accepted this shared-quota tradeoff, conditional on comparison-only throttling, free account-feature verification, no automatic inference retries, no paid fallback, and a separately labeled static sample.

No database, object storage, disk uploads, document-content cache, persistent browser state, provider file-upload endpoint, or AI Gateway content logging. Mark API data no-store; don't log documents, prompts, model responses, or secret-bearing errors. Keep operational status/timing only, without content. Memory cleanup is best effort, not a claim of immediate physical erasure. Privacy copy: files are processed transiently by ProofPath's server; extracted text is sent to Cloudflare Workers AI; comparisons are not saved by ProofPath and refreshing clears the browser workspace. Link accurate provider terms; never claim third-party zero retention or browser-only processing.

## Data Model

Implements `prd.md > Session-Only Workspace and Attempt Isolation` and `Source Context Viewer`.

| Record | Fields | Lifetime/authority |
| --- | --- | --- |
| Browser upload | File, label, revision, validating/valid/invalid, preview extraction | Open page only; preview never authoritative for Compare |
| ExtractedDocument | id (Old/New within attempt), filename, format, canonicalText, codePointCount, lineStarts, PDF page ranges, residual limitations | Created from original bytes on server; request memory, then browser memory for that result |
| Candidate | Defined AI wire fields | Untrusted server-local until checked; not returned when withheld |
| Evidence | documentId, exact quote, start/end UTF-16 offsets, one-based lines, optional reliable page | Derived server-side against that attempt's extraction |
| Visible item | server-assigned ID, kind, title/description, required Evidence, separate interpretation/action/uncertainty | Checked-source results only; semantics still AI-assisted |
| ComparisonResult | attemptId, documents, classified[], needsReview[], withheldCount number-or-null, incomplete flag/reasons, derived counts/overview/empty-state | One attempt; never merged |
| Browser workspace | generation, upload revisions, active attempt, stage, result, selection, sourceContext, list position | Reducer memory; cleared on reset/refresh/close |

Document IDs and attempt IDs are association keys, not authentication or cryptographic evidence. The verifier never uses a browser-generated ID to fetch stored authoritative content.

## API Contracts

### POST /api/documents/validate

Input: multipart `file`, `label`, `uploadRevision`; stream/body bounds and actual server validation. Output success: label/revision plus ExtractedDocument and residual limitations. Failure: typed safe error, affected file/label, optional reliable page, actionable replacement guidance. HTTP 400 invalid shape, 413 exceeded bytes/text/pages with specific code, 415 unsupported format, 422 unusable extraction/language, 500 unexpected safe error. The comparison-specific AI rate limit does not apply here; infrastructure-wide failures are still explicit errors. Never emit raw parser stack/content.

### POST /api/compare

Input: multipart `old`, `new`, `attemptId`. Return NDJSON stage events, then a final ComparisonResult or typed error. Before opening stream use HTTP errors normally; after stream starts errors are typed terminal events and HTTP 200 alone is never success. Client requires terminal result/error and checks attempt freshness. Stream missing/truncated → explicit failure. Bound serialized application response to 1 MB, including source context; fail explicitly rather than truncate context/findings. With two 30,000-code-point texts this leaves substantial ordinary-text headroom, but validate escaped/unusual input cases.

## External Services and Dependencies

### Cloudflare Workers AI

POST `https://api.cloudflare.com/client/v4/accounts/{accountId}/ai/run/@cf/qwen/qwen3-30b-a3b-fp8` with Authorization Bearer server token and application/json. Body: system/user messages, non-streamed generation, response_format `{type: json_schema, json_schema: <candidate schema>}`, temperature 0, bounded max_tokens. Endpoint is hardcoded from trusted configuration, never arbitrary user input.

Native REST wraps provider results. Adapter verifies HTTP status and API success, checks result.choices[0].message.content using the observed/documented chat-completion shape, accepts a structured object or parses the entire string once, then strict-validates. Confirm the exact raw successful response fixture before freezing the adapter; no broad guesswork over arbitrary nested keys, fence stripping, changes-array renaming, or repair calls. Require a nontruncated terminal generation; missing finish information requires investigation, not assumed success. Provider request IDs/status may be recorded without content.

Sources: [model contract/context](https://developers.cloudflare.com/workers-ai/models/qwen3-30b-a3b-fp8/), [REST run schema](https://developers.cloudflare.com/api/resources/ai/methods/run/), [JSON mode caveats](https://developers.cloudflare.com/workers-ai/features/json-mode/), [free allocation/pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), [limits](https://developers.cloudflare.com/workers-ai/platform/limits/), [data usage](https://developers.cloudflare.com/workers-ai/platform/data-usage/). Model schema/availability, raw response shape, context headroom, full-contract JSON-mode support, and quota consumption require free-plan verification. Documentation and a passed tiny probe do not prove full-contract compliance. No Cloudflare Worker deployment, Gateway, model hosting, or extra paid service.

### Zero-Cost Contingency — Not Adopted

Only if the Vercel rule is unavailable, propose [Turnstile Free](https://developers.cloudflare.com/turnstile/plans/) with [server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/). A managed challenge gates Compare, and the server calls POST `https://challenges.cloudflare.com/turnstile/v0/siteverify` with the server secret and response token, validating success/hostname/action before inference. Invalid/expired/replayed tokens fail closed; no AI quota is used for verification. No persistent document storage is involved. This is not a numeric per-IP rate-limit replacement and is not adopted without learner agreement. No paid fallback or silent dependency addition.

### Vercel

Hosts Next.js UI and Node handlers, env secrets, HTTPS, and the proposed included firewall rule. Confirm Hobby plan terms, 4.5 MB payload limits, memory/bundle limits, and Fluid Compute duration configuration in the project. Sources: [function limits](https://vercel.com/docs/functions/limitations), [Hobby](https://vercel.com/docs/plans/hobby), [rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting), [WAF pricing](https://vercel.com/docs/vercel-firewall/vercel-waf/usage-and-pricing). No paid activation without changing the zero-budget decision.

## File Structure

Planned application files only; none are created by this stage.

```text
proofpath/
├── devpost/                          # Canonical learning/planning docs and HTML companions
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Metadata and font setup
│   │   ├── page.tsx                  # Single workspace entry
│   │   ├── globals.css               # Approved theme and accessible states
│   │   └── api/
│   │       ├── documents/validate/route.ts # One-file validation/extraction
│   │       └── compare/route.ts      # Re-extract originals and stream real stage events
│   ├── components/
│   │   ├── comparison-workspace.tsx  # Upload/processing/results composition
│   │   ├── upload-panel.tsx          # Old/New validation and replacement
│   │   ├── comparison-overview.tsx   # Exact copy, distinct counts and limitations
│   │   ├── findings-list.tsx         # Classified/Needs Review sections
│   │   ├── evidence-inspector.tsx   # Evidence before AI interpretation/action
│   │   ├── source-context-viewer.tsx # Actual text, exact location and return behavior
│   │   └── sample-analysis-preview.tsx # Explicit labeled static demonstration, isolated state
│   └── lib/
│       ├── shared/contracts.ts      # Result/error/event types and runtime schemas
│       ├── client/
│       │   ├── workspace-reducer.ts # Session generations and state transitions
│       │   └── requests.ts          # Abort and NDJSON event handling
│       └── server/
│           ├── compare.ts           # Request-local orchestration
│           ├── results.ts           # Counts, safe overview, empty/incomplete precedence
│           ├── limits.ts            # Byte/code-point/page/time/output bounds
│           ├── documents/
│           │   ├── validate.ts      # Type/encoding/constraints/language policy
│           │   ├── extract-pdf.ts   # Per-page extraction and quality diagnostics
│           │   └── canonical-text.ts# Deterministic text, lines and page maps
│           ├── ai/
│           │   ├── cloudflare.ts    # Server-only fetch, envelope and quota errors
│           │   ├── prompt.ts        # Definitions, ambiguity and untrusted data boundaries
│           │   └── candidate-schema.ts # One schema source for prompt/output validation
│           └── evidence/
│               ├── verify.ts        # Exact quote and required-side checks
│               └── locations.ts     # Reliable offsets/lines/pages
├── tests/
│   ├── fixtures/                    # Synthetic public rules and expected semantic outcomes
│   ├── unit/                        # Verifier, limits, results and reducer invariants
│   ├── integration/                 # Routes/provider failure injection
│   └── e2e/                         # Upload→Inspector/context and reset/late-response flows
├── public/samples/                  # Public synthetic demonstration assets, no user content
│   ├── old-rules.txt                # Controlled old rules
│   ├── new-rules.txt                # Controlled updated rules
│   └── analysis.json                # Curated result with validated source locations
├── scripts/evaluate-model.ts        # Explicit opt-in live free-plan evaluation, no retries
├── .env.example                     # Names only; no credentials
├── .gitignore                       # Existing learner-profile/credential exclusions retained
├── package.json                     # Planned npm scripts
├── package-lock.json                # Exact verified versions
├── tsconfig.json                    # Strict TypeScript
├── next.config.ts                   # Required server dependency/runtime configuration
├── postcss.config.mjs               # Tailwind integration
├── eslint.config.mjs                # Lint configuration
├── vitest.config.ts                 # Deterministic tests
├── playwright.config.ts             # Browser flow checks
└── README.md                        # Setup, public demo, limits and accurate data handling
```

## Verification Strategy and Acceptance Gates

Implements `prd.md > Acceptance and Demonstration` and `scope.md > What "Working" Looks Like`.

Tests must check semantics and evidence independently, not just HTTP/JSON success. Use synthetic controlled fixtures without private data. Mocking the provider is allowed only in explicitly isolated tests. The live comparison kernel and live demo process actual uploaded files. The learner separately authorized a clearly labeled static sample using public controlled fixtures; it must never masquerade as live inference. Ordinary tests consume no inference quota. Live runs are deliberate, sequential, bounded, with no automatic retries and no private documents in reports.

| Fixture/check | Observable required outcome |
| --- | --- |
| Main three-change pair | Mandatory video Added; deadline Modified; team five→three Modified; unchanged rule omitted; no Removed/Added split for changed values |
| Video optional→mandatory contrast | Modified when an existing video rule's obligation changes; Added only for the fixture that truly introduces a previously absent obligation |
| Controlled removal | Removed, Old quote/locations match; null New evidence and honest absent-side notice |
| Exact identical extracted text | Skip inference; exact identical-text message; zero findings |
| Same requirements/different prose | No invented requirement change; appropriate nonidentical no-supported-change message |
| Scope/exception ambiguity | Paired verified passages under Needs Review; no forced conflict/replacement or classified-total inclusion |
| Fabricated/wrong-source/missing/multiply ambiguous quote | Candidate withheld, no unsupported quote/title/interpretation shown; incomplete warning/count |
| Mixed and all-withheld | Checked items remain inspectable; correct separated counts; all-withheld never no-changes |
| Schema-valid wrong classification | Evaluation fails semantically even when quotes match; labels never claim classification verified |
| Malformed/fenced/extra-key/truncated payload | Typed analysis failure, no silent repair, no invented zero findings |
| API 401/403, 429, 5xx, timeout, quota exhausted | Safe explicit errors, valid uploads retained, no paid fallback or automatic retry |
| TXT/MD/PDF accepted and boundaries | 2 MB, 10 PDF pages, 30,000 code points inclusive; next unit rejected; no silent truncation; binary spoof/invalid encoding/empty text rejected |
| PDF scanned/partial/missing page/bad order/parser fail | Correct distinct blocking state; valid partner preserved; accepted PDF retains limitation note |
| Source context | Correct actual occurrence, surrounding/full extracted text, independent sides, reliable page only, close restores selection/scroll/focus |
| Retry/replace/reset/refresh and delayed replies | Required clearing/preservation; old validation and comparison replies cannot overwrite current workspace |
| Static sample during quota exhaustion | Explicit labeled sample opens without inference/validation calls; all quotes map to static fixtures; live state preserved and no merged results |
| Comparison-only throttle | Seventh Compare request in the configured fixed window is rejected; static/sample/upload validation are outside that rule; verify actual deployed behavior without inference calls where possible |
| Validation quota isolation | Provider adapter spy records zero calls for valid, invalid, failed-extraction, and replacement-validation paths |
| Language policy | English/primarily English technical text proceeds normally; uncertain/mixed text proceeds with visible limitation; clearly predominantly non-English text blocks with actionable advice; language checks make zero AI calls and do not claim certainty |
| Public deployed flow | Signed-out judge with laptop off can run real comparison within free quotas; source evidence inspectable; secrets absent from bundle/errors |
| Mobile/accessibility | Keyboard-only upload/findings/context/close, visible focus, readable contrast, stacked panels, no mandatory motion |

Proposed repeatability gate: each live semantic fixture (main pair, removal, equivalent-requirements, ambiguous pair) passes three consecutive independent runs with identical recorded model/prompt/schema/settings; failures remain failures, not discarded until a lucky run. Exact-identical bypass is separately deterministic. After any prompt/schema change rerun the affected suite. Every displayed source quote/location must pass deterministic checks in every run. Repeat normal maximum-length input tests and token-dense boundary tests, record real neurons and duration; do not extrapolate from ~10.22 neurons on one tiny probe. Stop evaluation before exhausting the free daily allowance. This gate does not establish universal accuracy.

Release gates: deployed PDF feasibility within bounded resources; supported full-size context behavior; full application schema/finish/envelope validation; semantic fixture repeatability; free-plan/account/throttle availability. If a gate fails, retain failure/incomplete behavior and revisit the specific design with the learner. Do not silently drop PDF or reduce approved limits. Spec approval can authorize a clearly identified early feasibility investigation, but cannot claim its results in advance.

## Final 4-spec Review Checklist

This is a planning review checklist, not the 5-build implementation checklist. All implementation tests remain unexecuted unless explicitly identified as learner-reported probes.

- [x] Scope and PRD preserved; every approved behavior mapped to components, data flow, and planned files.
- [x] Qwen provisional status and observed classification/schema limitations recorded.
- [x] Server-owned extraction baseline, strict schema validation, exact quotation/location checks, and honest incomplete/Needs Review handling defined.
- [x] Accepted comparison-only throttle, zero inference in validation, no inference retries, no paid fallback, and clear quota-unavailability behavior recorded.
- [x] Explicit static sample provenance, evidence checks, isolated state, and zero-inference exploration defined.
- [x] Endpoint contracts, session generations, source-viewer behavior, public deployment, secrets, and no durable user-document storage documented.
- [x] Controlled semantic fixtures, source checks, failures, boundary inputs, and repeatability plan specified.
- [x] Language behavior agreed: uncertain/mixed inputs receive a limitation notice; clearly predominantly non-English inputs block without inference.
- [x] Endpoint and truthful processing-stage design accepted explicitly.
- [x] Routine implementation defaults identified separately from consequential decisions; they remain reviewable in the full draft.
- [ ] Verify actual Vercel Hobby rule availability/configurability and zero-cost terms in the learner's account; test the deployed match/rate behavior before relying on it. No connected account tool was available during drafting.
- [ ] If that rule is unavailable, agree on a genuinely free alternative and disclose its limits before adopting it.
- [ ] Record the early-build investigations for final Qwen schema/envelope/context limits and PDF extraction feasibility; do not claim them passed before execution.
- [x] Learner explicitly approved the complete technical spec and authorized the official 5-build workflow. Checklist-order approval and mode selection remain governed by that skill.

## Important Failure Modes

- Unusable PDF or limits breached → block before inference with specific replacement advice; retain valid partner.
- Provider quota/schema/context/timeout failure → explicit failure or correctly labeled supported partial result as defined above; no invented success, automatic retry, paid fallback, or truncation.
- Real quotes with wrong interpretation/classification → semantic evaluation failure; uncertainty/Needs Review where identified; source badge never asserts truth. Deterministic occurrence checks cannot solve all semantic errors.
- Late asynchronous work → cancellation plus generation guards; no update to a superseding workspace.

## What Was Simplified and Why

No database or durable file store; re-extraction replaces sessions/signatures; one provider/model and one full-text candidate call avoids fallback/routing complexity; no browser-side authoritative extraction; derived summary avoids a second AI call; request-stage stream avoids polling/jobs. The endpoint and stage-streaming design is accepted; remaining routine implementation details serve that stateless architecture and remain visible for full-spec review. No seeded findings or simulated progress in live comparison. The explicitly authorized static sample is separate, prominently labeled, and never substituted for live results. No OCR, advanced table repair, cloud history, accounts, extra sources, or blockchain.

## Decisions and Open Issues

### Learner Decisions Carried Forward

Public Vercel application independent of laptop; familiar Next.js/TypeScript/Tailwind; server extraction/quality/location/quotation checks; no durable content storage; session-only workspace; zero spending and no paid fallback; Qwen3 on Cloudflare provisionally preferred, with known semantic failures retained in the record; approved scope/PRD unchanged. No 5-build before explicit spec approval.

### Useful Unknown Discussed

The learner investigated whether structured JSON proves reliability. Their own tests showed schema failure for Mistral and a wrong Qwen category despite meaningful quotations; explicit definitions improved one test. This clarified that transport success, schema validity, quotation occurrence, and semantic correctness are separate checks. The agreed direction uses independent source verification; the proposed controlled semantic suite will investigate remaining uncertainty rather than claiming mastery or guaranteed quality.

### Decision Status and Approval Boundaries

1. **Accepted:** independent AI-free validation, original-file re-upload/revalidation/re-extraction on Compare, authoritative server baseline, truthful server-stage streaming, and complete non-streamed Qwen output validation. Revalidation failure stops before inference; interrupted streams fail explicitly; bounded execution and best-effort cancellation do not permit stale/partial results.
2. **Accepted conditionally:** free shared-quota availability and 6 requests/minute/IP on POST `/api/compare` only. Actual free Vercel account-feature verification is still outstanding. If unavailable, agree on the free Turnstile contingency or another verified zero-cost mechanism before public live launch; Turnstile does not reproduce numeric IP rate limiting.
3. **Routine implementation defaults, subject to full-spec review:** proposed supporting dependencies, decimal MB/Unicode-code-point conventions, timeout/output budgets, exact NDJSON event fields, focus mechanics, and three-run evaluation gate. The agent may resolve these within the approved requirements and zero budget; no separate permission ceremony is needed. Defaults that fail feasibility or change scope require renewed learner discussion.
4. **Accepted:** English and primarily English technical/name-bearing documents proceed; uncertain/mixed language proceeds with an English-only limitation notice; clearly predominantly non-English documents block before inference with actionable advice. Detection is conservative, runs without inference, and never claims certainty. Detector choice and thresholds are implementation details requiring fixture verification, not a reason to reopen this product decision.

### Feasibility Checks Before Claiming Build Readiness

Exact successful Qwen request/response envelope and final-contract support; accurate context budgeting for full approved bounds; conservative PDF detector thresholds and Node/Vercel packaging; actual free Cloudflare/Vercel plan settings, limits and included throttling. The spec is implementation-oriented but provisional at these gates. A failed free-plan gate requires a learner decision, not paid infrastructure or silent scope reduction. The only additional demonstration capability explicitly authorized here is the separately labeled static sample; all approved live comparison requirements remain unchanged.
