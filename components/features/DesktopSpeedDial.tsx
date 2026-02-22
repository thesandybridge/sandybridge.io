'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, Check, Sun, Moon, Volume2, Volume1, VolumeX, Settings, X } from 'lucide-react';
import { useTheme, THEMES, type Theme } from '../theme/ThemeProvider';
import { getVolume, setVolume, setMuted, isMuted, playSound } from '@/lib/audio';
import s from './DesktopSpeedDial.module.css';

function VolumeIcon({ volume }: { volume: number }) {
  if (volume === 0) return <VolumeX size={13} />;
  if (volume < 0.5) return <Volume1 size={13} />;
  return <Volume2 size={13} />;
}

export function DesktopSpeedDial() {
  const [open, setOpen] = useState(false);
  const [vol, setVol] = useState(0.5);
  const { theme, setTheme, mode, toggleMode } = useTheme();
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVol(getVolume());
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest(`.${s.dial}`)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value) / 100;
    setVolume(v);
    setVol(v);
  }, []);

  const handleVolumeMuteToggle = useCallback(() => {
    if (isMuted()) {
      setMuted(false);
      setVol(getVolume());
      playSound('click');
    } else {
      setMuted(true);
      setVol(0);
    }
  }, []);

  const handleModeToggle = useCallback(() => {
    playSound('select');
    toggleMode();
  }, [toggleMode]);

  const handleThemeSelect = useCallback((themeId: Theme) => {
    playSound('select');
    setTheme(themeId);
    clearTimeout(previewTimeoutRef.current);
  }, [setTheme]);

  const handlePreviewEnter = useCallback((t: Theme) => {
    clearTimeout(previewTimeoutRef.current);
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  const handlePreviewLeave = useCallback(() => {
    previewTimeoutRef.current = setTimeout(() => {
      document.documentElement.setAttribute('data-theme', theme);
    }, 50);
  }, [theme]);

  const handleClose = useCallback(() => {
    clearTimeout(previewTimeoutRef.current);
    document.documentElement.setAttribute('data-theme', theme);
    setOpen(false);
  }, [theme]);

  return (
    <div className={s.dial}>
      {open && (
        <div className={s.panel} ref={panelRef}>
          {/* Volume control */}
          <div className={s.volume}>
            <button
              className={s.volIcon}
              onClick={handleVolumeMuteToggle}
              title={vol === 0 ? 'Unmute' : 'Mute'}
              aria-label={vol === 0 ? 'Unmute' : 'Mute'}
            >
              <VolumeIcon volume={vol} />
            </button>
            <input
              type="range"
              className={s.slider}
              min={0}
              max={100}
              value={Math.round(vol * 100)}
              onChange={handleVolumeChange}
              aria-label="Volume"
            />
          </div>

          <div className={s.separator} />

          {/* Action row */}
          <div className={s.row}>
            <button
              className={s.action}
              onClick={handleModeToggle}
              title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={mode === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {mode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              className={`${s.action} ${s.close}`}
              onClick={handleClose}
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>

          <div className={s.separator} />

          {/* Theme list */}
          <div className={s.themes}>
            {THEMES.map((t) => (
              <button
                key={t.id}
                className={`${s.themeItem}${theme === t.id ? ` ${s.themeItemActive}` : ''}`}
                onClick={() => handleThemeSelect(t.id)}
                onMouseEnter={() => handlePreviewEnter(t.id)}
                onMouseLeave={handlePreviewLeave}
              >
                {t.name}
                {theme === t.id && <Check size={12} />}
              </button>
            ))}
          </div>

          <div className={s.separator} />

          <Link
            href="/uses/theme"
            className={s.more}
            onClick={() => setOpen(false)}
          >
            <Settings size={12} />
            More settings
          </Link>
        </div>
      )}

      <button
        className={`${s.fab}${open ? ` ${s.fabOpen}` : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close settings' : 'Open settings'}
        aria-expanded={open}
      >
        <SlidersHorizontal size={15} />
      </button>
    </div>
  );
}
