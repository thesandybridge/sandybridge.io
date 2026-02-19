'use client';

import { useTheme, THEMES, PARTICLE_DENSITIES } from './ThemeProvider';
import { Check, Sun, Moon, Sparkles } from 'lucide-react';

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

  return (
    <div className="theme-settings">
      <section className="theme-settings-section">
        <h2>Color Theme</h2>
        <p>Choose your preferred color scheme.</p>
        <div className="theme-settings-grid">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`theme-settings-option${theme === t.id ? ' active' : ''}`}
              onClick={() => setTheme(t.id)}
              data-theme-preview={t.id}
            >
              <span className="theme-settings-option-name">{t.name}</span>
              {theme === t.id && <Check size={16} />}
            </button>
          ))}
        </div>
      </section>

      <section className="theme-settings-section">
        <h2>Appearance</h2>
        <p>Toggle between light and dark mode.</p>
        <div className="theme-settings-row">
          <button
            className={`theme-settings-toggle${mode === 'dark' ? ' active' : ''}`}
            onClick={() => mode !== 'dark' && toggleMode()}
          >
            <Moon size={16} />
            <span>Dark</span>
          </button>
          <button
            className={`theme-settings-toggle${mode === 'light' ? ' active' : ''}`}
            onClick={() => mode !== 'light' && toggleMode()}
          >
            <Sun size={16} />
            <span>Light</span>
          </button>
        </div>
      </section>

      <section className="theme-settings-section">
        <h2>Particle Effects</h2>
        <p>Control the cursor particle density.</p>
        <div className="theme-settings-row">
          {PARTICLE_DENSITIES.map((d) => (
            <button
              key={d.id}
              className={`theme-settings-toggle${particleDensity === d.id ? ' active' : ''}`}
              onClick={() => setParticleDensity(d.id)}
            >
              {d.id === 'off' ? null : <Sparkles size={14} />}
              <span>{d.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="theme-settings-section">
        <h2>Cursor Trail</h2>
        <p>Enable a trailing effect that follows your cursor.</p>
        <div className="theme-settings-row">
          <button
            className={`theme-settings-toggle${!cursorTrail ? ' active' : ''}`}
            onClick={() => setCursorTrail(false)}
          >
            <span>Off</span>
          </button>
          <button
            className={`theme-settings-toggle${cursorTrail ? ' active' : ''}`}
            onClick={() => setCursorTrail(true)}
          >
            <span>On</span>
          </button>
        </div>
      </section>
    </div>
  );
}
