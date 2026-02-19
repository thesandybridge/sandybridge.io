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
