# ProofPath — submission readiness

Audit date: 2026-10-23. Decision: **CONDITIONAL GO for a truthful, bounded proof-of-concept submission; not ready to claim the full planned AI comparison journey works reliably.** No eligibility or prize guarantee. No inference, public AI activation, deployment, billing change or scope change in this audit.

**Highest-value next action:** record and publish a roughly 2-minute screen demo of the working upload → identical-text result and labeled sample → evidence/context flows. Use historical AI evidence only with its provenance visible. Do not postpone the required video for more model experiments.

Deadline: **October 26, 2026, 5 PM EDT = October 27, 2026, 04:00 WIB (Jakarta)**. Aim to submit by October 26, 2026, 20:00 WIB, leaving eight hours for upload/form problems. Keep judging access available through October 30, 5 PM EDT / October 31, 04:00 WIB.

## Sources and interpretation

- [Official overview and submission summary](https://learn-ai-basics.devpost.com/): new project, Skill Pack, planning files, video and repository.
- [Official rules](https://learn-ai-basics.devpost.com/rules), especially sections 3–6 and 11: eligibility, working functionality, materials, access and judging. Rules prevail over conflicting event copy. The rules add Potential Impact to the overview's three judging criteria.
- [Official resources](https://learn-ai-basics.devpost.com/resources) and [Skill Pack sequence](https://github.com/challengepost/learn-ai-basics): required development workflow and its artifacts.
- [Official 6-ship instructions](https://github.com/challengepost/learn-ai-basics/blob/main/skills/6-ship/SKILL.md): learner-written submission/exit survey and workflow completion. This audit is not a declaration that 6-ship is complete.

Public live inference is **not explicitly required** in these sources. AI-assisted development with the required skills is required; running a model in the shipped product is not separately stipulated. Public hosting is optional. However, functionality must agree with the video and description, and at least one function must work end to end. My assessment: real upload/extraction → identical-text comparison is a defensible working function. It does not establish that the planned AI change-analysis kernel works. The organizer retains eligibility discretion.

## Mandatory requirement checklist

PASS means inspected evidence; PENDING means not verified/completed; AT RISK means evidence or behavior falls short of the promised journey. Personal attestations stay with the entrant.

| Requirement | Status | Evidence / next step |
| --- | --- | --- |
| Register and complete all required Devpost fields before cutoff | PENDING | Account/submission form not inspected; learner must check registration, required fields and submitted confirmation. |
| Age/age-of-majority, allowed residence, no prohibited affiliation/conflict; authorized representative if needed | PENDING | Entrant attests privately. Do not infer age/residence from timezone or profile. Overview says 18+; rules require local age of majority. |
| Newly created during submission window; empty-folder start and disclosure of incorporated prior work | PARTIAL PASS | Local initial commit Oct 22, 2026 contains planning/skills; application follows in later commits. Public repo created Oct 23. These dates support freshness, not independent proof of an empty folder. Learner confirms origin. Frameworks, libraries and Skill Pack are incorporated pre-existing tooling and should be disclosed. |
| Build using Devpost Learn Skill Pack | PASS evidence / workflow incomplete | Public skills-lock.json identifies challengepost/learn-ai-basics; skill files, substantive approved plans, checklist revisions and implementation history support actual use. Installation alone would not prove use. Remaining build review/wrap-up recorded below. |
| Include scope.md, prd.md, spec.md in public repository | PASS | All three exist under devpost/, have status approved, describe ProofPath specifically, and public bytes match local files. No requirement found that they must be at repository root. |
| Working project with at least one end-to-end function; behaves as depicted/described | AT RISK / bounded function supported | User-verified production uploads and identical-text path; prior local production smoke evidence. Sample inspection works but curated findings do not prove uploaded-document AI comparison. Do not describe full live comparison as available or reliability-tested. |
| Public GitHub/GitLab/Bitbucket URL with source, assets and functional instructions | PASS with documentation gap | Anonymous GitHub API/raw reads succeed; main 000acaf8cd4146439220a04be7219e55ce3678d2. Source/assets, lockfile, README and secret-free .env.example present. README's stale no-public-URL claim corrected locally; not yet published. |
| Text description explaining implemented functionality | PENDING | Learner writes it; include audience/problem, tested behavior and disabled-AI limitation. Do not present this audit or an AI-written script as their submission prose. |
| Demo video and submission link | PENDING — immediate blocker | No video/link artifact found. Overview specifies 1–3 minutes; rules recommend under 3 and require YouTube/Vimeo publicly visible. Target 2:00–2:30 and test playback signed out. No inference reenactment. |
| Video rights; project ownership, permission for third-party tools/code/data, license compliance | PENDING / notice repair prepared | Use self-authored synthetic rules, no soundtrack/unlicensed logos. Public tree lacks license files despite copied Skill Pack files. Added upstream MIT copyright/permission notice locally in THIRD_PARTY_NOTICES.md; public publication still pending. Entrant confirms rights and platform permissions. |
| Free, unrestricted judging/testing access through judging end | PENDING continuing obligation | Public home and sample anonymously HTTP 200 now; user reports Vercel Hobby and upload/PDF/identical checks. Keep source/video/demo available. AI comparison remains restricted: disclose this and ensure the described working function is accessible without keys. If claiming general AI comparison, current access does not substantiate that claim. |
| English materials or English translations | PARTIAL PASS | Public app, plans and README English; final video/form still to verify. |
| Complete required workflow/form exit survey yourself | PENDING | Official Skill Pack includes learner-written exit-survey answers. Exact signed-in form prompts are unverified; complete every field it actually requires. No invented survey answers. |

### Recommendations, not verified hard submission gates

- Rules say the public repository **should** have a detectable open-source license. Public GitHub reports license null. Recommend choosing a license for original code; do not treat missing root LICENSE as an automatic disqualification, and do not assign licensing rights without the owner's choice.
- Under-three-minute working footage is the rules' recommendation; overview's 1–3-minute requirement is safely met with 2:00–2:30. Public YouTube/Vimeo hosting and the link are explicit requirements.
- Deployment, Discord/office hours, peer reviews, extra features, broad automated coverage and public inference are not listed mandatory deliverables. Do not spend the remaining time on them.
- App map/final review are Skill Pack workflow tasks, not separately named event pass/fail artifacts. They remain real unfinished work; do not tick boxes without doing them.

## Skill workflow evidence and remaining gaps

scope.md, prd.md, spec.md and checklist.md are approved. Initial planning preceded application code in Git history. The ignored learner profile exists locally and is not in the public tree. The public tree excludes .env.local. Existing records document manual sample/Inspector and identical-upload feedback, fixes, bounded model probes, failures and 79 deterministic checks.

All five slice boxes, hands-on checkpoint boxes, Final Review, and Code Tour/App Map remain unchecked. devpost/app-map.html is absent. Some records are stale relative to the user's new production verification, but the live semantic/context gates genuinely remain unmet. Do not convert the whole checklist into PASS or alter approved scope to hide this. Record the new production evidence separately; close only actual completed checks and perform a short learner review/wrap-up before claiming the whole workflow finished. Standard 6-ship instructions route unfinished reviews back to 5-build; this requested audit does not bypass or certify that handoff.

## Actual Qwen evidence: strongest truthful use

Existing artifacts are **learner-reported historical probe records**, not saved raw provider responses or existing video captures. scripts/evaluate-model.ts prints diagnostics/counts, not the complete generated candidate response. No saved report JSON, full generated finding capture or inference video was found in project artifacts. Do not fabricate missing titles, quotes, interpretation or action; fixture expectations and sample JSON are not captured model output.

| Historical observation | Recorded evidence | Honest demonstration value |
| --- | --- | --- |
| Main sample-file probe | HTTP 200; one request; schema, source verification and controlled oracle PASS; 1 Added + 2 Modified | Closest historical success to the planned multi-change kernel. Use original retained terminal output/screen capture if available, labeled historical and earlier prompt. Current sample is not this response. |
| Optional → required, checkpoint f7e1197 | HTTP 200; one request; 5,439 ms; 1,233 bytes; all checks PASS; one Modified | Clearest small successful semantic example. Show original report if retained. Known fixture text is input/expected evidence, not a reconstructed raw response. |
| Removal retest, checkpoint 420b5ef | HTTP 200; one fetch; 5,270 ms; one Removed; checks PASS | Narrow success; retain earlier 60,006 ms timeout as a separate failed/inconclusive attempt. |
| Equivalent requirements, before/after prompt mitigation | Two genuine semantic failures despite schema/source checks; first false Added+Removed, later false Removed | Evidence for the safety decision. Latest guard only covers recognized grammar; current model reliability is not established by older passes. |

**Recording choice under the current zero-call instruction:** spend at most 10 minutes locating an already retained, nonsecret terminal report or screenshot from the successful main or optional probe. Crop away prompts/account details. A new screen recording of an existing report is historical evidence, not a new inference execution. If only the checked-in prose record remains, show it briefly as a documented historical result, state its weaker provenance, and mark direct inference footage unavailable. Source code can establish integration implementation, not successful execution. No new run is authorized or necessary to complete the bounded demo.

Never execute eval:live/evaluate-model.ts during recording, enable local/public AI, print .env.local, manufacture console output, replay synthetic candidates under a live label, or splice sample inspection after an upload as though the upload generated it.

## Recommended video sequence — target 2:15

This is a shot plan, not learner narration or submission copy. The learner explains in their own words.

| Time | Visible action | Evidence and boundary |
| --- | --- | --- |
| 0:00–0:15 | Show ProofPath and two short self-authored rules files | Identify the audience and concrete rules-change problem; disclose public AI disabled and curated sample at the outset. |
| 0:15–0:40 | Upload the same TXT into both panels, compare, show identical-text result | Continuous working input → result footage proves the accessible no-inference function. Show validation separately from analysis. PDF support need not consume recording time. |
| 0:40–1:00 | If retained, show original successful main/optional probe report with input fixture and historical checkpoint | Label historical actual-provider evidence; one observed success, earlier prompt, not a current reliability pass. Otherwise show the checked-in historical summary and explicitly avoid claiming captured inference footage. |
| 1:00–1:40 | Explicitly choose Explore Sample Analysis, select a Modified finding, open Old/New Source Context | Keep sample banner visible; inspect exact highlighted passages/locations and distinguish curated interpretation/action from source text. Do not imply prior uploaded files produced these findings. |
| 1:40–2:00 | Return to uploads, replace one with different rules, compare, show unavailable error and retained uploads | Demonstrate honest failure handling; explain source occurrence cannot establish semantic correctness. Briefly identify repeated equivalence failures and bounded Needs Review safeguard. |
| 2:00–2:15 | Show public repository and the three planning document links | Identify Skill Pack process and one real lesson. Close on the bounded demonstrated benefit, not an unproved accuracy or eligibility claim. |

Use readable zoom, stable framing and a clean window. No keys, Cloudflare account screens, raw network headers, account data, copyrighted music or unrelated tabs. No long test output or code tour in the video. If editing removes waiting, make it obvious rather than implying measured speed. Verify final duration/audio and public playback before linking it.

## Judging priorities

The rules specify four equally weighted criteria; Design is the first tie-break criterion, then subsequent criteria in order.

| Criterion | Strongest evidence to emphasize | Current risk |
| --- | --- | --- |
| Design | Evidence Inspector, preserved context/selection, readable Old/New, recoverable errors | Disabled primary AI flow makes the experience incomplete; disclose rather than hide it. |
| Potential Impact | A specific developer checking changed hackathon obligations and locating the source | A curated sample cannot establish useful detection on real changed documents. Narrow benefits to demonstrated inspection and input checks. |
| Innovation/Idea | Exact occurrence/location checks, interpretation separated from evidence, visible uncertainty | Do not claim novelty over every existing product; no comparative research was performed. |
| Presentation | Short continuous functional flow and explicit mode transitions | Upload → sample montage would be misleading. The video is a mandatory artifact and the largest controllable gap. |

## UI / README claim audit

Anonymous public home and bundled sample return HTTP 200. Public sample JSON and README match local files at audit start; public planning bytes match local. Public rendered home distinguishes sample from live analysis and validation from success. Source shows persistent sample labels in banner, Inspector and source viewer, plus explicit disabled-provider error. Existing source-match disclaimer limits its meaning to text occurrence. Browser interactions were not re-automated in this audit; deployed TXT/PDF/identical verification is the user's report.

Residual risks: hero wording and Evidence-first AI branding suggest general comparison; Back to Live Workspace sounds enabled; AI Interpretation in sample mode can be mistaken for a fresh generated result if the banner is cropped. Keep disclosure visible in recording and learner description. No production UI changes requested or made.

README at audit start falsely said no public URL existed and treated all provider/deployed-PDF access as unverified. Corrected locally with the actual links, learner-verification provenance and prior semantic failures. Tests, sample, historical probes and present public functionality remain distinguished. This and THIRD_PARTY_NOTICES.md are unpublished local documentation changes. No push: connected Git pushes may automatically deploy and violate the production-preservation constraint.

## Remaining blockers and exact next action

1. Required public video URL and completed learner-authored form/exit survey are missing from the evidence. Start the 2:15 recording now; first locate historical capture for no longer than 10 minutes.
2. Public copied Skill Pack lacks its upstream MIT notice. Local repair prepared; arrange a user-approved documentation publication path that does not trigger deployment. Owner chooses any original-code license separately.
3. Confirm personal eligibility, empty-folder provenance, third-party permissions and judging access. If uncertain whether bounded functionality meets the project promise, the rules direct entrants to request written clarification before deadline. User can ask organizer; no message sent by this audit. Do not wait to prepare the video/form.
4. Record a real final learner review/wrap-up and the incomplete live gates accurately. Preserve scope; do not claim full kernel acceptance or all skill steps completed.

**Decision trigger:** submit once required video/form/access/rights conditions are met and the description accurately matches bounded working behavior. CONDITIONAL GO is not GO for claiming the full scoped AI kernel. If the organizer explicitly requires an inference capability that cannot be truthfully demonstrated/accessed under these constraints, treat that as NO-GO for the claimed AI functionality, not a reason to mislabel the sample.

## Stop conditions and time budget

Maximum next working block: **90 minutes**, Rp0, zero inference calls.

- 0–10 min: locate existing historical capture; stop searching at the cap.
- 10–40 min: rehearse once and record the continuous functional demo; two takes maximum.
- 40–55 min: trim to 2:00–2:30, add clear mode labels if needed, upload publicly to YouTube/Vimeo and check signed-out playback.
- 55–75 min: learner completes description, learning reflection, exit survey and personal confirmations; close actual review/wrap-up items. Flag uncompleted items honestly.
- 75–90 min: link checks, rights/notice publication decision, form validation, submit and save receipt. Do not silently publish repository updates or trigger redeployment.

Stop any action that would call inference, enable public AI, change the prompt/model/architecture/scope, deploy, require payment, reveal credentials or replace missing historical output with synthetic output. Do not repeat the 79-test suite/build for documentation-only edits; existing verified checks remain evidence, not new results. This audit only needs public read checks, document consistency and git diff --check. After the block, spend remaining time on actual missing submission fields or organizer clarification, not speculative semantic debugging.
