import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sanitizeHtml from 'sanitize-html';
import { getAllPosts } from '@/lib/content';
import { THEMES, THEME_LOOKUP } from '@/lib/themes';

export const runtime = 'nodejs';

interface CommandResponse {
  action?: string;
  url?: string;
  message?: string;
  theme?: string;
}

const items = ['blog', 'home', 'portfolio', 'uses'];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getPostIndex(): { slug: string; title: string; date: string; tags: string[]; dir: string }[] {
  const blogPosts = getAllPosts('blog').map(p => ({ slug: p.slug, title: p.title, date: p.date, tags: p.tags, dir: 'blog' }));
  const portfolioPosts = getAllPosts('portfolio').map(p => ({ slug: p.slug, title: p.title, date: p.date, tags: p.tags, dir: 'portfolio' }));
  return [...blogPosts, ...portfolioPosts];
}

const ASCII_FONTS: Record<string, string[]> = {
  A: ['  █  ', ' █ █ ', '█████', '█   █', '█   █'],
  B: ['████ ', '█   █', '████ ', '█   █', '████ '],
  C: [' ████', '█    ', '█    ', '█    ', ' ████'],
  D: ['████ ', '█   █', '█   █', '█   █', '████ '],
  E: ['█████', '█    ', '████ ', '█    ', '█████'],
  F: ['█████', '█    ', '████ ', '█    ', '█    '],
  G: [' ████', '█    ', '█  ██', '█   █', ' ████'],
  H: ['█   █', '█   █', '█████', '█   █', '█   █'],
  I: ['█████', '  █  ', '  █  ', '  █  ', '█████'],
  J: ['█████', '    █', '    █', '█   █', ' ███ '],
  K: ['█   █', '█  █ ', '███  ', '█  █ ', '█   █'],
  L: ['█    ', '█    ', '█    ', '█    ', '█████'],
  M: ['█   █', '██ ██', '█ █ █', '█   █', '█   █'],
  N: ['█   █', '██  █', '█ █ █', '█  ██', '█   █'],
  O: [' ███ ', '█   █', '█   █', '█   █', ' ███ '],
  P: ['████ ', '█   █', '████ ', '█    ', '█    '],
  Q: [' ███ ', '█   █', '█ █ █', '█  █ ', ' ██ █'],
  R: ['████ ', '█   █', '████ ', '█  █ ', '█   █'],
  S: [' ████', '█    ', ' ███ ', '    █', '████ '],
  T: ['█████', '  █  ', '  █  ', '  █  ', '  █  '],
  U: ['█   █', '█   █', '█   █', '█   █', ' ███ '],
  V: ['█   █', '█   █', '█   █', ' █ █ ', '  █  '],
  W: ['█   █', '█   █', '█ █ █', '██ ██', '█   █'],
  X: ['█   █', ' █ █ ', '  █  ', ' █ █ ', '█   █'],
  Y: ['█   █', ' █ █ ', '  █  ', '  █  ', '  █  '],
  Z: ['█████', '   █ ', '  █  ', ' █   ', '█████'],
  ' ': ['     ', '     ', '     ', '     ', '     '],
  '0': [' ███ ', '█  ██', '█ █ █', '██  █', ' ███ '],
  '1': ['  █  ', ' ██  ', '  █  ', '  █  ', '█████'],
  '2': [' ███ ', '█   █', '  ██ ', ' █   ', '█████'],
  '3': ['████ ', '    █', ' ███ ', '    █', '████ '],
  '4': ['█   █', '█   █', '█████', '    █', '    █'],
  '5': ['█████', '█    ', '████ ', '    █', '████ '],
  '6': [' ███ ', '█    ', '████ ', '█   █', ' ███ '],
  '7': ['█████', '   █ ', '  █  ', ' █   ', '█    '],
  '8': [' ███ ', '█   █', ' ███ ', '█   █', ' ███ '],
  '9': [' ███ ', '█   █', ' ████', '    █', ' ███ '],
};

function generateAsciiArt(text: string): string {
  const chars = text.toUpperCase().split('');
  const lines = [[], [], [], [], []] as string[][];

  for (const ch of chars) {
    const glyph = ASCII_FONTS[ch] || ASCII_FONTS[' '];
    for (let row = 0; row < 5; row++) {
      lines[row].push(glyph[row]);
    }
  }

  return lines.map(row => row.join(' ')).join('\n');
}

