import type { Metadata } from 'next';
import { WifiOff } from 'lucide-react';
import { CachedPages } from '@/components/CachedPages';

export const metadata: Metadata = {
  title: 'Offline',
};

export default function OfflinePage() {
  return (
    <div className="offline-page">
      <div className="offline-icon">
        <WifiOff size={48} />
      </div>
      <h1>You&apos;re offline</h1>
      <p>No internet connection. These pages are available from cache:</p>
      <CachedPages />
    </div>
  );
}
