export function Skeleton({ width, height, className }: { width?: string; height?: string; className?: string }) {
  return (
    <span
      className={`skeleton ${className || ''}`}
      style={{ width: width || '100%', height: height || '1em' }}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <span className={`skeleton-text ${className || ''}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <span key={i} className="skeleton" style={{ width: i === lines - 1 ? '70%' : '100%' }} />
      ))}
    </span>
  );
}
