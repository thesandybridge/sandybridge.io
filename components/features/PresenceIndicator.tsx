'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import s from './PresenceIndicator.module.css';

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
    sendHeartbeat();
    fetchPresence();

    const heartbeatInterval = setInterval(sendHeartbeat, 15000);
    const pollInterval = setInterval(fetchPresence, 10000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(pollInterval);
    };
  }, [sendHeartbeat, fetchPresence]);

  if (!presence || presence.total <= 1) return null;

  return (
    <div className={s.presenceIndicator} title={`${presence.total} visitors online`}>
      <span className={s.presenceDot} />
      <span className={s.presenceCount}>{presence.total} online</span>
    </div>
  );
}
