'use client';

import { useMemo } from 'react';

const BAR_HEIGHT = 28;
const ROW_HEIGHT = 40;
const TITLE_WIDTH = 200;
const CHART_WIDTH = 350;
const SPARKLINE_WIDTH = 80;
const COUNT_WIDTH = 60;
const TOTAL_WIDTH = TITLE_WIDTH + CHART_WIDTH + SPARKLINE_WIDTH + COUNT_WIDTH;

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '\u2026' : str;
}

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const h = 20;
  const w = SPARKLINE_WIDTH - 8;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`)
    .join(' ');

  return (
    <svg width={SPARKLINE_WIDTH - 8} height={h} viewBox={`0 0 ${w} ${h}`} style={{ marginLeft: 4 }}>
      <polyline
        points={points}
        fill="none"
        stroke="#d79921"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TopPostsChart({
  totals,
  daily,
  titleMap,
}: {
  totals: Record<string, number>;
  daily: Record<string, Record<string, number>>;
  titleMap: Map<string, string>;
}) {
  const rows = useMemo(() => {
    const sorted = Object.entries(totals)
      .filter(([slug]) => titleMap.has(slug))
      .map(([slug, views]) => ({ slug, title: titleMap.get(slug)!, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 15);

    const maxViews = sorted.length > 0 ? sorted[0].views : 1;

    // Build sparkline data: last 30 days
    const now = new Date();
    const dates: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    return sorted.map((row) => ({
      ...row,
      barWidth: (row.views / maxViews) * CHART_WIDTH,
      sparkline: dates.map((date) => daily[date]?.[row.slug] ?? 0),
    }));
  }, [totals, daily, titleMap]);

  if (rows.length === 0) return null;

  const svgH = rows.length * ROW_HEIGHT + 4;

  return (
    <div className="top-posts-chart">
      <svg
        viewBox={`0 0 ${TOTAL_WIDTH} ${svgH}`}
        width={TOTAL_WIDTH}
        style={{ maxWidth: '100%', height: 'auto' }}
        role="img"
        aria-label="Top posts bar chart"
      >
        {rows.map((row, i) => {
          const y = i * ROW_HEIGHT + 2;
          return (
            <g key={row.slug}>
              {/* Title */}
              <text
                x={TITLE_WIDTH - 8}
                y={y + ROW_HEIGHT / 2 + 4}
                fill="var(--primary-fg)"
                fontSize="12"
                textAnchor="end"
              >
                {truncate(row.title, 28)}
              </text>

              {/* Bar */}
              <rect
                x={TITLE_WIDTH}
                y={y + (ROW_HEIGHT - BAR_HEIGHT) / 2}
                width={Math.max(row.barWidth, 2)}
                height={BAR_HEIGHT}
                rx={3}
                fill="#d79921"
                opacity={0.85}
              />

              {/* Sparkline */}
              <g transform={`translate(${TITLE_WIDTH + CHART_WIDTH + 4}, ${y + (ROW_HEIGHT - 20) / 2})`}>
                <Sparkline data={row.sparkline} />
              </g>

              {/* Count */}
              <text
                x={TOTAL_WIDTH - 4}
                y={y + ROW_HEIGHT / 2 + 4}
                fill="var(--primary-fg)"
                fontSize="11"
                textAnchor="end"
                opacity={0.7}
              >
                {row.views.toLocaleString()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
