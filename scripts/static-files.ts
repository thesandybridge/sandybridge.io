import { resolve, sep, extname } from 'node:path';

export async function serveStatic(request: Request, clientDir: string): Promise<Response | null> {
  let pathname: string;
  try { pathname = decodeURIComponent(new URL(request.url).pathname); }
  catch { return new Response('Bad request', { status: 400 }); }
  if (pathname.includes('\0') || pathname.includes('\\') || pathname.split('/').some(part => part.startsWith('.'))) {
    return new Response('Not found', { status: 404 });
  }
  const filePath = resolve(clientDir, `.${pathname}`);
  if (!filePath.startsWith(resolve(clientDir) + sep)) return null;
  const file = Bun.file(filePath);
  if (!await file.exists()) {
    // Missing assets should not render the complete React 404 page.
    if (/^\/(assets|fonts|wasm)\//.test(pathname)) return new Response('Not found', { status: 404 });
    return null;
  }
  if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  const etag = `W/"${file.size.toString(16)}-${file.lastModified.toString(16)}"`;
  const immutable = /^\/assets\/[^/]+-[A-Za-z0-9_-]{8,}\.[a-z0-9]+$/.test(pathname);
  const headers = new Headers({
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=3600',
    ETag: etag,
    'Content-Type': extname(pathname) === '.wasm' ? 'application/wasm' : file.type,
    'X-Content-Type-Options': 'nosniff',
  });
  if (request.headers.get('if-none-match')?.split(',').some(value => value.trim() === etag || value.trim() === '*')) {
    return new Response(null, { status: 304, headers });
  }
  headers.set('Content-Length', String(file.size));
  return new Response(request.method === 'HEAD' ? null : file, { headers });
}
