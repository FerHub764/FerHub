// Every HTML/CSS exercise: the solution must pass its checks and the starter must not.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { startServer, loadPlaywright } from './server.mjs';

let srv, browser, page;
before(async () => {
  srv = await startServer(path.resolve('site'));
  browser = await loadPlaywright().chromium.launch();
  page = await browser.newPage();
  await page.route(/placehold\.co|fonts\.(googleapis|gstatic)/, (r) => r.fulfill({ status: 200, body: '' }));
  await page.goto(srv.url + '/index.html#/__nada__');
});
after(async () => { await browser?.close(); srv?.server.close(); });

test('exercicios web: solucao passa e codigo inicial falha', async () => {
  const results = await page.evaluate(async () => {
    const { default: track } = await import('/js/tracks/html-css/index.js');
    const m = await import('/js/engine/runner.js');
    const out = [];
    async function check(html, css, checks) {
      const frame = document.createElement('iframe');
      frame.setAttribute('sandbox', 'allow-same-origin');
      document.body.appendChild(frame);
      await new Promise((res) => { frame.onload = res; frame.srcdoc = m.renderPreview(html, css); });
      const r = m.checkWeb(frame.contentDocument, checks);
      frame.remove();
      return r;
    }
    for (const mod of track.modules) for (const l of mod.lessons) for (const [i, ex] of (l.exercises || []).entries()) {
      if (ex.type !== 'web') continue;
      const sol = await check(ex.solution.html ?? ex.html, ex.solution.css ?? ex.css, ex.checks);
      const start = await check(ex.html, ex.css, ex.checks);
      out.push({ where: `${mod.id}/${l.id}/ex${i + 1}`, sol, start });
    }
    return out;
  });
  assert.ok(results.length >= 8);
  for (const r of results) {
    assert.ok(r.sol.passed, `${r.where}: solucao falhou: ${r.sol.failures.join(' | ')}`);
    assert.ok(!r.start.passed, `${r.where}: codigo inicial ja passa`);
  }
});
