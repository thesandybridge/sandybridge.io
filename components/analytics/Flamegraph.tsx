'use client';

import { useMemo, useState } from 'react';
import s from './Flamegraph.module.css';

const GRUVBOX = ['#d79921', '#8ec07c', '#83a598', '#d3869b', '#b8bb26', '#fb4934', '#fe8019'];
const SVG_WIDTH = 800;
const LEVEL_HEIGHT = 32;
const GAP = 2;
const MIN_BAR_WIDTH = 3;

interface PostInfo {
  slug: string;
  title: string;
  tags: string[];
}

interface Bar {
  x: number;
  width: number;
  y: number;
  label: string;
  value: number;
  color: string;
  level: number;
  id: string;
  parentId: string | null;
}

function truncateLabel(text: string, width: number): string {
  const charWidth = 7;
  const maxChars = Math.floor((width - 8) / charWidth);
  if (maxChars < 2) return '';
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1) + '\u2026';
}

export function Flamegraph({
  totals,
  posts,
}: {
  totals: Record<string, number>;
  posts: PostInfo[];
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const bars = useMemo(() => {
    const totalViews = Object.values(totals).reduce((s, v) => s + v, 0);
    if (totalViews === 0) return [];

    // Build tag -> posts mapping
    const tagPosts: Record<string, { slug: string; title: string; views: number }[]> = {};
    for (const post of posts) {
      const views = totals[post.slug] ?? 0;
      if (views === 0) continue;
      const tags = post.tags.length > 0 ? post.tags : ['untagged'];
      for (const tag of tags) {
        if (!tagPosts[tag]) tagPosts[tag] = [];
        tagPosts[tag].push({ slug: post.slug, title: post.title, views });
      }
    }

    // Sort tags by total views
    const sortedTags = Object.entries(tagPosts)
      .map(([tag, items]) => ({
        tag,
        items: items.sort((a, b) => b.views - a.views),
        total: items.reduce((s, p) => s + p.views, 0),
      }))
      .sort((a, b) => b.total - a.total);

    const result: Bar[] = [];

    // Level 0: root
    result.push({
      x: 0,
      width: SVG_WIDTH,
      y: 0,
      label: `All Views (${totalViews.toLocaleString()})`,
      value: totalViews,
      color: '#504945',
      level: 0,
      id: 'root',
      parentId: null,
    });

    // Level 1: tags
    let tagX = 0;
    sortedTags.forEach((tagEntry, i) => {
      const tagWidth = Math.max((tagEntry.total / totalViews) * SVG_WIDTH, MIN_BAR_WIDTH);
      const tagId = `tag:${tagEntry.tag}`;
      result.push({
        x: tagX,
        width: tagWidth,
        y: LEVEL_HEIGHT + GAP,
        label: `${tagEntry.tag} (${tagEntry.total.toLocaleString()})`,
        value: tagEntry.total,
        color: GRUVBOX[i % GRUVBOX.length],
        level: 1,
        id: tagId,
        parentId: 'root',
      });

      // Level 2: posts under this tag
      let postX = tagX;
      tagEntry.items.forEach((post) => {
        const postWidth = Math.max((post.views / tagEntry.total) * tagWidth, MIN_BAR_WIDTH);
        result.push({
          x: postX,
          width: postWidth,
          y: 2 * (LEVEL_HEIGHT + GAP),
          label: `${post.title} (${post.views.toLocaleString()})`,
          value: post.views,
          color: GRUVBOX[i % GRUVBOX.length],
          level: 2,
          id: `post:${tagEntry.tag}:${post.slug}`,
          parentId: tagId,
        });
        postX += postWidth;
      });

      tagX += tagWidth;
    });

    return result;
  }, [totals, posts]);

  if (bars.length === 0) return null;

  // Get ancestors of hovered bar
  const hoveredAncestors = useMemo(() => {
    if (!hoveredId) return new Set<string>();
    const ids = new Set<string>();
    let current = hoveredId;
    const barMap = new Map(bars.map((b) => [b.id, b]));
    while (current) {
      ids.add(current);
      const bar = barMap.get(current);
      if (!bar?.parentId) break;
      current = bar.parentId;
    }
    return ids;
  }, [hoveredId, bars]);

  const svgH = 3 * (LEVEL_HEIGHT + GAP);

  return (
    <div className={s.container}>
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${svgH}`}
        width={SVG_WIDTH}
        style={{ maxWidth: '100%', height: 'auto' }}
        role="img"
        aria-label="Content flamegraph showing tag and post view breakdown"
      >
        {bars.map((bar) => {
          const isHighlighted = !hoveredId || hoveredAncestors.has(bar.id) || bar.id === hoveredId;
          const label = truncateLabel(bar.label, bar.width);

          return (
            <g
              key={bar.id}
              className={s.bar}
              opacity={isHighlighted ? 1 : 0.3}
              onMouseEnter={(e) => {
                setHoveredId(bar.id);
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                  text: bar.label,
                });
              }}
              onMouseLeave={() => {
                setHoveredId(null);
                setTooltip(null);
              }}
              style={{ cursor: 'default' }}
            >
              <rect
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={LEVEL_HEIGHT}
                rx={2}
                fill={bar.color}
              />
              {label && (
                <text
                  x={bar.x + 4}
                  y={bar.y + LEVEL_HEIGHT / 2 + 4}
                  fill="#ebdbb2"
                  fontSize="11"
                  style={{ pointerEvents: 'none' }}
                >
                  {label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

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
