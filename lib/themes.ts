export type Theme = 'gruvbox' | 'dracula' | 'alucard' | 'nord' | 'catppuccin' | 'one-dark' | 'solarized' | 'prism' | 'oil-spill';
export type Mode = 'light' | 'dark';

export interface ThemeConfig {
  id: Theme;
  name: string;
  aliases: string[];
}

export const THEMES: ThemeConfig[] = [
  { id: 'gruvbox', name: "Sandy's Theme", aliases: ['grub', 'sandy'] },
  { id: 'dracula', name: 'Dracula', aliases: ['drac'] },
  { id: 'alucard', name: 'Alucard', aliases: ['alu'] },
  { id: 'nord', name: 'Nord', aliases: [] },
  { id: 'catppuccin', name: 'Catppuccin', aliases: ['cat', 'ctp'] },
  { id: 'one-dark', name: 'One Dark', aliases: ['od', 'onedark'] },
  { id: 'solarized', name: 'Solarized', aliases: ['sol', 'solar'] },
  { id: 'prism', name: 'Prism', aliases: [] },
  { id: 'oil-spill', name: 'Oil Spill', aliases: ['oil'] },
];

export const THEME_IDS = THEMES.map(t => t.id);

// Map of all valid inputs (id + aliases) to theme id
export const THEME_LOOKUP: Record<string, Theme> = THEMES.reduce((acc, t) => {
  acc[t.id] = t.id;
  t.aliases.forEach(alias => { acc[alias] = t.id; });
  return acc;
}, {} as Record<string, Theme>);

// Background colors for each theme/mode (used for initial page load)
export const THEME_BACKGROUNDS: Record<Theme, Record<Mode, string>> = {
  gruvbox: { dark: '#151515', light: '#fbf1c7' },
  dracula: { dark: '#282a36', light: '#f8f8f2' },
  alucard: { dark: '#0a0a0f', light: '#f8f8f2' },
  nord: { dark: '#2e3440', light: '#eceff4' },
  catppuccin: { dark: '#1e1e2e', light: '#eff1f5' },
  'one-dark': { dark: '#282c34', light: '#fafafa' },
  solarized: { dark: '#002b36', light: '#fdf6e3' },
  prism: { dark: '#0a0a0c', light: '#fefefe' },
  'oil-spill': { dark: '#08080c', light: '#f0f8f8' },
};

// Generate inline script for initial theme (prevents flash)
// Reads from cookies first (for cross-subdomain sharing), falls back to localStorage
export function generateThemeScript(): string {
  const bgJson = JSON.stringify(THEME_BACKGROUNDS);
  return `(function(){
    function gc(n){var m=document.cookie.match(new RegExp('(^| )'+n+'=([^;]+)'));return m?decodeURIComponent(m[2]):null;}
    var t=gc('theme')||localStorage.getItem('theme')||'gruvbox';
    var m=gc('mode')||localStorage.getItem('mode');
    if(!m){m=window.matchMedia&&window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark';}
    document.documentElement.setAttribute('data-theme',t);
    document.documentElement.setAttribute('data-mode',m);
    var bg=${bgJson};
    var c=bg[t]&&bg[t][m]?bg[t][m]:bg.gruvbox[m];
    document.documentElement.style.backgroundColor=c;
  })();`;
}
