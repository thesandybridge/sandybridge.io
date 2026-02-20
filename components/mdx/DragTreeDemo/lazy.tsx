'use client';

import dynamic from 'next/dynamic';

const DragTreeDemo = dynamic(
  () => import('./index').then(m => m.DragTreeDemo),
  { ssr: false },
);

export function DragTreeDemoLazy() {
  return <DragTreeDemo />;
}
