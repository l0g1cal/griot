import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const GROIT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = join(GROIT, '..');
const GRAPH = join(GROIT, 'knowledge', 'graph.json');
const SEED = join(GROIT, 'knowledge', 'graph.seed.json');
const SLIDES_DIR = join(REPO, 'demo-assets');

function run(script, args = []) {
  return new Promise((resolve, reject) => {
    execFile(process.execPath, [join(GROIT, script), ...args], { cwd: GROIT }, (err, stdout, stderr) =>
      err ? reject(new Error(stderr || stdout || err.message)) : resolve(stdout),
    );
  });
}

/**
 * Prong 2 (context history) is read LIVE from git: the spec-to-code habit of
 * rich commit messages makes `git log` over an entity's spec + code paths the
 * chronological decision log — no separate document to go stale.
 */
function gitLog(paths = []) {
  return new Promise((resolve, reject) => {
    const args = [
      'log',
      '--date=short',
      '--format=%h%x1f%an%x1f%ad%x1f%s%x1f%b%x1e',
      '--',
      ...paths,
    ];
    execFile('git', args, { cwd: REPO, maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
      if (err) return reject(err);
      const commits = stdout
        .split('\x1e')
        .map((rec) => rec.trim())
        .filter(Boolean)
        .map((rec) => {
          const [hash, author, date, subject, body] = rec.split('\x1f');
          return { hash, author, date, subject, body: (body ?? '').trim() };
        });
      resolve(commits);
    });
  });
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => resolve(data));
  });
}

function send(res, status, body, type = 'application/json') {
  res.statusCode = status;
  res.setHeader('Content-Type', type);
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}

function ensureGraph() {
  if (!existsSync(GRAPH)) copyFileSync(SEED, GRAPH);
}

function findEntity(graph, id) {
  return graph.domains.find((d) => d.id === id) ?? graph.functions.find((f) => f.id === id);
}

/**
 * The UI never owns knowledge state. Reads come from graph.json and live
 * `git log`; mutations (recording a huddle resolution) are delegated to the
 * same CLI scripts the terminal demo uses, so the on-screen interaction
 * exercises the real write path and really regenerates CLAUDE.md on disk.
 */
function caddyApi() {
  return {
    name: 'contextcaddy-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/') && !req.url.startsWith('/slides/')) return next();
        const url = new URL(req.url, 'http://localhost');
        try {
          if (req.method === 'GET' && url.pathname.startsWith('/slides/')) {
            const name = url.pathname.slice('/slides/'.length);
            if (!/^[a-z0-9-]+\.html$/.test(name)) return send(res, 400, { error: 'bad slide name' });
            const file = join(SLIDES_DIR, name);
            if (!existsSync(file)) return send(res, 404, { error: 'no such slide' });
            return send(res, 200, readFileSync(file, 'utf8'), 'text/html; charset=utf-8');
          }
          if (req.method === 'GET' && url.pathname === '/api/graph') {
            ensureGraph();
            send(res, 200, readFileSync(GRAPH, 'utf8'), 'application/json; charset=utf-8');
          } else if (req.method === 'GET' && url.pathname === '/api/history') {
            ensureGraph();
            const graph = JSON.parse(readFileSync(GRAPH, 'utf8'));
            const entity = findEntity(graph, url.searchParams.get('id'));
            if (!entity) return send(res, 404, { error: 'unknown entity id' });
            send(res, 200, { commits: await gitLog(entity.paths) });
          } else if (req.method === 'POST' && url.pathname === '/api/resolve') {
            const { itemId, action, owner, by, outcome } = JSON.parse(await readBody(req));
            await run('resolve-item.mjs', [itemId, action, '--owner', owner, '--by', by, '--outcome', outcome]);
            await run('generate-rules.mjs');
            send(res, 200, { ok: true });
          } else if (req.method === 'POST' && url.pathname === '/api/reset') {
            copyFileSync(SEED, GRAPH);
            await run('generate-rules.mjs');
            send(res, 200, { ok: true });
          } else {
            next();
          }
        } catch (e) {
          send(res, 500, { error: e.message });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), caddyApi()],
});
