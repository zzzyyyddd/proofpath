'use client';

import { useRef, useState } from 'react';
import { consumeComparisonStream, STAGES } from '@/lib/client/requests';
import { comparisonResultSchema, documentResponseSchema, OVERVIEW_EXPLANATION, RESULT_MESSAGES,
  type ComparisonResult, type DocumentLabel, type Evidence, type ExtractedDocument, type VisibleFinding } from '@/lib/shared/contracts';

type Upload = { file: File | null; document: ExtractedDocument | null; validating: boolean; error: string | null };
const blankUpload = (): Upload => ({ file: null, document: null, validating: false, error: null });
const label = (id: DocumentLabel) => id === 'old' ? 'Old Version' : 'New Version';
const kindLabel = (kind: string) => ({ added: 'Added', removed: 'Removed', modified: 'Modified', needs_review: 'Needs Review' })[kind] ?? kind;

function serverMessage(data: unknown): string {
  if (data && typeof data === 'object' && 'error' in data && data.error && typeof data.error === 'object' && 'message' in data.error && typeof data.error.message === 'string') return data.error.message;
  return 'The request could not be completed. Try again or replace the document.';
}

function UploadPanel({ id, upload, onFile }: { id: DocumentLabel; upload: Upload; onFile: (id: DocumentLabel, file: File | undefined) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return <section className={`upload-panel ${upload.error ? 'invalid-panel' : ''}`} aria-label={label(id)}>
    <div className="panel-label"><span className="step-number">{id === 'old' ? '01' : '02'}</span><h3>{label(id)}</h3>{upload.document && <span className="status-valid">Ready</span>}</div>
    <div className="dropzone" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); onFile(id, event.dataTransfer.files.length === 1 ? event.dataTransfer.files[0] : undefined); }}>
      <span className="file-icon" aria-hidden="true">{upload.file ? '▤' : '↥'}</span>
      <strong className="file-name">{upload.file?.name ?? 'Drop a document here'}</strong>
      <span className="muted">{upload.validating ? 'Validating and extracting…' : upload.document ? `${upload.document.codePointCount.toLocaleString()} extracted characters` : 'or choose a file from your device'}</span>
      <input ref={input} type="file" accept=".txt,.md,.pdf" aria-label={`Choose ${label(id)} document`} onChange={event => { onFile(id, event.target.files?.[0]); event.target.value = ''; }} className="file-input" />
      <button className="secondary-button" onClick={() => input.current?.click()}>{upload.file ? 'Replace Document' : 'Browse Files'}</button>
    </div>
    {upload.error && <p className="inline-error" role="alert">{upload.error}</p>}
    {upload.document?.limitations.map(note => <p className="inline-limitation" key={note}>{note}</p>)}
  </section>;
}

function location(evidence: Evidence) {
  return `${evidence.page ? `Page ${evidence.page} · ` : ''}Line${evidence.startLine !== evidence.endLine ? 's' : ''} ${evidence.startLine}${evidence.startLine !== evidence.endLine ? `–${evidence.endLine}` : ''} · offsets ${evidence.start}–${evidence.end}`;
}

function QuoteHighlight({ text, counterpart }: { text: string; counterpart?: string }) {
  if (!counterpart) return <mark>{text}</mark>;
  const left = Array.from(text), right = Array.from(counterpart); let prefix = 0, suffix = 0;
  while (prefix < Math.min(left.length, right.length) && left[prefix] === right[prefix]) prefix++;
  while (suffix < Math.min(left.length, right.length) - prefix && left[left.length - suffix - 1] === right[right.length - suffix - 1]) suffix++;
  return <>{left.slice(0, prefix).join('')}<mark>{left.slice(prefix, left.length - suffix).join('')}</mark>{suffix ? left.slice(-suffix).join('') : ''}</>;
}
function Passage({ document, evidence, counterpart, onContext }: { document: ExtractedDocument; evidence: Evidence | null; counterpart?: string; onContext: (e: Evidence, opener: HTMLButtonElement) => void }) {
  return <section className="passage-panel">
    <div className="passage-label"><strong>{label(document.id)}</strong><span className="file-name muted">{document.filename}</span></div>
    {evidence ? <>
      <p className="location">{location(evidence)}</p>
      <blockquote><QuoteHighlight text={evidence.quote} counterpart={counterpart} /></blockquote>
      <span className="verified-source">✓ Source passage verified</span>
      <button className="text-button" onClick={event => onContext(evidence, event.currentTarget)}>View Source Context <span aria-hidden="true">↗</span></button>
    </> : <p className="absent-side">No corresponding {label(document.id)} passage was identified. This is not exhaustive proof of absence.</p>}
  </section>;
}

