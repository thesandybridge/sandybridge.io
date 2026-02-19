import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Uses',
  description: 'Software, hardware, and tools I use daily.',
};

export default function UsesPage() {
  return (
    <>
      <h1>Uses</h1>
      <p>Software, hardware, and tools I use daily for development and everything else.</p>

      <h2>Editor</h2>
      <ul>
        <li>
          <strong>Neovim</strong> — primary editor for everything. Custom Lua config built from scratch with lazy.nvim for plugin management.
          <ul>
            <li>LSP via nvim-lspconfig for TypeScript, Rust, Go, Lua</li>
            <li>Treesitter for syntax highlighting and code navigation</li>
            <li>Telescope for fuzzy finding files, grep, and more</li>
            <li>Harpoon for quick file switching</li>
            <li>Oil.nvim for file management</li>
          </ul>
          <p style={{ marginTop: '0.5rem' }}>
            <Link href="/uses/nvim" className="config-link">Browse my Neovim config →</Link>
          </p>
        </li>
      </ul>

      <h2>Terminal</h2>
      <ul>
        <li><strong>Ghostty</strong> — GPU-accelerated terminal with native feel. Recently switched from Alacritty.</li>
        <li>
          <strong>tmux</strong> — terminal multiplexer for session management and splits.
          <ul>
            <li>Custom prefix (Ctrl-a)</li>
            <li>Vim-style pane navigation</li>
            <li>Session persistence with tmux-resurrect</li>
          </ul>
        </li>
      </ul>

      <h2>Shell</h2>
      <ul>
        <li><strong>Bash</strong> — kept it simple. Custom aliases, functions, and prompt in .bashrc.</li>
        <li><strong>fzf</strong> — fuzzy finder for history, files, and directory navigation.</li>
        <li><strong>ripgrep</strong> — faster grep for code search.</li>
        <li><strong>eza</strong> — modern ls replacement with git integration.</li>
        <li><strong>zoxide</strong> — smarter cd that learns your habits.</li>
      </ul>

      <h2>Browser</h2>
      <ul>
        <li><strong>Zen Browser</strong> — Firefox-based browser focused on privacy and minimal UI.</li>
      </ul>

      <h2>Desktop</h2>
      <ul>
        <li>
          <strong>Arch Linux</strong> — rolling release, minimal base install. btw.
        </li>
        <li>
          <strong>omarchy</strong> — my Hyprland-based desktop environment.
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
        <li><strong>Git</strong> — version control with custom aliases (git lg, git st, etc.)</li>
        <li><strong>Docker</strong> — containerization for local dev and deployment.</li>
        <li><strong>lazygit</strong> — terminal UI for git operations.</li>
        <li><strong>httpie</strong> — better curl for API testing.</li>
      </ul>

      <h2>This Site</h2>
      <ul>
        <li><strong>Next.js 16</strong> — App Router with React Server Components.</li>
        <li><strong>React Three Fiber</strong> — 3D wireframe background animation.</li>
        <li><strong>Shiki</strong> — syntax highlighting with theme support.</li>
        <li><strong>Self-hosted</strong> — running on a home server, deployed with rsync.</li>
        <li><strong>Multi-theme</strong> — Gruvbox, Dracula, Nord, Catppuccin, and more.</li>
      </ul>
    </>
  );
}
