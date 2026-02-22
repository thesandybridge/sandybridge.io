'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme, THEMES, PARTICLE_DENSITIES } from './ThemeProvider';
import { Check, Sun, Moon, Sparkles, Volume2, Volume1, VolumeX } from 'lucide-react';
import { getVolume, setVolume, setMuted, isMuted, playSound } from '@/lib/audio';
import { cx } from '@/lib/cx';
import s from './ThemeSettings.module.css';

function VolumeIcon({ volume }: { volume: number }) {
  if (volume === 0) return <VolumeX size={16} />;
  if (volume < 0.5) return <Volume1 size={16} />;
  return <Volume2 size={16} />;
}

export function ThemeSettings() {
  const {
    theme,
    setTheme,
    mode,
    toggleMode,
    particleDensity,
    setParticleDensity,
    cursorTrail,
    setCursorTrail,
  } = useTheme();

  const [vol, setVol] = useState(0.5);

  useEffect(() => {
    setVol(getVolume());
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value) / 100;
    setVolume(v);
    setVol(v);
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (isMuted()) {
      setMuted(false);
      setVol(getVolume());
      playSound('click');
    } else {
      setMuted(true);
      setVol(0);
    }
  }, []);

  return (
    <div className={s.themeSettings}>
      <section className={s.themeSettingsSection}>
        <h2>Color Theme</h2>
        <p>Choose your preferred color scheme.</p>
        <div className={s.themeSettingsGrid}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={cx(s.themeSettingsOption, theme === t.id && s.active)}
              onClick={() => setTheme(t.id)}
              data-theme-preview={t.id}
            >
              <span className={s.themeSettingsOptionName}>{t.name}</span>
              {theme === t.id && <Check size={16} />}
            </button>
          ))}
        </div>
      </section>

      <section className={s.themeSettingsSection}>
        <h2>Appearance</h2>
        <p>Toggle between light and dark mode.</p>
        <div className={s.themeSettingsRow}>
          <button
            className={cx(s.themeSettingsToggle, mode === 'dark' && s.active)}
            onClick={() => mode !== 'dark' && toggleMode()}
          >
            <Moon size={16} />
            <span>Dark</span>
          </button>
          <button
            className={cx(s.themeSettingsToggle, mode === 'light' && s.active)}
            onClick={() => mode !== 'light' && toggleMode()}
          >
            <Sun size={16} />
            <span>Light</span>
          </button>
        </div>
      </section>

      <section className={s.themeSettingsSection}>
        <h2>Particle Effects</h2>
        <p>Control the cursor particle density.</p>
        <div className={s.themeSettingsRow}>
          {PARTICLE_DENSITIES.map((d) => (
            <button
              key={d.id}
              className={cx(s.themeSettingsToggle, particleDensity === d.id && s.active)}
              onClick={() => setParticleDensity(d.id)}
            >
              {d.id === 'off' ? null : <Sparkles size={14} />}
              <span>{d.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={s.themeSettingsSection}>
        <h2>Cursor Trail</h2>
        <p>Enable a trailing effect that follows your cursor.</p>
        <div className={s.themeSettingsRow}>
          <button
            className={cx(s.themeSettingsToggle, !cursorTrail && s.active)}
            onClick={() => setCursorTrail(false)}
          >
            <span>Off</span>
          </button>
          <button
            className={cx(s.themeSettingsToggle, cursorTrail && s.active)}
            onClick={() => setCursorTrail(true)}
          >
            <span>On</span>
          </button>
        </div>
      </section>

      <section className={s.themeSettingsSection}>
        <h2>Sound Effects</h2>
        <p>Adjust UI sound volume.</p>
        <div className={s.volumeControl}>
          <button
            className={s.volumeIcon}
            onClick={handleMuteToggle}
            title={vol === 0 ? 'Unmute' : 'Mute'}
            aria-label={vol === 0 ? 'Unmute' : 'Mute'}
          >
            <VolumeIcon volume={vol} />
          </button>
          <input
            type="range"
            className={s.volumeSlider}
            min={0}
            max={100}
            value={Math.round(vol * 100)}
            onChange={handleVolumeChange}
            aria-label="Volume"
          />
          <span className={s.volumeValue}>{Math.round(vol * 100)}%</span>
        </div>
      </section>
    </div>
  );
}
