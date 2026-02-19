'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Briefcase, BookOpen, Wrench, Palette, Check, Sun, Moon, Search } from 'lucide-react';
import { useTheme, THEMES } from '../theme/ThemeProvider';
import { haptic } from '@/lib/haptics';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/uses', label: 'Uses', icon: Wrench },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme, mode, toggleMode } = useTheme();

  const toggleMenu = useCallback(() => {
    haptic('light');
    setIsOpen((prev) => !prev);
    setShowThemes(false);
  }, []);

  const toggleThemes = useCallback(() => {
    haptic('light');
    setShowThemes((prev) => !prev);
  }, []);

  const handleNavClick = useCallback(() => {
    haptic('light');
    setIsOpen(false);
    setShowThemes(false);
  }, []);

  const handleThemeSelect = useCallback((themeId: typeof theme) => {
    haptic('medium');
    setTheme(themeId);
    setShowThemes(false);
    setIsOpen(false);
  }, [setTheme]);

  const handleModeToggle = useCallback(() => {
    haptic('medium');
    toggleMode();
    setIsOpen(false);
  }, [toggleMode]);

  const handleSearchClick = useCallback(() => {
    haptic('light');
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('open-mobile-search'));
  }, []);

  return (
    <div className="mobile-nav">
      {/* Backdrop */}
      {isOpen && <div className="mobile-nav-backdrop" onClick={toggleMenu} />}

      {/* Speed dial items */}
      <div className={`mobile-nav-items ${isOpen ? 'open' : ''}`}>
        {showThemes ? (
          // Theme selection
          <>
            {THEMES.map((t, i) => (
              <button
                key={t.id}
                className={`mobile-nav-pill theme-pill ${theme === t.id ? 'active' : ''}`}
                style={{ transitionDelay: `${i * 30}ms` }}
                onClick={() => handleThemeSelect(t.id)}
              >
                {theme === t.id && <Check size={14} />}
                <span>{t.name}</span>
              </button>
            ))}
            <button
              className="mobile-nav-pill back-pill"
              style={{ transitionDelay: `${THEMES.length * 30}ms` }}
              onClick={toggleThemes}
            >
              <X size={14} />
              <span>Back</span>
            </button>
          </>
        ) : (
          // Main navigation
          <>
            {navItems.map((item, i) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mobile-nav-pill ${isActive ? 'active' : ''}`}
                  style={{ transitionDelay: `${i * 30}ms` }}
                  onClick={handleNavClick}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              className="mobile-nav-pill"
              style={{ transitionDelay: `${navItems.length * 30}ms` }}
              onClick={handleSearchClick}
            >
              <Search size={14} />
              <span>Search</span>
            </button>
            <button
              className="mobile-nav-pill"
              style={{ transitionDelay: `${(navItems.length + 1) * 30}ms` }}
              onClick={handleModeToggle}
            >
              {mode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              <span>{mode === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <button
              className="mobile-nav-pill"
              style={{ transitionDelay: `${(navItems.length + 2) * 30}ms` }}
              onClick={toggleThemes}
            >
              <Palette size={14} />
              <span>Theme</span>
            </button>
          </>
        )}
      </div>

      {/* FAB button */}
      <button
        className={`mobile-nav-fab ${isOpen ? 'open' : ''}`}
        onClick={toggleMenu}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
}
