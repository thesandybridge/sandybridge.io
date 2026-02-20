'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface PresenceData {
  total: number;
  recentPages: Array<{ path: string; timestamp: number }>;
}

export function PresenceIndicator() {
  const [presence, setPresence] = useState<PresenceData | null>(null);
  const pathname = usePathname();

  const sendHeartbeat = useCallback(async () => {
    try {
      await fetch('/api/presence/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathname }),
      });
    } catch {
      // Silently fail
    }
  }, [pathname]);

  const fetchPresence = useCallback(async () => {
    try {
      const res = await fetch('/api/presence');
      const data = await res.json();
      setPresence(data);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    // Initial heartbeat and fetch
    sendHeartbeat();
    fetchPresence();

    // Send heartbeat every 15 seconds
    const heartbeatInterval = setInterval(sendHeartbeat, 15000);

    // Poll presence every 10 seconds
    const pollInterval = setInterval(fetchPresence, 10000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(pollInterval);
    };
  }, [sendHeartbeat, fetchPresence]);

  // Don't show if only 1 visitor (just you)
  if (!presence || presence.total <= 1) return null;

  return (
    <div className="presence-indicator" title={`${presence.total} visitors online`}>
      <span className="presence-dot" />
      <span className="presence-count">{presence.total} online</span>
    </div>
  );
}
