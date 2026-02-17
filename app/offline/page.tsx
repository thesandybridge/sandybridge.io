import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offline',
};

export default function OfflinePage() {
  return (
    <>
      <h1>You&apos;re offline</h1>
      <p>It looks like you&apos;ve lost your internet connection. Previously visited pages may still be available.</p>
    </>
  );
}
