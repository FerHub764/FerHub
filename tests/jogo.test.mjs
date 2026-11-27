// Física e fases do jogo Faísca: cada fase precisa ser vencível e ter todas
// as gemas alcançáveis com a física real (verificador em tools/jogo/solver.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makePlayer, stepPlayer, hazardHit } from '../site/jogo/js/physics.js';
import { parseLevel, makeWorld } from '../site/jogo/js/level.js';
import { LEVELS, WORLDS } from '../site/jogo/js/levels/index.js';
import { recordCompletion, defaultSave, fmtTime } from '../site/jogo/js/save.js';
import { solveLevel } from '../tools/jogo/solver.mjs';
import { CHUNKS, START_CHUNK, EXIT_CHUNK, LANTERN_CHUNK, makeRun, RunGame } from '../site/jogo/js/endless.js';
import { ACHIEVEMENTS, checkAchievements } from '../site/jogo/js/achievements.js';
import { recordRun } from '../site/jogo/js/save.js';

const flat = { id: 't', map: ['#.......#', '#.......#', '#.......#', '#.......#', '#.......#', '#P......E', '#########'] };
const inp = (o = {}) => ({ left: false, right: false, jump: false, jumpPressed: false, dashPressed: false, ...o });

test('3 mundos com 4 fases, ids únicos e 3 gemas por fase', () => {
  assert.equal(WORLDS.length, 3);
  assert.equal(LEVELS.length, 12);
  assert.equal(new Set(LEVELS.map((l) => l.id)).size, 12);
  for (const l of LEVELS) {
    const p = parseLevel(l);
    assert.equal(p.ents.filter((e) => e.type === 'G').length, 3, `${l.id} tem 3 gemas`);
    assert.equal(p.ents.filter((e) => e.type === 'E').length, 1, `${l.id} tem 1 saída`);
    const signs = p.ents.filter((e) => e.type === '?').length;
    assert.ok((l.hints || []).length >= signs, `${l.id}: cada placa tem dica`);
  }
});

test('pulo sobe ~3,5 blocos e a Faísca pousa de volta', () => {
  const parsed = parseLevel(flat);
  const w = makeWorld(parsed);
  const p = makePlayer(parsed.start.x - 5, parsed.start.y - 12);
  for (let i = 0; i < 5; i++) stepPlayer(p, inp(), w);
  assert.ok(p.onGround);
  const y0 = p.y;
  stepPlayer(p, inp({ jump: true, jumpPressed: true }), w);
  let minY = p.y;
  for (let i = 0; i < 80; i++) { stepPlayer(p, inp({ jump: true }), w); minY = Math.min(minY, p.y); }
  const rise = (y0 - minY) / 16;
  assert.ok(rise > 3.3 && rise < 3.85, `subiu ${rise.toFixed(2)} blocos`);
  assert.ok(p.onGround);
});

test('dash anda ~3 blocos sem cair e é recarregado ao tocar o chão', () => {
  const parsed = parseLevel(flat);
  const w = makeWorld(parsed);
  const p = makePlayer(parsed.start.x - 5, parsed.start.y - 40);
  const x0 = p.x, y0 = p.y;
  stepPlayer(p, inp({ right: true, dashPressed: true }), w);
  for (let i = 0; i < 9; i++) stepPlayer(p, inp({ right: true }), w);
  assert.ok(p.x - x0 > 45, 'avançou');
  assert.ok(Math.abs(p.y - y0) < 0.5, 'não caiu durante o dash');
  assert.equal(p.dashAvail, false);
  for (let i = 0; i < 40; i++) stepPlayer(p, inp(), w);
  assert.ok(p.onGround && p.dashAvail);
});

test('espinhos e água apagam a Faísca', () => {
  const w = makeWorld(parseLevel({ id: 't', map: ['#####', '#P^~E', '#####'] }));
  const p = makePlayer(32 + 3, 16 + 4);
  assert.equal(hazardHit(p, w), 'spike');
  p.x = 48 + 3;
  assert.equal(hazardHit(p, w), 'water');
});

