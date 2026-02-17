'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector3, type Mesh, type PerspectiveCamera } from 'three';

interface ShapeData {
  isBox: boolean;
  x: number;
  y: number;
  z: number;
  scale: number;
  opacity: number;
  scrollFactor: number;
}

function Shapes() {
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

  useFrame(() => {
    focal.current.lerp(targetFocal.current, 0.05);
    for (let i = 0; i < shapes.length; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      mesh.position.y = shapes[i].y + scrollY.current * shapes[i].scrollFactor;
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
          {s.isBox ? <boxGeometry args={[1, 1, 1]} /> : <tetrahedronGeometry args={[1]} />}
          <meshBasicMaterial color={0xd79921} transparent opacity={s.opacity} wireframe />
        </mesh>
      ))}
    </>
  );
}

export function Background() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.innerWidth >= 900) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <Canvas
      id="bg-canvas"
      camera={{ fov: 60, near: 0.1, far: 100, position: [0, 0, 5] }}
      gl={{ antialias: false, powerPreference: 'low-power' }}
      style={{ position: 'fixed', top: 0, left: 0, zIndex: -1, pointerEvents: 'none' }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x151515);
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      }}
    >
      <Shapes />
    </Canvas>
  );
}
