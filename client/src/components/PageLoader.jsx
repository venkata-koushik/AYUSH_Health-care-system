// Shown while a lazily-loaded route chunk is downloading.
function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="page-loader-ring" aria-hidden="true" />
      <span className="page-loader-text">Loading…</span>
    </div>
  );
}

export default PageLoader;
