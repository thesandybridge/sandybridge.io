// Server component — no hydration, pure SVG

// Seeded PRNG (mulberry32) for deterministic triangle placement
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

interface Triangle {
  cx: number;
  cy: number;
  size: number;
  rotation: number;
  opacity: number;
  driftClass: string | null;
}

function generateTriangles(): Triangle[] {
  const rng = mulberry32(42);
  const triangles: Triangle[] = [];
  const rings = [
    { radius: 120, count: 6, opacity: 0.4 },
    { radius: 260, count: 12, opacity: 0.3 },
    { radius: 420, count: 18, opacity: 0.2 },
    { radius: 600, count: 24, opacity: 0.15 },
    { radius: 800, count: 30, opacity: 0.1 },
  ];
  const driftClasses = ['triangle-drift-1', 'triangle-drift-2', 'triangle-drift-3'];

  for (const ring of rings) {
    for (let i = 0; i < ring.count; i++) {
      const angle = (i / ring.count) * Math.PI * 2 + (rng() - 0.5) * 0.5;
      const r = ring.radius + (rng() - 0.5) * ring.radius * 0.4;
      const cx = round(Math.cos(angle) * r);
      const cy = round(Math.sin(angle) * r);
      const size = round(8 + rng() * 22);
      const rotation = round(rng() * 360);
      const drift = rng() < 0.3 ? driftClasses[Math.floor(rng() * 3)] : null;

      triangles.push({ cx, cy, size, rotation, opacity: ring.opacity, driftClass: drift });
    }
  }

  return triangles;
}

const TRIANGLES = generateTriangles();

function trianglePath(size: number): string {
  const h = round(size * (Math.sqrt(3) / 2));
  return `M0,${round(-h * 0.67)} L${round(size / 2)},${round(h * 0.33)} L${round(-size / 2)},${round(h * 0.33)} Z`;
}

export function TriangleBurst() {
  return (
    <svg
      className="triangle-burst"
      viewBox="-1000 -1000 2000 2000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {TRIANGLES.map((t, i) => (
        <path
          key={i}
          d={trianglePath(t.size)}
          transform={`translate(${t.cx}, ${t.cy}) rotate(${t.rotation})`}
          fill="none"
          stroke="#d79921"
          strokeWidth="1.5"
          opacity={t.opacity}
          className={t.driftClass || undefined}
        />
      ))}
    </svg>
  );
}
