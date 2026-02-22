'use client';

import { useState, useCallback, type MouseEvent } from 'react';
import { cx } from '@/lib/cx';
import s from './CodeTabs.module.css';

interface CodeTabsProps {
  labels: string[];
  children: React.ReactNode[];
}

export function CodeTabs({ labels, children }: CodeTabsProps) {
  const [active, setActive] = useState(0);

  const handleTabClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const index = Number(e.currentTarget.dataset.index);
    setActive(index);
  }, []);

  return (
    <div className={s.codeTabs}>
      <div className={s.codeTabsHeader}>
        {labels.map((label, i) => (
          <button
            key={label}
            className={cx(s.codeTab, i === active && s.codeTabActive)}
            data-index={i}
            onClick={handleTabClick}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={s.codeTabsBody}>
        {Array.isArray(children) ? children[active] : children}
      </div>
    </div>
  );
}
