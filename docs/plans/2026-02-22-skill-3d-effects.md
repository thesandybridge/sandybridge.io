# Skill 3D Effects Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add per-skill 3D particle effects to the homepage tech stack badges, with a dramatic "wow" payoff for rapid clicking, using the existing R3F background scene.

**Architecture:** A shared context (`SkillEffectContext`) bridges the DOM TechStack badges and the R3F Canvas. Clicking a badge dispatches an event with the skill ID and screen position. Inside the Canvas, a `SkillEffects` component consumes these events, spawning instanced wireframe particles with skill-specific geometry and movement. A 5-click rapid-fire threshold triggers a "wow" mode that adds bloom + chromatic aberration post-processing. Existing background shapes react with a color tint and outward push.

**Tech Stack:** React Three Fiber (existing), `@react-three/postprocessing` (new), `postprocessing` (peer dep)

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install post-processing packages**

Run: `npm install @react-three/postprocessing postprocessing`

**Step 2: Verify installation**

Run: `npm ls @react-three/postprocessing postprocessing`
Expected: Both packages listed without errors

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @react-three/postprocessing for skill effects"
```

---

### Task 2: Create SkillEffectContext

**Files:**
- Create: `lib/skill-effects.ts`

This is the communication bridge between DOM (TechStack) and R3F (Background). Uses a simple pub/sub pattern — no React context needed since the R3F Canvas is in a separate React tree (dynamic import). A module-level event emitter is the simplest approach.

**Step 1: Create the skill effects module**

```ts
// lib/skill-effects.ts

export interface SkillEffectEvent {
  skillId: string
  color: string
  x: number  // normalized 0-1 screen position
  y: number
  isWow: boolean
}

type Listener = (event: SkillEffectEvent) => void

const listeners = new Set<Listener>()

export function onSkillEffect(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emitSkillEffect(event: SkillEffectEvent): void {
  listeners.forEach(fn => fn(event))
}

// Click tracking for wow detection
const clickTimestamps: Record<string, number[]> = {}
let wowCooldownUntil = 0
const WOW_WINDOW = 2000    // 2s window
const WOW_THRESHOLD = 5    // clicks needed
const WOW_COOLDOWN = 3000  // 3s cooldown after wow
const DEBOUNCE_MS = 150    // normal click debounce

let lastClickTime = 0

export function handleSkillClick(skillId: string, color: string, x: number, y: number): void {
  const now = Date.now()

  // Track clicks for wow detection (even during debounce)
  if (!clickTimestamps[skillId]) clickTimestamps[skillId] = []
  clickTimestamps[skillId].push(now)
  clickTimestamps[skillId] = clickTimestamps[skillId].filter(t => now - t < WOW_WINDOW)

  // Check for wow
  if (clickTimestamps[skillId].length >= WOW_THRESHOLD && now > wowCooldownUntil) {
    clickTimestamps[skillId] = []
    wowCooldownUntil = now + WOW_COOLDOWN
    emitSkillEffect({ skillId, color, x, y, isWow: true })
    return
  }

  // Debounce normal clicks
  if (now - lastClickTime < DEBOUNCE_MS) return
  lastClickTime = now

  emitSkillEffect({ skillId, color, x, y, isWow: false })
}
```

**Step 2: Commit**

```bash
git add lib/skill-effects.ts
git commit -m "feat: add skill effect event system with click tracking"
```

---

### Task 3: Wire TechStack badges to emit click events

**Files:**
- Modify: `components/home/TechStack.tsx`
- Modify: `components/home/TechStack.module.css`

**Step 1: Add click handler to TechStack**

Update `TechStack.tsx` to import `handleSkillClick` and add onClick to each badge. The badge should get the skill's screen position from its bounding rect.

```tsx
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { handleSkillClick } from '@/lib/skill-effects';
import s from './TechStack.module.css';

const technologies = [
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'React', color: '#61dafb' },
  { name: 'Next.js', color: '#ffffff' },
  { name: 'Rust', color: '#dea584' },
  { name: 'Go', color: '#00add8' },
  { name: 'Node.js', color: '#68a063' },
  { name: 'PostgreSQL', color: '#336791' },
  { name: 'Redis', color: '#dc382d' },
  { name: 'Docker', color: '#2496ed' },
  { name: 'Neovim', color: '#57a143' },
  { name: 'tmux', color: '#1bb91f' },
  { name: 'Arch Linux', color: '#1793d1' },
];

