'use client';

import dynamic from 'next/dynamic';

const RaftDemo = dynamic(() => import('./index').then(m => m.RaftDemo), { ssr: false });

export function RaftDemoLazy() {
  return <RaftDemo />;
}
