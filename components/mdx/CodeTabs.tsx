'use client';

import { useState, useCallback, type MouseEvent } from 'react';

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
    <div className="code-tabs">
      <div className="code-tabs-header">
        {labels.map((label, i) => (
          <button
            key={label}
            className={`code-tab ${i === active ? 'code-tab-active' : ''}`}
            data-index={i}
            onClick={handleTabClick}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="code-tabs-body">
        {Array.isArray(children) ? children[active] : children}
      </div>
    </div>
  );
}
