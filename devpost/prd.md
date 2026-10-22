---
doc: prd
status: approved
---

# ProofPath — Product Requirements

An evidence-backed comparison workspace for independent developers reviewing two versions of hackathon rules before submission.

Source: `scope.md > Who It's For`, `The Unique Kernel`, and `The POC Boundary`. The approved scope remains unchanged. This document defines product behavior, not implementation choices.

## The Core Journey

Source: `scope.md > The Core Loop` and `What "Working" Looks Like`.

1. Open ProofPath and immediately understand its purpose: “Know what changed. See the proof.”
2. Upload Old Version and New Version documents. Inspect per-document validation and extraction status. Replace an invalid document without losing the valid one.
3. Once both documents pass validation, select “Compare Documents.” Follow truthful processing stages without invented percentages.
4. Review the supplied filenames, result status, summary, and separate counts for classified findings, Needs Review items, and withheld candidates.
5. Select a finding to inspect its exact source passages and reliable locations. Inspect AI Interpretation and Suggested Action separately from document evidence.
6. Review unresolved relationships manually. If any evidence checks fail, use the explicitly incomplete results cautiously or retry; never mistake withheld candidates for verified findings.
7. Make the submission decision personally, consulting the supplied documents and official rules. ProofPath never determines eligibility.

A compelling demo shows the real upload-to-evidence loop, ideally in roughly one minute and within a presentation under three minutes. This is not a processing-latency guarantee.

## Screens and Layout

Source: `scope.md > The Core Loop` and `Inspiration & Identity`.

### Upload Workspace

- Minimal navigation: ProofPath name and subtle “Evidence-first AI” identity. No accounts or distracting secondary navigation.
- Headline: “Know what changed. See the proof.”
- Description: “Compare two versions of a document, understand meaningful changes, and inspect the evidence behind every finding.”
- Two upload panels: Old Version left, New Version right on desktop; stacked in the same order on mobile. Each supports drag-and-drop and browsing.
- Show TXT, MD, and text-based PDF support; English only; 2 MB and 30,000 extracted characters per document; maximum 10 pages per PDF.
- Selected panels show filename, validation status, and a replace action. Errors appear beside the affected document.
- One prominent “Compare Documents” action, disabled until both documents pass all required checks.
- Small, visible note: user-provided documents are not independently authenticated; Old/New labels do not establish official authority.
- Brief, unobtrusive session notice: comparisons are not saved; refreshing or closing the page clears the workspace.
- Intended usability outcome: a first-time user can identify the purpose and next action within five seconds, without a tutorial. This is a usability goal to check, not a guaranteed metric.

### Processing Panel

Show the current processing stage and disable duplicate comparison requests. Retain context about the uploaded documents. Errors identify the failed stage and offer retry when possible.

### Results Workspace and Evidence Inspector

- Header: Old/New filenames, overall status, Comparison Overview, category counts, and a visible warning that detected findings may not include every change.
- Clear “New Comparison” action, distinguishable from “Retry Comparison” and replacing a document. Keep the session-only notice available in the workspace.
- Desktop: selectable Findings List at left, more visually prominent Evidence Inspector at right. Needs Review items occupy a clearly separated section.
- Finding cards show title, category, and concise document-supported difference; avoid speculative importance or eligibility judgments as facts.
- Selecting a card updates the Inspector without navigating away.
- Inspector: document evidence first; source labels, filenames, and reliable locations; then distinct AI Interpretation and Suggested Action sections and limitations.
- Modified findings display Old and New passages side by side on desktop. Added and Removed findings show the evidence-bearing side and an honest absent-side notice.
- Mobile: sections stack; selecting a finding brings evidence into view without losing the list position. Preserve the selected finding and list position; opening or closing source context preserves the inspector state. Keyboard focus must remain usable through these transitions; exact focus mechanics belong in the technical spec.

## Look and Feel

Source: `scope.md > Inspiration & Identity`.

Identity: **Modern Evidence Intelligence**. Combine the precision and polish of Linear, readability of Notion, and inspectability of developer tools as references, not copied templates. No external reference research or additional product capabilities are required by these references.

