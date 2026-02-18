import type { Metadata } from 'next';

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
        <li><strong>Neovim</strong> — primary editor for everything. Custom Lua config with LSP, Treesitter, and Telescope.</li>
      </ul>

      <h2>Terminal</h2>
      <ul>
        <li><strong>Alacritty</strong> — GPU-accelerated terminal emulator. Fast and minimal.</li>
        <li><strong>tmux</strong> — terminal multiplexer for session management and splits.</li>
      </ul>

      <h2>Shell</h2>
      <ul>
        <li><strong>Bash</strong> — kept it simple. Custom aliases and functions in .bashrc.</li>
      </ul>

      <h2>Browser</h2>
      <ul>
        <li><strong>Zen Browser</strong> — Firefox-based browser focused on privacy and minimal UI.</li>
      </ul>

      <h2>Desktop</h2>
      <ul>
        <li><strong>Arch Linux</strong> — rolling release, minimal base install.</li>
        <li><strong>omarchy</strong> — Hyprland-based desktop environment with Waybar, Walker, and Mako.</li>
      </ul>

      <h2>This Site</h2>
      <ul>
        <li><strong>Next.js 16</strong> — App Router with React Server Components.</li>
        <li><strong>React Three Fiber</strong> — 3D wireframe background animation.</li>
        <li><strong>Shiki</strong> — syntax highlighting with Gruvbox dark theme.</li>
        <li><strong>Self-hosted</strong> — running on a home server, deployed with rsync.</li>
        <li><strong>Gruvbox dark</strong> — color scheme across the entire site.</li>
      </ul>
    </>
  );
}