export default function ComparisonWorkspace() {
  const [uploads, setUploads] = useState<Record<DocumentLabel, Upload>>({ old: blankUpload(), new: blankUpload() });
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [sample, setSample] = useState<ComparisonResult | null>(null);
  const [sampleSelected, setSampleSelected] = useState<string | null>(null);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [context, setContext] = useState<Evidence | null>(null);
  const generation = useRef(0), revisions = useRef({ old: 0, new: 0 });
  const activeRequest = useRef<AbortController | null>(null);
  const validationRequests = useRef<Partial<Record<DocumentLabel, AbortController>>>({});
  const inflight = useRef(false), sampleRevision = useRef(0);
  const inspectorHeading = useRef<HTMLHeadingElement>(null), contextMark = useRef<HTMLElement>(null);
  const contextOpener = useRef<HTMLButtonElement | null>(null);

  function clearComparison() {
    generation.current++; activeRequest.current?.abort(); inflight.current = false;
    setBusy(false); setStage(null); setCompletedStages([]); setResult(null); setSelected(null); setContext(null); setError(null);
    sampleRevision.current++; setSample(null); setSampleLoading(false);
  }
  async function selectFile(id: DocumentLabel, file: File | undefined) {
    clearComparison(); validationRequests.current[id]?.abort();
    const revision = ++revisions.current[id];
    if (!file || file.size > 2_000_000 || !/\.(txt|md|pdf)$/i.test(file.name)) {
      setUploads(previous => ({ ...previous, [id]: { ...blankUpload(), error: !file ? 'Choose or drop exactly one file.' : 'Choose TXT, Markdown, or PDF at most 2 MB.' } })); return;
    }
    setUploads(previous => ({ ...previous, [id]: { file, document: null, validating: true, error: null } }));
    const controller = new AbortController(); validationRequests.current[id] = controller;
    try {
      const form = new FormData(); form.append('file', file); form.append('label', id); form.append('uploadRevision', String(revision));
      const response = await fetch('/api/documents/validate', { method: 'POST', body: form, signal: AbortSignal.any([controller.signal, AbortSignal.timeout(35_000)]) });
      const body: unknown = await response.json();
      if (!response.ok) throw new Error(serverMessage(body));
      const { document } = documentResponseSchema.parse(body);
      if (revisions.current[id] === revision) setUploads(previous => ({ ...previous, [id]: { file, document, validating: false, error: null } }));
    } catch (failure) {
      if (revisions.current[id] === revision && !controller.signal.aborted) setUploads(previous => ({ ...previous, [id]: { file, document: null, validating: false, error: failure instanceof Error ? failure.message : 'Document validation failed.' } }));
    }
  }
  async function compare() {
    if (inflight.current || !uploads.old.document || !uploads.new.document || !uploads.old.file || !uploads.new.file) return;
    clearComparison(); const current = generation.current; inflight.current = true; setBusy(true);
    const controller = new AbortController(); activeRequest.current = controller;
    const attemptId = crypto.randomUUID();
    try {
      const form = new FormData(); form.append('old', uploads.old.file); form.append('new', uploads.new.file); form.append('attemptId', attemptId);
      const response = await fetch('/api/compare', { method: 'POST', body: form, signal: AbortSignal.any([controller.signal, AbortSignal.timeout(110_000)]) });
      if (!response.ok) throw new Error(serverMessage(await response.json()));
      const parsed = await consumeComparisonStream(response, attemptId, {
        isCurrent: () => generation.current === current,
        onStage: (name, status) => { setStage(name); if (status === 'done') setCompletedStages(previous => [...previous, name]); },
      });
      if (parsed && generation.current === current) {
        setResult(parsed); setSelected(parsed.classified[0]?.id ?? parsed.needsReview[0]?.id ?? null);
      }
    } catch (failure) {
      if (generation.current === current && !controller.signal.aborted) { setResult(null); setSelected(null); setError(failure instanceof Error ? failure.message : 'Comparison failed.'); }
    } finally { if (generation.current === current) { inflight.current = false; setBusy(false); } }
  }
  function reset() {
    clearComparison(); revisions.current.old++; revisions.current.new++;
    validationRequests.current.old?.abort(); validationRequests.current.new?.abort();
    setUploads({ old: blankUpload(), new: blankUpload() });
  }
  async function openSample() {
    if (busy || sampleLoading) return;
    const revision = ++sampleRevision.current; setSampleLoading(true);
    try {
      const response = await fetch('/samples/analysis.json'); if (!response.ok) throw new Error('The static sample is unavailable.');
      const parsed = comparisonResultSchema.parse(await response.json());
      if (sampleRevision.current !== revision) return;
      setSample(parsed); setSampleSelected(parsed.classified[0]?.id ?? null); setContext(null);
    } catch { if (sampleRevision.current === revision) setError('The static sample could not be loaded. No live analysis was substituted.'); }
    finally { if (sampleRevision.current === revision) setSampleLoading(false); }
  }
  function selectFinding(id: string) {
    if (sample) setSampleSelected(id); else setSelected(id);
    setContext(null);
    if (window.matchMedia('(max-width: 800px)').matches) setTimeout(() => { inspectorHeading.current?.scrollIntoView({ block: 'start' }); inspectorHeading.current?.focus({ preventScroll: true }); }, 0);
  }
  function openContext(evidence: Evidence, opener: HTMLButtonElement) {
    contextOpener.current = opener; setContext(evidence);
    setTimeout(() => { contextMark.current?.scrollIntoView({ block: 'center' }); contextMark.current?.focus({ preventScroll: true }); }, 0);
  }
  function closeContext() { setContext(null); setTimeout(() => contextOpener.current?.focus({ preventScroll: true }), 0); }
  const visible = sample ?? result;
  const finding = visible ? [...visible.classified, ...visible.needsReview].find(item => item.id === (sample ? sampleSelected : selected)) : null;
  const contextDocument = visible && context ? visible.documents[context.documentId] : null;
  function renderFinding(item: VisibleFinding) {
    return <button key={item.id} className={`finding-card ${finding?.id === item.id ? 'is-selected' : ''}`} aria-pressed={finding?.id === item.id} onClick={() => selectFinding(item.id)}>
      <span className={`kind-label ${item.kind}`}>{kindLabel(item.kind)}</span><strong>{item.title}</strong><span>{item.changeDescription}</span>
    </button>;
  }
  return <>
    <section className={`hero ${visible ? 'compact-hero' : ''}`}><span className="eyebrow">Document comparison, with receipts</span><h1>Know what changed.<br /><span>See the proof.</span></h1><p>Compare two versions of a document, understand meaningful changes, and inspect the evidence behind every finding.</p></section>
    {!sample && <section className="upload-workspace" aria-label="Comparison workspace">
      <div className="section-heading"><h2>Your documents</h2>{result && <button className="text-button" onClick={reset}>New Comparison ↗</button>}</div>
      <div className="upload-grid"><UploadPanel id="old" upload={uploads.old} onFile={selectFile} /><UploadPanel id="new" upload={uploads.new} onFile={selectFile} /></div>
      <p className="limits">TXT, Markdown, text-based PDF · 2 MB and 30,000 extracted characters per file · Up to 10 PDF pages · English supported</p>
      <div className="action-row"><button className="primary-button" disabled={busy || !uploads.old.document || !uploads.new.document} onClick={compare}>{busy ? 'Comparing Documents…' : result || error ? 'Retry Comparison' : 'Compare Documents'} <span aria-hidden="true">→</span></button><button className="secondary-button" disabled={busy || sampleLoading} onClick={openSample}>{sampleLoading ? 'Loading sample…' : 'Explore Sample Analysis'}</button></div>
      {busy && <section className="processing-panel" role="status" aria-live="polite"><strong>Working with your actual documents</strong><ol>{STAGES.map(name => <li key={name} className={completedStages.includes(name) ? 'stage-done' : stage === name ? 'stage-active' : ''}><span aria-hidden="true">{completedStages.includes(name) ? '✓' : stage === name ? '●' : '○'}</span> {name}</li>)}</ol><p className="muted">Stages complete only when their work finishes. Processing may take a little time.</p></section>}
      {error && <div className="error-panel" role="alert"><h3>Analysis unavailable</h3><p>{error}</p><p>Valid uploads are retained. Review your documents manually or explicitly explore the labeled static sample.</p></div>}
      <p className="privacy-note">Documents are processed transiently on our server. Extracted content may be sent to Cloudflare Workers AI. ProofPath does not save comparisons; refreshing or closing clears your workspace. Source labels do not authenticate official rules.</p>
    </section>}
    {sample && <div className="sample-banner"><div><strong>Static sample — controlled fixtures. Not a live AI result.</strong><p>Curated demonstration data. No inference request was made to open this sample.</p></div><button className="secondary-button" onClick={() => { setSample(null); setContext(null); }}>Back to Live Workspace</button></div>}
    {visible && <section className="results-workspace" aria-label={sample ? 'Static sample analysis' : 'Comparison results'}>
      <header className="overview"><span className="eyebrow">{sample ? 'Static sample' : 'Your comparison'}</span><h2>Comparison Overview</h2><p>{OVERVIEW_EXPLANATION}</p>
        <div className="document-pair"><span>Old: {visible.documents.old.filename}</span><span aria-hidden="true">→</span><span>New: {visible.documents.new.filename}</span></div>
        {visible.incomplete && <div className="warning-panel" role="status"><strong>Analysis Incomplete</strong>{visible.incompleteReasons.map(reason => <p key={reason}>{reason}</p>)}</div>}
        <div className="counts"><div><strong>{visible.classified.length}</strong><span>Classified Findings</span><small>{visible.counts.added} Added · {visible.counts.removed} Removed · {visible.counts.modified} Modified</small></div><div><strong>{visible.needsReview.length}</strong><span>Needs Review</span><small>Source passages matched; relationship unresolved</small></div><div><strong>{visible.withheldCount ?? 'Unknown'}</strong><span>Withheld Candidates</span><small>Not established changes</small></div></div>
        <p className="muted overview-limit">Category counts are assignments, not proof that other changes are absent. Results may not include every relevant change.</p>
        {visible.incomplete && <p className="muted">Withheld candidates are not shown as findings. Their required source evidence could not be checked, or analysis coverage is unknown.</p>}
        <p className="result-state">{RESULT_MESSAGES[visible.state]}</p>
        {[...new Set([...visible.documents.old.limitations, ...visible.documents.new.limitations])].map(note => <p key={note} className="inline-limitation">{note}</p>)}
      </header>
      <div className="results-grid"><aside className="findings-panel"><div className="section-heading"><h2>Findings</h2><span className="muted">Select to inspect</span></div>{visible.classified.length ? visible.classified.map(renderFinding) : <p className="muted">No classified findings to display.</p>}{visible.needsReview.length > 0 && <section className="needs-review-section"><h3>Needs Review</h3><p className="muted">Possible scope, exception, replacement or conflict ambiguities require human judgment.</p>{visible.needsReview.map(renderFinding)}</section>}</aside>
        <section className="inspector"><div className="section-heading"><h2 ref={inspectorHeading} tabIndex={-1}>Evidence Inspector</h2><span className="eyebrow">{sample ? 'Static sample evidence' : 'Inspect the source'}</span></div>
          {finding ? <><span className={`kind-label ${finding.kind}`}>{kindLabel(finding.kind)}</span><h3 className="finding-title">{finding.title}</h3><p>{finding.changeDescription}</p>{finding.kind === 'needs_review' && <div className="warning-panel"><strong>Relationship not established</strong><p>Both passages were found, but ProofPath could not reliably determine how they relate.</p></div>}
            <div className="evidence-grid"><Passage document={visible.documents.old} evidence={finding.oldEvidence} counterpart={finding.kind === 'modified' ? finding.newEvidence?.quote : undefined} onContext={openContext} /><Passage document={visible.documents.new} evidence={finding.newEvidence} counterpart={finding.kind === 'modified' ? finding.oldEvidence?.quote : undefined} onContext={openContext} /></div>
            <p className="evidence-disclaimer">Source matching verifies occurrence in extracted text, not classification, interpretation, authenticity, or complete PDF extraction.</p>
            {context && contextDocument && <section className="source-context" aria-label="Source Context Viewer"><div className="section-heading"><h3>Source Context Viewer</h3><button className="text-button" onClick={closeContext}>Back to Finding ×</button></div>{sample && <p className="sample-label">Static sample — not live analysis</p>}<p className="file-name">{label(context.documentId)} · {contextDocument.filename}</p><p className="location">{location(context)}</p>{contextDocument.format === 'pdf' && <p className="inline-limitation">This is extracted text, not the original PDF layout or proof of complete extraction.</p>}<div className="source-scroll" tabIndex={0}><pre>{contextDocument.canonicalText.slice(0, context.start)}<mark ref={contextMark} tabIndex={-1}>{contextDocument.canonicalText.slice(context.start, context.end)}</mark>{contextDocument.canonicalText.slice(context.end)}</pre></div></section>}
            <section className="interpretation"><span className="eyebrow">AI Interpretation</span><p>{finding.interpretation || 'No impact interpretation was provided.'}</p><h3>Suggested Action</h3><p>{finding.suggestedAction || 'Review the source clauses and confirm which rule applies.'}</p><p className="inline-limitation">{finding.uncertainty} ProofPath does not determine eligibility, compliance, or official document authenticity.</p></section>
          </> : <div className="empty-inspector"><span aria-hidden="true">⌕</span><h3>No evidence selected</h3><p>Select a classified finding or Needs Review item to inspect its source passages. Withheld candidates do not appear here.</p></div>}
        </section></div>
    </section>}
  </>;
}
