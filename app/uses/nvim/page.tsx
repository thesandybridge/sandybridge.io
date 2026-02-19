import type { Metadata } from 'next';
import Link from 'next/link';
import { NvimConfigExplorer } from '@/components/NvimConfigExplorer';

export const metadata: Metadata = {
  title: 'Neovim Config',
  description: 'Browse my Neovim configuration files.',
};

export default function NvimConfigPage() {
  return (
    <>
      <p style={{ marginBottom: '0.5rem' }}>
        <Link href="/uses" className="back-link">← Back to Uses</Link>
      </p>
      <h1>Neovim Config</h1>
      <p>
        My Neovim configuration built with Lua and lazy.nvim. Click on any file to view its contents.
        Feel free to copy anything you find useful.
      </p>
      <NvimConfigExplorer />
    </>
  );
}
