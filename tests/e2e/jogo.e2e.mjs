// Testes de navegador do jogo Faísca (site/jogo).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { startServer, loadPlaywright } from './server.mjs';

const SHOTS = process.env.SHOTS;
let srv, browser;
const errors = [];

before(async () => {
  srv = await startServer(path.resolve('site'));
  browser = await loadPlaywright().chromium.launch();
});
after(async () => { await browser?.close(); srv?.server.close(); });

async function open(opts = {}, query = '') {
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, ...opts });
  await context.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, body: '', contentType: 'text/css' }));
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`${srv.url}/jogo/index.html${query}`);
  await page.waitForFunction(() => window.__faisca && window.__faisca.mode !== 'boot');
  return { page, context };
}
const shot = async (page, name) => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, `jogo-${name}.png`) }); } };

test('título abre e o mapa lista 12 fases com só a primeira liberada', async () => {
  const { page, context } = await open();
  await page.waitForSelector('#scr-title:not([hidden])');
  await shot(page, 'titulo');
  await page.click('#t-play');
  await page.waitForSelector('#scr-map:not([hidden])');
  assert.equal(await page.locator('.lvl').count(), 12);
  assert.equal(await page.locator('.lvl:not(.locked)').count(), 1);
  await shot(page, 'mapa');
  await context.close();
  assert.deepEqual(errors, []);
});

test('jogar 1-1: anda, pula, pausa e conclui a fase', async () => {
  const { page, context } = await open();
  await page.click('#t-play');
  await page.click('.lvl:not(.locked)');
  await page.waitForFunction(() => window.__faisca.mode === 'play');
  await page.waitForFunction(() => window.__faisca.game.state === 'play');
  const x0 = await page.evaluate(() => window.__faisca.game.player.x);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(700);
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  await page.keyboard.up('ArrowRight');
  const st = await page.evaluate(() => ({ x: window.__faisca.game.player.x, coins: window.__faisca.game.coinsGot }));
  assert.ok(st.x > x0 + 40, `a Faísca andou (${x0} -> ${st.x})`);
  assert.ok(st.coins > 0, 'pegou brasas no caminho');
  await page.keyboard.press('Escape');
  await page.waitForSelector('#scr-pause:not([hidden])');
  await page.click('#p-resume');
  // leva a Faísca até o braseiro
  await page.evaluate(() => {
    const g = window.__faisca.game;
    g.player.x = g.exit.x + 3; g.player.y = g.exit.y + 4; g.player.vy = 0;
  });
  await page.waitForSelector('#scr-complete:not([hidden])', { timeout: 5000 });
  await shot(page, 'resultado');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('faisca.save.v1')));
  assert.equal(saved.levels['1-1'].done, true);
  assert.ok(saved.wallet > 0);
  await page.click('#r-map');
  await page.waitForSelector('#scr-map:not([hidden])');
  assert.equal(await page.locator('.lvl:not(.locked)').count(), 2);
  await context.close();
  assert.deepEqual(errors, []);
});

test('cair nos espinhos apaga a Faísca e ela renasce na lanterna', async () => {
  const { page, context } = await open({}, '?fase=1-1');
  await page.waitForFunction(() => window.__faisca.game.state === 'play');
  await page.evaluate(() => {
    const g = window.__faisca.game;
    const c = g.checkpoints[0];
    g.player.x = c.x + 3; g.player.y = c.y + 4;
  });
  await page.waitForTimeout(150);
  await page.evaluate(() => {
    const g = window.__faisca.game;
    g.player.x = 31 * 16 + 2; g.player.y = 9 * 16 + 2; g.player.vy = 1;
  });
  await page.waitForFunction(() => window.__faisca.game.deaths === 1);
  await page.waitForFunction(() => window.__faisca.game.state === 'play', null, { timeout: 4000 });
  const p = await page.evaluate(() => { const g = window.__faisca.game; return { x: g.player.x, sx: g.spawn.x }; });
  assert.ok(Math.abs(p.x + 5 - p.sx) < 4, 'renasceu na lanterna');
  await context.close();
  assert.deepEqual(errors, []);
});

