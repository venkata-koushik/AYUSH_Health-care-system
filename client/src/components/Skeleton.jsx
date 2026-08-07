// Placeholder shapes shown while a page's data is in flight. They mirror the
// layout of the real content so the page does not jump when it arrives.

export function SkeletonLine({ width = "100%" }) {
  return <span className="skeleton skeleton-line" style={{ width }} />;
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="skeleton-card">
      <SkeletonLine width="42%" />
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLine
          key={index}
          width={index === lines - 1 ? "65%" : "100%"}
        />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3, lines = 3, label = "Loading" }) {
  return (
    <div className="skeleton-list" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} lines={lines} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="skeleton-list" role="status" aria-live="polite">
      <span className="sr-only">Loading</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div className="skeleton-row" key={index}>
          <SkeletonLine width="12%" />
          <SkeletonLine width="46%" />
          <SkeletonLine width="22%" />
        </div>
      ))}
    </div>
  );
}

export default SkeletonList;