const COMMAND_HELP: Record<string, { usage: string; description: string; examples?: string[] }> = {
  help: {
    usage: 'help [command]',
    description: 'Display help information. Use "help <command>" for detailed info on a specific command.',
    examples: ['help', 'help cd', 'help grep'],
  },
  cd: {
    usage: 'cd <directory>',
    description: 'Navigate to another page. Use "cd .." to go up, "cd ~" or "cd home" to go to homepage.',
    examples: ['cd blog', 'cd portfolio', 'cd ..', 'cd ~'],
  },
  ls: {
    usage: 'ls',
    description: 'List all available top-level pages on the site.',
  },
  pwd: {
    usage: 'pwd',
    description: 'Print the current working directory (your current page path).',
  },
  cat: {
    usage: 'cat <filename>',
    description: 'Display the first few lines of a blog post or portfolio item content.',
    examples: ['cat building_tileforge', 'cat safe-route'],
  },
  grep: {
    usage: 'grep [-C n] [-b] <term>',
    description: 'Search posts. Use -b for body content search, -C n for context lines.',
    examples: ['grep rust', 'grep -b redis', 'grep -b -C 3 async'],
  },
  man: {
    usage: 'man <slug>',
    description: 'Display metadata for a post including title, date, tags, and location.',
    examples: ['man building_tileforge'],
  },
  tree: {
    usage: 'tree',
    description: 'Display the full site structure as a tree diagram.',
  },
  history: {
    usage: 'history',
    description: 'Show your command history for this session.',
  },
  ascii: {
    usage: 'ascii <text>',
    description: 'Generate ASCII art from text (max 12 characters).',
    examples: ['ascii hello', 'ascii rust'],
  },
  neofetch: {
    usage: 'neofetch',
    description: 'Display system information in the classic neofetch style.',
  },
  matrix: {
    usage: 'matrix',
    description: 'Enter the matrix. Press any key or click to exit.',
  },
  fireworks: {
    usage: 'fireworks',
    description: 'Launch a fireworks display. Press any key or click to exit.',
  },
  confetti: {
    usage: 'confetti',
    description: 'Celebrate with confetti!',
  },
  mode: {
    usage: 'mode [light|dark]',
    description: 'Toggle or set the color mode (light/dark).',
    examples: ['mode', 'mode light', 'mode dark'],
  },
  rain: {
    usage: 'rain',
    description: 'Watch the digital rain fall. Press any key or click to exit.',
  },
  clear: {
    usage: 'clear',
    description: 'Clear the terminal screen.',
  },
  github: {
    usage: 'github',
    description: 'Open the GitHub profile in a new tab.',
  },
  x: {
    usage: 'x',
    description: 'Open the X (Twitter) profile in a new tab.',
  },
  whoami: {
    usage: 'whoami',
    description: 'Display information about the site author.',
  },
  echo: {
    usage: 'echo <message>',
    description: 'Echo back the provided message.',
    examples: ['echo hello world'],
  },
  contact: {
    usage: 'contact',
    description: 'Display contact information including email, LinkedIn, GitHub, and X.',
  },
  theme: {
    usage: 'theme [name]',
    description: 'Switch the site theme. Run without arguments to see available themes.',
    examples: ['theme', 'theme dracula', 'theme nord'],
  },
  particles: {
    usage: 'particles [off|low|medium|high]',
    description: 'Set the cursor particle effect density. Run without arguments to see current setting.',
    examples: ['particles', 'particles high', 'particles off'],
  },
};