- Dark-first: Midnight Navy `#0B1220` background; Deep Slate `#152238` elevated surfaces; Evidence Teal `#2DD4BF` accent; Cloud White `#F1F5F9` main text; Muted Slate `#94A3B8` secondary text; Amber `#F59E0B` for warnings and unresolved relationships. Errors use restrained red with accessible contrast; exact red is not yet chosen.
- Inter or Geist for interface typography. JetBrains Mono or another readable monospace for locations, evidence references, and appropriate quotations; do not sacrifice long-passage readability.
- Generous negative space, carefully aligned panels, subtle borders, clear selection and focus states, compact but comfortable density, restrained hover transitions.
- Evidence Inspector has greater prominence through layout, spacing, and typography. Subtle text-level highlights preserve the original quotation content.
- AI Interpretation and Suggested Action are visibly separate from evidence. “Source passage verified” indicators refer only to successful source matching.
- Status labels and explanatory text accompany colors. Keyboard navigation, visible focus, readable contrast, responsive layout, and reduced-motion preferences are required.
- Avoid neon gradients, excessive glassmorphism, glowing AI effects, decorative animations, and visual complexity that impairs reliability or usability.

## Features and Behavior

### Document Validation and Extraction Integrity

Source: `scope.md > The POC Boundary` and `Review Notes: Unresolved Decisions and Reliability Risks`.

Exactly two English documents, one per label, in TXT, MD, or directly extractable text PDF format. Reject unsupported formats, documents larger than 2 MB, PDFs longer than 10 pages, and extracted text longer than 30,000 characters. Clearly explain the violated limit; never silently truncate.

Validate the usability of extracted text before enabling comparison. For PDFs, check detectable issues including little or no text on pages, image-only/scanned pages, extraction errors, missing page results, suspicious reading order, and structures inadequate for trustworthy quotations or location tracking. These checks cannot guarantee detection of every lost table, scanned element, or ordering problem.

Block comparison when a material extraction issue is detected or extraction is insufficient for trustworthy evidence. Show “Extraction quality warning,” affected filename, known issue, reliable page number when available, why comparison could mislead, and an action to replace the file. Never silently skip problematic pages and present the remainder as complete.

Distinguish unsupported scanned/image-only PDFs, materially incomplete extraction, parsing/extraction failure, and usable extraction with residual limitations. For a PDF with no detected blocking problem, allow comparison with a visible note that extraction may miss or reorder content. Successful extraction is not proof of completeness.

Replacing a problem document preserves the other valid document. Recommend a clean text-based PDF, TXT, or Markdown source. No OCR, manual editing, repair, or advanced table reconstruction.

Acceptance: the comparison action remains disabled through validation and for a blocked document; replacing that document allows recovery without replacing its valid partner. Limit breaches are rejected explicitly. Material extraction problems never lead to a silently partial comparison.

### Truthful Processing and Retry

Source: `scope.md > The Core Loop` and `The POC Boundary`.

Stages: “Validating and extracting document text,” “Comparing requirements,” “Checking source evidence,” and “Preparing findings.” Only mark work complete when it actually finishes. Initial upload checks and pre-comparison extraction validation remain mandatory; stage presentation must not imply unchecked content was eligible for comparison. Exact correspondence between upload checks and comparison stages belongs in the technical spec.

No fabricated percentages or simulated progress. A failure names its stage, explains the problem, retains documents where possible, and offers retry. A retry is a distinct attempt: clearly distinguish its results from previous incomplete results and never silently merge findings across attempts.

Acceptance: duplicate requests are prevented; completed stage indicators reflect actual completed work; a failed attempt is an explicit failure, not a zero-findings result.

### Session-Only Workspace and Attempt Isolation

Source: `scope.md > The Core Loop`, `The POC Boundary`, and `Later`.

Preserve documents and workspace state only while the current page remains open. No accounts, comparison history, persistent document storage, or cross-session recovery. Keep Retry Comparison, Replace Document, and New Comparison clearly distinguishable. Use confirmation only when necessary to prevent accidental loss of meaningful work; avoid unnecessary dialogs. Actions remain keyboard accessible and mobile friendly.

