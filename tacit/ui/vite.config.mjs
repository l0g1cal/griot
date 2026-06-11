import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TACIT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GRAPH = join(TACIT, 'knowledge', 'graph.json');
const SEED = join(TACIT, 'knowledge', 'graph.seed.json');
const RULES = join(TACIT, '..', 'appeals-service', 'CLAUDE.md');

function run(script, args = []) {
  return new Promise((resolve, reject) => {
    execFile(process.execPath, [join(TACIT, script), ...args], { cwd: TACIT }, (err, stdout, stderr) =>
      err ? reject(new Error(stderr || stdout || err.message)) : resolve(stdout),
    );
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

/**
 * The UI never owns knowledge state. Reads come from graph.json; the single
 * mutation (answering a question) is delegated to the same CLI scripts the
 * terminal demo uses, so the on-screen interaction exercises the real write
 * path and really regenerates CLAUDE.md / .cursor rules on disk.
 */
function tacitApi() {
  return {
    name: 'tacit-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next();
        try {
          if (req.method === 'GET' && req.url === '/api/graph') {
            ensureGraph();
            send(res, 200, readFileSync(GRAPH, 'utf8'), 'application/json; charset=utf-8');
          } else if (req.method === 'GET' && req.url === '/api/rules') {
            if (!existsSync(RULES)) await run('generate-rules.mjs');
            send(res, 200, { markdown: readFileSync(RULES, 'utf8') });
          } else if (req.method === 'POST' && req.url === '/api/answer') {
            const { questionId, answer, by, classification } = JSON.parse(await readBody(req));
            await run('answer-question.mjs', [questionId, answer, '--by', by, '--classification', classification]);
            await run('generate-rules.mjs');
            send(res, 200, { ok: true });
          } else if (req.method === 'POST' && req.url === '/api/reset') {
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
  plugins: [react(), tacitApi()],
});
