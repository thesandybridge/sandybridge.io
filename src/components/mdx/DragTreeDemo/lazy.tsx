import { lazy, Suspense } from 'react';

const DragTreeDemo = lazy(() => import('./index').then(m => ({ default: m.DragTreeDemo })));

export function DragTreeDemoLazy() {
  return (
    <Suspense fallback={null}>
      <DragTreeDemo />
    </Suspense>
  );
}
