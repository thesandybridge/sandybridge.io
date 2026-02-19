'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Palette, Check } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemePicker() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger className="theme-trigger" aria-label="Select theme">
        <Palette size={16} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="theme-menu" sideOffset={8} align="end">
          {themes.map((t) => (
            <DropdownMenu.Item
              key={t.id}
              className="theme-item"
              onSelect={() => setTheme(t.id)}
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
