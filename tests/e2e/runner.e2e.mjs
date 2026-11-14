import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { startServer, loadPlaywright } from './server.mjs';

let srv, browser, page;
before(async () => {
  srv = await startServer(path.resolve('site'));
  browser = await loadPlaywright().chromium.launch();
  page = await browser.newPage();
  await page.goto(srv.url + '/index.html#/__nada__');
});
after(async () => { await browser?.close(); srv?.server.close(); });

test('JS: saida, erro e loop infinito interrompido', async () => {
  const r = await page.evaluate(async () => {
    const m = await import('/js/engine/runner.js');
    const ok = await m.runJavaScript('console.log("oi", [1,2]); setTimeout(() => console.log("depois"), 30);');
    const err = await m.runJavaScript('console.log(1); x.y;');
    const t0 = performance.now();
    const loop = await m.runJavaScript('while(true){}', { timeoutMs: 1500 });
    const elapsed = performance.now() - t0;
    // page still responsive
    const alive = await new Promise((res) => setTimeout(() => res(true), 10));
    const input = await m.runJavaScript('console.log(prompt() + "!")', { stdin: 'Ana' });
    return { ok, err, loop, elapsed, alive, input };
  });
  assert.equal(r.ok.stdout, 'oi [1, 2]\ndepois\n');
  assert.equal(r.ok.error ?? null, null);
  assert.match(r.err.error, /ReferenceError/);
  assert.equal(r.err.stdout, '1\n');
  assert.equal(r.loop.timedOut, true);
  assert.ok(r.elapsed < 3000);
  assert.equal(r.alive, true);
  assert.equal(r.input.stdout, 'Ana!\n');
});

test('Web: checkWeb valida elementos, texto e estilo', async () => {
  const r = await page.evaluate(async () => {
    const m = await import('/js/engine/runner.js');
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-same-origin');
    document.body.appendChild(frame);
    await new Promise((res) => { frame.onload = res; frame.srcdoc = m.renderPreview('<h1 class="t">Olá</h1><a href="x">l</a>', 'h1 { color: red; }'); });
    const doc = frame.contentDocument;
    return {
      good: m.checkWeb(doc, [{ selector: 'h1', text: 'olá' }, { selector: 'h1', style: { color: 'red' } }, { selector: 'a', attr: { href: true } }]),
      bad: m.checkWeb(doc, [{ selector: 'p' }, { selector: 'h1', style: { color: 'blue' }, message: 'pinte de azul' }]),
    };
  });
  assert.equal(r.good.passed, true);
  assert.equal(r.bad.passed, false);
  assert.equal(r.bad.failures.length, 2);
  assert.equal(r.bad.failures[1], 'pinte de azul');
});
