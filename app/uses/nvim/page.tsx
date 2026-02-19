import type { Metadata } from 'next';
import { NvimConfigExplorer } from '@/components/NvimConfigExplorer';

export const metadata: Metadata = {
  title: 'Neovim Config',
  description: 'Browse my Neovim configuration files.',
};

export default function NvimConfigPage() {
  return (
    <>
      <h1>Neovim Config</h1>
      <p>
        My Neovim configuration built with Lua and lazy.nvim. Click on any file to view its contents.
        Feel free to copy anything you find useful.
      </p>
      <NvimConfigExplorer />
    </>
  );
}
