// Verificador de fases: procura, com a física real do jogo, uma sequência de
// comandos que leve do início até a saída e até cada gema. Inimigos são
// ignorados (podem ser evitados ou derrotados); plataformas móveis viram
// plataformas fixas ao longo do trajeto (o jogador pode esperar por elas).
//
// Uso: node tools/jogo/solver.mjs [id-da-fase ...] [--mapa]
import { TILE as T, PHYS } from '../../site/jogo/js/config.js';
import { makePlayer, stepPlayer, interactStatic, hazardHit, overlap } from '../../site/jogo/js/physics.js';
import { parseLevel, makeWorld, buildPlatforms, stepPlatform } from '../../site/jogo/js/level.js';
import { LEVELS } from '../../site/jogo/js/levels/index.js';

function staticPlatforms(parsed, world) {
  const out = [];
  for (const pl of buildPlatforms(parsed)) {
    const seen = new Set();
    for (let i = 0; i < 4000; i++) {
      const key = `${Math.round(pl.x / 12)},${Math.round(pl.y / 12)}`;
      if (!seen.has(key)) { seen.add(key); out.push({ x: pl.x, y: pl.y, w: pl.w, h: pl.h, dx: 0, dy: 0 }); }
      stepPlatform(pl, world);
      if (i > 10 && Math.abs(pl.x - pl.x0) < 0.5 && Math.abs(pl.y - pl.y0) < 0.5) break;
    }
  }
  return out;
}

function clone(p) {
  const c = { ...p };
  c.events = [];
  return c;
}

const INP = { left: false, right: false, jump: false, jumpPressed: false, dashPressed: false };
function setDir(d) { INP.left = d < 0; INP.right = d > 0; }

function groundMacros() {
  const list = [];
  for (const d of [-1, 1]) {
    for (const run of [5, 12, 26]) list.push({ kind: 'walk', d, run });
    for (const run of [0, 9, 22]) {
      for (const hold of [3, 8, 13, 60]) {
        for (const air of ['same', 'none', 'back']) {
          for (const dashAt of [-1, 3, 11, 19, 27]) {
            if (air !== 'same' && dashAt >= 0) continue;
            list.push({ kind: 'jump', d, run, hold, air, dashAt });
          }
        }
      }
    }
    // dash no chão seguido de pulo (dash-pulo)
    list.push({ kind: 'dashjump', d, hold: 60 });
    list.push({ kind: 'dashjump', d, hold: 8 });
  }
  for (const hold of [4, 60]) list.push({ kind: 'jump', d: 0, run: 0, hold, air: 'same', dashAt: -1 });
  return list;
}

function wallMacros() {
  const list = [];
  for (const hold of [6, 12, 60]) {
    for (const after of ['away', 'toward', 'none']) {
      for (const dashAt of [-1, 4, 12, 20]) {
        if (after !== 'away' && dashAt >= 0) continue;
        list.push({ kind: 'walljump', hold, after, dashAt });
      }
    }
  }
  list.push({ kind: 'release' });
  list.push({ kind: 'slide' });
  return list;
}

function inputFor(m, f, wd, p, ctx) {
  INP.jumpPressed = false; INP.dashPressed = false; INP.jump = false;
  // depois de sair do chão e pousar de novo, solta tudo para a Faísca parar
  if (m.kind !== 'walk') {
    if (!p.onGround) ctx.air = true;
    else if (ctx.air && f > 2) { setDir(0); return INP; }
  }
  if (m.kind === 'walk') { setDir(f < m.run ? m.d : 0); return INP; }
  if (m.kind === 'jump') {
    if (f < m.run) { setDir(m.d); return INP; }
    const t = f - m.run;
    if (t === 0) INP.jumpPressed = true;
    INP.jump = t < m.hold;
    let d = m.d;
    if (m.air === 'none' && t > 10) d = 0;
    if (m.air === 'back' && t > 12) d = -m.d;
    setDir(d);
    if (m.dashAt >= 0 && t === m.dashAt) INP.dashPressed = true;
    return INP;
  }
  if (m.kind === 'dashjump') {
    setDir(m.d);
    if (f === 0) INP.dashPressed = true;
    if (f === 3) INP.jumpPressed = true;
    INP.jump = f >= 3 && f < 3 + m.hold;
    return INP;
  }
  if (m.kind === 'walljump') {
    if (f === 0) INP.jumpPressed = true;
    INP.jump = f < m.hold;
    let d = -wd;
    if (f >= PHYS.wallJumpLock) d = m.after === 'away' ? -wd : m.after === 'toward' ? wd : 0;
    setDir(d);
    if (m.dashAt >= 0 && f === m.dashAt) INP.dashPressed = true;
    return INP;
  }
  if (m.kind === 'release') { setDir(0); return INP; }
  if (m.kind === 'slide') { setDir(f < 24 ? wd : 0); return INP; }
  return INP;
}

