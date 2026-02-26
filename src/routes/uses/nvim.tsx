import { createFileRoute, Link } from '@tanstack/react-router'
import { NvimConfigExplorer } from '~/components/features'
import pm from '~/components/blog/post-meta.module.css'

export const Route = createFileRoute('/uses/nvim')({
  head: () => ({
    meta: [
      { title: 'Neovim Config | sandybridge.io' },
      { name: 'description', content: 'Browse my Neovim configuration files.' },
    ],
  }),
  component: NvimConfigPage,
})

function NvimConfigPage() {
  return (
    <>
      <p style={{ marginBottom: '0.5rem' }}>
        <Link to="/uses" className={pm.backLink}>&larr; Back to Uses</Link>
      </p>
      <h1>Neovim Config</h1>
      <p>
        My Neovim configuration built with Lua and lazy.nvim. Click on any file to view its contents.
        Feel free to copy anything you find useful.
      </p>
      <NvimConfigExplorer />
    </>
  )
}
