import ComparisonWorkspace from '@/components/comparison-workspace';

export default function HomePage() {
  return (
    <main className="workspace-shell">
      <nav className="topbar" aria-label="Main navigation">
        <a className="brand" href="/" aria-label="ProofPath home"><span className="brand-mark" aria-hidden="true">P</span>ProofPath</a>
        <span className="eyebrow">Evidence-first AI</span>
      </nav>
      <ComparisonWorkspace />
      <footer>Comparisons are not saved. Refreshing or closing clears the workspace.<br />Old and New labels do not establish document authenticity or official authority.</footer>
    </main>
  );
}
