// Full path to the certificate for a main track (python) and an essential track (git).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { startServer, loadPlaywright } from './server.mjs';

const SHOTS = process.env.SHOTS;
let srv, browser, page;
const errors = [];

before(async () => {
  srv = await startServer(path.resolve('site'));
  browser = await loadPlaywright().chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 860 }, acceptDownloads: true });
  await context.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, body: '', contentType: 'text/css' }));
  page = await context.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
});
after(async () => { await browser?.close(); srv?.server.close(); });

async function passAllQuizzes(trackId) {
  await page.goto(srv.url + '/#/');
  await page.evaluate(async (id) => {
    const { TRACKS } = await import('/js/tracks/index.js');
    const t = TRACKS.find((x) => x.id === id);
    const s = JSON.parse(localStorage.getItem('devtrilhas:v1') || '{}');
    s.quizzes = s.quizzes || {};
    for (const m of t.modules) s.quizzes[`${id}/${m.id}`] = 100;
    localStorage.setItem('devtrilhas:v1', JSON.stringify(s));
  }, trackId);
  await page.reload();
}

async function answerExam(trackId) {
  const answers = await page.evaluate(async (id) => {
    const { TRACKS } = await import('/js/tracks/index.js');
    const t = TRACKS.find((x) => x.id === id);
    const all = [...t.modules.flatMap((m) => m.quiz), ...t.exam];
    return Object.fromEntries(all.map((q) => [q.id, { type: q.type, answer: Array.isArray(q.answer) ? q.answer[0] : q.answer }]));
  }, trackId);
  const total = await page.locator('.quiz-dot').count();
  for (let i = 0; i < total; i++) {
    const qid = await page.locator('.quiz-card').getAttribute('data-qid');
    const q = answers[qid];
    if (q.type === 'choice') await page.locator('.quiz-card .option').nth(q.answer).click();
    else if (q.type === 'find-bug') await page.locator('.quiz-card .bug-line').nth(q.answer - 1).click();
    else await page.fill('.quiz-card input', String(q.answer));
    await page.click('.quiz-nav .btn-primary');
  }
}

for (const trackId of ['python', 'git']) {
  test(`${trackId}: prova final exige nome, aprova e gera certificado PNG`, async () => {
    await passAllQuizzes(trackId);
    await page.goto(srv.url + `/#/trilha/${trackId}/prova`);
    await page.waitForSelector('.exam-intro');
    await page.fill('#exam-name', '');
    await page.click('.exam-intro .btn-primary');
    assert.match(await page.locator('.field-error').innerText(), /nome/i, 'nome vazio e bloqueado');
    await page.fill('#exam-name', 'Maria Eduarda dos Santos Albuquerque Ferreira');
    await page.click('.exam-intro .btn-primary');
    await page.waitForSelector('.quiz-timer');
    await answerExam(trackId);
    await page.waitForSelector('.result.passed');
    const state = await page.evaluate(() => JSON.parse(localStorage.getItem('devtrilhas:v1')));
    assert.equal(state.exams[trackId].score, 100);
    assert.ok(state.achievements.includes('first-cert'));

    await page.click('.result .btn-primary');
    await page.waitForSelector('.cert-canvas');
    await page.waitForTimeout(300);
    if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, `cert-${trackId}.png`), fullPage: true }); }
    const [download] = await Promise.all([page.waitForEvent('download'), page.click('.cert-actions .btn-primary')]);
    assert.match(download.suggestedFilename(), new RegExp(`^certificado-${trackId}-maria-eduarda.*\\.png$`));
    const file = await download.path();
    const head = fs.readFileSync(file).subarray(0, 8);
    assert.deepEqual([...head.subarray(1, 4)], [0x50, 0x4e, 0x47], 'arquivo e PNG');
    assert.deepEqual(errors, []);
  });
}

test('certificado bloqueado sem aprovacao', async () => {
  await page.evaluate(() => localStorage.clear());
  await page.goto(srv.url + '/#/certificado/rust');
  await page.waitForSelector('.empty.card');
  await page.goto(srv.url + '/#/trilha/rust/prova');
  await page.waitForSelector('.empty.card');
});

test('backup: exporta e importa o progresso', async () => {
  await page.goto(srv.url + '/#/');
  await page.evaluate(() => localStorage.setItem('devtrilhas:v1', JSON.stringify({ xp: 321, name: 'Teste' })));
  await page.goto(srv.url + '/#/painel');
  await page.reload();
  await page.waitForSelector('.backup');
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('.backup .btn >> text=Exportar')]);
  const json = fs.readFileSync(await download.path(), 'utf8');
  assert.equal(JSON.parse(json).xp, 321);
  page.once('dialog', (d) => d.accept());
  await page.click('.backup .btn-danger');
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('devtrilhas:v1')).xp === 0);
  await page.setInputFiles('#import-file', { name: 'b.json', mimeType: 'application/json', buffer: Buffer.from(json) });
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('devtrilhas:v1')).xp === 321);
  await page.setInputFiles('#import-file', { name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('lixo') });
  await page.waitForSelector('.toast.warn');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('devtrilhas:v1')).xp), 321);
});
