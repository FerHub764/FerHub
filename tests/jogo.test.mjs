// Física e fases do jogo Faísca: cada fase precisa ser vencível e ter todas
// as gemas alcançáveis com a física real (verificador em tools/jogo/solver.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makePlayer, stepPlayer, hazardHit } from '../site/jogo/js/physics.js';
import { parseLevel, makeWorld } from '../site/jogo/js/level.js';
import { LEVELS, WORLDS } from '../site/jogo/js/levels/index.js';
import { recordCompletion, defaultSave, fmtTime } from '../site/jogo/js/save.js';
import { solveLevel } from '../tools/jogo/solver.mjs';

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
