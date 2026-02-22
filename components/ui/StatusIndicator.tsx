'use client';

import s from './StatusIndicator.module.css';

export function StatusIndicator() {
  return (
    <div className={s.statusIndicator}>
      <span className={s.statusDot} />
      <span>Available for work</span>
    </div>
  );
}
