#!/usr/bin/env node
/**
 * Local Relay Server
 *
 * ローカルPCで動かすWebhookサーバー。
 * ngrokで公開→リモートのClaude CodeセッションからCodex等を叩ける。
 *
 * 起動:
 *   RELAY_TOKEN=mysecret node server.js
 *   ngrok http 3741
 *
 * リモートから呼ぶ:
 *   curl -X POST https://xxxx.ngrok-free.app/codex \
 *     -H "x-relay-token: mysecret" \
 *     -H "Content-Type: application/json" \
 *     -d '{"task":"DrawingToolbarにIoniconsを追加", "workdir":"/path/to/sekaishi-chizu"}'
 */

const http = require('http');
const { execSync, spawn } = require('child_process');
const crypto = require('crypto');
const path = require('path');

// 認証トークン（起動時に自動生成 or 環境変数で固定）
const AUTH_TOKEN = process.env.RELAY_TOKEN || crypto.randomBytes(20).toString('hex');
const PORT = Number(process.env.PORT) || 3741;

// 許可するCodexモデル
const ALLOWED_MODELS = new Set([
  'gpt-5.3-codex', 'gpt-5.4', 'gpt-5.4-mini', 'o4-mini', 'o3', 'gpt-4o',
]);

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); }
      catch (e) { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(json),
  });
  res.end(json);
}

function requireAuth(req, res) {
  if (req.headers['x-relay-token'] !== AUTH_TOKEN) {
    send(res, 401, { error: 'Unauthorized' });
    return false;
  }
  return true;
}

/**
 * POST /codex
 * body: { task: string, model?: string, workdir?: string, sandbox?: string }
 */
async function handleCodex(req, res) {
  const body = await parseBody(req);
  const { task, model = 'o4-mini', workdir, sandbox = 'workspace-write' } = body;

  if (!task) return send(res, 400, { error: '"task" is required' });

  const resolvedModel = ALLOWED_MODELS.has(model) ? model : 'o4-mini';
  const resolvedDir = workdir ? path.resolve(workdir) : process.cwd();

  console.log(`\n[codex] model=${resolvedModel} sandbox=${sandbox} dir=${resolvedDir}`);
  console.log(`[codex] task: ${task.slice(0, 120)}...`);

  return new Promise((resolve) => {
    const args = ['exec', '-m', resolvedModel, '--sandbox', sandbox, task];
    const child = spawn('codex', args, {
      cwd: resolvedDir,
      env: { ...process.env },
      timeout: 900_000,
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d.toString(); process.stdout.write(d); });
    child.stderr.on('data', (d) => { stderr += d.toString(); process.stderr.write(d); });
    child.on('close', (code) => {
      console.log(`[codex] exit=${code}`);
      send(res, 200, { success: code === 0, exitCode: code, stdout, stderr });
      resolve();
    });
    child.on('error', (err) => {
      console.error('[codex] spawn error:', err.message);
      send(res, 500, { success: false, error: err.message });
      resolve();
    });
  });
}

/**
 * POST /exec
 * body: { cmd: string, workdir?: string }
 * 安全なコマンドのみ許可（git diff, npm test など）
 */
async function handleExec(req, res) {
  const body = await parseBody(req);
  const { cmd, workdir } = body;

  if (!cmd) return send(res, 400, { error: '"cmd" is required' });

  const SAFE_PREFIXES = [
    'git diff', 'git log', 'git status', 'git show',
    'npm test', 'npx jest', 'npx tsc',
    'cat ', 'ls ', 'echo ',
  ];
  const isSafe = SAFE_PREFIXES.some((p) => cmd.trim().startsWith(p));
  if (!isSafe) {
    return send(res, 403, {
      error: `Command not allowed. Safe prefixes: ${SAFE_PREFIXES.join(', ')}`,
    });
  }

  const resolvedDir = workdir ? path.resolve(workdir) : process.cwd();
  try {
    const output = execSync(cmd, { cwd: resolvedDir, timeout: 60_000, encoding: 'utf8' });
    send(res, 200, { success: true, output });
  } catch (err) {
    send(res, 200, {
      success: false,
      error: err.message,
      stdout: err.stdout?.toString() ?? '',
      stderr: err.stderr?.toString() ?? '',
    });
  }
}

function handlePing(res) {
  send(res, 200, { ok: true, ts: new Date().toISOString() });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-relay-token');

  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method === 'GET' && req.url === '/ping') return handlePing(res);
  if (!requireAuth(req, res)) return;

  try {
    if (req.method === 'POST' && req.url === '/codex') return await handleCodex(req, res);
    if (req.method === 'POST' && req.url === '/exec')  return await handleExec(req, res);
    send(res, 404, { error: 'Not found. Endpoints: POST /codex, POST /exec, GET /ping' });
  } catch (err) {
    console.error('[server error]', err);
    send(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Local Relay Server');
  console.log(`  Port    : ${PORT}`);
  console.log(`  Token   : ${AUTH_TOKEN}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  次のステップ:');
  console.log('  1. ngrok http 3741');
  console.log('  2. 表示されたURLをリモートClaude Codeに伝える');
  console.log('  3. RELAY_TOKEN も伝える');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
