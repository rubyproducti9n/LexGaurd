'use strict';
require('dotenv').config();

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

const PORT = process.env.PORT || 3000;
const KEY  = process.env.GEMINI_API_KEY;

// ── Startup check ─────────────────────────────────────
const missingOnStart = [
  'GEMINI_API_KEY',
  'FIREBASE_API_KEY',
  'FIREBASE_DATABASE_URL',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_APP_ID',
].filter(k => !process.env[k]);

if (missingOnStart.length > 0) {
  console.error('\n  ❌  Missing required environment variables:');
  missingOnStart.forEach(k => console.error(`       - ${k}`));
  console.error('\n  Add them to your .env file and restart.\n');
  process.exit(1);
}

console.log('  ✅  All environment variables loaded.');

// ── Request handler ───────────────────────────────────
http.createServer((req, res) => {
  const parsed = url.parse(req.url);

  // CORS headers for localhost dev
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  // ── Health check — frontend calls this on load ─────
  if (parsed.pathname === '/api/ping' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // ── Firebase config endpoint ──────────────────────────
  if (parsed.pathname === '/api/config' && req.method === 'GET') {
    // Verify all required Firebase env vars exist
    const required = [
      'FIREBASE_API_KEY',
      'FIREBASE_AUTH_DOMAIN',
      'FIREBASE_DATABASE_URL',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_STORAGE_BUCKET',
      'FIREBASE_MESSAGING_SENDER_ID',
      'FIREBASE_APP_ID',
      'FIREBASE_MEASUREMENT_ID',
    ];

    const missing = required.filter(k => !process.env[k]);
    if (missing.length > 0) {
      console.error('Missing Firebase env vars:', missing.join(', '));
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Firebase config incomplete.' }));
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify({
      apiKey           : process.env.FIREBASE_API_KEY,
      authDomain       : process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL      : process.env.FIREBASE_DATABASE_URL,
      projectId        : process.env.FIREBASE_PROJECT_ID,
      storageBucket    : process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId            : process.env.FIREBASE_APP_ID,
      measurementId    : process.env.FIREBASE_MEASUREMENT_ID,
    }));
    return;
  }

  // ── Gemini proxy — key never leaves server ─────────
  if (parsed.pathname === '/api/gemini' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => { body += chunk.toString(); });

    req.on('end', () => {
      let payload;
      try {
        payload = JSON.parse(body);
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON body.' }));
        return;
      }

      // Extract model — default to gemini-2.5-flash
      const model = payload.model || 'gemini-2.5-flash';
      delete payload.model;

      // Build Gemini URL — key attached server-side only
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`;
      const bodyStr   = JSON.stringify(payload);

      const options = {
        method : 'POST',
        headers: {
          'Content-Type'  : 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr),
        },
      };

      // Forward to Gemini
      const proxyReq = https.request(geminiUrl, options, (proxyRes) => {
        let data = '';
        proxyRes.on('data', chunk => { data += chunk; });
        proxyRes.on('end', () => {
          res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'application/json',
          });
          res.end(data);
        });
      });

      proxyReq.on('error', (e) => {
        console.error('Proxy error:', e.message);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to reach Gemini.' }));
      });

      proxyReq.write(bodyStr);
      proxyReq.end();
    });

    req.on('error', () => {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Bad request.' }));
    });

    return;
  }

  // ── Serve index.html for all other routes ──────────
  const filePath = path.join(__dirname, 'index.html');
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('index.html not found.');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });

}).listen(PORT, () => {
  console.log(`\n  🚀  LexGuard running at http://localhost:${PORT}\n`);
});
