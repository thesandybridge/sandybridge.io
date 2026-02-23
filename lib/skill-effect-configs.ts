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
  movement: (t: number, i: number, total: number, originX: number, originY: number) => {
    x: number; y: number; z: number
    rx: number; ry: number; rz: number
    scale: number; opacity: number
  }
  wowMovement: (t: number, i: number, total: number, originX: number, originY: number) => {
    x: number; y: number; z: number
    rx: number; ry: number; rz: number
    scale: number; opacity: number
  }
}

function convergeExplode(t: number, i: number, total: number, ox: number, oy: number, convergeTime: number) {
  const angle = (i / total) * Math.PI * 2
  if (t < convergeTime) {
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
    geometry: () => new BoxGeometry(0.3, 0.6, 0.15),
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
      return { ...base, rx: t * 4 + i, ry: t * 3, rz: t * 2 }
    },
  },
  React: {
    geometry: () => new TorusGeometry(0.2, 0.05, 8, 16),
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
      return { ...base, rx: t * 6, ry: t * 4 + i, rz: t * 8 }
    },
  },
  'Next.js': {
    geometry: () => new TetrahedronGeometry(0.25),
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
      return { ...base, rx: t * 5 + i, ry: -t * 3, rz: t * 4 }
    },
  },
  Rust: {
    geometry: () => new BoxGeometry(0.4, 0.1, 0.3),
    count: { normal: 10, wow: 50 },
    movement: (t, i, total, ox, oy) => {
      const angle = (i / total) * Math.PI * 2 + (i % 3) * 0.5
      const r = t * 2.0
      return {
        x: ox + Math.cos(angle) * r,
        y: oy + Math.sin(angle) * r * 0.8,
        z: -2 + Math.sin(i * 1.3 + t) * 0.4,
        rx: t * 4 * (i % 2 ? 1 : -1), ry: t * 2, rz: t * 3,
        scale: Math.max(0.1, 0.5 - t * 0.12),
        opacity: Math.max(0, 1 - t * 0.35),
      }
    },
    wowMovement: (t, i, total, ox, oy) => {
      const base = convergeExplode(t, i, total, ox, oy, 0.6)
      return { ...base, rx: t * 6 * (i % 2 ? 1 : -1), ry: t * 4, rz: t * 5 }
    },
  },
  Go: {
    geometry: () => new IcosahedronGeometry(0.2, 0),
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
      return { ...base, rx: t * 1.5, ry: t * 2 + i, rz: t }
    },
  },
  'Node.js': {
    geometry: () => new CylinderGeometry(0.02, 0.02, 0.5, 4),
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
      return { ...base, rx: t * 2 + i, ry: 0, rz: t * 3 }
    },
  },
  PostgreSQL: {
    geometry: () => new CylinderGeometry(0.15, 0.15, 0.4, 6),
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
      return { ...base, rx: 0, ry: t * 3, rz: 0 }
    },
  },
  Redis: {
    geometry: () => new OctahedronGeometry(0.2),
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
      return { ...base, rx: t * 4, ry: t * 5 + i, rz: t * 2 }
    },
  },
  Docker: {
    geometry: () => new BoxGeometry(0.25, 0.25, 0.25),
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
      return { ...base, rx: t * 0.5, ry: t, rz: 0 }
    },
  },
  Neovim: {
    geometry: () => new BoxGeometry(0.08, 0.4, 0.02),
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
      return { ...base, rx: 0, ry: 0, rz: t * 2 + i * 0.5 }
    },
  },
  tmux: {
    geometry: () => new PlaneGeometry(0.4, 0.3),
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
      return { ...base, rx: 0, ry: t * 2 * (i % 2 ? 1 : -1), rz: 0 }
    },
  },
  'Arch Linux': {
    geometry: () => new TetrahedronGeometry(0.25),
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
      return { ...base, rx: t * 3, ry: t * 2 + i, rz: t * 1.5 }
    },
  },
}

const defaultConfig: SkillEffectConfig = {
  geometry: () => new IcosahedronGeometry(0.2, 0),
  count: { normal: 8, wow: 30 },
  movement: (t, i, total, ox, oy) => {
    const angle = (i / total) * Math.PI * 2
    const r = t * 1.0
    return {
      x: ox + Math.cos(angle + t * 0.5) * r,
      y: oy + Math.sin(angle + t * 0.5) * r,
      z: -2 + Math.sin(t + i) * 0.5,
      rx: t * 2, ry: t + i, rz: t * 0.5,
      scale: Math.max(0.1, 0.4 - t * 0.1),
      opacity: Math.max(0, 1 - t * 0.4),
    }
  },
  wowMovement: (t, i, total, ox, oy) => {
    const base = convergeExplode(t, i, total, ox, oy, 0.8)
    return { ...base, rx: t * 3, ry: t * 2 + i, rz: t }
  },
}

export function getSkillConfig(skillId: string): SkillEffectConfig {
  return configs[skillId] ?? defaultConfig
}
