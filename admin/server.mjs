import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.TEN_MILLION_WINS_ADMIN_PORT || 8791);
const apiBase = process.env.TEN_MILLION_WINS_API_BASE || 'https://10millionwins.com';
const adminToken = process.env.TEN_MILLION_WINS_ADMIN_TOKEN || process.env.ADMIN_TOKEN || '';

const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8']
]);

async function proxy(request, response) {
  if (!adminToken) {
    response.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ error: 'TEN_MILLION_WINS_ADMIN_TOKEN is not set.' }));
    return;
  }

  const sourceUrl = new URL(request.url, `http://127.0.0.1:${port}`);
  const target = new URL(sourceUrl.pathname.replace('/admin-api', '/api/admin') + sourceUrl.search, apiBase);
  const body = ['GET', 'HEAD'].includes(request.method || 'GET') ? undefined : await readBody(request);
  const upstream = await fetch(target, {
    method: request.method,
    headers: {
      authorization: `Bearer ${adminToken}`,
      'content-type': request.headers['content-type'] || 'application/json'
    },
    body
  });

  response.writeHead(upstream.status, {
    'content-type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  response.end(await upstream.text());
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => resolve(Buffer.concat(chunks)));
    request.on('error', reject);
  });
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://127.0.0.1:${port}`);
    if (url.pathname.startsWith('/admin-api/')) {
      await proxy(request, response);
      return;
    }

    const file = url.pathname === '/' ? 'dashboard.html' : url.pathname.slice(1);
    const safeFile = file.replace(/\.\./g, '');
    const path = join(root, safeFile);
    const body = await readFile(path);
    response.writeHead(200, {
      'content-type': types.get(extname(path)) || 'application/octet-stream',
      'cache-control': 'no-store'
    });
    response.end(body);
  } catch (error) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`10 Million AI Wins admin dashboard: http://127.0.0.1:${port}`);
  console.log(`API base: ${apiBase}`);
});
