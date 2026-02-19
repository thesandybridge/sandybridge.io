'use client';

import { useState, useCallback } from 'react';
import { Info, X, Cpu, Sparkles } from 'lucide-react';

export function AsciiInfo() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <div className="ascii-info-wrapper">
      <button
        className="ascii-info-trigger"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close info" : "What is Sandy Bridge?"}
      >
        {isOpen ? <X size={14} /> : <Info size={14} />}
        <span>{isOpen ? 'Close' : 'What is Sandy Bridge?'}</span>
      </button>

      {isOpen && (
        <div className="ascii-info-panel">
          <div className="ascii-info-item">
            <Cpu size={20} className="ascii-info-icon" />
            <div>
              <h4>The CPU</h4>
              <p>
                Sandy Bridge was Intel's groundbreaking CPU microarchitecture released in 2011.
                It introduced the ring bus architecture and integrated graphics, becoming one of
                the most celebrated processor generations.
              </p>
            </div>
          </div>

          <div className="ascii-info-item">
            <Sparkles size={20} className="ascii-info-icon" />
            <div>
              <h4>The Name</h4>
              <p>
                When the Sandy Bridge CPU dropped in 2011, I needed a new online handle. The name
                stuck. It's been my identity across games, Discord, GitHub, and everywhere else
                online ever since.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
