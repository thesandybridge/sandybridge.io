import { lazy, Suspense } from 'react';

const RaftDemo = lazy(() => import('./index').then(m => ({ default: m.RaftDemo })));

export function RaftDemoLazy() {
  return (
    <Suspense fallback={null}>
      <RaftDemo />
    </Suspense>
  );
}
