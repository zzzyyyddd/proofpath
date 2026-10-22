---
doc: scope
status: approved
---

# ProofPath

An evidence-backed change analysis assistant that helps independent developers compare two versions of hackathon rules and understand what may need review before submission.

## The Unique Kernel

Every finding connects a document-supported change to inspectable, exact source passages, while visibly separating that change from AI interpretation of its potential impact. Programmatic quotation checks establish that quoted text exists in the extracted source; they do not establish that an interpretation is correct or that every change was found.

## Who It's For

An independent developer preparing an international hackathon submission, with an earlier and a newer version of the competition rules. They currently compare long documents manually or use AI summaries that can sound confident despite weak evidence. They need to understand changed requirements and decide what to review in their own submission.

## The Core Loop

Upload two documents labeled Old Version and New Version → compare their actual contents → review a concise summary and Added, Removed, or Modified findings → open a finding to inspect exact, labeled source passages → review the suggested action and uncertainty → decide what to check or change in the submission. Repeat when another rules update arrives.

The comparison distinguishes a newer requirement replacing an older one from an unresolved conflict. It does not judge project eligibility, compliance, or disqualification.

## Inspiration & Identity

A polished, professional, intuitive research tool that makes evidence and uncertainty easy to inspect. Prioritize a coherent end-to-end experience and evidence integrity over feature breadth. No specific visual reference has been selected.

## Why This Matters to the Learner

The learner encounters incomplete, outdated, ambiguous, or contradictory information while researching hackathons and building AI/Web3 applications. They want AI-assisted research to be transparent and useful for real decisions, while practicing the official Devpost scope → PRD → spec workflow from scratch.

## What "Working" Looks Like

In a roughly one-minute demonstration, upload two short controlled rules documents, run a real comparison, inspect categorized findings, then open a finding to verify Old and New source passages and review its suggested action and uncertainty notice. Findings must come from the uploaded content, not predefined results.

The controlled fixtures introduce exactly three known changes: a mandatory demo video is added, the submission deadline changes, and maximum team size decreases from five to three. Include at least one unchanged requirement. Acceptance requires detecting all three changes, no false positives on unchanged requirements, and programmatic source validation of every displayed quotation. The core workflow must complete consistently; this is a fixture-specific acceptance target, not a universal accuracy claim. Additional controlled acceptance cases must (1) compare documents containing identical requirements and report no detected changes, and (2) remove a known requirement and detect it as Removed, quoting the Old source without fabricating a quotation from the New document where it is absent. These supplement the three-change demonstration rather than alter it. Every displayed quotation must link to its source document and a reliable text location: text offsets or line references for TXT/Markdown, and a reliable extracted-text location for PDFs, with page references only when extraction establishes them reliably.

Never present speculative impact as a verified fact or claim eligibility. If extraction, evidence validation, or analysis cannot support a reliable result, surface the failure or incomplete analysis rather than presenting unsupported conclusions.

## The POC Boundary

- Exactly two English-language documents per comparison: Old Version and New Version, at most 2 MB and 30,000 extracted-text characters each. Reject documents exceeding the text limit with a clear explanation; never silently truncate. Old and New are user-assigned labels and establish neither authenticity nor official authority.
- Support plain text (.txt), Markdown (.md), and directly extractable text PDFs (.pdf), with at most 10 pages per PDF. No scanned or image-based documents. Extraction failures must produce clear errors.
- Validate inputs, extract actual text, compare requirements, and show Added, Removed, and Modified findings with exact source evidence, separate AI impact interpretations, suggested review actions, and explicit uncertainty.
- Programmatically validate every displayed quotation against the corresponding extracted text and link it to the source document and a reliable text location. Use text offsets or line references for TXT/Markdown. For PDFs, provide a reliable extracted-text location and include page references only when extraction establishes them reliably. Evidence for additions or removals must not invent a passage on the absent side; detailed evidence rules belong in the PRD.
- Findings with unverifiable quotations must never be presented as verified evidence. The PRD and spec will determine whether such findings are withheld or the comparison is marked incomplete. Handle invalid input, failed extraction, and incomplete analysis clearly. A matching quotation does not establish semantic correctness; PDF extraction may also lose reading order. Resolve these reliability behaviors in PRD and spec.
- Keep one polished upload-to-evidence workflow. If effort becomes excessive, reduce formats or secondary features before evidence integrity; revisit the documented boundary explicitly rather than silently omitting support.

The curriculum targets a small proof of concept in 2–4 hours of active work; the learner is willing to invest additional time in quality. Required shipping artifacts are a short demo video and public GitHub repository; deployment is optional. This scope does not choose a stack or create application code.

## Later

OCR; image, Word, and spreadsheet inputs; more than two documents; multilingual analysis; accounts; cloud storage and collaboration; historical version tracking; comprehensive report exports; live web retrieval; blockchain verification. These increase ingestion, infrastructure, or workflow breadth without being necessary to prove this comparison loop.

## Explicitly Cut

- Automatic eligibility, compliance, or disqualification decisions: ProofPath has not examined the project and cannot provide an official determination.
- Complex legal or regulatory interpretation: beyond the focused hackathon-rules comparison and its evidence model.
- Claims of exhaustive detection or universal accuracy: the controlled test cannot establish them.
- A generic chatbot or multiple parallel product workflows: preserve one complete, inspectable comparison journey.

The developer reviews the evidence, checks their submission against official rules, and makes the final decision.

## Review Notes: Unresolved Decisions and Reliability Risks

These are open planning questions, not additional approved capabilities. Resolve product behavior in `3-prd` and technical choices in `4-spec`, after scope approval.

- **Evidence rules:** Define evidence for additions and removals when no corresponding passage exists on the other side. A missing match alone cannot prove that a requirement is absent. Implement the required source-document links and reliable text locations; decide how extraction-related whitespace or formatting differences are handled without altering their meaning.
- **Change interpretation:** Define how to distinguish replacement, unresolved conflict, and ambiguity. Finding a real quotation does not validate the classification or the AI's interpretation.
- **Input feasibility:** The extracted-text limit is fixed at 30,000 characters per document, with clear rejection and no silent truncation. Define the precise character-counting convention in the technical spec. PDF reading order, tables, and partially scanned pages can undermine an apparently successful extraction. Decide what is rejected or marked incomplete.
- **Failure behavior:** The PRD and spec must decide whether a finding with unverifiable quotations is withheld or the comparison is marked incomplete, and how that outcome is labeled. Unverified evidence must not appear as verified.
- **Validation coverage:** Identical-requirement and controlled-removal tests are now required in addition to the three-change demonstration. Define checks for unresolved conflicts, failed extraction, input limits, traceable locations, all supported formats, and a repeatability criterion before claiming consistent completion; avoid turning fixture success into a broader accuracy claim.
- **Document authority:** Old and New are user-assigned labels, not independently verified publication dates or official provenance. The app compares the supplied documents and does not authenticate rules or fetch current versions.
- **Effort and timing:** Three formats and semantic analysis add risk to the small proof of concept. The one-minute video is a presentation target, not a measured processing-time guarantee. Reduce format support through an explicit scope revision if needed to protect the core workflow.
