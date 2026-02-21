'use client';

import dynamic from 'next/dynamic';

const Sha3Demo = dynamic(
  () => import('./index').then(m => m.Sha3Demo),
  { ssr: false },
);

export function Sha3DemoLazy() {
  return <Sha3Demo />;
}
