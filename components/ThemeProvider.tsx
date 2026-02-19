'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'gruvbox' | 'dracula' | 'nord' | 'catppuccin' | 'one-dark' | 'solarized';

export const THEMES: { id: Theme; name: string }[] = [
  { id: 'gruvbox', name: "Sandy's Theme" },
  { id: 'dracula', name: 'Dracula' },
  { id: 'nord', name: 'Nord' },
  { id: 'catppuccin', name: 'Catppuccin' },
  { id: 'one-dark', name: 'One Dark' },
  { id: 'solarized', name: 'Solarized' },
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

export const THEME_COLORS: Record<Theme, ThemeColors> = {
  gruvbox: {
    primary: '#928374',
    primaryHex: 0x928374,
    background: '#151515',
    backgroundHex: 0x151515,
    accent: '#d79921',
    accentHex: 0xd79921,
    accentRgb: '215, 153, 33',
  },
  dracula: {
    primary: '#f8f8f2',
    primaryHex: 0xf8f8f2,
    background: '#282a36',
    backgroundHex: 0x282a36,
    accent: '#bd93f9',
    accentHex: 0xbd93f9,
    accentRgb: '189, 147, 249',
  },
  nord: {
    primary: '#d8dee9',
    primaryHex: 0xd8dee9,
    background: '#2e3440',
    backgroundHex: 0x2e3440,
    accent: '#88c0d0',
    accentHex: 0x88c0d0,
    accentRgb: '136, 192, 208',
  },
  catppuccin: {
    primary: '#cdd6f4',
    primaryHex: 0xcdd6f4,
    background: '#1e1e2e',
    backgroundHex: 0x1e1e2e,
    accent: '#cba6f7',
    accentHex: 0xcba6f7,
    accentRgb: '203, 166, 247',
  },
  'one-dark': {
    primary: '#abb2bf',
    primaryHex: 0xabb2bf,
    background: '#282c34',
    backgroundHex: 0x282c34,
    accent: '#c678dd',
    accentHex: 0xc678dd,
    accentRgb: '198, 120, 221',
  },
  solarized: {
    primary: '#839496',
    primaryHex: 0x839496,
    background: '#002b36',
    backgroundHex: 0x002b36,
    accent: '#b58900',
    accentHex: 0xb58900,
    accentRgb: '181, 137, 0',
  },
};

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  themes: typeof THEMES;
  colors: ThemeColors;
}>({
  theme: 'gruvbox',
  setTheme: () => {},
  themes: THEMES,
  colors: THEME_COLORS.gruvbox,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('gruvbox');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved && THEMES.some((t) => t.id === saved)) {
      setThemeState(saved);
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('theme', t);
    document.documentElement.setAttribute('data-theme', t);
  };

  const colors = THEME_COLORS[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
