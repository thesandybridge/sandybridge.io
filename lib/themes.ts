export type Theme = 'gruvbox' | 'dracula' | 'alucard' | 'nord' | 'catppuccin' | 'one-dark' | 'solarized' | 'prism' | 'oil-spill';
export type Mode = 'light' | 'dark';

export const THEMES: { id: Theme; name: string }[] = [
  { id: 'gruvbox', name: "Sandy's Theme" },
  { id: 'dracula', name: 'Dracula' },
  { id: 'alucard', name: 'Alucard' },
  { id: 'nord', name: 'Nord' },
  { id: 'catppuccin', name: 'Catppuccin' },
  { id: 'one-dark', name: 'One Dark' },
  { id: 'solarized', name: 'Solarized' },
  { id: 'prism', name: 'Prism' },
  { id: 'oil-spill', name: 'Oil Spill' },
];

export const THEME_IDS = THEMES.map(t => t.id);
