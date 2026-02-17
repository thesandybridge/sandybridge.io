import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sanitizeHtml from 'sanitize-html';

export const runtime = 'nodejs';

interface CommandResponse {
  action?: string;
  url?: string;
  message?: string;
}

const items = ['blog', 'home', 'portfolio'];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const rawCmd = formData.get('cmd') as string || '';
  const referer = formData.get('referer') as string || '/';
  const command = sanitizeHtml(rawCmd, { allowedTags: [], allowedAttributes: {} });
  const args = command.trim().split(/\s+/).filter(Boolean);

  if (args.length === 0) {
    return new NextResponse('', { headers: { 'Content-Type': 'text/html' } });
  }

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
        if (target === 'home' || target === '') {
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
        message = '<span class="term-error">cd: path required</span>';
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
          // Strip YAML frontmatter
          if (content.startsWith('---')) {
            const end = content.indexOf('---', 3);
            if (end !== -1) {
              content = content.slice(end + 3);
            }
          }
          // Take first 5 non-empty lines
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

    case 'rotate':
      response.action = 'rotate';
      break;

    case 'malware':
      response.action = 'malware';
      break;

    default:
      message = `<span class="term-error">${escapeHtml(args[0])}: command not found</span>`;
  }

  if (message) {
    response.message = `<pre class='ignore'>&gt; ${escapeHtml(args.join(' '))}\n${message}</pre>`;
  }

  if (response.action) {
    return NextResponse.json(response);
  }

  return new NextResponse(response.message || '', {
    headers: { 'Content-Type': 'text/html' },
  });
}
