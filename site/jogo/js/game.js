// Uma partida numa fase: jogador, inimigos, itens, câmera, partículas e regras.
import { TILE as T, PHYS as P } from './config.js';
import { makePlayer, stepPlayer, interactStatic, hazardHit, overlap, TL, isSolidCode } from './physics.js';
import { parseLevel, makeWorld, buildPlatforms, stepPlatform } from './level.js';
import { THEMES } from './themes.js';
import { SKINS } from './sprites.js';

const cache = new Map();
const rnd = (a, b) => a + Math.random() * (b - a);
const NO_INPUT = { left: false, right: false, jump: false, jumpPressed: false, dashPressed: false };

export function getParsed(def) {
  let p = cache.get(def.id);
  if (!p) { p = parseLevel(def); cache.set(def.id, p); }
  return p;
}

export class Game {
  constructor(def, opts = {}) {
    this.def = def;
    this.worldIndex = def.world ?? 0;
    this.theme = THEMES[this.worldIndex];
    this.parsed = getParsed(def);
    this.world = makeWorld(this.parsed);
    this.skin = opts.skin || 'classica';
    this.skinLight = (SKINS.find((s) => s.id === this.skin) || SKINS[0]).light;
    this.hooks = opts.hooks || {};
    this.demo = !!opts.demo;
    this.vw = 384; this.vh = 216;

    const ents = this.parsed.ents;
    this.decor = ents.filter((e) => e.type === 'T' || e.type === '*' || e.type === '?')
      .map((e) => ({ type: e.type, x: e.x, y: e.y, v: (e.tx + e.ty) % 2, hint: e.hint }));
    this.coins = ents.filter((e) => e.type === 'o').map((e) => ({ x: e.x + 8, y: e.y + 8, got: false, phase: Math.random() * 6 }));
    const had = opts.gemsHad || [];
    this.gems = ents.filter((e) => e.type === 'G').sort((a, b) => a.tx - b.tx || a.ty - b.ty)
      .map((e, i) => ({ x: e.x + 8, y: e.y + 8, got: false, had: !!had[i], idx: i }));
    this.checkpoints = ents.filter((e) => e.type === 'C').map((e) => ({ x: e.x, y: e.y, tx: e.tx, ty: e.ty, lit: false }));
    const ex = ents.find((e) => e.type === 'E');
    this.exit = { x: ex.x, y: ex.y, lit: false };
    this.springs = this.world.springs = ents.filter((e) => e.type === 'J').map((e) => ({ x: e.x, y: e.y, anim: 0 }));
    this.orbs = this.world.orbs = ents.filter((e) => e.type === 'f').map((e) => ({ x: e.x + 8, y: e.y + 8, cd: 0 }));
    this.platforms = this.world.platforms = buildPlatforms(this.parsed, def.platformSpeed || 0.8);
    this.crumbles = [];
    const { w, h, base } = this.parsed;
    for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
      if (base[ty * w + tx] === TL.CRUMBLE) this.crumbles.push({ tx, ty, x: tx * T, y: ty * T, state: 'idle', t: 0 });
    }
    this.staticLights = this.makeStaticLights();

