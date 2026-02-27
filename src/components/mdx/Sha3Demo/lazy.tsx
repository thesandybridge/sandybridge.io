import { lazy, Suspense } from 'react';

const Sha3Demo = lazy(() => import('./index').then(m => ({ default: m.Sha3Demo })));

export function Sha3DemoLazy() {
  return (
    <Suspense fallback={null}>
      <Sha3Demo />
    </Suspense>
  );
}
