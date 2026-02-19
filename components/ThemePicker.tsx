'use client';

import { useCallback } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Palette, Check, Sun, Moon } from 'lucide-react';
import { useTheme, type Theme } from './ThemeProvider';

export function ThemePicker() {
  const { theme, setTheme, themes, mode, toggleMode } = useTheme();

  const handleSelect = useCallback((e: Event) => {
    const target = e.currentTarget as HTMLElement;
    const themeId = target.dataset.theme as Theme;
    if (themeId) setTheme(themeId);
  }, [setTheme]);

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger className="theme-trigger" aria-label="Select theme">
        <Palette size={16} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="theme-menu" sideOffset={8} align="end">
          <DropdownMenu.Item className="theme-item mode-toggle" onSelect={toggleMode}>
            {mode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="theme-separator" />
          {themes.map((t) => (
            <DropdownMenu.Item
              key={t.id}
              className="theme-item"
              data-theme={t.id}
              onSelect={handleSelect}
            >
              {t.name}
              {theme === t.id && <Check size={14} />}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
