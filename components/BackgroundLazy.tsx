'use client';

import dynamic from 'next/dynamic';

const Background = dynamic(() => import('@/components/Background').then(m => m.Background), { ssr: false });

export function BackgroundLazy() {
  return <Background />;
}
