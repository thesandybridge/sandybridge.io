import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/uses/')({
  head: () => ({
    meta: [
      { title: 'Uses | sandybridge.io' },
      { name: 'description', content: 'Software, hardware, and tools I use daily.' },
    ],
  }),
  component: UsesPage,
})

function UsesPage() {
  return (
    <>
      <h1>Uses</h1>
      <p>Software, hardware, and tools I use daily for development and everything else.</p>

      <h2>Editor</h2>
      <ul>
        <li>
          <strong>Neovim</strong> &mdash; primary editor for everything. Custom Lua config built from scratch with lazy.nvim for plugin management.
          <ul>
            <li>LSP via nvim-lspconfig for TypeScript, Rust, Go, Lua</li>
            <li>Treesitter for syntax highlighting and code navigation</li>
            <li>Telescope for fuzzy finding files, grep, and more</li>
            <li>Harpoon for quick file switching</li>
            <li>Oil.nvim for file management</li>
          </ul>
          <p style={{ marginTop: '0.5rem' }}>
            <a href="/uses/nvim" className="config-link">Browse my Neovim config &rarr;</a>
          </p>
        </li>
      </ul>

      <h2>Terminal</h2>
      <ul>
        <li><strong>Ghostty</strong> &mdash; GPU-accelerated terminal with native feel. Recently switched from Alacritty.</li>
        <li>
          <strong>tmux</strong> &mdash; terminal multiplexer for session management and splits.
          <ul>
            <li>Custom prefix (Ctrl-a)</li>
            <li>Vim-style pane navigation</li>
            <li>Session persistence with tmux-resurrect</li>
          </ul>
        </li>
      </ul>

      <h2>Shell</h2>
      <ul>
        <li><strong>Bash</strong> &mdash; kept it simple. Custom aliases, functions, and prompt in .bashrc.</li>
        <li><strong>fzf</strong> &mdash; fuzzy finder for history, files, and directory navigation.</li>
        <li><strong>ripgrep</strong> &mdash; faster grep for code search.</li>
        <li><strong>eza</strong> &mdash; modern ls replacement with git integration.</li>
        <li><strong>zoxide</strong> &mdash; smarter cd that learns your habits.</li>
      </ul>

      <h2>Browser</h2>
      <ul>
        <li><strong>Zen Browser</strong> &mdash; Firefox-based browser focused on privacy and minimal UI.</li>
      </ul>

      <h2>Desktop</h2>
      <ul>
        <li><strong>Arch Linux</strong> &mdash; rolling release, minimal base install. btw.</li>
        <li>
          <strong>omarchy</strong> &mdash; my Hyprland-based desktop environment.
          <ul>
            <li>Hyprland for Wayland compositor with animations</li>
            <li>Waybar for status bar</li>
            <li>Walker for application launcher</li>
            <li>Mako for notifications</li>
          </ul>
        </li>
      </ul>

      <h2>Dev Tools</h2>
      <ul>
        <li><strong>Git</strong> &mdash; version control with custom aliases (git lg, git st, etc.)</li>
        <li><strong>Docker</strong> &mdash; containerization for local dev and deployment.</li>
        <li><strong>lazygit</strong> &mdash; terminal UI for git operations.</li>
        <li><strong>httpie</strong> &mdash; better curl for API testing.</li>
      </ul>

      <h2>This Site</h2>
      <ul>
        <li><strong>TanStack Start</strong> &mdash; with Vite and React 19.</li>
        <li><strong>React Three Fiber</strong> &mdash; 3D wireframe background animation.</li>
        <li><strong>Shiki</strong> &mdash; syntax highlighting with theme support.</li>
        <li><strong>Railway</strong> &mdash; hosted on Railway with Redis for caching.</li>
        <li>
          <strong>Multi-theme</strong> &mdash; Gruvbox, Dracula, Nord, Catppuccin, and more.
          <p style={{ marginTop: '0.5rem' }}>
            <Link to="/uses/theme" className="config-link">Customize theme settings &rarr;</Link>
          </p>
        </li>
      </ul>
    </>
  )
}