async function executeCommand(args: string[], referer: string): Promise<{ response: CommandResponse; message: string }> {
  const response: CommandResponse = {};
  let message = '';

  switch (args[0]) {
    case 'help': {
      if (args.length > 1) {
        const cmd = args[1];
        const help = COMMAND_HELP[cmd];
        if (help) {
          let helpText = `<span class="term-highlight">${cmd}</span>\n\n`;
          helpText += `<span class="term-info">Usage:</span>    ${help.usage}\n`;
          helpText += `<span class="term-info">About:</span>    ${help.description}`;
          if (help.examples && help.examples.length > 0) {
            helpText += `\n\n<span class="term-info">Examples:</span>\n${help.examples.map(e => `    $ ${e}`).join('\n')}`;
          }
          message = helpText;
        } else {
          message = `<span class="term-error">help: no help entry for '${escapeHtml(cmd)}'</span>`;
        }
      } else {
        const commands = Object.entries(COMMAND_HELP);
        message = `<span class="term-highlight">Available Commands</span>\n<span class="term-info">Type "help &lt;command&gt;" for detailed information</span>\n\n<div class="term-help-grid">${
          commands.map(([cmd, info]) =>
            `<span class="term-help-cmd">${cmd}</span><span class="term-help-desc">${info.description.split('.')[0]}</span>`
          ).join('')
        }</div>`;
      }
      break;
    }

    case 'clear':
      response.action = 'clear';
      break;

    case 'ls':
      message = items.join(' ');
      break;

    case 'github':
      response.action = 'open-url';
      response.url = 'https://github.com/thesandybridge';
      break;

    case 'x':
      response.action = 'open-url';
      response.url = 'https://x.com/sandybridge__';
      break;

    case 'whoami':
      message = `<span class="term-highlight">Matt Miller</span> <span class="term-info">@sandybridge__</span>

Software engineer focused on frontend development and expanding into systems work.
Building with TypeScript, React, Rust, and Go.

Currently tinkering with Neovim configs, Hyprland setups, and side projects.
Based in the terminal. Powered by mass amounts of caffeine.

<span class="term-info">Run 'contact' for links or 'github' to see my code.</span>`;
      break;

    case 'echo':
      if (args.length > 1) {
        message = args.slice(1).join(' ');
      } else {
        message = '<span class="term-error">echo: no message provided</span>';
      }
      break;

    case 'contact':
      message = `Contact info:
    email:      matt@mattmillerdev.io
    linkedin:   /in/mattmillerdev/
    github:     /thesandybridge
    x:          @sandybridge__`;
      break;

    case 'cd': {
      if (args.length > 1) {
        const target = args[1];
        let newPath: string;
        if (target === 'home' || target === '' || target === '~') {
          newPath = '/';
        } else if (target === '..') {
          const segments = referer.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
          newPath = segments.length > 1 ? '/' + segments.slice(0, -1).join('/') : '/';
        } else if (target.startsWith('/')) {
          newPath = target;
        } else {
          newPath = referer === '/' ? '/' + target : referer.replace(/\/$/, '') + '/' + target;
        }
        response.action = 'navigate';
        response.url = newPath;
      } else {
        response.action = 'navigate';
        response.url = '/';
      }
      break;
    }

    case 'rm': {
      const full = args.join(' ');
      if (full.includes('-rf') || full.includes('-fr')) {
        response.action = 'rm-rf';
      } else {
        message = '<span class="term-error">rm: missing operand</span>';
      }
      break;
    }

    case 'sudo': {
      if (args.length > 1 && args[1] === 'rm') {
        const full = args.join(' ');
        if (full.includes('-rf') || full.includes('-fr')) {
          response.action = 'rm-rf';
        } else {
          message = '<span class="term-error">rm: missing operand</span>';
        }
      } else {
        message = `<span class="term-error">${escapeHtml(args[0])}: command not found</span>`;
      }
      break;
    }

    case 'pwd':
      message = referer || '/';
      break;

    case 'cat': {
      if (args.length < 2) {
        message = '<span class="term-error">cat: filename required</span>';
      } else {
        const slug = args[1];
        let filePath = path.join(process.cwd(), 'content', slug + '.md');
        let data: Buffer | null = null;

        try {
          data = fs.readFileSync(filePath);
        } catch {
          try {
            filePath = path.join(process.cwd(), 'content', 'portfolio', slug + '.md');
            data = fs.readFileSync(filePath);
          } catch {
            data = null;
          }
        }

        if (!data) {
          message = `<span class="term-error">cat: ${escapeHtml(slug)}: No such file or directory</span>`;
        } else {
          let content = data.toString();
          if (content.startsWith('---')) {
            const end = content.indexOf('---', 3);
            if (end !== -1) {
              content = content.slice(end + 3);
            }
          }
          const lines = content.split('\n');
          const result: string[] = [];
          for (const line of lines) {
            if (line.trim() !== '') {
              result.push(line);
              if (result.length >= 5) break;
            }
          }
          message = escapeHtml(result.join('\n'));
        }
      }
      break;
    }

    case 'grep': {
      if (args.length < 2) {
        message = `<span class="term-error">grep: search term required</span>
<span class="term-info">Usage: grep [-C n] [-b] &lt;term&gt;</span>
<span class="term-info">  -C n  Show n lines of context (default: 2)</span>
<span class="term-info">  -b    Search body content (default: titles/tags only)</span>`;
      } else {
        // Parse flags
        let contextLines = 2;
        let searchBody = false;
        let searchTerm = '';
        const remainingArgs = args.slice(1);

        for (let i = 0; i < remainingArgs.length; i++) {
          if (remainingArgs[i] === '-C' && remainingArgs[i + 1]) {
            contextLines = parseInt(remainingArgs[i + 1], 10) || 2;
            i++;
          } else if (remainingArgs[i] === '-b') {
            searchBody = true;
          } else {
            searchTerm = remainingArgs.slice(i).join(' ');
            break;
          }
        }

        if (!searchTerm) {
          message = '<span class="term-error">grep: search term required</span>';
        } else if (searchBody) {
          // Full-body search using the grep API
          try {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            const grepUrl = `${baseUrl}/api/grep?q=${encodeURIComponent(searchTerm)}&context=${contextLines}`;
            const res = await fetch(grepUrl);
            const data = await res.json();

            if (data.results.length === 0) {
              message = `<span class="term-info">No matches for "${escapeHtml(searchTerm)}"</span>`;
            } else {
              const lines: string[] = [];
              for (const result of data.results) {
                lines.push(`<span class="term-highlight">${escapeHtml(result.type)}/${escapeHtml(result.slug)}</span>  ${escapeHtml(result.title)}`);
                for (const match of result.matches.slice(0, 3)) {
                  if (contextLines > 0 && match.before.length > 0) {
                    for (const ctx of match.before) {
                      lines.push(`<span class="term-muted">  ${match.lineNumber - match.before.indexOf(ctx) - 1}: ${escapeHtml(ctx)}</span>`);
                    }
                  }
                  lines.push(`<span class="term-success">  ${match.lineNumber}: ${escapeHtml(match.content)}</span>`);
                  if (contextLines > 0 && match.after.length > 0) {
                    for (let j = 0; j < match.after.length; j++) {
                      lines.push(`<span class="term-muted">  ${match.lineNumber + j + 1}: ${escapeHtml(match.after[j])}</span>`);
                    }
                  }
                }
                if (result.matches.length > 3) {
                  lines.push(`<span class="term-info">  ... and ${result.matches.length - 3} more matches</span>`);
                }
              }
              message = lines.join('\n');
            }
          } catch {
            message = '<span class="term-error">grep: failed to search content</span>';
          }
        } else {
          // Quick title/tag search (original behavior)
          const term = searchTerm.toLowerCase();
          const posts = getPostIndex();
          const matches = posts.filter(p =>
            p.title.toLowerCase().includes(term) ||
            p.tags.some(t => t.toLowerCase().includes(term))
          );

          if (matches.length === 0) {
            message = `<span class="term-info">No results for "${escapeHtml(searchTerm)}"</span>
<span class="term-muted">Tip: Use -b flag to search body content</span>`;
          } else {
            message = matches.map(p =>
              `<span class="term-info">${escapeHtml(p.dir)}/${escapeHtml(p.slug)}</span>  ${escapeHtml(p.title)}`
            ).join('\n');
          }
        }
      }
      break;
    }

    case 'man': {
      if (args.length < 2) {
        message = '<span class="term-error">man: slug required</span>';
      } else {
        const slug = args[1];
        const posts = getPostIndex();
        const post = posts.find(p => p.slug === slug);
        if (!post) {
          message = `<span class="term-error">man: no manual entry for ${escapeHtml(slug)}</span>`;
        } else {
          message = `NAME\n    ${escapeHtml(post.title)}\n\nDATE\n    ${escapeHtml(post.date)}\n\nTAGS\n    ${post.tags.map(t => escapeHtml(t)).join(', ')}\n\nLOCATION\n    /${escapeHtml(post.dir)}/${escapeHtml(post.slug)}`;
        }
      }
      break;
    }

    case 'tree': {
      message = `.
├── home
├── blog/
${(() => {
  const posts = getPostIndex().filter(p => p.dir === 'blog');
  return posts.map((p, i) =>
    `│   ${i === posts.length - 1 ? '└' : '├'}── ${escapeHtml(p.slug)}`
  ).join('\n');
})()}
├── portfolio/
${(() => {
  const items = getPostIndex().filter(p => p.dir === 'portfolio');
  return items.map((p, i) =>
    `│   ${i === items.length - 1 ? '└' : '├'}── ${escapeHtml(p.slug)}`
  ).join('\n');
})()}
└── uses`;
      break;
    }

    case 'history':
      response.action = 'history';
      break;

    case 'ascii': {
      if (args.length < 2) {
        message = '<span class="term-error">ascii: text required</span>';
      } else {
        const text = args.slice(1).join(' ');
        if (text.length > 12) {
          message = '<span class="term-error">ascii: max 12 characters</span>';
        } else {
          message = generateAsciiArt(text);
        }
      }
      break;
    }

    case 'neofetch': {
      const posts = getPostIndex();
      const blogCount = posts.filter(p => p.dir === 'blog').length;
      const projectCount = posts.filter(p => p.dir === 'portfolio').length;
      const logo = [
        '       <span style="color:#d79921">▲</span>       ',
        '      <span style="color:#d79921">▲ ▲</span>      ',
        '     <span style="color:#d79921">▲   ▲</span>     ',
        '    <span style="color:#d79921">▲ ▲ ▲ ▲</span>    ',
        '   <span style="color:#d79921">▲       ▲</span>   ',
        '  <span style="color:#d79921">▲ ▲ ▲ ▲ ▲ ▲</span>  ',
        ' <span style="color:#d79921">▲▲▲▲▲▲▲▲▲▲▲▲▲</span> ',
      ];
      const info = [
        `<span style="color:#d79921">you</span>@<span style="color:#d79921">sandybridge</span>`,
        '─────────────────',
        `<span style="color:#d79921">OS</span>: Next.js 15`,
        `<span style="color:#d79921">Shell</span>: gruvbox-terminal`,
        `<span style="color:#d79921">Posts</span>: ${blogCount}`,
        `<span style="color:#d79921">Projects</span>: ${projectCount}`,
        `<span style="color:#d79921">Theme</span>: Gruvbox Dark`,
        `<span style="color:#d79921">Font</span>: Kode Mono`,
      ];
      const lines = [];
      const maxLines = Math.max(logo.length, info.length);
      for (let i = 0; i < maxLines; i++) {
        const left = i < logo.length ? logo[i] : '                       ';
        const right = i < info.length ? info[i] : '';
        lines.push(`${left}  ${right}`);
      }
      message = lines.join('\n');
      break;
    }

    case 'matrix':
      response.action = 'matrix';
      break;

    case 'fireworks':
      response.action = 'fireworks';
      break;

    case 'confetti':
      response.action = 'confetti';
      break;

    case 'rain':
      response.action = 'rain';
      break;

    case 'mode': {
      if (args.length < 2) {
        response.action = 'toggle-mode';
        message = '<span class="term-info">Toggling color mode...</span>';
      } else {
        const targetMode = args[1].toLowerCase();
        if (targetMode === 'light' || targetMode === 'dark') {
          response.action = 'set-mode';
          response.theme = targetMode; // reusing theme field for mode
          message = `<span class="term-info">Color mode set to ${targetMode}</span>`;
        } else {
          message = `<span class="term-error">Invalid mode: ${escapeHtml(targetMode)}. Use 'light' or 'dark'.</span>`;
        }
      }
      break;
    }

    case 'stats':
      response.action = 'navigate';
      response.url = '/stats/views';
      break;

    case 'rotate':
      response.action = 'rotate';
      break;

    case 'malware':
      response.action = 'malware';
      break;

    case 'theme': {
      if (args.length < 2) {
        const themeList = THEMES.map(t => {
          const aliasStr = t.aliases.length ? ` <span class="term-comment">(${t.aliases.join(', ')})</span>` : '';
          return `  ${t.id.padEnd(12)}<span class="term-info">${t.name}</span>${aliasStr}`;
        }).join('\n');
        message = `<span class="term-highlight">Available themes</span>\n\n${themeList}\n\n<span class="term-info">Usage: theme &lt;name|alias&gt;</span>`;
      } else {
        const target = args[1].toLowerCase();
        const resolvedTheme = THEME_LOOKUP[target];
        if (resolvedTheme) {
          response.action = 'theme';
          response.theme = resolvedTheme;
          message = `<span class="term-info">Theme changed to ${escapeHtml(resolvedTheme)}</span>`;
        } else {
          message = `<span class="term-error">Unknown theme: ${escapeHtml(target)}</span>\n<span class="term-info">Run 'theme' to see available options</span>`;
        }
      }
      break;
    }

    case 'particles': {
      const validDensities = ['off', 'low', 'medium', 'high'];
      if (args.length < 2) {
        message = `<span class="term-highlight">Particle Density Settings</span>\n\n  off     <span class="term-info">No cursor particles</span>\n  low     <span class="term-info">Subtle particles</span>\n  medium  <span class="term-info">Default density</span>\n  high    <span class="term-info">Maximum particles</span>\n\n<span class="term-info">Usage: particles &lt;density&gt;</span>`;
      } else {
        const target = args[1].toLowerCase();
        if (validDensities.includes(target)) {
          response.action = 'particles';
          response.theme = target; // reusing theme field for density
          message = `<span class="term-info">Particle density set to ${escapeHtml(target)}</span>`;
        } else {
          message = `<span class="term-error">Invalid density: ${escapeHtml(target)}</span>\n<span class="term-info">Options: off, low, medium, high</span>`;
        }
      }
      break;
    }

    default:
      message = `<span class="term-error">${escapeHtml(args[0])}: command not found</span>`;
  }

  return { response, message };
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const rawCmd = formData.get('cmd') as string || '';
  const referer = formData.get('referer') as string || '/';
  const command = sanitizeHtml(rawCmd, { allowedTags: [], allowedAttributes: {} });

  // Pipe support: split on | and chain commands
  const pipeSegments = command.split('|').map(s => s.trim()).filter(Boolean);

  if (pipeSegments.length === 0) {
    return new NextResponse('', { headers: { 'Content-Type': 'text/html' } });
  }

  // Execute first command
  let firstArgs = pipeSegments[0].split(/\s+/).filter(Boolean);
  if (firstArgs.length === 0) {
    return new NextResponse('', { headers: { 'Content-Type': 'text/html' } });
  }

  let { response, message } = await executeCommand(firstArgs, referer);

  // If there's an action (JSON response), pipes don't apply
  if (response.action) {
    if (pipeSegments.length > 1) {
      // Can't pipe action commands
      message = `<span class="term-error">pipe not supported for ${escapeHtml(firstArgs[0])}</span>`;
    } else {
      if (message) {
        response.message = `<pre class='ignore'>&gt; ${escapeHtml(command)}\n${message}</pre>`;
      }
      return NextResponse.json(response);
    }
  }

  // Process remaining pipe segments (currently only grep is meaningful)
  for (let i = 1; i < pipeSegments.length; i++) {
    const pipeArgs = pipeSegments[i].split(/\s+/).filter(Boolean);
    if (pipeArgs[0] === 'grep' && pipeArgs.length > 1) {
      const term = pipeArgs.slice(1).join(' ').toLowerCase();
      const lines = message.replace(/<[^>]+>/g, '').split('\n');
      const filtered = lines.filter(l => l.toLowerCase().includes(term));
      message = filtered.length > 0 ? filtered.join('\n') : `<span class="term-info">No matches</span>`;
    } else {
      message = `<span class="term-error">${escapeHtml(pipeArgs[0] || '')}: not supported in pipe</span>`;
      break;
    }
  }

  const fullMessage = `<pre class='ignore'>&gt; ${escapeHtml(command)}\n${message}</pre>`;

  return new NextResponse(fullMessage, {
    headers: { 'Content-Type': 'text/html' },
  });
}
