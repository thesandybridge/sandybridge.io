import { expect, test } from 'bun:test';
import { createAsyncCache } from '../src/lib/server/async-cache';
import { getAllPosts, getPost } from '../src/lib/server/content';
import { parseGitHubUrl } from '../src/lib/server/github';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

test('cache shares concurrent work, expires values, and bounds retained entries', async () => {
  let time = 0;
  let calls = 0;
  const cache = createAsyncCache<number>(2, 100, () => time);
  const load = async () => ++calls;
  const first = cache.get('a', load);
  expect(cache.get('a', load)).toBe(first);
  expect(await first).toBe(1);
  time = 101;
  expect(await cache.get('a', load)).toBe(2);
  await cache.get('b', load);
  await cache.get('c', load);
  expect(await cache.get('a', load)).toBe(5);
});

test('failed loads can be retried without poisoning the cache', async () => {
  const cache = createAsyncCache<number>(2, 1000);
  await expect(cache.get('a', async () => { throw new Error('unavailable'); })).rejects.toThrow('unavailable');
  expect(await cache.get('a', async () => 42)).toBe(42);
});

test('repeat and concurrent post loads reuse the rendered result', async () => {
  const slug = getAllPosts('blog')[0].slug;
  const [first, second] = await Promise.all([getPost('blog', slug), getPost('blog', slug)]);
  expect(first).not.toBeNull();
  expect(second).toBe(first);
});

test('GitHub URLs are restricted to actual GitHub HTTPS repositories', () => {
  expect(parseGitHubUrl('https://github.com/thesandybridge/nvim.git')).toEqual({ owner: 'thesandybridge', repo: 'nvim' });
  expect(parseGitHubUrl('https://example.com/github.com/owner/repo')).toBeNull();
  expect(parseGitHubUrl('https://github.com.evil.test/owner/repo')).toBeNull();
  expect(parseGitHubUrl('http://github.com/owner/repo')).toBeNull();
});

test('client components do not import server implementations', () => {
  const violations: string[] = [];
  function inspect(dir: string) {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const file = join(dir, item.name);
      if (item.isDirectory()) { inspect(file); continue; }
      if (!/\.tsx?$/.test(file)) continue;
      const ast = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
      ast.forEachChild(node => {
        if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) return;
        if (!node.moduleSpecifier.text.includes('/server/')) return;
        const clause = node.importClause;
        const bindings = clause?.namedBindings;
        const typeOnly = clause?.isTypeOnly || (!clause?.name && bindings && ts.isNamedImports(bindings) && bindings.elements.every(element => element.isTypeOnly));
        if (!typeOnly) violations.push(file);
      });
    }
  }
  inspect('src/components');
  expect(violations).toEqual([]);
});

test('concurrent portfolio loads share GitHub requests and bound network waits', async () => {
  const originalFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    requests++;
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    if (String(input).includes('/commits?')) {
      return Response.json([], { headers: { Link: '<https://api.github.com/repos/test/repo/commits?page=3>; rel="last"' } });
    }
    return Response.json({ stargazers_count: 7, language: 'TypeScript', pushed_at: '2026-10-01T00:00:00Z' });
  }) as typeof fetch;
  try {
    const { getRepoStats } = await import('../src/lib/server/github');
    const [first, second] = await Promise.all([getRepoStats('cache-test', 'repo'), getRepoStats('cache-test', 'repo')]);
    expect(first).toEqual({ stars: 7, commits: 3, language: 'TypeScript', lastPush: '2026-10-01' });
    expect(second).toBe(first);
    await getRepoStats('cache-test', 'repo');
    expect(requests).toBe(2);
  } finally { globalThis.fetch = originalFetch; }
});