    this.coinsTotal = this.coins.length;
    this.time = 0; this.deaths = 0; this.coinsGot = 0; this.brasas = 0;
    this.kills = 0; this.combo = 0; this.bestCombo = 0; this.coinChain = 0; this.lastCoin = -99;
    this.particles = []; this.popups = []; this.afterimages = []; this.shots = [];
    this.spawn = { x: this.parsed.start.x, y: this.parsed.start.y };
    this.frame = 0; this.freeze = 0; this.shake = 0; this.flash = 0;
    this.squash = { x: 1, y: 1 };
    this.lastDashFrame = -99;
    this.state = 'spawn'; this.stateT = 0;
    this.iris = 0; this.irisAt = null;
    this.playerVisible = true;
    this.hintIdx = -1;
    this.completed = false;
    this.player = makePlayer(this.spawn.x - 5, this.spawn.y - 12);
    this.resetDynamic();
    this.cam = { x: 0, y: 0 };
    this.look = 0;
    this.camAnchorY = this.player.y + 6;
    this.updateCamera(true);
  }

  setView(vw, vh) {
    const changed = vw !== this.vw || vh !== this.vh;
    this.vw = vw; this.vh = vh;
    if (changed) this.updateCamera(true);
  }

  emit(name, a, b) { const f = this.hooks[name]; if (f) f(a, b); }
  sfx(name, opt) { this.emit('sfx', name, opt); }

  makeStaticLights() {
    const L = [];
    for (const d of this.decor) {
      if (d.type === 'T') L.push({ x: d.x + 8, y: d.y + 4, r: 62, i: 0.95, c: '#ff8a2a', glow: 0.3, flick: 1 });
      if (d.type === '*') L.push({ x: d.x + 8, y: d.y + 8, r: 50, i: 0.85, c: d.v ? '#d36bff' : '#4fc3ff', glow: 0.3 });
    }
    if (this.worldIndex === 2 || this.def.glowWater) {
      const { w, h } = this.parsed;
      for (let ty = 0; ty < h; ty++) for (let tx = 0; tx < w; tx++) {
        if (this.world.tileAt(tx, ty) === TL.WATER && this.world.tileAt(tx, ty - 1) !== TL.WATER && tx % 3 === 0) {
          L.push({ x: tx * T + 8, y: ty * T + 8, r: 34, i: 0.4, c: '#2fd0d0', glow: 0.18 });
        }
      }
    }
    return L;
  }

  resetDynamic() {
    const ents = this.parsed.ents;
    let ti = 0;
    this.enemies = ents.filter((e) => 'sbhkt'.includes(e.type)).map((e) => {
      const en = { type: e.type, x: e.x + 2, y: e.y + T - 9, w: 12, h: 9, vx: 0, vy: 0, face: -1, dead: false, flash: 0, t: Math.random() * 200 };
      if (e.type === 's') en.vx = -0.42;
      if (e.type === 'h') en.vx = -0.55;
      if (e.type === 'k') en.vx = -0.5;
      if (e.type === 'b') { en.bx = e.x + 2; en.by = e.y + 3; en.y = en.by; en.h = 8; en.range = 30; }
      if (e.type === 't') { en.w = 14; en.h = 12; en.x = e.x + 1; en.y = e.y + 4; en.cd = 70 + (ti++ % 3) * 35; en.mouth = 0; }
      return en;
    });
    this.drips = ents.filter((e) => e.type === 'D').map((e) => ({ x: e.x, y: e.y, dy: e.y + 7, vy: 0, state: 'hang', t: 0 }));
    for (const c of this.crumbles) {
      c.state = 'idle'; c.t = 0;
      this.world.setTile(c.tx, c.ty, TL.CRUMBLE);
    }
    for (const o of this.orbs) o.cd = 0;
    this.shots.length = 0;
    const pls = buildPlatforms(this.parsed, this.def.platformSpeed || 0.8);
    for (let i = 0; i < pls.length; i++) Object.assign(this.platforms[i], pls[i]);
    const r = this.def.rising;
    if (r) {
      this.world.waterY = this.spawn.y + r.below * T;
      this.risingWait = r.delay ?? 90;
    }
  }

  // ---------- quadro ----------
  update(input) {
    const inp = this.state === 'play' && !this.demo ? input : NO_INPUT;
    this.heldJump = inp.jump;
    this.frame++;
    if (this.flash > 0) this.flash--;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - 0.6);
    this.updateParticles();
    if (this.freeze > 0) { this.freeze--; return; }

    if (this.state === 'play' && !this.demo) this.time++;
    this.stateT++;

    if (this.state === 'spawn') {
      this.iris = Math.min(1, this.stateT / 22);
      if (this.stateT === 1) this.burstIn();
      if (this.stateT >= 22) { this.state = 'play'; this.stateT = 0; this.iris = 1; }
    }

    for (const pl of this.platforms) {
      stepPlatform(pl, this.world);
      if (this.player.plat === pl && this.state !== 'dead') {
        const p = this.player;
        const nx = p.x + pl.dx;
        if (!this.rectBlocked(nx, p.y)) p.x = nx;
        p.y = pl.y - p.h;
      }
    }

    if (this.state !== 'dead') this.updatePlayer(inp);
    else this.updateDeath();

    this.updateEnemies();
    this.updateShots();
    this.updateDrips();
    this.updateCrumbles();
    for (const s of this.springs) if (s.anim > 0) s.anim--;
    for (const o of this.orbs) if (o.cd > 0) { o.cd--; if (o.cd === 0) this.ring(o.x, o.y, '#ffb347', 10); }

    if (this.world.waterY !== undefined && this.state === 'play') {
      if (this.risingWait > 0) this.risingWait--;
      else {
        const p = this.player;
        let sp = this.def.rising.speed;
        if (this.world.waterY - (p.y + p.h) > 11 * T) sp *= 3;
        this.world.waterY -= sp;
        if (this.frame % 3 === 0) this.particles.push({ x: this.cam.x + Math.random() * this.vw, y: this.world.waterY + 1, vx: 0, vy: -0.3, life: 20, max: 20, color: this.theme.water[2], size: 1, grav: 0 });
      }
    }

    if (this.state === 'win') this.updateWin();
    if (this.demo) this.updateDemo();
    this.updateCamera(false);
  }

  rectBlocked(x, y) {
    const p = this.player;
    const x0 = Math.floor(x / T), x1 = Math.floor((x + p.w - 0.001) / T);
    const y0 = Math.floor(y / T), y1 = Math.floor((y + p.h - 0.001) / T);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (isSolidCode(this.world.tileAt(tx, ty))) return true;
    return false;
  }

  updatePlayer(inp) {
    const p = this.player;
    if (this.state === 'spawn' || this.state === 'win') {
      stepPlayer(p, NO_INPUT, this.world);
      if (this.state === 'win') { p.vx *= 0.8; }
      this.squashRelax();
      return;
    }
    const wasDash = p.dashing > 0;
    stepPlayer(p, inp, this.world);
    interactStatic(p, this.world);
    if (p.dashing > 0) this.lastDashFrame = this.frame;

    for (const ev of p.events) this.onPlayerEvent(ev, p);
    if (wasDash && p.dashing === 0) this.squash.x = 1;

    // rastro
    if (p.dashing > 0 && this.frame % 2 === 0) this.afterimages.push({ x: p.x, y: p.y, face: p.dashDir, life: 14 });
    if (this.frame % (p.dashing > 0 ? 1 : 5) === 0) {
      this.particles.push({ x: p.x + 5 + rnd(-2, 2), y: p.y + 2, vx: rnd(-0.2, 0.2) - p.vx * 0.15, vy: rnd(-0.7, -0.3), life: 26, max: 26, color: this.skinLight, size: 1, grav: -0.005, glow: true });
    }
    if (p.sliding && this.frame % 4 === 0) {
      this.particles.push({ x: p.x + (p.wallDir > 0 ? p.w : 0), y: p.y + 8, vx: -p.wallDir * 0.3, vy: rnd(-0.6, -0.1), life: 16, max: 16, color: '#ffd27a', size: 1, grav: 0.02, glow: true });
    }

    if (p.onGround && this.combo > 0) {
      if (this.combo >= 2) this.emit('comboEnd', this.combo);
      this.combo = 0;
    }

    this.checkPickups();
    const hz = hazardHit(p, this.world);
    if (hz) { this.die(hz); return; }
    this.squashRelax();
  }

  squashRelax() {
    this.squash.x += (1 - this.squash.x) * 0.25;
    this.squash.y += (1 - this.squash.y) * 0.25;
  }

  onPlayerEvent(ev, p) {
    const fx = p.x + 5, fy = p.y + p.h;
    switch (ev) {
      case 'jump':
        this.sfx('jump');
        this.dust(fx, fy, 5);
        this.squash.x = 0.72; this.squash.y = 1.3;
        break;
      case 'walljump':
        this.sfx('walljump');
        this.dust(p.x + (p.facing > 0 ? 0 : p.w), p.y + 8, 6, p.facing);
        this.squash.x = 0.75; this.squash.y = 1.25;
        break;
      case 'dash':
        this.sfx('dash');
        this.shake = Math.max(this.shake, 2);
        for (let i = 0; i < 12; i++) this.particles.push({ x: fx, y: p.y + 6, vx: -p.dashDir * rnd(0.5, 2.5), vy: rnd(-1, 1), life: rnd(12, 24), max: 24, color: i % 2 ? '#ffd27a' : this.skinLight, size: i % 3 ? 1 : 2, grav: 0, glow: true });
        this.squash.x = 1.35; this.squash.y = 0.7;
        this.emit('vibrate', 12);
        break;
      case 'dashjump': this.sfx('dashjump'); break;
      case 'land':
        this.dust(fx, fy, 3);
        this.squash.x = 1.2; this.squash.y = 0.82;
        break;
      case 'landhard':
        this.sfx('land');
        this.dust(fx, fy, 8);
        this.squash.x = 1.35; this.squash.y = 0.7;
        break;
      case 'spring':
        this.sfx('spring');
        this.squash.x = 0.65; this.squash.y = 1.4;
        for (let i = 0; i < 8; i++) this.particles.push({ x: fx + rnd(-6, 6), y: fy, vx: rnd(-1, 1), vy: rnd(-2, -0.5), life: 20, max: 20, color: '#ff6a5a', size: 1, grav: 0.1 });
        this.emit('vibrate', 15);
        break;
      case 'orb':
        this.sfx('orb');
        this.ring(fx, p.y + 6, '#ffcf6b', 16);
        this.flash = Math.max(this.flash, 3);
        break;
      case 'dashwall':
        this.shake = Math.max(this.shake, 2);
        for (let i = 0; i < 6; i++) this.particles.push({ x: p.x + (p.dashDir > 0 ? p.w : 0), y: p.y + 6, vx: -p.dashDir * rnd(0.3, 1.5), vy: rnd(-1.5, 1.5), life: 14, max: 14, color: '#ffe0a0', size: 1, grav: 0.05, glow: true });
        break;
      default:
    }
  }

  checkPickups() {
    const p = this.player;
    const pcx = p.x + 5, pcy = p.y + 6;
    for (const c of this.coins) {
      if (c.got) continue;
      const dx = pcx - c.x, dy = pcy - c.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 30 * 30) {
        const d = Math.sqrt(d2) || 1;
        c.x += (dx / d) * 2.2; c.y += (dy / d) * 2.2;
      }
      if (d2 < 10 * 10) {
        c.got = true;
        this.coinsGot++; this.brasas++;
        this.coinChain = this.frame - this.lastCoin < 40 ? Math.min(this.coinChain + 1, 14) : 0;
        this.lastCoin = this.frame;
        this.sfx('coin', this.coinChain);
        for (let i = 0; i < 5; i++) this.particles.push({ x: c.x, y: c.y, vx: rnd(-1, 1), vy: rnd(-1.4, -0.2), life: 16, max: 16, color: i % 2 ? '#ffd27a' : '#ff8a2a', size: 1, grav: 0.05, glow: true });
        this.emit('hud');
      }
    }
    for (const g of this.gems) {
      if (g.got) continue;
      if (overlap(p, g.x - 6, g.y - 6, 12, 12)) {
        g.got = true;
        this.sfx('gem');
        this.flash = 10; this.freeze = 6; this.shake = 3;
        this.ring(g.x, g.y, '#ff6f7d', 26);
        for (let i = 0; i < 18; i++) this.particles.push({ x: g.x, y: g.y, vx: rnd(-2, 2), vy: rnd(-2.5, 0.5), life: 30, max: 30, color: i % 2 ? '#ff6f7d' : '#ffe0e0', size: i % 3 ? 1 : 2, grav: 0.06, glow: true });
        this.popups.push({ x: g.x, y: g.y - 12, text: '!', color: '#ff9aa6', life: 40 });
        this.emit('gem', g.idx, g.had);
        this.emit('hud');
        this.emit('vibrate', 30);
      }
    }
    for (const c of this.checkpoints) {
      if (overlap(p, c.x, c.y - 16, 16, 32)) {
        const sx = c.x + 8, sy = (c.ty + 1) * T;
        if (!c.lit) {
          c.lit = true;
          this.sfx('checkpoint');
          this.ring(c.x + 7, c.y - 4, '#ffd27a', 30);
          this.flash = 6;
          this.emit('checkpoint');
        }
        this.spawn = { x: sx, y: sy };
      }
    }
    const e = this.exit;
    if (!this.demo && this.state === 'play' && overlap(p, e.x - 4, e.y - 18, 24, 34)) this.win();
    let near = -1;
    for (const d of this.decor) {
      if (d.type === '?' && Math.abs(d.x + 8 - pcx) < 34 && Math.abs(d.y + 8 - pcy) < 40) near = d.hint;
    }
    if (near !== this.hintIdx) {
      this.hintIdx = near;
      this.emit('hint', near >= 0 ? (this.def.hints || [])[near] : null);
    }
  }

  // ---------- inimigos ----------
  updateEnemies() {
    const p = this.player;
    const alive = this.state === 'play';
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.t++;
      if (e.flash > 0) e.flash--;
      if (e.type === 's' || e.type === 'h' || e.type === 'k') this.walk(e);
      else if (e.type === 'b') {
        const nx = e.bx + Math.sin(e.t * 0.025) * e.range;
        e.face = nx > e.x ? 1 : -1;
        e.x = nx;
        e.y = e.by + Math.sin(e.t * 0.07) * 6;
      } else if (e.type === 't') {
        e.face = p.x + 5 < e.x + 7 ? -1 : 1;
        if (e.mouth > 0) e.mouth--;
        const dx = Math.abs(p.x - e.x), dy = Math.abs(p.y - e.y);
        if (e.cd > 0) e.cd--;
        else if (dx < 14 * T && dy < 5 * T && alive) {
          e.cd = 125;
          e.mouth = 14;
          this.shots.push({ x: e.x + 7 + e.face * 9, y: e.y + 5, vx: e.face * 1.6, life: 400 });
          if (dx < 12 * T) this.sfx('shoot');
        }
      }
      if (alive) this.hitEnemy(e);
    }
  }

  walk(e) {
    const W = this.world;
    e.vy = Math.min(e.vy + 0.25, 4);
    let ny = e.y + e.vy;
    const row = Math.floor((ny + e.h) / T);
    const x0 = Math.floor(e.x / T), x1 = Math.floor((e.x + e.w - 0.01) / T);
    let grounded = false;
    for (let tx = x0; tx <= x1; tx++) {
      const c = W.tileAt(tx, row);
      if ((isSolidCode(c) || c === TL.ONEWAY) && e.y + e.h <= row * T + 0.5) { ny = row * T - e.h; e.vy = 0; grounded = true; }
    }
    e.y = ny;
    if (e.y > W.h * T + 32) { e.dead = true; return; }
    if (!grounded) return;
    const nx = e.x + e.vx;
    const front = e.vx > 0 ? nx + e.w : nx;
    const ftx = Math.floor(front / T);
    const mid = W.tileAt(ftx, Math.floor((e.y + e.h - 2) / T));
    const below = W.tileAt(ftx, Math.floor((e.y + e.h + 2) / T));
    const wall = isSolidCode(mid) || (mid >= TL.SPIKE_U && mid <= TL.WATER);
    const floor = isSolidCode(below) || below === TL.ONEWAY;
    if (wall || !floor) e.vx = -e.vx;
    else e.x = nx;
    e.face = e.vx > 0 ? 1 : -1;
  }

  hitEnemy(e) {
    const p = this.player;
    if (!overlap(p, e.x + 1, e.y + 1, e.w - 2, e.h - 1)) return;
    const dashing = p.dashing > 0 || this.frame - this.lastDashFrame <= 4;
    const fromAbove = p.vy > 0.2 && p.y + p.h - p.vy <= e.y + 6;
    if (dashing && !fromAbove) {
      if (e.type === 'k') {
        p.dashing = 0;
        p.vx = -p.dashDir * 2.8;
        p.vy = -3.4;
        this.lastDashFrame = -99;
        e.flash = 10;
        e.x += p.dashDir * 3;
        this.shake = 4; this.freeze = 3;
        this.sfx('clang');
        for (let i = 0; i < 10; i++) this.particles.push({ x: e.x + 6, y: e.y + 4, vx: rnd(-2, 2), vy: rnd(-2, 0), life: 18, max: 18, color: '#bff4ff', size: 1, grav: 0.1, glow: true });
        return;
      }
      p.vy = -P.dashHitBounce;
      p.dashing = 0;
      p.vx = p.dashDir * 2.2;
      p.dashAvail = true;
      p.dashCD = 0;
      p.canCut = false;
      this.lastDashFrame = -99;
      this.kill(e);
    } else if (fromAbove) {
      if (e.type === 'h') { this.die('spike'); return; }
      p.vy = -(this.heldJump ? P.stompBounceHeld : P.stompBounce);
      p.y = e.y - p.h;
      p.dashAvail = true;
      p.canCut = false;
      this.squash.x = 1.3; this.squash.y = 0.75;
      this.kill(e);
    } else {
      this.die('enemy');
    }
  }

  kill(e) {
    e.dead = true;
    const p = this.player;
    this.combo = p.onGround ? 1 : this.combo + 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.kills++;
    const reward = Math.min(this.combo, 8);
    this.brasas += reward;
    this.freeze = 4 + Math.min(this.combo, 4);
    this.shake = 4 + Math.min(this.combo, 5);
    this.sfx('kill', this.combo);
    const cols = { s: ['#c07ac8', '#7a2f86'], b: ['#8d5a7d', '#ff4a3a'], h: ['#c49a6a', '#e8dcc4'], k: ['#9fe6ff', '#3fa6c8'], t: ['#7fd8d0', '#1f7f8f'] }[e.type];
    const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
    for (let i = 0; i < 14; i++) this.particles.push({ x: cx, y: cy, vx: rnd(-2.2, 2.2), vy: rnd(-2.8, 0.2), life: rnd(18, 30), max: 30, color: cols[i % 2], size: i % 3 ? 1 : 2, grav: 0.12 });
    for (let i = 0; i < 6; i++) this.particles.push({ x: cx, y: cy, vx: rnd(-1.5, 1.5), vy: rnd(-1.5, 1.5), life: 16, max: 16, color: '#ffe7a8', size: 1, grav: 0, glow: true });
    this.ring(cx, cy, '#fff2c2', 14);
    this.popups.push({ x: cx, y: e.y - 6, text: this.combo >= 2 ? `x${this.combo}` : `+${reward}`, color: this.combo >= 2 ? '#ffd23a' : '#fff2c2', life: 45 });
    this.emit('combo', this.combo);
    this.emit('hud');
    this.emit('vibrate', 20 + Math.min(this.combo, 6) * 6);
  }

  updateShots() {
    const W = this.world, p = this.player;
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const s = this.shots[i];
      s.x += s.vx; s.life--;
      const c = W.tileAt(Math.floor(s.x / T), Math.floor(s.y / T));
      let gone = s.life <= 0 || isSolidCode(c);
      if (!gone && this.state === 'play' && overlap(p, s.x - 3, s.y - 3, 6, 6)) {
        if (p.dashing > 0) { gone = true; this.sfx('pop'); this.brasas += 1; this.popups.push({ x: s.x, y: s.y - 6, text: '+1', color: '#bff4ff', life: 30 }); }
        else { this.die('water'); }
      }
      if (gone) {
        for (let k = 0; k < 6; k++) this.particles.push({ x: s.x, y: s.y, vx: rnd(-1.2, 1.2), vy: rnd(-1.5, 0), life: 14, max: 14, color: '#8fdcff', size: 1, grav: 0.12 });
        this.shots.splice(i, 1);
      }
    }
  }

  updateDrips() {
    const W = this.world, p = this.player;
    for (const d of this.drips) {
      if (d.state === 'hang') {
        const dx = Math.abs(p.x + 5 - (d.x + 8));
        if (this.state === 'play' && dx < 30 && p.y > d.y && p.y - d.y < 11 * T) { d.state = 'shake'; d.t = 14; this.sfx('drip'); }
      } else if (d.state === 'shake') {
        if (--d.t <= 0) { d.state = 'fall'; d.vy = 0; }
      } else if (d.state === 'fall') {
        d.vy = Math.min(d.vy + 0.25, 5);
        d.dy += d.vy;
        const c = W.tileAt(Math.floor((d.x + 8) / T), Math.floor((d.dy + 6) / T));
        const hitWater = W.waterY !== undefined && d.dy + 6 > W.waterY;
        if (isSolidCode(c) || c === TL.ONEWAY || c === TL.WATER || hitWater || d.dy > W.h * T) {
          for (let k = 0; k < 7; k++) this.particles.push({ x: d.x + 8, y: d.dy + 5, vx: rnd(-1.3, 1.3), vy: rnd(-1.8, -0.3), life: 16, max: 16, color: '#8fdcff', size: 1, grav: 0.12 });
          d.state = 'wait'; d.t = 80; d.dy = d.y + 7;
        } else if (this.state === 'play' && overlap(p, d.x + 5, d.dy, 6, 7)) this.die('water');
      } else if (d.state === 'wait') {
        if (--d.t <= 0) d.state = 'hang';
      }
    }
  }

  updateCrumbles() {
    const W = this.world, p = this.player;
    if (p.onGround && this.state === 'play') {
      const row = Math.round((p.y + p.h) / T);
      for (const c of this.crumbles) {
        if (c.state === 'idle' && c.ty === row && p.x + p.w > c.x && p.x < c.x + T) {
          c.state = 'shake'; c.t = 24; this.sfx('crack');
        }
      }
    }
    for (const c of this.crumbles) {
      if (c.state === 'shake') {
        if (--c.t <= 0) {
          c.state = 'gone'; c.t = 200;
          W.setTile(c.tx, c.ty, TL.EMPTY);
          this.sfx('crumble');
          for (let k = 0; k < 8; k++) this.particles.push({ x: c.x + rnd(2, 14), y: c.y + rnd(2, 14), vx: rnd(-0.8, 0.8), vy: rnd(-1, 0.5), life: 30, max: 30, color: k % 2 ? this.theme.rock.base : this.theme.rock.light, size: 2, grav: 0.15 });
        }
      } else if (c.state === 'gone') {
        if (--c.t <= 0) {
          if (overlap(p, c.x, c.y, T, T)) c.t = 20;
          else { c.state = 'idle'; W.setTile(c.tx, c.ty, TL.CRUMBLE); this.ring(c.x + 8, c.y + 8, this.theme.rock.light, 8); }
        }
      }
    }
  }

  // ---------- morte, vitória ----------
  die(cause) {
    if (this.state !== 'play' || this.demo) return;
    const p = this.player;
    this.state = 'dead'; this.stateT = 0;
    this.deaths++;
    this.playerVisible = false;
    this.deathAt = { x: p.x + 5, y: p.y + 6 };
    this.combo = 0;
    this.afterimages.length = 0;
    this.sfx(cause === 'water' ? 'fizz' : 'die');
    this.shake = 7;
    this.emit('vibrate', 90);
    const cx = p.x + 5, cy = p.y + 6;
    if (cause === 'water') {
      for (let i = 0; i < 26; i++) this.particles.push({ x: cx + rnd(-4, 4), y: cy + rnd(-3, 3), vx: rnd(-0.6, 0.6), vy: rnd(-1.6, -0.3), life: rnd(25, 50), max: 50, color: i % 3 ? '#d8e4ea' : '#9fb3bf', size: i % 2 ? 2 : 1, grav: -0.01, alpha: 0.8 });
    }
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * Math.PI * 2, s = rnd(0.5, 3.2);
      this.particles.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.6, life: rnd(20, 40), max: 40, color: i % 3 === 0 ? '#fff2c2' : this.skinLight, size: i % 4 ? 1 : 2, grav: 0.08, glow: true });
    }
    this.emit('death', cause);
  }

  updateDeath() {
    const t = this.stateT;
    if (t > 30) { this.iris = Math.max(0, 1 - (t - 30) / 18); this.irisAt = this.deathAt; }
    if (t >= 50) this.respawn();
  }

  respawn() {
    const p = makePlayer(this.spawn.x - 5, this.spawn.y - 12);
    p.facing = this.player.facing;
    this.player = p;
    this.resetDynamic();
    this.playerVisible = true;
    this.state = 'spawn'; this.stateT = 0;
    this.irisAt = null;
    this.camAnchorY = p.y + 6;
    this.updateCamera(true);
    this.emit('hud');
  }

  burstIn() {
    const p = this.player;
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      this.particles.push({ x: p.x + 5 + Math.cos(a) * 16, y: p.y + 6 + Math.sin(a) * 16, vx: -Math.cos(a) * 0.9, vy: -Math.sin(a) * 0.9, life: 18, max: 18, color: this.skinLight, size: 1, grav: 0, glow: true });
    }
    if (!this.demo) this.sfx('spawn');
  }

  win() {
    this.state = 'win'; this.stateT = 0;
    this.exit.lit = true;
    this.flash = 18; this.shake = 4;
    this.combo = 0;
    this.sfx('win');
    this.emit('win');
    this.emit('vibrate', 60);
    const e = this.exit;
    for (let i = 0; i < 40; i++) this.particles.push({ x: e.x + 8 + rnd(-10, 10), y: e.y + 2, vx: rnd(-1.2, 1.2), vy: rnd(-3.5, -0.8), life: rnd(30, 60), max: 60, color: i % 3 ? '#ffb347' : '#fff2c2', size: i % 3 ? 1 : 2, grav: 0.03, glow: true });
  }

  updateWin() {
    const e = this.exit;
    if (this.frame % 2 === 0) this.particles.push({ x: e.x + 8 + rnd(-9, 9), y: e.y + 2, vx: rnd(-0.3, 0.3), vy: rnd(-1.6, -0.6), life: 30, max: 30, color: Math.random() < 0.5 ? '#ff8a2a' : '#ffd27a', size: 1, grav: -0.01, glow: true });
    const p = this.player;
    p.x += (e.x + 3 - p.x) * 0.08;
    if (this.stateT === 80 && !this.completed) {
      this.completed = true;
      this.emit('complete', this.stats());
    }
  }

  stats() {
    return {
      id: this.def.id,
      time: this.time,
      deaths: this.deaths,
      coins: this.coinsGot,
      coinsTotal: this.coinsTotal,
      brasas: this.brasas,
      gems: this.gems.map((g) => g.got),
      bestCombo: this.bestCombo,
      kills: this.kills,
    };
  }

  updateDemo() {
    const p = this.player;
    if (this.state === 'play' && this.frame % 220 === 120 && p.onGround) {
      p.vy = -P.jumpV * 0.8;
      p.onGround = false;
      this.squash.x = 0.75; this.squash.y = 1.25;
    }
  }

  // ---------- câmera ----------
  updateCamera(snap) {
    const p = this.player;
    const vw = this.vw, vh = this.vh;
    const lw = this.parsed.w * T, lh = this.parsed.h * T;
    const target = p.facing * Math.min(36, vw * 0.1);
    this.look += (target - this.look) * (snap ? 1 : 0.035);
    const py = p.y + 6;
    if (snap || p.onGround || p.sliding || py < this.camAnchorY - vh * 0.22 || py > this.camAnchorY + vh * 0.12) {
      if (!snap && !p.onGround && !p.sliding) {
        if (py < this.camAnchorY - vh * 0.22) this.camAnchorY = py + vh * 0.22;
        else if (py > this.camAnchorY + vh * 0.12) this.camAnchorY = py - vh * 0.12;
      } else this.camAnchorY = py;
    }
    if (this.demo) this.camAnchorY = this.demoCamY ?? py;
    let tx = p.x + 5 + this.look - vw / 2;
    let ty = this.camAnchorY - vh * 0.56;
    if (this.state === 'dead' && this.deathAt) tx = this.deathAt.x + this.look - vw / 2;
    if (this.demo) tx = this.demoCamX ?? tx;
    tx = lw <= vw ? (lw - vw) / 2 : Math.max(0, Math.min(lw - vw, tx));
    ty = lh <= vh ? (lh - vh) / 2 : Math.max(0, Math.min(lh - vh, ty));
    if (snap) { this.cam.x = tx; this.cam.y = ty; }
    else {
      this.cam.x += (tx - this.cam.x) * 0.12;
      this.cam.y += (ty - this.cam.y) * 0.1;
    }
  }

  // ---------- efeitos ----------
  dust(x, y, n, dir = 0) {
    for (let i = 0; i < n; i++) this.particles.push({ x: x + rnd(-4, 4), y: y - 1, vx: rnd(-0.8, 0.8) + dir * 0.6, vy: rnd(-0.7, -0.1), life: rnd(12, 22), max: 22, color: this.theme.rock.light, size: i % 2 ? 2 : 1, grav: 0.02, alpha: 0.8 });
  }
  ring(x, y, color, r) { this.particles.push({ x, y, vx: 0, vy: 0, life: 18, max: 18, color, ring: true, r, size: 1, grav: 0, glow: true }); }

  updateParticles() {
    const ps = this.particles;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.x += p.vx; p.y += p.vy; p.vy += p.grav; p.vx *= 0.97;
      if (--p.life <= 0) { ps[i] = ps[ps.length - 1]; ps.pop(); }
    }
    if (ps.length > 600) ps.splice(0, ps.length - 600);
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.y -= 0.35;
      if (--p.life <= 0) this.popups.splice(i, 1);
    }
    for (let i = this.afterimages.length - 1; i >= 0; i--) if (--this.afterimages[i].life <= 0) this.afterimages.splice(i, 1);
  }

  collectLights(cx, cy, vw, vh) {
    const out = [];
    const m = 90;
    const inView = (x, y) => x > cx - m && x < cx + vw + m && y > cy - m && y < cy + vh + m;
    const t = this.frame;
    const p = this.player;
    if (this.playerVisible) {
      const fl = Math.sin(t * 0.21) * 2.5 + Math.sin(t * 0.53) * 1.5;
      out.push({ x: p.x + 5, y: p.y + 4, r: 84 + fl + (p.dashing > 0 ? 16 : 0), i: 1, c: this.skinLight, glow: 0.26 });
    } else if (this.deathAt && this.state === 'dead') {
      out.push({ x: this.deathAt.x, y: this.deathAt.y, r: Math.max(0, 80 - this.stateT * 2.2), i: 1, c: this.skinLight, glow: 0.3 });
    }
    for (const L of this.staticLights) {
      if (!inView(L.x, L.y)) continue;
      const fl = L.flick ? Math.sin(t * 0.3 + L.x) * 3 + Math.sin(t * 0.77 + L.y) * 2 : 0;
      out.push({ x: L.x, y: L.y, r: L.r + fl, i: L.i, c: L.c, glow: L.glow });
    }
    for (const c of this.checkpoints) {
      if (!inView(c.x, c.y)) continue;
      if (c.lit) out.push({ x: c.x + 7, y: c.y - 6, r: 74 + Math.sin(t * 0.2 + c.x) * 2, i: 1, c: '#ffcf6b', glow: 0.28 });
      else out.push({ x: c.x + 7, y: c.y - 6, r: 22, i: 0.35, c: '#8aa0b8', glow: 0.1 });
    }
    const e = this.exit;
    if (inView(e.x, e.y)) {
      if (e.lit) out.push({ x: e.x + 8, y: e.y - 4, r: 130 + Math.sin(t * 0.25) * 5, i: 1, c: '#ffb347', glow: 0.35 });
      else out.push({ x: e.x + 8, y: e.y - 2, r: 48 + Math.sin(t * 0.25) * 3, i: 0.7, c: '#ff7a2a', glow: 0.25 });
    }
    for (const g of this.gems) if (!g.got && inView(g.x, g.y)) out.push({ x: g.x, y: g.y, r: 28, i: 0.7, c: g.had ? '#8fa6d6' : '#ff4a6a', glow: 0.3 });
    for (const o of this.orbs) if (o.cd <= 0 && inView(o.x, o.y)) out.push({ x: o.x, y: o.y, r: 38, i: 0.85, c: '#ff8a3a', glow: 0.3 });
    let n = 0;
    for (const c of this.coins) {
      if (c.got || !inView(c.x, c.y)) continue;
      out.push({ x: c.x, y: c.y, r: 14, i: 0.5, c: null });
      if (++n > 40) break;
    }
    for (const s of this.shots) out.push({ x: s.x, y: s.y, r: 14, i: 0.5, c: '#5fc8ff', glow: 0.2 });
    return out;
  }
}
