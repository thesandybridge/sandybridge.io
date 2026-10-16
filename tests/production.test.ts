import { afterAll, describe, expect, test } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { serveStatic } from '../scripts/static-files';
import { getAllPosts, getPost } from '../src/lib/server/content';
import { getDocBySlug } from '../src/lib/server/docs';
import { getChangelog } from '../src/lib/server/changelog';
import { createRedisClient } from '../src/lib/server/redis';
import { rateLimit } from '../src/lib/server/rate-limit';

const root = mkdtempSync(join(tmpdir(), 'portfolio-static-'));
writeFileSync(join(root, 'test.txt'), 'hello');
afterAll(() => rmSync(root, { recursive: true }));

describe('static responses', () => {
  test('cache validation avoids retransmitting the body; HEAD has no body', async () => {
    const get = await serveStatic(new Request('http://localhost/test.txt'), root);
    expect(await get!.text()).toBe('hello');
    expect(get!.headers.get('cache-control')).toBe('public, max-age=3600');
    const cached = await serveStatic(new Request('http://localhost/test.txt', { headers: { 'If-None-Match': get!.headers.get('etag')! } }), root);
    expect(cached!.status).toBe(304);
    expect(await cached!.text()).toBe('');
    const head = await serveStatic(new Request('http://localhost/test.txt', { method: 'HEAD' }), root);
    expect(await head!.text()).toBe('');
    expect(head!.headers.get('content-length')).toBe('5');
  });
  test('rejects encoded traversal, malformed encodings, and non-GET asset access', async () => {
    expect((await serveStatic(new Request('http://localhost/%2e%2e%2fsecret'), root))!.status).toBe(404);
    expect((await serveStatic(new Request('http://localhost/%ZZ'), root))!.status).toBe(400);
    expect((await serveStatic(new Request('http://localhost/test.txt', { method: 'POST' }), root))!.status).toBe(405);
    expect((await serveStatic(new Request('http://localhost/assets/missing.js'), root))!.status).toBe(404);
    expect(await serveStatic(new Request('http://localhost/blog'), root)).toBeNull();
  });
});

test('content access is confined to published directories', async () => {
  expect(() => getAllPosts('../' as any)).toThrow('Invalid content directory');
  expect(await getPost('blog', '../README')).toBeNull();
  expect(await getDocBySlug('../../README')).toBeNull();
  expect(getAllPosts('blog').length).toBeGreaterThan(0);
  expect(Array.isArray(getChangelog())).toBe(true);
});

test('rate limiting remains enforced without Redis', async () => {
  expect(await rateLimit('test:fallback', 2, 60)).toBe(true);
  expect(await rateLimit('test:fallback', 2, 60)).toBe(true);
  expect(await rateLimit('test:fallback', 2, 60)).toBe(false);
});

test('Redis handles connection errors without queueing commands indefinitely', async () => {
  const client = createRedisClient('redis://127.0.0.1:1')!;
  try {
    expect(client.listenerCount('error')).toBeGreaterThan(0);
    expect(client.options.family).toBe(0);
    expect(client.options.enableOfflineQueue).toBe(false);
    expect(client.options.retryStrategy!(100)).toBe(30000);
    await expect(client.get('test')).rejects.toThrow();
  } finally { client.disconnect(); }
});

test('Satori rejects the old WOFF2 but renders the bundled WOFF to a 1200x630 PNG', async () => {
  const { default: satori } = await import('satori');
  const { Resvg } = await import('@resvg/resvg-js');
  const element = { type: 'div', props: { style: { display: 'flex', fontFamily: 'Kode Mono' }, children: 'Portfolio test' } } as any;
  const render = (data: Buffer) => satori(element, { width: 1200, height: 630, fonts: [{ name: 'Kode Mono', data, weight: 400 }] });
  await expect(render(readFileSync('public/fonts/KodeMono-Regular.woff2'))).rejects.toThrow('Unsupported OpenType signature wOF2');
  const svg = await render(readFileSync('src/assets/fonts/KodeMono-Regular.woff'));
  const png = new Resvg(svg).render().asPng();
  expect(png.subarray(1, 4).toString()).toBe('PNG');
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
});