export function solveLevel(def, { maxNodes = 60000 } = {}) {
  const parsed = parseLevel(def);
  const world = makeWorld(parsed);
  world.platforms = staticPlatforms(parsed, world);
  world.springs = parsed.ents.filter((e) => e.type === 'J').map((e) => ({ x: e.x, y: e.y, anim: 0 }));
  world.orbs = parsed.ents.filter((e) => e.type === 'f').map((e) => ({ x: e.x + 8, y: e.y + 8, cd: 0 }));

  const goals = [];
  for (const e of parsed.ents) {
    if (e.type === 'E') goals.push({ name: 'saída', x: e.x - 4, y: e.y - 16, w: 24, h: 32, hit: false });
    if (e.type === 'G') goals.push({ name: `gema (${e.tx},${e.ty})`, x: e.x + 2, y: e.y + 2, w: 12, h: 12, hit: false });
    if (e.type === 'C') goals.push({ name: `lanterna (${e.tx},${e.ty})`, x: e.x, y: e.y - 16, w: 16, h: 32, hit: false });
  }

  const gm = groundMacros();
  const wm = wallMacros();
  const seen = new Set();
  const queue = [];
  const visitedTiles = new Set();

  const startP = makePlayer(parsed.start.x - 5, parsed.start.y - 12);
  for (let i = 0; i < 30; i++) { setDir(0); INP.jump = INP.jumpPressed = INP.dashPressed = false; stepPlayer(startP, INP, world); }
  const keyOf = (p, kind) => (kind === 'w' ? `w${p.wallDir}${Math.round(p.x / 4)},${Math.round(p.y / 8)}` : `g${Math.round(p.x / 6)},${Math.round(p.y / 4)}`);
  const push = (p, kind, wd) => {
    const k = keyOf(p, kind);
    if (seen.has(k)) return;
    seen.add(k);
    queue.push({ p: clone(p), kind, wd });
    visitedTiles.add(`${Math.floor((p.x + 5) / T)},${Math.floor((p.y + 6) / T)}`);
  };
  push(startP, 'g', 0);

  let steps = 0;
  for (let qi = 0; qi < queue.length && qi < maxNodes; qi++) {
    if (goals.every((g) => g.hit)) break;
    const node = queue[qi];
    const macros = node.kind === 'g' ? gm : wm;
    for (const m of macros) {
      const p = clone(node.p);
      for (const o of world.orbs) o.cd = 0;
      const limit = 220;
      const ctx = { air: node.kind === 'w' };
      for (let f = 0; f < limit; f++) {
        const inp = inputFor(m, f, node.wd, p, ctx);
        stepPlayer(p, inp, world);
        interactStatic(p, world);
        for (const o of world.orbs) if (o.cd > 0) o.cd--;
        steps++;
        if (hazardHit(p, world)) break;
        for (const gl of goals) if (!gl.hit && overlap(p, gl.x, gl.y, gl.w, gl.h)) gl.hit = true;
        if (f < 4) continue;
        if (p.sliding && (m.kind !== 'slide')) { push(p, 'w', p.wallDir); break; }
        const released = m.kind === 'walk' ? f > m.run : true;
        if (released && p.onGround && Math.abs(p.vx) < 0.01 && p.dashing === 0 && !inp.left && !inp.right) { push(p, 'g', 0); break; }
        if (released && p.onGround && f > 120) { push(p, 'g', 0); break; }
      }
    }
  }
  return { parsed, goals, nodes: queue.length, steps, visitedTiles };
}

function drawMap(parsed, visitedTiles) {
  const rows = [];
  for (let y = 0; y < parsed.h; y++) {
    let s = '';
    for (let x = 0; x < parsed.w; x++) {
      const c = parsed.base[y * parsed.w + x];
      const e = parsed.ents.find((en) => en.tx === x && en.ty === y);
      let ch = c === 1 ? '#' : c === 2 ? '=' : c === 7 ? '~' : c === 8 ? 'i' : c === 10 ? 'X' : c >= 3 && c <= 6 ? '^' : '.';
      if (e) ch = e.type;
      if (visitedTiles.has(`${x},${y}`) && ch === '.') ch = '@';
      s += ch;
    }
    rows.push(s);
  }
  return rows.join('\n');
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const args = process.argv.slice(2);
  const showMap = args.includes('--mapa');
  const ids = args.filter((a) => !a.startsWith('--'));
  const defs = ids.length ? LEVELS.filter((l) => ids.includes(l.id)) : LEVELS;
  let ok = true;
  for (const def of defs) {
    const t0 = Date.now();
    const r = solveLevel(def);
    const missing = r.goals.filter((g) => !g.hit).map((g) => g.name);
    const status = missing.length ? `FALTA: ${missing.join(', ')}` : 'ok';
    if (missing.length) ok = false;
    console.log(`${def.id.padEnd(4)} ${def.name.padEnd(24)} ${String(r.nodes).padStart(6)} estados ${((Date.now() - t0) / 1000).toFixed(1)}s  ${status}`);
    if (showMap || missing.length) console.log(drawMap(r.parsed, r.visitedTiles));
  }
  process.exit(ok ? 0 : 1);
}
