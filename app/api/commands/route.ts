import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import sanitizeHtml from 'sanitize-html';

export const runtime = 'nodejs';

interface CommandResponse {
  action?: string;
  url?: string;
  message?: string;
}

const items = ['blog', 'home', 'portfolio'];
const contentDir = path.join(process.cwd(), 'content');

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getPostIndex(): { slug: string; title: string; date: string; tags: string[]; dir: string }[] {
  const posts: { slug: string; title: string; date: string; tags: string[]; dir: string }[] = [];

  for (const file of fs.readdirSync(contentDir).filter(f => f.endsWith('.md'))) {
    const raw = fs.readFileSync(path.join(contentDir, file), 'utf-8');
    const { data } = matter(raw);
    posts.push({
      slug: path.basename(file, '.md'),
      title: data.title || path.basename(file, '.md'),
      date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : String(data.date || ''),
      tags: data.tags || [],
      dir: 'blog',
    });
  }

  const portfolioDir = path.join(contentDir, 'portfolio');
  if (fs.existsSync(portfolioDir)) {
    for (const file of fs.readdirSync(portfolioDir).filter(f => f.endsWith('.md'))) {
      const raw = fs.readFileSync(path.join(portfolioDir, file), 'utf-8');
      const { data } = matter(raw);
      posts.push({
        slug: path.basename(file, '.md'),
        title: data.title || path.basename(file, '.md'),
        date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : String(data.date || ''),
        tags: data.tags || [],
        dir: 'portfolio',
      });
    }
  }

  return posts;
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

function executeCommand(args: string[], referer: string): { response: CommandResponse; message: string } {
  const response: CommandResponse = {};
  let message = '';

  switch (args[0]) {
    case 'help':
      message = `Commands available:
    help    - Show this help message
    cd      - Navigate to another page
    ls      - List available pages
    pwd     - Print current directory
    cat     - Display post content
    grep    - Search posts by keyword
    man     - Show post metadata
    tree    - Show site structure
    history - Show command history (client-side)
    ascii   - Generate ASCII art text
    clear   - Clear the screen
    github  - Open the GitHub page in a new tab
    echo    - Echo back the input
    contact - Show contact information`;
      break;

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
    github:     /thesandybridge`;
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
        message = '<span class="term-error">grep: search term required</span>';
      } else {
        const term = args.slice(1).join(' ').toLowerCase();
        const posts = getPostIndex();
        const matches = posts.filter(p =>
          p.title.toLowerCase().includes(term) ||
          p.tags.some(t => t.toLowerCase().includes(term))
        );

        if (matches.length === 0) {
          message = `<span class="term-info">No results for "${escapeHtml(term)}"</span>`;
        } else {
          message = matches.map(p =>
            `<span class="term-info">${escapeHtml(p.dir)}/${escapeHtml(p.slug)}</span>  ${escapeHtml(p.title)}`
          ).join('\n');
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
└── portfolio/
${(() => {
  const items = getPostIndex().filter(p => p.dir === 'portfolio');
  return items.map((p, i) =>
    `    ${i === items.length - 1 ? '└' : '├'}── ${escapeHtml(p.slug)}`
  ).join('\n');
})()}`;
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

    case 'rotate':
      response.action = 'rotate';
      break;

    case 'malware':
      response.action = 'malware';
      break;

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

  let { response, message } = executeCommand(firstArgs, referer);

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
