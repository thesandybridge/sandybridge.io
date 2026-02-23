'use client';

import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Object3D,
  Color,
  Vector2,
  InstancedMesh,
  type BufferGeometry,
  MeshBasicMaterial,
  type PerspectiveCamera,
} from 'three';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useIsMobile } from '@/lib/use-mobile';
import { useTheme } from '../theme/ThemeProvider';
import { onSkillEffect, type SkillEffectEvent } from '@/lib/skill-effects';
import { getSkillConfig } from '@/lib/skill-effect-configs';

interface ActiveEffect {
  id: number
  skillId: string
  colorObj: Color
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

// Reusable Vector2 to avoid allocations in render loop
const _caOffset = new Vector2(0, 0)

function screenToWorld(nx: number, ny: number, camera: PerspectiveCamera): [number, number] {
  const vFov = camera.fov * Math.PI / 180;
  const dist = camera.position.z - (-2);
  const halfH = Math.tan(vFov / 2) * dist;
  const halfW = halfH * camera.aspect;
  const x = (nx * 2 - 1) * halfW;
  const y = (-(ny * 2 - 1)) * halfH;
  return [x, y];
}

function Particles({ onWowStateChange }: { onWowStateChange: (active: boolean) => void }) {
  const effectsRef = useRef<ActiveEffect[]>([]);
  const [effectKeys, setEffectKeys] = useState<number[]>([]);
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
        colorObj: new Color(event.color),
        originX: worldX,
        originY: worldY,
        startTime: performance.now() / 1000,
        isWow: event.isWow,
        count,
        geometry: config.geometry(),
        movement,
      };

      if (event.isWow) {
        onWowStateChange(true);
      }

      const prev = effectsRef.current;
      let next = [...prev, newEffect];
      if (next.length > MAX_CONCURRENT) {
        const evicted = next.slice(0, next.length - MAX_CONCURRENT);
        evicted.forEach(e => e.geometry.dispose());
        next = next.slice(-MAX_CONCURRENT);
      }
      effectsRef.current = next;
      setEffectKeys(next.map(e => e.id));
    });
  }, [camera, onWowStateChange]);

  // Animate and expire effects
  useFrame(() => {
    const now = performance.now() / 1000;
    const effects = effectsRef.current;
    let changed = false;
    let wowEnded = false;

    // Check for expired effects
    const alive: ActiveEffect[] = [];
    for (const e of effects) {
      const duration = e.isWow ? WOW_DURATION : EFFECT_DURATION;
      if (now - e.startTime >= duration) {
        e.geometry.dispose();
        changed = true;
        if (e.isWow) wowEnded = true;
      } else {
        alive.push(e);
      }
    }

    if (changed) {
      effectsRef.current = alive;
      setEffectKeys(alive.map(e => e.id));
      if (wowEnded && !alive.some(e => e.isWow)) {
        onWowStateChange(false);
      }
    }

    // Update instance transforms
    for (const effect of effectsRef.current) {
      const mesh = instanceRefs.current.get(effect.id);
      if (!mesh) continue;

      const elapsed = now - effect.startTime;
      let firstOpacity = 1;

      for (let i = 0; i < effect.count; i++) {
        const state = effect.movement(elapsed, i, effect.count, effect.originX, effect.originY);
        if (i === 0) firstOpacity = state.opacity;
        dummy.position.set(state.x, state.y, state.z);
        dummy.rotation.set(state.rx, state.ry, state.rz);
        dummy.scale.setScalar(state.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      (mesh.material as MeshBasicMaterial).opacity = firstOpacity;
    }
  });

  return (
    <>
      {effectsRef.current.map(effect => (
        <instancedMesh
          key={effect.id}
          ref={(el) => {
            if (el) instanceRefs.current.set(effect.id, el);
            else instanceRefs.current.delete(effect.id);
          }}
          args={[effect.geometry, undefined, effect.count]}
        >
          <meshBasicMaterial
            color={effect.colorObj}
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

function WowPostProcessing({ startTime }: { startTime: number }) {
  const bloomRef = useRef<any>(null);
  const caRef = useRef<any>(null);

  useFrame(() => {
    const elapsed = performance.now() / 1000 - startTime;

    if (bloomRef.current) {
      if (elapsed < 0.5) {
        bloomRef.current.intensity = (elapsed / 0.5) * 1.5;
      } else if (elapsed < 1.5) {
        bloomRef.current.intensity = 1.5 * (1 - (elapsed - 0.5) / 1.0);
      } else {
        bloomRef.current.intensity = 0;
      }
    }

    if (caRef.current) {
      if (elapsed > 0.4 && elapsed < 0.7) {
        const t = (elapsed - 0.4) / 0.3;
        const strength = Math.sin(t * Math.PI) * 0.005;
        _caOffset.set(strength, strength);
        caRef.current.offset = _caOffset;
      } else {
        _caOffset.set(0, 0);
        caRef.current.offset = _caOffset;
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

export function SkillEffectsOverlay() {
  const isMobile = useIsMobile();
  const { colors } = useTheme();
  const [wowActive, setWowActive] = useState(false);
  const wowStartTime = useRef(0);

  const handleWowStateChange = useCallback((active: boolean) => {
    setWowActive(active);
    if (active) wowStartTime.current = performance.now() / 1000;
  }, []);

  if (isMobile) return null;

  return (
    <Canvas
      camera={{ fov: 60, near: 0.1, far: 100, position: [0, 0, 5] }}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        pointerEvents: 'none',
      }}
      dpr={1}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <Particles onWowStateChange={handleWowStateChange} />
      {wowActive && <WowPostProcessing startTime={wowStartTime.current} />}
    </Canvas>
  );
}
