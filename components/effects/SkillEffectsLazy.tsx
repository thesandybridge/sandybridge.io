'use client';

import dynamic from 'next/dynamic';

const SkillEffectsOverlay = dynamic(
  () => import('@/components/effects/SkillEffects').then(m => m.SkillEffectsOverlay),
  { ssr: false }
);

export function SkillEffectsLazy() {
  return <SkillEffectsOverlay />;
}
