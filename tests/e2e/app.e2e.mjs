import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { startServer, loadPlaywright } from './server.mjs';

const SHOTS = process.env.SHOTS;
let srv, browser, context, page;
const errors = [];

before(async () => {
  srv = await startServer(path.resolve('site'));
  browser = await loadPlaywright().chromium.launch();
  context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  await context.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, body: '', contentType: 'text/css' }));
  page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
});
after(async () => { await browser?.close(); srv?.server.close(); });

const shot = async (name) => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true }); } };

test('home carrega com trilhas e sem erros', async () => {
  await page.goto(srv.url + '/#/');
  await page.waitForSelector('.track-card');
  assert.ok(await page.locator('.track-card').count() >= 1);
  await shot('home');
  assert.deepEqual(errors, []);
});

test('rota inexistente mostra 404 com link para o inicio', async () => {
  await page.goto(srv.url + '/#/trilha/xyz');
  await page.waitForSelector('.not-found');
  assert.ok(await page.locator('.not-found a[href="#/"]').count());
  await page.goto(srv.url + '/#/nada/aqui/mesmo');
  await page.waitForSelector('.not-found');
});

test('tema alterna e persiste apos recarregar', async () => {
  await page.goto(srv.url + '/#/');
  await page.waitForSelector('.topbar .icon-btn');
  const before = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.click('.topbar .icon-btn');
  const afterClick = await page.evaluate(() => document.documentElement.dataset.theme);
  assert.notEqual(before, afterClick);
  await page.reload();
  await page.waitForSelector('.track-card');
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), afterClick);
  await page.click('.topbar .icon-btn');
});

test('fluxo: licao -> quiz aprovado -> proximo modulo liberado -> XP aumentou', async () => {
  await page.goto(srv.url + '/#/trilha/python');
  await page.waitForSelector('.module');
  await shot('track');
  assert.equal(await page.locator('.module.locked').count() >= 1, true);
  const xp0 = await page.evaluate(() => JSON.parse(localStorage.getItem('devtrilhas:v1') || '{"xp":0}').xp);

  await page.goto(srv.url + '/#/trilha/python/intro/l1');
  await page.waitForSelector('.lesson-main');
  await shot('lesson');
  await page.click('.lesson-nav .btn-primary');
  await page.waitForURL(/intro\/l2/);
  await page.waitForSelector('.lesson-main .exercise');
  const text = await page.locator('.lesson-main').innerText();
  assert.ok(!/^null$/m.test(text), 'licao nao deve exibir "null"');

  // answer the quiz correctly using the track data
  const quiz = await page.evaluate(async () => {
    const { TRACKS } = await import('/js/tracks/index.js');
    return TRACKS[0].modules[0].quiz.map((q) => ({ type: q.type, answer: Array.isArray(q.answer) ? q.answer[0] : q.answer }));
  });
  await page.goto(srv.url + '/#/trilha/python/intro/quiz');
  await page.waitForSelector('.quiz-card');
  for (let i = 0; i < quiz.length; i++) {
    const q = quiz[i];
    if (q.type === 'choice') await page.locator('.quiz-card .option').nth(q.answer).click();
    else if (q.type === 'find-bug') await page.locator('.quiz-card .bug-line').nth(q.answer - 1).click();
    else await page.fill('.quiz-card input', String(q.answer));
    if (i < quiz.length - 1) await page.click('.quiz-nav .btn-primary');
  }
  await shot('quiz-last');
  await page.click('.quiz-nav .btn-primary');
  await page.waitForSelector('.result.passed');
  await shot('quiz-result');
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('devtrilhas:v1')));
  assert.equal(state.quizzes['python/intro'], 100);
  assert.ok(state.xp > xp0, 'xp aumentou');
  assert.ok(state.achievements.includes('first-lesson'));

  await page.goto(srv.url + '/#/trilha/python');
  await page.waitForSelector('.module');
  const second = page.locator('.path > .module').nth(1);
  assert.ok(!(await second.getAttribute('class')).includes('locked'), 'modulo 2 liberado');
  await page.goto(srv.url + '/#/trilha/python/variaveis/l1');
  await page.waitForSelector('.lesson-main');
});

test('quiz reprovado nao libera e mostra revisao', async () => {
  await page.goto(srv.url + '/#/trilha/python/variaveis/quiz');
  await page.waitForSelector('.quiz-card');
  page.once('dialog', (d) => d.accept());
  const n = await page.locator('.quiz-dot').count();
  await page.locator('.quiz-dot').nth(n - 1).click();
  await page.click('.quiz-nav .btn-primary');
  await page.waitForSelector('.result.failed');
  assert.ok(await page.locator('.review-item.bad').count() >= 1);
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('devtrilhas:v1')));
  assert.equal(state.quizzes['python/variaveis'], 0);
});

test('painel mostra estatisticas e conquistas', async () => {
  await page.goto(srv.url + '/#/painel');
  await page.waitForSelector('.dash-hero');
  assert.ok(await page.locator('.badge.got').count() >= 1);
  await shot('dashboard');
  assert.deepEqual(errors, []);
});

test('localStorage corrompido: abre do zero e avisa', async () => {
  await page.evaluate(() => localStorage.setItem('devtrilhas:v1', '{quebrado'));
  await page.goto(srv.url + '/#/');
  await page.reload();
  await page.waitForSelector('.track-card');
  assert.ok(await page.locator('.toast.warn').count() >= 1);
});

test('layout de celular nao tem rolagem horizontal', async () => {
  const mobile = await browser.newPage({ viewport: { width: 360, height: 740 } });
  for (const route of ['#/', '#/trilha/python', '#/trilha/python/intro/l2', '#/painel', '#/glossario']) {
    await mobile.goto(srv.url + '/' + route);
    await mobile.waitForSelector('main > *:not(.boot)');
    const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 0, `${route} tem rolagem horizontal de ${overflow}px`);
  }
  if (SHOTS) { await mobile.goto(srv.url + '/#/trilha/python/intro/l2'); await mobile.waitForSelector('.lesson-main'); await mobile.screenshot({ path: path.join(SHOTS, 'mobile-lesson.png'), fullPage: true }); }
  await mobile.close();
});
