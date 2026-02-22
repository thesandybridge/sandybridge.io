'use client';

import { useCallback, useRef } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Palette, Check, Sun, Moon, Settings } from 'lucide-react';
import Link from 'next/link';
import { useTheme, type Theme } from './ThemeProvider';
import { cx } from '@/lib/cx';
import s from './ThemePicker.module.css';

export function ThemePicker() {
  const { theme, setTheme, themes, mode, toggleMode } = useTheme();
  const previewTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  const handleSelect = useCallback((e: Event) => {
    const target = e.currentTarget as HTMLElement;
    const themeId = target.dataset.theme as Theme;
    if (themeId) setTheme(themeId);
  }, [setTheme]);

  const handlePreviewEnter = useCallback((previewTheme: Theme) => {
    clearTimeout(previewTimeoutRef.current);
    document.documentElement.setAttribute('data-theme', previewTheme);
  }, []);

  const handlePreviewLeave = useCallback(() => {
    previewTimeoutRef.current = setTimeout(() => {
      document.documentElement.setAttribute('data-theme', theme);
    }, 50);
  }, [theme]);

  const handleMenuClose = useCallback(() => {
    clearTimeout(previewTimeoutRef.current);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <DropdownMenu.Root modal={false} onOpenChange={(open) => !open && handleMenuClose()}>
      <DropdownMenu.Trigger className={s.themeTrigger} aria-label="Select theme">
        <Palette size={16} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className={s.themeMenu} sideOffset={8} align="end">
          <DropdownMenu.Item className={cx(s.themeItem, s.modeToggle)} onSelect={toggleMode}>
            {mode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </DropdownMenu.Item>
          <DropdownMenu.Separator className={s.themeSeparator} />
          {themes.map((t) => (
            <DropdownMenu.Item
              key={t.id}
              className={s.themeItem}
              data-theme={t.id}
              onSelect={handleSelect}
              onMouseEnter={() => handlePreviewEnter(t.id)}
              onMouseLeave={handlePreviewLeave}
            >
              {t.name}
              {theme === t.id && <Check size={14} />}
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className={s.themeSeparator} />
          <DropdownMenu.Item className={s.themeItem} asChild>
            <Link href="/uses/theme">
              <Settings size={14} />
              More Settings
            </Link>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
