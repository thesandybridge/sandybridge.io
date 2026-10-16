import { useDesktopEffects } from '~/lib/use-desktop-effects';
import { lazy, Suspense } from 'react';

const Background = lazy(() => import('~/components/effects/Background').then(m => ({ default: m.Background })));

export function BackgroundLazy() {
  const enabled = useDesktopEffects();
  if (!enabled) return null;
  return (
    <Suspense fallback={null}>
      <Background />
    </Suspense>
  );
}
