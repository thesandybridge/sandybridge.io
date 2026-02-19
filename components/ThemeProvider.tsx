'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Theme = 'gruvbox' | 'dracula' | 'nord' | 'catppuccin' | 'one-dark' | 'solarized' | 'prism' | 'oil-spill';
export type Mode = 'light' | 'dark';

export const THEMES: { id: Theme; name: string }[] = [
  { id: 'gruvbox', name: "Sandy's Theme" },
  { id: 'dracula', name: 'Dracula' },
  { id: 'nord', name: 'Nord' },
  { id: 'catppuccin', name: 'Catppuccin' },
  { id: 'one-dark', name: 'One Dark' },
  { id: 'solarized', name: 'Solarized' },
  { id: 'prism', name: 'Prism' },
  { id: 'oil-spill', name: 'Oil Spill' },
];

export interface ThemeColors {
  primary: string;
  primaryHex: number;
  background: string;
  backgroundHex: number;
  accent: string;
  accentHex: number;
  accentRgb: string;
}

export const THEME_COLORS: Record<Theme, Record<Mode, ThemeColors>> = {
  gruvbox: {
    dark: {
      primary: '#928374',
      primaryHex: 0x928374,
      background: '#151515',
      backgroundHex: 0x151515,
      accent: '#d79921',
      accentHex: 0xd79921,
      accentRgb: '215, 153, 33',
    },
    light: {
      primary: '#504945',
      primaryHex: 0x504945,
      background: '#fbf1c7',
      backgroundHex: 0xfbf1c7,
      accent: '#b57614',
      accentHex: 0xb57614,
      accentRgb: '181, 118, 20',
    },
  },
  dracula: {
    dark: {
      primary: '#f8f8f2',
      primaryHex: 0xf8f8f2,
      background: '#282a36',
      backgroundHex: 0x282a36,
      accent: '#bd93f9',
      accentHex: 0xbd93f9,
      accentRgb: '189, 147, 249',
    },
    light: {
      primary: '#282a36',
      primaryHex: 0x282a36,
      background: '#f8f8f2',
      backgroundHex: 0xf8f8f2,
      accent: '#9d6dd0',
      accentHex: 0x9d6dd0,
      accentRgb: '157, 109, 208',
    },
  },
  nord: {
    dark: {
      primary: '#d8dee9',
      primaryHex: 0xd8dee9,
      background: '#2e3440',
      backgroundHex: 0x2e3440,
      accent: '#88c0d0',
      accentHex: 0x88c0d0,
      accentRgb: '136, 192, 208',
    },
    light: {
      primary: '#2e3440',
      primaryHex: 0x2e3440,
      background: '#eceff4',
      backgroundHex: 0xeceff4,
      accent: '#5e81ac',
      accentHex: 0x5e81ac,
      accentRgb: '94, 129, 172',
    },
  },
  catppuccin: {
    dark: {
      primary: '#cdd6f4',
      primaryHex: 0xcdd6f4,
      background: '#1e1e2e',
      backgroundHex: 0x1e1e2e,
      accent: '#cba6f7',
      accentHex: 0xcba6f7,
      accentRgb: '203, 166, 247',
    },
    light: {
      primary: '#4c4f69',
      primaryHex: 0x4c4f69,
      background: '#eff1f5',
      backgroundHex: 0xeff1f5,
      accent: '#8839ef',
      accentHex: 0x8839ef,
      accentRgb: '136, 57, 239',
    },
  },
  'one-dark': {
    dark: {
      primary: '#abb2bf',
      primaryHex: 0xabb2bf,
      background: '#282c34',
      backgroundHex: 0x282c34,
      accent: '#56b6c2',
      accentHex: 0x56b6c2,
      accentRgb: '86, 182, 194',
    },
    light: {
      primary: '#383a42',
      primaryHex: 0x383a42,
      background: '#fafafa',
      backgroundHex: 0xfafafa,
      accent: '#0184bc',
      accentHex: 0x0184bc,
      accentRgb: '1, 132, 188',
    },
  },
  solarized: {
    dark: {
      primary: '#839496',
      primaryHex: 0x839496,
      background: '#002b36',
      backgroundHex: 0x002b36,
      accent: '#b58900',
      accentHex: 0xb58900,
      accentRgb: '181, 137, 0',
    },
    light: {
      primary: '#657b83',
      primaryHex: 0x657b83,
      background: '#fdf6e3',
      backgroundHex: 0xfdf6e3,
      accent: '#b58900',
      accentHex: 0xb58900,
      accentRgb: '181, 137, 0',
    },
  },
  prism: {
    dark: {
      primary: '#d0d0d0',
      primaryHex: 0xd0d0d0,
      background: '#0a0a0c',
      backgroundHex: 0x0a0a0c,
      accent: '#e8b4d8',
      accentHex: 0xe8b4d8,
      accentRgb: '232, 180, 216',
    },
    light: {
      primary: '#2a2a2a',
      primaryHex: 0x2a2a2a,
      background: '#fefefe',
      backgroundHex: 0xfefefe,
      accent: '#d946ef',
      accentHex: 0xd946ef,
      accentRgb: '217, 70, 239',
    },
  },
  'oil-spill': {
    dark: {
      primary: '#b0c4c8',
      primaryHex: 0xb0c4c8,
      background: '#08080c',
      backgroundHex: 0x08080c,
      accent: '#4a9ca8',
      accentHex: 0x4a9ca8,
      accentRgb: '74, 156, 168',
    },
    light: {
      primary: '#1a3a40',
      primaryHex: 0x1a3a40,
      background: '#f0f8f8',
      backgroundHex: 0xf0f8f8,
      accent: '#2d7a87',
      accentHex: 0x2d7a87,
      accentRgb: '45, 122, 135',
    },
  },
};

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  toggleMode: () => void;
  themes: typeof THEMES;
  colors: ThemeColors;
}>({
  theme: 'gruvbox',
  setTheme: () => {},
  mode: 'dark',
  setMode: () => {},
  toggleMode: () => {},
  themes: THEMES,
  colors: THEME_COLORS.gruvbox.dark,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('gruvbox');
  const [mode, setModeState] = useState<Mode>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const savedMode = localStorage.getItem('mode') as Mode | null;

    if (savedTheme && THEMES.some((t) => t.id === savedTheme)) {
      setThemeState(savedTheme);
    }
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      setModeState(savedMode);
      document.documentElement.setAttribute('data-mode', savedMode);
    }
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem('theme', t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    localStorage.setItem('mode', m);
    document.documentElement.setAttribute('data-mode', m);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  const colors = THEME_COLORS[theme][mode];

  const value = useMemo(
    () => ({ theme, setTheme, mode, setMode, toggleMode, themes: THEMES, colors }),
    [theme, setTheme, mode, setMode, toggleMode, colors]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
