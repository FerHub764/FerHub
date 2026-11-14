// Needs a local Pyodide copy: set PYODIDE_DIR to a folder with pyodide.js etc.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { startServer, loadPlaywright } from './server.mjs';

const DIR = process.env.PYODIDE_DIR;
let srv, browser, page;
before(async () => {
  if (!DIR) return;
  srv = await startServer(path.resolve('site'));
  browser = await loadPlaywright().chromium.launch();
  const context = await browser.newContext();
  await context.route('https://cdn.jsdelivr.net/pyodide/**', (route) => {
    const name = new URL(route.request().url()).pathname.split('/').pop();
    const file = path.join(DIR, name);
    if (!fs.existsSync(file)) return route.fulfill({ status: 404 });
    const type = name.endsWith('.wasm') ? 'application/wasm' : name.endsWith('.js') ? 'text/javascript' : name.endsWith('.json') ? 'application/json' : 'application/octet-stream';
    route.fulfill({ status: 200, body: fs.readFileSync(file), headers: { 'content-type': type, 'access-control-allow-origin': '*' } });
  });
  page = await context.newPage();
  await page.goto(srv.url + '/index.html#/__nada__');
});
after(async () => { await browser?.close(); srv?.server.close(); });

test('Python: saida, input, erro e loop infinito', { skip: !DIR && 'PYODIDE_DIR not set', timeout: 120000 }, async () => {
  const r = await page.evaluate(async () => {
    const m = await import('/js/engine/runner.js');
    const ok = await m.runPython('nome = input("Nome: ")\nprint(f"Olá, {nome}!")\nprint(2 + 3)', { stdin: 'Ana' });
    const err = await m.runPython('print("a")\nprint(x)');
    const loop = await m.runPython('while True:\n    pass', { timeoutMs: 1500 });
    const after = await m.runPython('print("voltei")');
    return { ok, err, loop, after };
  });
  assert.equal(r.ok.stdout, 'Nome: Ana\nOlá, Ana!\n5\n');
  assert.equal(r.err.stdout, 'a\n');
  assert.equal(r.err.error, "Linha 2: NameError: name 'x' is not defined");
  assert.equal(r.loop.timedOut, true);
  assert.equal(r.after.stdout, 'voltei\n');
});