export function TechStack() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll('.' + s.techItem);
    items.forEach((item, i) => {
      (item as HTMLElement).style.animationDelay = `${i * 0.1}s`;
    });
  }, []);

  const onClick = useCallback((e: React.MouseEvent, tech: typeof technologies[number]) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    handleSkillClick(tech.name, tech.color, x, y);
  }, []);

  return (
    <div className={s.techStack} ref={containerRef}>
      <span className={s.techLabel}>Tech I work with</span>
      <div className={s.techItems}>
        {technologies.map((tech) => (
          <button
            key={tech.name}
            className={s.techItem}
            style={{ '--tech-color': tech.color } as React.CSSProperties}
            onClick={(e) => onClick(e, tech)}
            type="button"
          >
            {tech.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Update CSS for button reset**

Add to `TechStack.module.css` — the `<span>` becomes `<button>`, so we need to reset button styles:

```css
.techItem {
    /* existing styles stay the same */
    /* add: */
    background: none;
    font-family: inherit;
    cursor: pointer;
    user-select: none;
}
```

**Step 3: Verify dev server renders correctly**

Run: `npm run dev`
Check that the tech badges still look the same, clicks don't break anything.

**Step 4: Commit**

```bash
git add components/home/TechStack.tsx components/home/TechStack.module.css
git commit -m "feat: wire tech stack badges to skill effect events"
```

---

### Task 4: Create skill effect configs (geometry + movement definitions)

**Files:**
- Create: `lib/skill-effect-configs.ts`

This file defines per-skill geometry types and movement parameters. The actual Three.js geometry creation and animation functions live here as pure config — the R3F component consumes them.

**Step 1: Create the config file**

```ts
// lib/skill-effect-configs.ts
import {
  BoxGeometry,
  TorusGeometry,
  TetrahedronGeometry,
  IcosahedronGeometry,
  OctahedronGeometry,
  CylinderGeometry,
  PlaneGeometry,
  type BufferGeometry,
} from 'three';

export interface SkillEffectConfig {
  geometry: () => BufferGeometry
  count: { normal: number; wow: number }
  // Movement function: given (elapsed, index, total) returns { x, y, z, rx, ry, rz, scale, opacity }
  movement: (t: number, i: number, total: number, originX: number, originY: number) => {
    x: number; y: number; z: number
    rx: number; ry: number; rz: number
    scale: number; opacity: number
  }
  // Wow movement (convergence phase then explosion)
  wowMovement: (t: number, i: number, total: number, originX: number, originY: number) => {
    x: number; y: number; z: number
    rx: number; ry: number; rz: number
    scale: number; opacity: number
  }
}

// Helper: spread particles outward from origin in a pattern
function radialSpread(t: number, i: number, total: number, ox: number, oy: number, speed: number, spin: number) {
  const angle = (i / total) * Math.PI * 2
  const r = t * speed
  return {
    x: ox + Math.cos(angle + t * spin) * r,
    y: oy + Math.sin(angle + t * spin) * r,
    z: -2 + Math.sin(i + t) * 0.5,
  }
}

// Helper: converge then explode for wow
function convergeExplode(t: number, i: number, total: number, ox: number, oy: number, convergeTime: number) {
  const angle = (i / total) * Math.PI * 2
  if (t < convergeTime) {
    // Converge phase
    const progress = t / convergeTime
    const r = (1 - progress) * 3
    return {
      x: ox + Math.cos(angle) * r,
      y: oy + Math.sin(angle) * r,
      z: -2 + (1 - progress) * -1,
      scale: 0.3 + progress * 0.5,
      opacity: 0.3 + progress * 0.7,
    }
  }
  // Explode phase
  const explodeT = t - convergeTime
  const r = explodeT * 5
  return {
    x: ox + Math.cos(angle + i) * r,
    y: oy + Math.sin(angle + i) * r,
    z: -2 + explodeT * 2,
    scale: Math.max(0.1, 0.8 - explodeT * 0.3),
    opacity: Math.max(0, 1 - explodeT * 0.5),
  }
}

const configs: Record<string, SkillEffectConfig> = {
  TypeScript: {
    geometry: () => new BoxGeometry(0.3, 0.6, 0.15), // crystalline prism
    count: { normal: 8, wow: 40 },
    movement: (t, i, total, ox, oy) => {
      const angle = (i / total) * Math.PI * 2
      const r = t * 1.2
      const refractOffset = Math.sin(t * 3 + i * 0.7) * 0.3
      return {
        x: ox + Math.cos(angle) * r + refractOffset,
        y: oy + Math.sin(angle) * r * 0.7,
        z: -2 + Math.sin(i * 2.1) * 0.8,
        rx: t * 2 + i, ry: t * 1.5, rz: t * 0.8,
        scale: Math.max(0.1, 0.4 - t * 0.1),
        opacity: Math.max(0, 1 - t * 0.4),
      }
    },
    wowMovement: (t, i, total, ox, oy) => {
      const base = convergeExplode(t, i, total, ox, oy, 0.8)
      return { ...base, rx: t * 4 + i, ry: t * 3, rz: t * 2, scale: base.scale ?? 0.4, opacity: base.opacity ?? 1 }
    },
  },
  React: {
    geometry: () => new TorusGeometry(0.2, 0.05, 8, 16), // rings
    count: { normal: 6, wow: 30 },
    movement: (t, i, total, ox, oy) => {
      const orbitR = 0.5 + i * 0.15
      const speed = 2 + i * 0.3
      return {
        x: ox + Math.cos(t * speed + i) * orbitR,
        y: oy + Math.sin(t * speed + i) * orbitR * 0.6,
        z: -2 + Math.cos(t + i * 1.5) * 0.5,
        rx: t * 2, ry: i * 0.5 + t, rz: t * 1.2,
        scale: Math.max(0.1, 0.5 - t * 0.12),
        opacity: Math.max(0, 1 - t * 0.4),
      }
    },
    wowMovement: (t, i, total, ox, oy) => {
      const base = convergeExplode(t, i, total, ox, oy, 1.0)
      return { ...base, rx: t * 6, ry: t * 4 + i, rz: t * 8, scale: base.scale ?? 0.5, opacity: base.opacity ?? 1 }
    },
  },
  'Next.js': {
    geometry: () => new TetrahedronGeometry(0.25), // triangular shards
    count: { normal: 10, wow: 45 },
    movement: (t, i, total, ox, oy) => {
      const angle = (i / total) * Math.PI * 2 + t * 1.5
      const r = 0.2 + t * 0.8
      return {
        x: ox + Math.cos(angle) * r,
        y: oy + Math.sin(angle) * r,
        z: -2 + Math.sin(t * 2 + i) * 0.6,
        rx: t * 3 + i * 0.8, ry: t * 2, rz: -t * 1.5,
        scale: Math.max(0.1, 0.35 - t * 0.08),
        opacity: Math.max(0, 1 - t * 0.4),
      }
    },
    wowMovement: (t, i, total, ox, oy) => {
      const base = convergeExplode(t, i, total, ox, oy, 0.7)
      return { ...base, rx: t * 5 + i, ry: -t * 3, rz: t * 4, scale: base.scale ?? 0.35, opacity: base.opacity ?? 1 }
    },
  },
  Rust: {
    geometry: () => new BoxGeometry(0.4, 0.1, 0.3), // angular fragments
    count: { normal: 10, wow: 50 },
    movement: (t, i, total, ox, oy) => {
      const angle = (i / total) * Math.PI * 2 + (i % 3) * 0.5
      const r = t * 2.0
      return {
        x: ox + Math.cos(angle) * r,
        y: oy + Math.sin(angle) * r * 0.8,
        z: -2 + (Math.random() - 0.5) * t * 0.4,
        rx: t * 4 * (i % 2 ? 1 : -1), ry: t * 2, rz: t * 3,
        scale: Math.max(0.1, 0.5 - t * 0.12),
        opacity: Math.max(0, 1 - t * 0.35),
      }
    },
    wowMovement: (t, i, total, ox, oy) => {
      const base = convergeExplode(t, i, total, ox, oy, 0.6)
      return { ...base, rx: t * 6 * (i % 2 ? 1 : -1), ry: t * 4, rz: t * 5, scale: base.scale ?? 0.5, opacity: base.opacity ?? 1 }
    },
  },
  Go: {
    geometry: () => new IcosahedronGeometry(0.2, 0), // smooth pebbles
    count: { normal: 8, wow: 35 },
    movement: (t, i, total, ox, oy) => {
      const angle = (i / total) * Math.PI * 2
      const drift = Math.sin(t * 0.8 + i * 1.2) * 0.3
      return {
        x: ox + Math.cos(angle) * (0.5 + t * 0.3) + drift,
        y: oy + t * 1.0 + Math.sin(i * 1.5) * 0.2,
        z: -2 + Math.sin(t + i) * 0.4,
        rx: t * 0.5, ry: t * 0.8 + i, rz: t * 0.3,
        scale: Math.max(0.1, 0.4 - t * 0.1),
        opacity: Math.max(0, 1 - t * 0.4),
      }
    },
    wowMovement: (t, i, total, ox, oy) => {
      const base = convergeExplode(t, i, total, ox, oy, 1.2)
      return { ...base, rx: t * 1.5, ry: t * 2 + i, rz: t, scale: base.scale ?? 0.4, opacity: base.opacity ?? 1 }
    },
  },
  'Node.js': {
    geometry: () => new CylinderGeometry(0.02, 0.02, 0.5, 4), // line segments
    count: { normal: 12, wow: 50 },
    movement: (t, i, total, ox, oy) => {
      const branchAngle = (i / total) * Math.PI * 2
      const branchLen = t * 1.5
      const fork = (i % 3) * 0.4
      return {
        x: ox + Math.cos(branchAngle) * (branchLen + fork),
        y: oy + Math.sin(branchAngle) * (branchLen + fork) * 0.7,
        z: -2 + Math.sin(i) * 0.3,
        rx: branchAngle, ry: 0, rz: branchAngle + Math.PI / 4,
        scale: Math.max(0.1, 0.5 - t * 0.1),
        opacity: Math.max(0, 1 - t * 0.35),
      }
    },
    wowMovement: (t, i, total, ox, oy) => {
      const base = convergeExplode(t, i, total, ox, oy, 0.9)
      return { ...base, rx: t * 2 + i, ry: 0, rz: t * 3, scale: base.scale ?? 0.5, opacity: base.opacity ?? 1 }
    },
  },
  PostgreSQL: {
    geometry: () => new CylinderGeometry(0.15, 0.15, 0.4, 6), // hex columns
    count: { normal: 8, wow: 35 },
    movement: (t, i, total, ox, oy) => {
      const col = i % 4
      const row = Math.floor(i / 4)
      const hexOffset = row % 2 ? 0.2 : 0
      return {
        x: ox + (col * 0.4 - 0.6) + hexOffset + t * 0.3,
        y: oy + row * 0.35 - 0.3 + t * 0.5,
        z: -2 + Math.sin(t + i) * 0.3,
        rx: 0, ry: t * 0.5, rz: 0,
        scale: Math.max(0.1, 0.4 - t * 0.1),
        opacity: Math.max(0, 1 - t * 0.4),
      }
    },
    wowMovement: (t, i, total, ox, oy) => {
      const base = convergeExplode(t, i, total, ox, oy, 0.8)
      return { ...base, rx: 0, ry: t * 3, rz: 0, scale: base.scale ?? 0.4, opacity: base.opacity ?? 1 }
    },
  },
  Redis: {
    geometry: () => new OctahedronGeometry(0.2), // diamonds
    count: { normal: 8, wow: 40 },
    movement: (t, i, total, ox, oy) => {
      const wave = Math.floor(i / 4)
      const angle = (i % 4 / 4) * Math.PI * 2
      const r = (wave + 1) * t * 0.8
      return {
        x: ox + Math.cos(angle) * r,
        y: oy + Math.sin(angle) * r * 0.7,
        z: -2 + Math.sin(t * 3 + i) * 0.4,
        rx: t * 2, ry: t * 3 + i, rz: t,
        scale: Math.max(0.1, 0.4 - t * 0.1),
        opacity: Math.max(0, 1 - t * 0.4),
      }
    },
    wowMovement: (t, i, total, ox, oy) => {
      const base = convergeExplode(t, i, total, ox, oy, 0.7)
      return { ...base, rx: t * 4, ry: t * 5 + i, rz: t * 2, scale: base.scale ?? 0.4, opacity: base.opacity ?? 1 }
    },
  },
  Docker: {
    geometry: () => new BoxGeometry(0.25, 0.25, 0.25), // cube clusters
    count: { normal: 9, wow: 40 },
    movement: (t, i, total, ox, oy) => {
      const cluster = Math.floor(i / 3)
      const inCluster = i % 3
      const clusterAngle = (cluster / Math.ceil(total / 3)) * Math.PI * 2
      const r = t * 1.0
      const offset = inCluster * 0.15
      return {
        x: ox + Math.cos(clusterAngle) * r + offset,
        y: oy + Math.sin(clusterAngle) * r * 0.7,
        z: -2 + inCluster * 0.2,
        rx: t * 0.3, ry: t * 0.5, rz: 0,
        scale: Math.max(0.1, 0.35 - t * 0.08),
        opacity: Math.max(0, 1 - t * 0.4),
      }
    },
    wowMovement: (t, i, total, ox, oy) => {
      const base = convergeExplode(t, i, total, ox, oy, 0.9)
      return { ...base, rx: t * 0.5, ry: t, rz: 0, scale: base.scale ?? 0.35, opacity: base.opacity ?? 1 }
    },
  },
  Neovim: {
    geometry: () => new BoxGeometry(0.08, 0.4, 0.02), // thin bars
    count: { normal: 12, wow: 50 },
    movement: (t, i, total, ox, oy) => {
      const col = (i / total) * 3 - 1.5
      const fallDelay = i * 0.08
      const effectiveT = Math.max(0, t - fallDelay)
      return {
        x: ox + col + Math.sin(effectiveT * 2 + i) * 0.1,
        y: oy + 1.5 - effectiveT * 2.0,
        z: -2 + Math.sin(i) * 0.2,
        rx: 0, ry: 0, rz: Math.sin(effectiveT + i) * 0.2,
        scale: Math.max(0.1, 0.4 - effectiveT * 0.1),
        opacity: Math.max(0, 1 - effectiveT * 0.5),
      }
    },
    wowMovement: (t, i, total, ox, oy) => {
      const base = convergeExplode(t, i, total, ox, oy, 0.8)
      return { ...base, rx: 0, ry: 0, rz: t * 2 + i * 0.5, scale: base.scale ?? 0.4, opacity: base.opacity ?? 1 }
    },
  },
  tmux: {
    geometry: () => new PlaneGeometry(0.4, 0.3), // flat panels
    count: { normal: 6, wow: 30 },
    movement: (t, i, total, ox, oy) => {
      const splitDir = i % 2 === 0 ? 1 : -1
      const depth = Math.floor(i / 2)
      const spread = t * 0.8
      return {
        x: ox + splitDir * spread * (depth + 1) * 0.4,
        y: oy + (depth - 1) * t * 0.3,
        z: -2 + depth * -0.3,
        rx: 0, ry: splitDir * t * 0.3, rz: 0,
        scale: Math.max(0.1, 0.5 - t * 0.1),
        opacity: Math.max(0, 0.8 - t * 0.35),
      }
    },
    wowMovement: (t, i, total, ox, oy) => {
      const base = convergeExplode(t, i, total, ox, oy, 1.0)
      return { ...base, rx: 0, ry: t * 2 * (i % 2 ? 1 : -1), rz: 0, scale: base.scale ?? 0.5, opacity: base.opacity ?? 1 }
    },
  },
  'Arch Linux': {
    geometry: () => new TetrahedronGeometry(0.25), // pyramids
    count: { normal: 8, wow: 40 },
    movement: (t, i, total, ox, oy) => {
      const angle = (i / total) * Math.PI * 2
      const formation = Math.min(t * 0.8, 1)
      const r = formation * 0.8
      return {
        x: ox + Math.cos(angle) * r,
        y: oy + t * 0.8 + Math.sin(angle) * 0.2,
        z: -2 + Math.sin(t * 1.5 + i) * 0.4,
        rx: t * 1.5, ry: t + i * 0.5, rz: t * 0.8,
        scale: Math.max(0.1, 0.4 - t * 0.1),
        opacity: Math.max(0, 1 - t * 0.4),
      }
    },
    wowMovement: (t, i, total, ox, oy) => {
      const base = convergeExplode(t, i, total, ox, oy, 0.8)
      return { ...base, rx: t * 3, ry: t * 2 + i, rz: t * 1.5, scale: base.scale ?? 0.4, opacity: base.opacity ?? 1 }
    },
  },
}

// Fallback for any skill not explicitly configured
const defaultConfig: SkillEffectConfig = {
  geometry: () => new IcosahedronGeometry(0.2, 0),
  count: { normal: 8, wow: 30 },
  movement: (t, i, total, ox, oy) => {
    const pos = radialSpread(t, i, total, ox, oy, 1.0, 0.5)
    return { ...pos, rx: t * 2, ry: t + i, rz: t * 0.5, scale: Math.max(0.1, 0.4 - t * 0.1), opacity: Math.max(0, 1 - t * 0.4) }
  },
  wowMovement: (t, i, total, ox, oy) => {
    const base = convergeExplode(t, i, total, ox, oy, 0.8)
    return { ...base, rx: t * 3, ry: t * 2 + i, rz: t, scale: base.scale ?? 0.4, opacity: base.opacity ?? 1 }
  },
}

export function getSkillConfig(skillId: string): SkillEffectConfig {
  return configs[skillId] ?? defaultConfig
}
```

Note: The `radialSpread` helper is used by the default config. The per-skill movement functions are self-contained since each has unique behavior.

**Step 2: Commit**

```bash
git add lib/skill-effect-configs.ts
git commit -m "feat: add per-skill 3D effect configs with geometry and movement"
```

---

### Task 5: Create SkillEffects R3F component (particle rendering)

**Files:**
- Create: `components/effects/SkillEffects.tsx`

This component lives inside the R3F Canvas. It subscribes to skill effect events and manages instanced mesh particles.

**Step 1: Create the SkillEffects component**

```tsx
'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  Object3D,
  Color,
  Matrix4,
  InstancedMesh,
  type BufferGeometry,
  MeshBasicMaterial,
  type PerspectiveCamera,
} from 'three';
import { onSkillEffect, type SkillEffectEvent } from '@/lib/skill-effects';
import { getSkillConfig } from '@/lib/skill-effect-configs';

interface ActiveEffect {
  id: number
  skillId: string
  color: string
  originX: number // 3D world x
  originY: number // 3D world y
  startTime: number
  isWow: boolean
  count: number
  geometry: BufferGeometry
  movement: (t: number, i: number, total: number, ox: number, oy: number) => {
    x: number; y: number; z: number; rx: number; ry: number; rz: number; scale: number; opacity: number
  }
}

const EFFECT_DURATION = 2.5 // seconds for normal
const WOW_DURATION = 3.5 // seconds for wow
const MAX_CONCURRENT = 5

let effectIdCounter = 0

// Convert normalized screen coords to 3D world position at z=-2
function screenToWorld(nx: number, ny: number, camera: PerspectiveCamera): [number, number] {
  const vFov = camera.fov * Math.PI / 180;
  const dist = camera.position.z - (-2); // distance from camera to z=-2
  const halfH = Math.tan(vFov / 2) * dist;
  const halfW = halfH * camera.aspect;
  const x = (nx * 2 - 1) * halfW;
  const y = (-(ny * 2 - 1)) * halfH;
  return [x, y];
}

export function SkillEffects({ onWowStateChange }: { onWowStateChange?: (active: boolean) => void }) {
  const [effects, setEffects] = useState<ActiveEffect[]>([]);
  const { camera } = useThree();
  const dummy = useMemo(() => new Object3D(), []);
  const instanceRefs = useRef<Map<number, InstancedMesh>>(new Map());

  useEffect(() => {
    return onSkillEffect((event: SkillEffectEvent) => {
      const config = getSkillConfig(event.skillId);
      const [worldX, worldY] = screenToWorld(event.x, event.y, camera as PerspectiveCamera);
      const count = event.isWow ? config.count.wow : config.count.normal;
      const movement = event.isWow ? config.wowMovement : config.movement;

      const newEffect: ActiveEffect = {
        id: effectIdCounter++,
        skillId: event.skillId,
        color: event.color,
        originX: worldX,
        originY: worldY,
        startTime: performance.now() / 1000,
        isWow: event.isWow,
        count,
        geometry: config.geometry(),
        movement,
      };

      if (event.isWow) {
        onWowStateChange?.(true);
      }

      setEffects(prev => {
        const next = [...prev, newEffect];
        // Limit concurrent effects
        if (next.length > MAX_CONCURRENT) return next.slice(-MAX_CONCURRENT);
        return next;
      });
    });
  }, [camera, onWowStateChange]);

  // Remove expired effects
  useFrame(() => {
    const now = performance.now() / 1000;
    setEffects(prev => {
      const filtered = prev.filter(e => {
        const duration = e.isWow ? WOW_DURATION : EFFECT_DURATION;
        return now - e.startTime < duration;
      });
      // If a wow effect just ended, notify
      if (prev.some(e => e.isWow) && !filtered.some(e => e.isWow)) {
        onWowStateChange?.(false);
      }
      if (filtered.length !== prev.length) return filtered;
      return prev; // no change, don't trigger re-render
    });
  });

  // Update instance transforms each frame
  useFrame(() => {
    const now = performance.now() / 1000;

    for (const effect of effects) {
      const mesh = instanceRefs.current.get(effect.id);
      if (!mesh) continue;

      const elapsed = now - effect.startTime;

      for (let i = 0; i < effect.count; i++) {
        const state = effect.movement(elapsed, i, effect.count, effect.originX, effect.originY);
        dummy.position.set(state.x, state.y, state.z);
        dummy.rotation.set(state.rx, state.ry, state.rz);
        dummy.scale.setScalar(state.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;

      // Update opacity on material
      const mat = mesh.material as MeshBasicMaterial;
      // Use the first particle's opacity as overall (they fade together)
      const state0 = effect.movement(elapsed, 0, effect.count, effect.originX, effect.originY);
      mat.opacity = state0.opacity;
    }
  });

  return (
    <>
      {effects.map(effect => (
        <instancedMesh
          key={effect.id}
          ref={(el) => {
            if (el) instanceRefs.current.set(effect.id, el);
            else instanceRefs.current.delete(effect.id);
          }}
          args={[effect.geometry, undefined, effect.count]}
        >
          <meshBasicMaterial
            color={new Color(effect.color)}
            transparent
            opacity={1}
            wireframe
            depthWrite={false}
          />
        </instancedMesh>
      ))}
    </>
  );
}
```

**Step 2: Commit**

```bash
git add components/effects/SkillEffects.tsx
git commit -m "feat: add SkillEffects R3F component with instanced particle rendering"
```

---

### Task 6: Add background shape reaction to skill clicks

**Files:**
- Modify: `components/effects/Background.tsx`

The existing `Shapes` component needs to react to skill effect events: briefly tint toward the skill's brand color and push outward from the click origin.

**Step 1: Add skill event subscription to Shapes**

Add to the `Shapes` component:
- A ref holding the current tint state: `{ color: Color, originX: number, originY: number, startTime: number } | null`
- Subscribe to `onSkillEffect` events
- In `useFrame`, lerp mesh colors toward tint color (0.3s in, 1s out) and apply a subtle position offset away from origin

The key changes inside `Shapes`:

```tsx
// New imports needed at top of Background.tsx
import { Color } from 'three'; // add Color to existing import
import { onSkillEffect } from '@/lib/skill-effects';

// Inside Shapes component, add:
const tintRef = useRef<{ color: Color; originX: number; originY: number; startTime: number } | null>(null);
const baseColor = useMemo(() => new Color(accentHex), [accentHex]);

useEffect(() => {
  return onSkillEffect((event) => {
    const vFov = (camera as PerspectiveCamera).fov * Math.PI / 180;
    const dist = camera.position.z - (-2);
    const halfH = Math.tan(vFov / 2) * dist;
    const halfW = halfH * (camera as PerspectiveCamera).aspect;
    tintRef.current = {
      color: new Color(event.color),
      originX: (event.x * 2 - 1) * halfW,
      originY: (-(event.y * 2 - 1)) * halfH,
      startTime: performance.now() / 1000,
    };
  });
}, [camera]);

// In useFrame, after existing animation, add color tint + push logic:
// (inside the for loop, after mesh.lookAt)
if (tintRef.current) {
  const tintElapsed = performance.now() / 1000 - tintRef.current.startTime;
  const mat = mesh.material as MeshBasicMaterial;

  if (tintElapsed < 0.3) {
    // Tint in
    const progress = tintElapsed / 0.3;
    const lerpedColor = baseColor.clone().lerp(tintRef.current.color, progress * 0.4);
    mat.color.copy(lerpedColor);
  } else if (tintElapsed < 1.3) {
    // Tint out
    const progress = (tintElapsed - 0.3) / 1.0;
    const lerpedColor = baseColor.clone().lerp(tintRef.current.color, (1 - progress) * 0.4);
    mat.color.copy(lerpedColor);
  } else {
    mat.color.set(accentHex);
    if (i === shapes.length - 1) tintRef.current = null; // clear after last mesh processed
  }

  // Subtle push away from click origin
  if (tintElapsed < 1.0) {
    const pushStrength = Math.max(0, 0.3 * (1 - tintElapsed));
    const dx = mesh.position.x - tintRef.current.originX;
    const dy = mesh.position.y - tintRef.current.originY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    mesh.position.x += (dx / dist) * pushStrength * delta;
    mesh.position.y += (dy / dist) * pushStrength * delta;
  }
}
```

You'll also need to add `MeshBasicMaterial` to the Three.js import if not already there (it is not — the material is JSX `<meshBasicMaterial>` but we need the type for casting).

**Step 2: Commit**

```bash
git add components/effects/Background.tsx
git commit -m "feat: add color tint and push reaction to background shapes on skill click"
```

---

### Task 7: Add post-processing for wow effects

**Files:**
- Modify: `components/effects/Background.tsx`

Mount `EffectComposer` with Bloom and ChromaticAberration inside the Canvas, only when a wow is active.

**Step 1: Add post-processing to Background component**

```tsx
// New imports at top of Background.tsx
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three'; // add to existing three import
import { SkillEffects } from './SkillEffects';

// Inside Background component, add wow state:
const [wowActive, setWowActive] = useState(false);
const wowStartTime = useRef(0);

const handleWowStateChange = useCallback((active: boolean) => {
  setWowActive(active);
  if (active) wowStartTime.current = performance.now() / 1000;
}, []);
```

Add `SkillEffects` and conditional `EffectComposer` inside the Canvas:

```tsx
<Canvas ...>
  <SceneUpdater ... />
  <Shapes ... />
  <SkillEffects onWowStateChange={handleWowStateChange} />
  {wowActive && <WowPostProcessing startTime={wowStartTime.current} />}
</Canvas>
```

Create the `WowPostProcessing` component inside Background.tsx:

```tsx
function WowPostProcessing({ startTime }: { startTime: number }) {
  const bloomRef = useRef<any>(null);
  const caRef = useRef<any>(null);

  useFrame(() => {
    const elapsed = performance.now() / 1000 - startTime;

    // Bloom: ramp up 0->1.5 over 0.5s, peak, then fade over 1s
    if (bloomRef.current) {
      if (elapsed < 0.5) {
        bloomRef.current.intensity = (elapsed / 0.5) * 1.5;
      } else if (elapsed < 1.5) {
        bloomRef.current.intensity = 1.5 * (1 - (elapsed - 0.5) / 1.0);
      } else {
        bloomRef.current.intensity = 0;
      }
    }

    // Chromatic aberration: burst at 0.4-0.7s
    if (caRef.current) {
      if (elapsed > 0.4 && elapsed < 0.7) {
        const t = (elapsed - 0.4) / 0.3;
        const strength = Math.sin(t * Math.PI) * 0.005;
        caRef.current.offset = new Vector2(strength, strength);
      } else {
        caRef.current.offset = new Vector2(0, 0);
      }
    }
  });

  return (
    <EffectComposer>
      <Bloom
        ref={bloomRef}
        intensity={0}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        blendFunction={BlendFunction.ADD}
      />
      <ChromaticAberration
        ref={caRef}
        offset={new Vector2(0, 0)}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0}
      />
    </EffectComposer>
  );
}
```

**Step 2: Add necessary imports to Background.tsx**

Add `useState, useCallback` to the existing React imports (useState is not currently imported in Background).

**Step 3: Verify dev server — click a badge, see particles. Click 5x rapidly, see bloom/chromatic aberration.**

Run: `npm run dev`

**Step 4: Commit**

```bash
git add components/effects/Background.tsx
git commit -m "feat: add post-processing bloom and chromatic aberration for wow effects"
```

---

### Task 8: Integration testing and polish

**Files:**
- Possibly modify: `components/effects/Background.tsx`, `lib/skill-effect-configs.ts`

**Step 1: Test normal click behavior**

- Open dev server, scroll to tech stack
- Click each badge, verify particles spawn from correct position with correct color
- Verify existing background shapes tint and push
- Verify particles fade out after ~2.5s

**Step 2: Test wow behavior**

- Click a badge 5 times rapidly (within 2s)
- Verify bloom ramps up and chromatic aberration bursts
- Verify wow cooldown prevents re-triggering for 3s
- Verify post-processing unmounts cleanly (no lingering bloom)

**Step 3: Test mobile**

- Open devtools, toggle mobile viewport
- Verify badges are still visible but clicks produce no 3D effects
- Verify no console errors

**Step 4: Test performance**

- Open devtools Performance tab
- Click badges repeatedly, verify frame rate stays above 30fps
- Verify no memory leaks (instanced meshes get cleaned up)

**Step 5: Tune movement parameters if needed**

Adjust values in `skill-effect-configs.ts` for feel. This is subjective — tune particle counts, speeds, scales, and opacity curves.

**Step 6: Build check**

Run: `npm run build`
Expected: Clean build, no type errors

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: skill 3D effects — particles, post-processing, click tracking"
```

---

### Task 9: Export and barrel file updates

**Files:**
- Modify: `components/effects/index.ts`

**Step 1: Add SkillEffects export**

Add to `components/effects/index.ts`:
```ts
export { SkillEffects } from './SkillEffects';
```

(Note: SkillEffects is only used internally by Background.tsx, so this export is optional. Include it for consistency with the barrel file pattern.)

**Step 2: Commit**

```bash
git add components/effects/index.ts
git commit -m "chore: export SkillEffects from effects barrel"
```

Plan complete and saved to `docs/plans/2026-02-22-skill-3d-effects.md`. Two execution options:

**1. Subagent-Driven (this session)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** — Open new session with executing-plans, batch execution with checkpoints

Which approach?