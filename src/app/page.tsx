export default function HomePage() {
  return (
    <main className="workspace-shell">
      <nav className="topbar" aria-label="Main navigation">
        <a className="brand" href="/" aria-label="ProofPath home"><span className="brand-mark" aria-hidden="true">P</span>ProofPath</a>
        <span className="eyebrow">Evidence-first AI</span>
      </nav>
      <section className="hero">
        <span className="eyebrow">Document comparison, with receipts</span>
        <h1>Know what changed.<br /><span>See the proof.</span></h1>
        <p>Compare two versions of a document, understand meaningful changes, and inspect the evidence behind every finding.</p>
      </section>
      <section className="upload-workspace" aria-label="Comparison workspace">
        <div className="section-heading"><h2>Your documents</h2><span className="muted">Two versions. One clear comparison.</span></div>
        <div className="upload-grid">
          {['Old Version', 'New Version'].map((label, index) => (
            <section className="upload-panel" key={label} aria-label={label}>
              <div className="panel-label"><span className="step-number">0{index + 1}</span><h3>{label}</h3></div>
              <div className="dropzone"><span className="file-icon" aria-hidden="true">↥</span><strong>Document upload is being connected</strong><span className="muted">The application foundation is running.</span></div>
            </section>
          ))}
        </div>
        <p className="limits">TXT, Markdown, text-based PDF · 2 MB and 30,000 extracted characters per file · Up to 10 PDF pages · English supported</p>
        <button className="primary-button" disabled>Compare Documents <span aria-hidden="true">→</span></button>
        <div className="notice"><strong>Foundation milestone</strong><p>Live analysis is not enabled. The comparison contracts and evidence checks are under verification; no findings are shown here.</p></div>
      </section>
      <footer>Comparisons are not saved. Refreshing or closing clears the workspace.<br />Old and New labels do not establish document authenticity or official authority.</footer>
    </main>
  );
}
