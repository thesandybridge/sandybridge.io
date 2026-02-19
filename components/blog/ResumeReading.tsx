'use client';

import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'reading-progress';
const MIN_PROGRESS = 5;
const MAX_PROGRESS = 95;

interface ReadingProgress {
  slug: string;
  position: number;
  timestamp: number;
}

function getProgress(): Record<string, ReadingProgress> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveProgress(slug: string, position: number) {
  const progress = getProgress();
  progress[slug] = { slug, position, timestamp: Date.now() };

  // Keep only last 20 entries
  const entries = Object.entries(progress);
  if (entries.length > 20) {
    entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
    const trimmed = Object.fromEntries(entries.slice(0, 20));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }
}

function clearProgress(slug: string) {
  const progress = getProgress();
  delete progress[slug];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function ResumeReading({ slug }: { slug: string }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [savedPosition, setSavedPosition] = useState(0);

  const scrollToPosition = useCallback(() => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = (savedPosition / 100) * docHeight;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
    setShowPrompt(false);
    clearProgress(slug);
  }, [savedPosition, slug]);

  const dismiss = useCallback(() => {
    setShowPrompt(false);
    clearProgress(slug);
  }, [slug]);

  useEffect(() => {
    const progress = getProgress();
    const saved = progress[slug];

    // Show prompt if there's saved progress and it's meaningful
    if (saved && saved.position >= MIN_PROGRESS && saved.position <= MAX_PROGRESS) {
      // Only show if saved within last 7 days
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      if (saved.timestamp > weekAgo) {
        setSavedPosition(saved.position);
        setShowPrompt(true);
      } else {
        clearProgress(slug);
      }
    }

    // Track scroll position
    let lastSaved = 0;
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const pct = Math.round((scrollTop / docHeight) * 100);

      // Save every 5% change, throttled
      if (Math.abs(pct - lastSaved) >= 5 && pct >= MIN_PROGRESS && pct <= MAX_PROGRESS) {
        lastSaved = pct;
        saveProgress(slug, pct);
      }

      // Clear progress when finished reading
      if (pct > MAX_PROGRESS) {
        clearProgress(slug);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [slug]);

  if (!showPrompt) return null;

  return (
    <div className="resume-reading">
      <span>Continue where you left off ({savedPosition}%)?</span>
      <button onClick={scrollToPosition} className="resume-btn">Resume</button>
      <button onClick={dismiss} className="resume-dismiss" aria-label="Dismiss">×</button>
    </div>
  );
}
