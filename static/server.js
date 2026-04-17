#!/usr/bin/env node

/**
 * Lightweight static file server for the /static folder.
 * Uses only Node built-ins — no extra dependencies.
 *
 * Usage:
 *   node static/server.js          # serves on http://localhost:4000
 *   PORT=5000 node static/server.js
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT) || 4000;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

/**
 * Resolves a request URL to a file path, falling back to index.html
 * for directory requests.
 * @param {string} url The raw request URL (pathname only).
 * @returns {string} Absolute file-system path to serve.
 */
function resolve(url) {
  const decoded = decodeURIComponent(url.split('?')[0]);
  let rel = decoded === '/' ? '/static/index.html' : decoded;

  // Bare directory → append index.html
  if (!path.extname(rel)) rel = `${rel.replace(/\/$/, '')}/index.html`;

  return path.join(ROOT, rel);
}

const server = http.createServer((req, res) => {
  const filePath = resolve(req.url);

  // Prevent path traversal outside ROOT
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('403 Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500);
      res.end(err.code === 'ENOENT' ? '404 Not Found' : '500 Internal Server Error');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Static server running at http://localhost:${PORT}/static/`);
  console.log('Press Ctrl+C to stop.');
});
