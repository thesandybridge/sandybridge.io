import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Git is a build-time input only; deployments do not need Git or .git.
const git = (...args: string[]) => execFileSync('git', args, {
  encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
}).trim();
const lastModified: Record<string, string> = {};
let changelog: Array<{ hash: string; date: string; message: string; body?: string }> = [];
try {
  changelog = git('log', '-n', '100', '--format=%H%x00%cs%x00%s%x00%b%x1e')
    .split('\x1e').filter(entry => entry.trim()).map(entry => {
      const [hash, date, message, body] = entry.trim().split('\0');
      return { hash: hash.slice(0, 7), date, message, body: body?.trim() || undefined };
    });
  for (const dir of ['content', 'content/portfolio', 'content/til']) {
    for (const file of readdirSync(dir).filter(file => /\.mdx?$/.test(file))) {
      const name = join(dir, file);
      lastModified[name] = git('log', '-1', '--format=%cs', '--', name);
    }
  }
} catch {
  console.warn('Git history unavailable at build time; changelog/dates may be incomplete.');
}
mkdirSync('src/generated', { recursive: true });
writeFileSync('src/generated/git-metadata.json', JSON.stringify({ changelog, lastModified }));
