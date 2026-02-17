'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

function SpinningTetra() {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += 0.005;
    meshRef.current.rotation.y += 0.008;
  });

  return (
    <mesh ref={meshRef}>
      <tetrahedronGeometry args={[0.8]} />
      <meshBasicMaterial color={0xd79921} wireframe transparent opacity={0.4} />
    </mesh>
  );
}

export function TermTriangle() {
  return (
    <Canvas
      id="term-tri"
      camera={{ fov: 50, near: 0.1, far: 10, position: [0, 0, 2.5] }}
      gl={{ alpha: true }}
      style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', width: 40, height: 40, pointerEvents: 'none' }}
    >
      <SpinningTetra />
    </Canvas>
  );
}
