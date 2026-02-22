import { cx } from '@/lib/cx';
import s from './Skeleton.module.css';

export function Skeleton({ width, height, className }: { width?: string; height?: string; className?: string }) {
  return (
    <span
      className={cx(s.skeleton, className)}
      style={{ width: width || '100%', height: height || '1em' }}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <span className={cx(s.skeletonText, className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <span key={i} className={s.skeleton} style={{ width: i === lines - 1 ? '70%' : '100%' }} />
      ))}
    </span>
  );
}
