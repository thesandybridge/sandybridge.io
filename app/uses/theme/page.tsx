import type { Metadata } from 'next';
import { ThemeSettings } from '@/components/theme';

export const metadata: Metadata = {
  title: 'Theme Settings',
  description: 'Customize your visual experience with themes, colors, and effects.',
};

export default function ThemeSettingsPage() {
  return (
    <>
      <h1>Theme Settings</h1>
      <p>Customize your visual experience. Changes are saved automatically.</p>
      <ThemeSettings />
    </>
  );
}
