'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  Object3D,
  Color,
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
  originX: number
  originY: number
  startTime: number
  isWow: boolean
  count: number
  geometry: BufferGeometry
  movement: (t: number, i: number, total: number, ox: number, oy: number) => {
    x: number; y: number; z: number; rx: number; ry: number; rz: number; scale: number; opacity: number
  }
}

const EFFECT_DURATION = 2.5
const WOW_DURATION = 3.5
const MAX_CONCURRENT = 5

let effectIdCounter = 0

function screenToWorld(nx: number, ny: number, camera: PerspectiveCamera): [number, number] {
  const vFov = camera.fov * Math.PI / 180;
  const dist = camera.position.z - (-2);
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
      if (prev.some(e => e.isWow) && !filtered.some(e => e.isWow)) {
        onWowStateChange?.(false);
      }
      if (filtered.length !== prev.length) return filtered;
      return prev;
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

      const mat = mesh.material as MeshBasicMaterial;
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
