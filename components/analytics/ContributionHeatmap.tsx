'use client';

import { useMemo, useState } from 'react';
import s from './ContributionHeatmap.module.css';

const CELL = 13;
const GAP = 3;
const SIZE = CELL + GAP;
const WEEKS = 52;
const DAYS = 7;
const LABEL_W = 30;
const HEADER_H = 20;

const COLORS = ['#303030', '#504945', '#7c6f64', '#b57614', '#d79921'];
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getColor(count: number, max: number): string {
  if (count === 0 || max === 0) return COLORS[0];
  const ratio = count / max;
  if (ratio <= 0.25) return COLORS[1];
  if (ratio <= 0.5) return COLORS[2];
  if (ratio <= 0.75) return COLORS[3];
  return COLORS[4];
}

export function ContributionHeatmap({ daily }: { daily: Record<string, Record<string, number>> }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const { grid, monthLabels, maxCount } = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Adjust so Monday=0
    const adjusted = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // Start from (WEEKS-1)*7 days ago, aligned to Monday
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - ((WEEKS - 1) * 7 + adjusted));

    const cells: { date: string; count: number; col: number; row: number }[] = [];
    const months: { label: string; col: number }[] = [];
    let lastMonth = -1;
    let max = 0;

    for (let w = 0; w < WEEKS; w++) {
      for (let d = 0; d < DAYS; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + w * 7 + d);
        if (date > today) continue;

        const dateStr = date.toISOString().split('T')[0];
        const dayData = daily[dateStr];
        const count = dayData ? Object.values(dayData).reduce((s, v) => s + v, 0) : 0;
        if (count > max) max = count;

        cells.push({ date: dateStr, count, col: w, row: d });

        if (date.getMonth() !== lastMonth && d === 0) {
          lastMonth = date.getMonth();
          months.push({ label: MONTH_NAMES[lastMonth], col: w });
        }
      }
    }

    return { grid: cells, monthLabels: months, maxCount: max };
  }, [daily]);

  const svgW = LABEL_W + WEEKS * SIZE;
  const svgH = HEADER_H + DAYS * SIZE;

  return (
    <div className={s.container}>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width={svgW}
        style={{ maxWidth: '100%', height: 'auto' }}
        role="img"
        aria-label="Contribution heatmap showing daily view counts"
      >
        {/* Month labels */}
        {monthLabels.map((m, i) => (
          <text
            key={i}
            x={LABEL_W + m.col * SIZE + CELL / 2}
            y={12}
            fill="var(--primary-fg)"
            fontSize="10"
            textAnchor="middle"
          >
            {m.label}
          </text>
        ))}

        {/* Day labels */}
        {DAY_LABELS.map((label, i) => (
          label ? (
            <text
              key={i}
              x={LABEL_W - 6}
              y={HEADER_H + i * SIZE + CELL / 2 + 4}
              fill="var(--primary-fg)"
              fontSize="10"
              textAnchor="end"
            >
              {label}
            </text>
          ) : null
        ))}

        {/* Grid cells */}
        {grid.map((cell) => (
          <rect
            key={cell.date}
            className={s.cell}
            x={LABEL_W + cell.col * SIZE}
            y={HEADER_H + cell.row * SIZE}
            width={CELL}
            height={CELL}
            rx={2}
            fill={getColor(cell.count, maxCount)}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltip({
                x: rect.left + rect.width / 2,
                y: rect.top,
                text: `${cell.date}: ${cell.count} view${cell.count === 1 ? '' : 's'}`,
              });
            }}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </svg>

      {/* Legend */}
      <div className={s.legend}>
        <span style={{ fontSize: '0.75rem', color: 'var(--primary-fg)' }}>Less</span>
        {COLORS.map((c, i) => (
          <span key={i} style={{ display: 'inline-block', width: 12, height: 12, background: c, borderRadius: 2 }} />
        ))}
        <span style={{ fontSize: '0.75rem', color: 'var(--primary-fg)' }}>More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className={s.tooltip}
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y - 30,
            transform: 'translateX(-50%)',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