- **Retry Comparison:** preserve both valid uploaded documents; begin a new attempt; clear the previous selected finding and Source Context Viewer state. Show processing, never merge attempts or present previous results as belonging to the new attempt. If retry fails, show an explicit error and preserve valid uploads for another attempt.
- **Replace Document:** preserve the other valid upload; clear all prior results, summary counts, comparison warnings, selected finding, and open source context. Validate the replacement from the beginning. Require an explicit Compare Documents click after both pass; do not automatically compare.
- **New Comparison:** from results, clear both uploads and extracted text, all analysis results, warnings, errors, selected findings, and source-viewer state. Return to initial upload; do not restore previous comparisons.
- **Refresh or close/reopen:** start fresh without restoring documents, extracted text, results, or selection. Do not recover sessions through localStorage, sessionStorage, IndexedDB, or persistent backend storage. Explain this with a brief, unobtrusive notice.
- **Pending analysis:** prevent duplicates. Replacement, reset, or a new attempt invalidates earlier pending work; late responses must never overwrite the current workspace. Exact cancellation/stale-response protection belongs in the technical spec.
- **Source context only:** simply opening or closing the viewer preserves the comparison, selected finding, inspector state, and findings-list position; it is not a reset or retry.

Acceptance: retry retains valid uploads and clears selection/context; failures retain uploads and remain explicit errors. Replacement clears stale comparison state, preserves the valid partner, revalidates, and never auto-runs comparison. New Comparison clears uploads, extracted text, results, and errors. Refresh/close-and-return recover nothing. A response from an obsolete attempt cannot repopulate a reset workspace or overwrite a replacement/new attempt. Closing source context preserves the existing selection and positions. These behaviors are independently checkable; no history or recovery feature is implied.

### Privacy and Data-Handling Statements

Source: `scope.md > The POC Boundary` and `Later`.

Avoid unnecessary retention of document content. If processing occurs server-side, do not intentionally persist uploads, extracted text, or results in a database or durable file storage. Session-only workspace describes the product's recovery behavior; it is not a promise that all processing happens in the browser or that external services retain nothing.

Any privacy statement must accurately describe the eventual processing architecture, including any AI service receiving content. Never claim documents stay in the browser unless all processing actually occurs there. No provider or retention promise is established in this PRD; resolve actual handling and accurate disclosure in the technical spec before build.

Acceptance: the interface explains that comparisons are not saved; no session recovery stores document content. Any processing/privacy description agrees with the implemented content flow and AI-service use. Do not intentionally persist document content or analysis for recovery.

### Classified Findings and Source Traceability

Source: `scope.md > The Unique Kernel`, `The Core Loop`, and `The POC Boundary`.

Analyze actual uploaded contents, not hardcoded demo findings. Classify supported relationships as Added, Removed, or Modified while distinguishing newer replacements from genuine unresolved relationships. A classification remains an AI-assisted analysis, not a verified truth merely because quotations match.

Every displayed quotation must match the corresponding extracted text and link to its source document and a reliable text location. TXT/Markdown use offsets or line references. PDFs use a reliable extracted-text location and page references only when extraction reliably establishes the association. Highlighting must preserve exact quoted content. Source access must allow inspection rather than merely display an untraceable citation; source navigation uses the Source Context Viewer defined below. Missing required source mapping is an evidence-verification failure, even if quotation text can be matched.

- **Added:** verified New passage; “No corresponding Old Version passage was identified.” Do not invent an Old quotation or claim exhaustive proof of absence.
- **Removed:** verified Old passage; “No corresponding New Version passage was identified.” Do not invent a New quotation or claim exhaustive proof of absence.
- **Modified:** verified Old and New passages.

Use “Source passage verified” only for a quotation that passed matching. Explain that matching establishes occurrence in extracted text, not semantic correctness, faithful PDF extraction, completeness, document authenticity, or eligibility.

Acceptance: each displayed quotation can be located in the correct extracted source. Invalid quotations are not exposed as verified evidence. An absent-side notice never becomes a fabricated quotation.

### Source Context Viewer

Source: `scope.md > The Unique Kernel`, `The Core Loop`, and `The POC Boundary`.

“View Source Context” opens an in-app expandable panel or side drawer without navigating away from comparison results. Show the selected uploaded document’s actual extracted text, Old Version or New Version label, original filename, and reliable location (line reference, text offset, or reliably established PDF page reference).