test('na fase 3-4 a água sobe', async () => {
  const { page, context } = await open({}, '?fase=3-4');
  await page.waitForFunction(() => window.__faisca.game.state === 'play');
  const w0 = await page.evaluate(() => window.__faisca.game.world.waterY);
  await page.waitForTimeout(3500);
  const w1 = await page.evaluate(() => window.__faisca.game.world.waterY);
  assert.ok(w1 < w0 - 4, `água subiu (${w0} -> ${w1})`);
  await shot(page, 'mare');
  await context.close();
  assert.deepEqual(errors, []);
});

test('terminar a última fase mostra o final', async () => {
  const { page, context } = await open();
  await page.evaluate(() => {
    const levels = {};
    for (const l of window.__faisca.LEVELS.slice(0, 11)) levels[l.id] = { done: true, gems: [true, true, false], bestTime: 3000, bestCoins: 1, bestCombo: 0 };
    localStorage.setItem('faisca.save.v1', JSON.stringify({ levels }));
  });
  await page.reload();
  await page.waitForFunction(() => window.__faisca && window.__faisca.mode === 'title');
  await page.evaluate(() => window.__faisca.startLevel(11));
  await page.waitForFunction(() => window.__faisca.game.state === 'play');
  await page.evaluate(() => { const g = window.__faisca.game; g.player.x = g.exit.x + 3; g.player.y = g.exit.y + 4; g.player.vy = 0; });
  await page.waitForSelector('#scr-complete:not([hidden])', { timeout: 5000 });
  assert.equal(await page.textContent('#r-next'), 'Ver o final');
  await page.click('#r-next');
  await page.waitForSelector('#scr-ending:not([hidden])');
  assert.match(await page.textContent('#e-gems'), /^22\/36$/);
  await shot(page, 'final');
  await context.close();
  assert.deepEqual(errors, []);
});

test('todas as fases carregam e rodam alguns segundos sem erro', async () => {
  const { page, context } = await open();
  const ids = await page.evaluate(() => window.__faisca.LEVELS.map((l) => l.id));
  for (let i = 0; i < ids.length; i++) {
    await page.evaluate((k) => window.__faisca.startLevel(k), i);
    await page.waitForTimeout(450);
    const ok = await page.evaluate(() => window.__faisca.game.state !== undefined && window.__faisca.game.frame > 10);
    assert.ok(ok, `fase ${ids[i]} rodando`);
  }
  await context.close();
  assert.deepEqual(errors, []);
});

test('celular em pé: console portátil sem botões sobrepostos e toque no PULO pula', async () => {
  const { page, context } = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }, '?fase=1-1');
  await page.waitForFunction(() => window.__faisca.game && window.__faisca.game.state === 'play');
  assert.ok(await page.evaluate(() => document.getElementById('app').classList.contains('portrait')));
  const boxes = await page.evaluate(() => ['b-left', 'b-right', 'b-dash', 'b-jump'].map((id) => {
    const r = document.getElementById(id).getBoundingClientRect();
    return { id, l: r.left, r: r.right, t: r.top, b: r.bottom };
  }));
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      const over = a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
      assert.ok(!over, `${a.id} e ${b.id} não se sobrepõem`);
    }
    assert.ok(boxes[i].l >= 0 && boxes[i].r <= 390, `${boxes[i].id} cabe na tela`);
  }
  const jb = boxes.find((b) => b.id === 'b-jump');
  await page.touchscreen.tap((jb.l + jb.r) / 2, (jb.t + jb.b) / 2);
  await page.waitForTimeout(80);
  const vy = await page.evaluate(() => window.__faisca.game.player.y);
  const y0 = await page.evaluate(() => window.__faisca.game.spawn.y - 12);
  assert.ok(vy < y0 - 4, 'subiu depois do toque');
  await shot(page, 'retrato');
  await context.close();
  assert.deepEqual(errors, []);
});

test('loja mostra as 6 chamas e compra quando há brasas', async () => {
  const { page, context } = await open();
  await page.evaluate(() => {
    localStorage.setItem('faisca.save.v1', JSON.stringify({ wallet: 500 }));
  });
  await page.reload();
  await page.waitForSelector('#scr-title:not([hidden])');
  await page.click('#t-shop');
  await page.waitForSelector('#scr-shop:not([hidden])');
  assert.equal(await page.locator('.skin').count(), 6);
  await page.locator('.skin').nth(1).locator('button').click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('faisca.save.v1')));
  assert.equal(saved.skin, 'fatuo');
  assert.equal(saved.wallet, 380);
  await shot(page, 'loja');
  await context.close();
  assert.deepEqual(errors, []);
});
