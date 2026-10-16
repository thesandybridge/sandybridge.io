import { useDesktopEffects } from '~/lib/use-desktop-effects';
import { lazy, Suspense } from 'react';

const SkillEffectsOverlay = lazy(() => import('~/components/effects/SkillEffects').then(m => ({ default: m.SkillEffectsOverlay })));

export function SkillEffectsLazy() {
  const enabled = useDesktopEffects();
  if (!enabled) return null;
  return (
    <Suspense fallback={null}>
      <SkillEffectsOverlay />
    </Suspense>
  );
}