Bring the cited passage into view automatically and highlight its exact mapped location without changing its wording. Show surrounding lines or an appropriate text window before and after it, and allow scrolling through the extracted document text. Preserve extracted wording and ordering; never use AI to regenerate, paraphrase, or reconstruct the source.

For PDFs, explicitly explain that the viewer shows extracted text, not a faithful rendering of the original layout or a guarantee of complete extraction. Display page references only when reliably mapped to the passage.

Provide “Back to Finding” or a clear close action. Closing restores the selected finding, inspector state, and findings-list position without losing the current comparison. Modified and Needs Review items allow independent Old/New inspection. Added and Removed items offer source navigation only for existing verified passages; never fabricate absent-side text or locations.

Only offer source navigation when a reliable mapping exists. Missing required traceability is an evidence-verification failure: withhold the affected candidate and mark the comparison incomplete under the established rules, rather than presenting an untraceable finding as verified. Do not show misleading clickable references.

Keep the viewer lightweight, keyboard accessible, and usable on mobile. No external PDF viewer, editing, annotations, OCR, accounts, or persistent document storage.

Acceptance: opening either valid source reveals the actual extracted text with its cited occurrence highlighted and surrounding context available; users can scroll further. Closing returns to the same finding, inspector state, and list position. Every source link maps reliably; unmapped required evidence fails verification. PDF limitations remain explicit and unreliable page numbers never appear.

### AI Interpretation and Suggested Action

Source: `scope.md > The Unique Kernel` and `Explicitly Cut`.

Separate AI Interpretation beneath evidence. Explain potential submission impact conditionally and suggest a practical review action, such as checking a video against updated requirements. Do not present interpretations as document-supported facts or make an eligibility/compliance determination. Clearly communicate uncertainty and unauthenticated document provenance.

Acceptance: users can distinguish source evidence, interpretation, and action visually and through labels; no text declares their project eligible, compliant, or disqualified.

### Needs Review — Relationship Unresolved

Source: `scope.md > The Core Loop` and `Review Notes: Unresolved Decisions and Reliability Risks`.

Use this safety state when both source passages are verified but their relationship cannot reliably be established: replacement, unresolved conflict, differing contexts/exceptions, or meaningful change. Do not force Added/Removed/Modified classification or label the relationship a confirmed contradiction.

Display items separately under Needs Review, with a separate count excluded from classified category totals. Selecting one shows both passages and locations, source-match indicators, and: “Relationship not established — both passages were found, but ProofPath could not reliably determine how they relate.”

Possible explanations remain labeled AI Interpretation. Suggested action: review surrounding clauses and confirm which rule applies before deciding. Do not assume New automatically overrides Old. This is a safety state in the existing workflow, not authoritative arbitration.

Acceptance: unresolved items remain inspectable and separate from withheld candidates; zero classified findings with unresolved items never produces a no-changes message; their verified passages remain available for manual review. An attempt can finish with unresolved items, but the UI must not imply all relationships were resolved.

### Partial Results, Never False Completeness

Source: `scope.md > The POC Boundary` and `Review Notes: Unresolved Decisions and Reliability Risks`.

If any candidate's required evidence fails verification, withhold it from normal findings and label the overall comparison **Analysis Incomplete** prominently and persistently: “Analysis incomplete — some candidate findings could not be verified.” Show supported results while explaining that other changes may be missed.

Use the heading **Comparison Overview** with this exact explanation directly below it:

“AI-assisted analysis of the supplied documents. Source passages are checked against extracted text; change classifications and interpretations may still be incorrect.”

Summarize only displayed classified findings and unresolved relationships, explicitly distinguishing three groups:

- **Classified Findings:** show the count assigned Added, Removed, or Modified, with a category breakdown. Required quotations and traceability passed checks, but classification remains an AI-assisted assessment. Never call these verified changes or verified classifications.
- **Needs Review:** separate count for items with checked source passages but unresolved relationships, potentially involving scopes, exceptions, replacements, conflicts, or other ambiguities requiring human judgment. Exclude these from classified category totals.
- **Withheld Candidates:** separate count of candidates failing required source-evidence checks, never established changes. Use “Unknown” when the count is not reliably available. Any withheld candidates require the persistent Analysis Incomplete warning above the counts and findings.