test('depth endpoint accepts a beacon with Redis disabled and rejects malformed/unknown inputs', async () => {
  const { Route } = await import('../src/routes/api/views/$slug/depth');
  const handler = Route.options.server!.handlers!.POST as Function;
  const slug = getAllPosts('blog')[0].slug;
  const send = (slug: string, body: unknown) => handler({ params: { slug }, request: new Request('http://localhost/api/views/test/depth', { method: 'POST', body: JSON.stringify(body) }) });
  expect((await send(slug, { depth: 50 })).status).toBe(200);
  expect((await send(slug, null)).status).toBe(400);
  expect((await send(slug, { depth: 55 })).status).toBe(400);
  expect((await send('not-a-published-post', { depth: 50 })).status).toBe(404);
});

test('arbitrary slugs cannot create analytics keys', async () => {
  const { Route } = await import('../src/routes/api/views/$slug');
  const handler = Route.options.server!.handlers!.POST as Function;
  const response = await handler({ params: { slug: 'invented-slug' }, request: new Request('http://localhost/api/views/invented-slug', { method: 'POST' }) });
  expect(response.status).toBe(404);
});

test('Railway client address takes precedence over spoofed forwarding chains', async () => {
  const { getClientIP } = await import('../src/lib/server/views');
  const request = new Request('http://localhost', { headers: { 'X-Real-IP': '192.0.2.1', 'X-Forwarded-For': 'spoofed' } });
  expect(getClientIP(request)).toBe('192.0.2.1');
  expect(getClientIP(new Request('http://localhost', { headers: { 'X-Forwarded-For': '192.0.2.2' } }))).toBe('127.0.0.1');
});

test('Vite bundles the OG font and the compiled route serves and caches PNG responses', async () => {
  const { build } = await import('vite');
  const { mkdirSync } = await import('node:fs');
  const { resolve } = await import('node:path');
  mkdirSync('node_modules/.cache', { recursive: true });
  const output = mkdtempSync(resolve('node_modules/.cache/og-test-'));
  try {
    await build({
      configFile: false,
      logLevel: 'error',
      resolve: { alias: { '~': resolve('src') } },
      build: {
        ssr: resolve('src/routes/api/og/$type/$slug.tsx'),
        outDir: output,
        rollupOptions: { output: { entryFileNames: 'og.mjs' } },
      },
    });
    const { Route } = await import(join(output, 'og.mjs'));
    const handler = Route.options.server.handlers.GET;
    const request = new Request('http://localhost/api/og/blog/test');
    const params = { type: 'blog', slug: getAllPosts('blog')[0].slug };
    const first = await handler({ params, request });
    expect(first.status).toBe(200);
    expect(first.headers.get('content-type')).toBe('image/png');
    const firstBytes = Buffer.from(await first.arrayBuffer());
    expect(firstBytes.subarray(1, 4).toString()).toBe('PNG');
    const second = await handler({ params, request });
    expect(Buffer.from(await second.arrayBuffer()).equals(firstBytes)).toBe(true);
    expect((await handler({ params: { type: 'blog', slug: 'nonexistent' }, request })).status).toBe(404);
    expect((await handler({ params: { type: '../', slug: 'README' }, request })).status).toBe(404);
  } finally { rmSync(output, { recursive: true, force: true }); }
});

test('every published slug remains readable, including apostrophes', async () => {
  for (const dir of ['blog', 'portfolio', 'til'] as const) {
    for (const metadata of getAllPosts(dir)) {
      const post = await getPost(dir, metadata.slug);
      expect(post?.slug).toBe(metadata.slug);
    }
  }
}, 15000);