test('concluir fase grava recorde, gemas e brasas', () => {
  const s = defaultSave();
  const r1 = recordCompletion(s, { id: '1-1', time: 600, deaths: 2, coins: 10, brasas: 14, gems: [true, false, false], bestCombo: 3, kills: 4 });
  assert.equal(r1.firstClear, true);
  assert.equal(s.wallet, 14);
  const r2 = recordCompletion(s, { id: '1-1', time: 500, deaths: 0, coins: 12, brasas: 12, gems: [false, true, false], bestCombo: 1, kills: 0 });
  assert.equal(r2.newRecord, true);
  assert.deepEqual(s.levels['1-1'].gems, [true, true, false]);
  assert.deepEqual(r2.newGems, [false, true, false]);
  assert.equal(s.levels['1-1'].bestTime, 500);
  assert.equal(fmtTime(3723), '01:02.05');
});

for (const def of LEVELS) {
  test(`fase ${def.id} (${def.name}) é vencível e todas as gemas são alcançáveis`, () => {
    const r = solveLevel(def);
    const missing = r.goals.filter((g) => !g.hit).map((g) => g.name);
    assert.deepEqual(missing, []);
  });
}

test('Modo Fuga: corridas encaixam, têm lanternas e a mesma semente gera a mesma corrida', () => {
  const a = makeRun(123), b = makeRun(123), c = makeRun(124);
  assert.deepEqual(a.map, b.map);
  assert.notDeepEqual(a.map, c.map);
  assert.equal(a.map.length, 18);
  assert.ok(a.map.every((r) => r.length === a.map[0].length));
  const p = parseLevel(a);
  assert.ok(p.ents.filter((e) => e.type === 'C').length >= 10);
  assert.equal(p.ents.filter((e) => e.type === 'E').length, 1);
  assert.deepEqual(a.run.chunks.slice(1, 6).map((id) => CHUNKS.find((k) => k.id === id).tier), [1, 1, 1, 1, 1]);
});

test('Modo Fuga: a escuridão alcança quem fica parado e as 3 vidas acabam', () => {
  const g = new RunGame(makeRun(7), {});
  const idle = inp();
  let over = null;
  g.hooks.runover = (st) => { over = st; };
  for (let i = 0; i < 6000 && !over; i++) g.update(idle);
  assert.ok(over, 'corrida terminou');
  assert.equal(g.lives, 0);
  assert.equal(over.run, true);
});

for (const c of CHUNKS) {
  test(`trecho "${c.id}" do Modo Fuga é atravessável`, () => {
    const F = '################';
    const list = [START_CHUNK, c, EXIT_CHUNK];
    const map = [];
    for (let y = 0; y < 18; y++) map.push(list.map((k) => (y < 2 ? F : k.rows[y - 2])).join(''));
    const r = solveLevel({ id: c.id, name: c.id, map, hints: [] });
    assert.ok(r.goals.every((gl) => gl.hit), `saída alcançável depois de ${c.id}`);
    assert.equal(c.rows.length, 16);
    assert.ok(c.rows.every((row) => row.length === 16));
  });
}

test('troféus: corrida de 300 m e combo liberam os certos', () => {
  const s = defaultSave();
  assert.deepEqual(checkAchievements(s), []);
  recordRun(s, { distance: 320, brasas: 40, kills: 3, deaths: 3, time: 600, bestCombo: 3, escaped: false });
  const ids = checkAchievements(s).map((a) => a.id);
  assert.ok(ids.includes('fuga300') && ids.includes('combo3'));
  assert.ok(!ids.includes('fuga1000'));
  assert.deepEqual(checkAchievements(s), [], 'não repete');
  assert.equal(new Set(ACHIEVEMENTS.map((a) => a.id)).size, ACHIEVEMENTS.length);
});