A category zero means no findings were assigned that category, not that no such changes exist. Do not imply every relevant change was detected, even when processing finishes. Omit total requirements assessed from the MVP. Do not use universal confidence percentages, completeness scores, or “100% verified” language. If only Needs Review items exist, explain that no changes were confidently classified and manual review is required; do not imply a numeric confidence score. If all candidates were withheld, show “No findings could be verified” and retain Analysis Incomplete. Preserve the separate identical-text and non-identical/no-supported-changes states. Use restrained, clear, non-alarmist language for a developer reviewing rules.

Added/Removed/Modified counts include only classified findings whose required source checks passed. Needs Review is separate. Withheld candidates have a separate count, or “Unknown” if reliable counting is unavailable; unknown is never zero. Withheld candidates are not confirmed changes. A separate non-authoritative notice explains the number and verification issue without exposing fabricated quotations or unsupported interpretations.

If candidates exist but none pass, show “No findings could be verified,” mark Analysis Incomplete, show withheld count when known, encourage manual source review, and offer retry. Never show “No changes detected.”

No universal confidence score, accuracy percentage, completeness guarantee, or “fully verified” conclusion. Zero withheld candidates does not establish exhaustive detection. An unknown verification outcome cannot imply complete analysis.

Acceptance: summary and totals omit withheld candidates, retain unresolved items separately, and never present a partially verified attempt as complete or successful. Retrying never merges attempts.

## States and Boundaries

Source: `scope.md > What "Working" Looks Like` and `The POC Boundary`.

- **Initial / one file / validating:** Compare disabled; clear per-panel actions/statuses.
- **Invalid or extraction-blocked:** explain the specific problem next to the file; preserve the other valid file; replacement offered.
- **Ready:** both files meet limits and usable-extraction requirements; Compare enabled; residual PDF limitation visible where relevant.
- **Processing:** truthful stages, no duplicate requests, no invented percentages.
- **Classified results:** neutral summary, source-check limitations, category counts and selectable evidence.
- **Unresolved relationships:** Needs Review items remain visible separately. With no classified changes: “No requirement changes were classified. Some verified passages require manual review.”
- **Some withheld:** persistent Analysis Incomplete; supported classified/unresolved items remain inspectable; withheld notice and separate count. The incomplete warning takes precedence over any reassuring empty-state message.
- **None verified:** “No findings could be verified”; incomplete status, withheld count/Unknown, retry and manual-review advice.
- **Identical supplied text:** “The supplied document texts are identical. No textual differences were detected.” No invented findings or universal semantic assurance.
- **Non-identical with no supported requirement changes, no unresolved items, and no withheld candidates:** “No supported requirement changes were identified,” with a limitation notice. This is different from identical text.
- **Extraction or processing failure:** explicit failure, not an empty result; retry or replacement as appropriate.
- **Retry:** fresh attempt with valid uploads retained; prior selection/context cleared; no merged or mislabeled previous findings.
- **Replacement:** clear prior comparison; retain valid partner; validate replacement and wait for Compare Documents.
- **New Comparison:** fully cleared initial upload workspace.
- **Refresh/close-and-return:** fresh workspace with no restored content or state.
- **Obsolete pending response:** cannot update the current workspace after replacement, reset, or a new attempt.

An identical-requirements test is required even when the broader text differs; exact text identity and absence of supported requirement changes remain distinct outcomes.

## Acceptance and Demonstration

Source: `scope.md > What "Working" Looks Like`.

