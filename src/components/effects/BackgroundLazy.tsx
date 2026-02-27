import { lazy, Suspense } from 'react';

const Background = lazy(() => import('~/components/effects/Background').then(m => ({ default: m.Background })));

export function BackgroundLazy() {
  return (
    <Suspense fallback={null}>
      <Background />
    </Suspense>
  );
}
