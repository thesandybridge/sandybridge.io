import { lazy, Suspense } from 'react';

const SkillEffectsOverlay = lazy(() => import('~/components/effects/SkillEffects').then(m => ({ default: m.SkillEffectsOverlay })));

export function SkillEffectsLazy() {
  return (
    <Suspense fallback={null}>
      <SkillEffectsOverlay />
    </Suspense>
  );
}
