'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useIsMobile } from '@/lib/use-mobile';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector3, Shape, ExtrudeGeometry, type Mesh, type PerspectiveCamera } from 'three';
import { useTheme, THEME_COLORS, type Theme } from '../theme/ThemeProvider';

// Create a bat-shaped geometry
function createBatGeometry() {
  const shape = new Shape();
  const s = 0.5;

  // Body center
  shape.moveTo(0, -s * 0.3);

  // Right wing
  shape.quadraticCurveTo(s * 0.4, -s * 0.1, s * 1.2, s * 0.3);
  shape.quadraticCurveTo(s * 0.9, s * 0.1, s * 0.7, -s * 0.1);
  shape.quadraticCurveTo(s * 0.5, s * 0.1, s * 0.3, s * 0.2);

  // Head and right ear
  shape.quadraticCurveTo(s * 0.2, s * 0.4, s * 0.15, s * 0.6);
  shape.lineTo(s * 0.05, s * 0.35);

  // Left ear
  shape.lineTo(-s * 0.05, s * 0.35);
  shape.lineTo(-s * 0.15, s * 0.6);
  shape.quadraticCurveTo(-s * 0.2, s * 0.4, -s * 0.3, s * 0.2);

  // Left wing
  shape.quadraticCurveTo(-s * 0.5, s * 0.1, -s * 0.7, -s * 0.1);
  shape.quadraticCurveTo(-s * 0.9, s * 0.1, -s * 1.2, s * 0.3);
  shape.quadraticCurveTo(-s * 0.4, -s * 0.1, 0, -s * 0.3);

  return new ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false });
}

interface ShapeData {
  isBox: boolean;
  x: number;
  y: number;
  z: number;
  scale: number;
  opacity: number;
  scrollFactor: number;
}

function Shapes({ accentHex, theme }: { accentHex: number; theme: Theme }) {
  const batGeometry = useMemo(() => (theme === 'dracula' || theme === 'alucard') ? createBatGeometry() : null, [theme]);
  const { camera, viewport } = useThree();
  const meshRefs = useRef<(Mesh | null)[]>([]);
  const focal = useRef(new Vector3());
  const targetFocal = useRef(new Vector3());
  const scrollY = useRef(0);

  const vFov = (camera as PerspectiveCamera).fov * Math.PI / 180;
  const halfFovTan = Math.tan(vFov / 2);

  const shapes = useMemo<ShapeData[]>(() => {
    const contentHalf = (800 / window.innerWidth) * halfFovTan * camera.position.z * (viewport.width / viewport.height > 1 ? viewport.width / viewport.height : 1);
    const items: ShapeData[] = [];

    for (let i = 0; i < 18; i++) {
      const z = -1 - Math.random() * 4;
      const dist = camera.position.z - z;
      const hRange = halfFovTan * dist * (camera as PerspectiveCamera).aspect;
      const vRange = halfFovTan * dist;
      const side = Math.random() < 0.5 ? -1 : 1;

      items.push({
        isBox: i % 2 === 0,
        x: side * (contentHalf + Math.random() * (hRange - contentHalf)),
        y: (Math.random() - 0.5) * 2 * vRange,
        z,
        scale: 0.3 + Math.random() * 0.5,
        opacity: 0.15 + Math.random() * 0.1,
        scrollFactor: 0.002 + (1 - (z / -5)) * 0.004,
      });
    }
    return items;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
      const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetFocal.current.x = ndcX * halfFovTan * camera.position.z * (camera as PerspectiveCamera).aspect;
      targetFocal.current.y = ndcY * halfFovTan * camera.position.z;
    };
    const onScroll = () => { scrollY.current = window.scrollY; };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, [camera, halfFovTan]);

  useFrame((_, delta) => {
    focal.current.lerp(targetFocal.current, 0.05);
    const t = performance.now() * 0.001;

    for (let i = 0; i < shapes.length; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      const s = shapes[i];

      // Parallax
      mesh.position.y = s.y + scrollY.current * s.scrollFactor;

      // Gentle drift: sine wave offset unique per shape
      mesh.position.x = s.x + Math.sin(t * 0.3 + i * 1.7) * 0.15;

      // Slow idle rotation
      mesh.rotation.x += delta * 0.08 * (i % 2 === 0 ? 1 : -1);
      mesh.rotation.y += delta * 0.05;

      // Pulse opacity based on scroll proximity to viewport center
      const screenY = mesh.position.y - scrollY.current * s.scrollFactor * 0.5;
      const distFromCenter = Math.abs(screenY);
      const pulse = Math.max(0.08, s.opacity + Math.sin(t * 0.5 + i) * 0.03 - distFromCenter * 0.01);
      (mesh.material as { opacity: number }).opacity = Math.min(0.3, pulse);

      mesh.lookAt(focal.current);
    }
  });

  return (
    <>
      {shapes.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
          position={[s.x, s.y, s.z]}
          scale={s.scale}
        >
          {(theme === 'dracula' || theme === 'alucard') && batGeometry ? (
            <primitive object={batGeometry} attach="geometry" />
          ) : s.isBox ? (
            <boxGeometry args={[1, 1, 1]} />
          ) : (
            <tetrahedronGeometry args={[1]} />
          )}
          <meshBasicMaterial color={accentHex} transparent opacity={s.opacity} wireframe />
        </mesh>
      ))}
    </>
  );
}

export function Background() {
  const isMobile = useIsMobile();
  const { colors, theme } = useTheme();

  if (isMobile) return null;

  return (
    <Canvas
      key={colors.backgroundHex}
      id="bg-canvas"
      camera={{ fov: 60, near: 0.1, far: 100, position: [0, 0, 5] }}
      gl={{ antialias: false, powerPreference: 'low-power' }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none', background: colors.background }}
      dpr={1}
      onCreated={({ gl }) => {
        gl.setClearColor(colors.backgroundHex);
      }}
    >
      <Shapes accentHex={colors.accentHex} theme={theme} />
    </Canvas>
  );
}