- Main controlled pair: detect mandatory-video addition, changed deadline, and team size five → three; do not report the unchanged requirement.
- Identical-requirements pair: no invented requirement changes. If whole extracted texts are identical, use the identical-text message; otherwise use the non-identical no-supported-change state when appropriate.
- Controlled removal: detect Removed with exact Old evidence and no invented New quotation.
- Verify every displayed quotation and reliable location against the corresponding extracted source; never conflate quotation verification with semantic truth.
- Check Needs Review separation, mixed supported/withheld results, zero verified findings, and unknown withheld counts where encountered.
- Check supported formats, exceeded limits, PDF extraction failure categories, replacement recovery, retry isolation, and truthful stage reporting.
- Check session notice, retry failure with uploads preserved, replacement without auto-analysis, full New Comparison reset, refresh/close-and-return without recovery, and stale-response exclusion after each invalidating action.
- Check that privacy statements reflect actual processing and AI-service use without unsupported browser-only or retention guarantees.
- Check Source Context Viewer navigation, exact occurrence highlighting, surrounding text, independent Old/New access, missing-mapping failure, and preservation of finding/list/inspector state on close.
- Check responsive layout, keyboard access, visible focus, readable contrast, and reduced-motion behavior.
- The core workflow must complete consistently. A concrete repeatability criterion and technical checks are still to be specified; fixture results do not establish universal accuracy.

## Product Decisions

- One comparison journey with a prominent Evidence Inspector, not a chatbot or marketing site.
- Inspect actual extracted source context in-app without losing comparison state; missing reliable source mapping fails evidence verification.
- Exactly two labeled uploads and one primary action; validation gates comparison.
- Session-Only Workspace: preserve state only on the open page, with distinct retry/replace/reset behavior and no cross-session recovery; obsolete responses cannot overwrite current work.
- Show evidence first; separate AI interpretation, review actions, and uncertainty.
- Use Comparison Overview and its explicit source-check limitation; keep Classified Findings, Needs Review, and Withheld Candidates distinct without implying verified classifications or exhaustive coverage.
- Partial Results, Never False Completeness: withhold unsupported candidates and mark incomplete attempts honestly.
- Verified Evidence, Unresolved Relationship: preserve verified passages without forcing a relationship classification.
- Extraction Integrity Before Comparison: block material problems rather than quietly use partial PDF content.
- Modern Evidence Intelligence: dark-first, restrained, accessible, evidence-centered identity.
- Preserve the approved scope and reliability requirements; reduce PDF scope only through explicit scope revision if feasibility demands it.

## What We're Building

The upload, validation/extraction, truthful processing, results, Evidence Inspector, and lightweight Source Context Viewer surfaces defined above; classified findings, unresolved review items, verified-source locations, cautious interpretations/actions, explicit incomplete/failure/empty states, and the controlled acceptance cases. No additional workflows or document sources.

## Deferred From the POC

OCR; advanced table reconstruction and PDF repair; image, Word, and spreadsheet inputs; more than two documents; multilingual analysis; accounts; cloud storage and collaboration; history; comprehensive reports; live retrieval; blockchain verification. These add ingestion, infrastructure, or unrelated workflow breadth.

## Possible Later Enhancements

Revisit supported formats, historical comparison, exports, and collaboration only after the core evidence workflow is dependable. They carry no acceptance requirements for this proof of concept.

## Non-Goals

Automatic eligibility/compliance/disqualification decisions, authoritative rule arbitration, complex legal interpretation, authenticated document provenance, exhaustive detection claims, universal accuracy/confidence scores, generic chat, decorative complexity, or hardcoded comparison results.

## Open Questions

### Product Questions — Resolve Before PRD Approval

None currently identified. The learner has defined source context, summary wording, and session/reset behavior, and explicitly approved the final PRD. The official 3-prd stage is complete. Start 4-spec only when explicitly invoked.

### Technical Questions — Resolve in 4-spec, Not Here

- Extraction-quality detection approach, thresholds, reliable page association, and conservative handling of suspicious PDFs; acknowledge undetectable defects.
- Precise character-counting convention for the fixed 30,000 limit and size/page enforcement.
- Source matching, normalization, offsets/line mapping, repeated passages, and highlights while preserving exact quotations.
- Real processing-stage signals, request cancellation/stale-response protection, and retry/attempt isolation.
- Actual document-content processing flow, AI-service handling, avoidance of durable storage, and accurate privacy disclosure.
- Accessible focus/return mechanics for mobile selection and source-context interactions; preserve the agreed selection and scroll behavior.
- Feasible handling of comparisons and classification uncertainty within the input limits, without promising exhaustive semantic detection.
- Concrete repeatability checks and coverage across formats, removal, identical requirements, failures, and unresolved relationships.

These technical questions require decisions before spec approval/build, not additional features. No application code or technical stack has been chosen by this PRD.
