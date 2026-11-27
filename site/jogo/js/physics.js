// Física da Faísca. Este módulo não toca em DOM nem em canvas, para que o
// verificador de fases (tools/jogo/solver.mjs) rode a mesma física no Node.
import { TILE as T, PHYS as P, PW, PH } from './config.js';

export const TL = {
  EMPTY: 0,
  SOLID: 1,
  ONEWAY: 2,
  SPIKE_U: 3,
  SPIKE_D: 4,
  SPIKE_L: 5,
  SPIKE_R: 6,
  WATER: 7,
  ICE: 8,
  MARK: 9,
  CRUMBLE: 10,
};

const SOLID = new Uint8Array(16);
SOLID[TL.SOLID] = SOLID[TL.ICE] = SOLID[TL.CRUMBLE] = 1;

export const isSolidCode = (c) => SOLID[c] === 1;

export function makePlayer(x, y) {
  return {
    x, y, w: PW, h: PH,
    vx: 0, vy: 0,
    onGround: false, ground: 0, plat: null,
    coyote: 0, jumpBuf: 0, canCut: false,
    wallDir: 0, wallCoyote: 0, wallCoyoteDir: 0, wallLock: 0, wallLockDir: 0,
    sliding: false,
    facing: 1,
    dashing: 0, dashDir: 1, dashAvail: true, dashCD: 0,
    events: [],
  };
}

export function rectSolid(world, x, y, w, h) {
  const x0 = Math.floor(x / T), x1 = Math.floor((x + w - 0.0001) / T);
  const y0 = Math.floor(y / T), y1 = Math.floor((y + h - 0.0001) / T);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) if (SOLID[world.tileAt(tx, ty)]) return true;
  }
  return false;
}

function moveX(p, world, dx) {
  if (dx === 0) return false;
  let nx = p.x + dx;
  if (!rectSolid(world, nx, p.y, p.w, p.h)) { p.x = nx; return false; }
  // Durante o dash, sobe um degrauzinho (até 5 px) em vez de bater na quina.
  if (p.dashing > 0) {
    for (let k = 1; k <= 5; k++) {
      if (!rectSolid(world, nx, p.y - k, p.w, p.h)) { p.x = nx; p.y -= k; return false; }
    }
  }
  if (dx > 0) nx = Math.floor((nx + p.w - 0.0001) / T) * T - p.w;
  else nx = (Math.floor(nx / T) + 1) * T;
  if (rectSolid(world, nx, p.y, p.w, p.h)) nx = p.x;
  p.x = nx;
  return true;
}

function landOnPlatforms(p, world, prevBottom, newBottom) {
  const list = world.platforms;
  if (!list) return null;
  for (let i = 0; i < list.length; i++) {
    const pl = list[i];
    if (pl.off) continue;
    if (p.x + p.w <= pl.x || p.x >= pl.x + pl.w) continue;
    const tol = 0.01 + Math.max(0, -(pl.dy || 0));
    if (prevBottom <= pl.y + tol && newBottom >= pl.y) return pl;
  }
  return null;
}

function moveY(p, world, dy) {
  const prevBottom = p.y + p.h;
  let ny = p.y + dy;
  if (dy > 0) {
    if (rectSolid(world, p.x, ny, p.w, p.h)) {
      const row = Math.floor((ny + p.h - 0.0001) / T);
      p.y = row * T - p.h;
      if (rectSolid(world, p.x, p.y, p.w, p.h)) p.y = ny - dy;
      return 1;
    }
    const newBottom = ny + p.h;
    const r = Math.floor((newBottom - 0.0001) / T);
    const top = r * T;
    if (prevBottom <= top + 0.01 && newBottom > top) {
      const x0 = Math.floor(p.x / T), x1 = Math.floor((p.x + p.w - 0.0001) / T);
      for (let tx = x0; tx <= x1; tx++) {
        if (world.tileAt(tx, r) === TL.ONEWAY) { p.y = top - p.h; return 1; }
      }
    }
    const pl = landOnPlatforms(p, world, prevBottom, newBottom);
    if (pl) { p.y = pl.y - p.h; p.plat = pl; return 1; }
    p.y = ny;
    return 0;
  }
  if (dy < 0) {
    if (rectSolid(world, p.x, ny, p.w, p.h)) {
      // Correção de quina: se bateu a cabeça só de raspão, escorrega para o lado.
      for (let k = 1; k <= 4; k++) {
        if (!rectSolid(world, p.x + k, ny, p.w, p.h) && !rectSolid(world, p.x + k, p.y, p.w, p.h)) { p.x += k; p.y = ny; return 0; }
        if (!rectSolid(world, p.x - k, ny, p.w, p.h) && !rectSolid(world, p.x - k, p.y, p.w, p.h)) { p.x -= k; p.y = ny; return 0; }
      }
      p.y = (Math.floor(ny / T) + 1) * T;
      if (rectSolid(world, p.x, p.y, p.w, p.h)) p.y = ny - dy;
      return -1;
    }
    p.y = ny;
  }
  return 0;
}

// Devolve o código do chão sob os pés (0 = nada). Também marca a plataforma móvel.
function probeGround(p, world) {
  const feet = p.y + p.h;
  const row = Math.round(feet / T);
  if (Math.abs(feet - row * T) < 0.05) {
    const x0 = Math.floor(p.x / T), x1 = Math.floor((p.x + p.w - 0.0001) / T);
    let found = 0;
    for (let tx = x0; tx <= x1; tx++) {
      const c = world.tileAt(tx, row);
      if (c === TL.ICE) found = TL.ICE;
      else if (SOLID[c] || c === TL.ONEWAY) { if (!found) found = c; }
    }
    if (found) { p.plat = null; return found; }
  }
  const pl = landOnPlatforms(p, world, feet, feet + 0.05);
  if (pl) { p.plat = pl; return TL.ONEWAY; }
  return 0;
}

function wallCheck(p, world) {
  if (rectSolid(world, p.x - 1, p.y + 2, 1, p.h - 4)) return -1;
  if (rectSolid(world, p.x + p.w, p.y + 2, 1, p.h - 4)) return 1;
  return 0;
}

function doJump(p) {
  p.vy = -P.jumpV;
  if (p.plat && p.plat.dy < 0) p.vy += p.plat.dy;
  p.jumpBuf = 0;
  p.coyote = 0;
  p.onGround = false;
  p.canCut = true;
  p.events.push('jump');
}

// inp: { left, right, jump (segurando), jumpPressed, dashPressed }
export function stepPlayer(p, inp, world) {
  p.events.length = 0;
  const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);

  if (inp.jumpPressed) p.jumpBuf = P.buffer;
  else if (p.jumpBuf > 0) p.jumpBuf--;
  if (p.dashCD > 0) p.dashCD--;
  if (p.wallLock > 0) p.wallLock--;

  if (inp.dashPressed && p.dashAvail && p.dashCD <= 0 && p.dashing === 0) {
    p.dashing = P.dashFrames;
    p.dashDir = dir || p.facing;
    p.facing = p.dashDir;
    if (!p.onGround) p.dashAvail = false;
    p.dashCD = P.dashCooldown;
    p.vy = 0;
    p.canCut = false;
    p.wallLock = 0;
    p.events.push('dash');
  }

  p.sliding = false;
  if (p.dashing > 0) {
    p.vx = p.dashDir * P.dashSpeed;
    p.vy = 0;
    p.dashing--;
    if (p.jumpBuf > 0 && (p.onGround || p.coyote > 0)) {
      p.dashing = 0;
      doJump(p);
      p.vx = p.dashDir * P.dashJumpVX;
      p.events.push('dashjump');
    } else if (p.dashing === 0) {
      p.vx = p.dashDir * P.dashEndSpeed;
    }
  } else {
    const ice = p.onGround && p.ground === TL.ICE;
    let accel, decel;
    if (p.onGround) { accel = ice ? P.iceAccel : P.accelGround; decel = ice ? P.iceDecel : P.decelGround; }
    else { accel = P.accelAir; decel = P.decelAir; }
    const d = p.wallLock > 0 ? p.wallLockDir : dir;
    if (d !== 0) {
      const sp = p.vx * d;
      if (sp < P.runMax) p.vx = d * Math.min(P.runMax, sp + accel);
      else p.vx = d * Math.max(P.runMax, sp - (p.onGround ? decel : P.airDrag));
      p.facing = d;
    } else if (p.vx > 0) p.vx = Math.max(0, p.vx - decel);
    else if (p.vx < 0) p.vx = Math.min(0, p.vx + decel);

    let g = P.gravity;
    if (inp.jump && !p.onGround && Math.abs(p.vy) < P.apexThreshold) g *= P.apexMul;
    p.vy += g;

    if (!p.onGround && p.wallDir !== 0 && dir === p.wallDir && p.vy > 0) {
      if (p.vy > P.wallSlideMax) p.vy = P.wallSlideMax;
      p.sliding = true;
      p.dashAvail = true;
    }
    if (p.vy > P.maxFall) p.vy = P.maxFall;

    if (!inp.jump && p.canCut && p.vy < -1.5) { p.vy *= P.jumpCut; p.canCut = false; }
    if (p.vy >= 0) p.canCut = false;

    if (p.jumpBuf > 0) {
      if (p.onGround || p.coyote > 0) doJump(p);
      else if (p.wallDir !== 0 || p.wallCoyote > 0) {
        const wd = p.wallDir || p.wallCoyoteDir;
        p.vx = -wd * P.wallJumpVX;
        p.vy = -P.wallJumpVY;
        p.wallLock = P.wallJumpLock;
        p.wallLockDir = -wd;
        p.facing = -wd;
        p.jumpBuf = 0;
        p.wallCoyote = 0;
        p.canCut = true;
        p.dashAvail = true;
        p.events.push('walljump');
      }
    }
  }

  const hitWall = moveX(p, world, p.vx);
  if (hitWall) {
    if (p.dashing > 0) { p.dashing = 0; p.events.push('dashwall'); }
    p.vx = 0;
  }

  const wasGround = p.onGround;
  const fallSpeed = p.vy;
  p.plat = null;
  const r = moveY(p, world, p.vy);
  if (r === -1) p.vy = 0;
  const g = p.vy >= 0 ? probeGround(p, world) : 0;
  p.onGround = g !== 0;
  p.ground = g;
  if (p.onGround) {
    if (p.vy > 0) p.vy = 0;
    if (!wasGround) p.events.push(fallSpeed > 3.2 ? 'landhard' : 'land');
    p.coyote = P.coyote;
    p.dashAvail = true;
  } else if (p.coyote > 0) p.coyote--;

  p.wallDir = p.onGround ? 0 : wallCheck(p, world);
  if (p.wallDir !== 0) { p.wallCoyote = P.wallCoyote; p.wallCoyoteDir = p.wallDir; }
  else if (p.wallCoyote > 0) p.wallCoyote--;
}

// Molas e orbes de fogo: objetos fixos que o verificador também precisa ver.
export function interactStatic(p, world) {
  const springs = world.springs;
  if (springs) {
    for (let i = 0; i < springs.length; i++) {
      const s = springs[i];
      if (p.vy >= 0 && overlap(p, s.x + 1, s.y + 9, 14, 7)) {
        p.vy = -P.springV;
        p.canCut = false;
        p.dashAvail = true;
        p.dashing = 0;
        p.onGround = false;
        p.coyote = 0;
        p.jumpBuf = 0;
        s.anim = 14;
        p.events.push('spring');
      }
    }
  }
  const orbs = world.orbs;
  if (orbs) {
    for (let i = 0; i < orbs.length; i++) {
      const o = orbs[i];
      if (o.cd > 0) continue;
      if (p.dashAvail && !(p.dashing > 0 && !p.onGround)) continue;
      if (overlap(p, o.x - 7, o.y - 7, 14, 14)) {
        o.cd = 150;
        p.dashAvail = true;
        p.dashCD = 0;
        p.events.push('orb');
      }
    }
  }
}

export function overlap(p, x, y, w, h) {
  return p.x < x + w && p.x + p.w > x && p.y < y + h && p.y + p.h > y;
}

// Espinhos, água e queda. Devolve o motivo ou null.
export function hazardHit(p, world) {
  if (p.y > world.h * T + 4) return 'fall';
  const px = p.x + 1, py = p.y + 1, pw = p.w - 2, ph = p.h - 2;
  const x0 = Math.floor(px / T), x1 = Math.floor((px + pw) / T);
  const y0 = Math.floor(py / T), y1 = Math.floor((py + ph) / T);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const c = world.tileAt(tx, ty);
      if (c < 3 || c > 7) continue;
      let zx = tx * T, zy = ty * T, zw = T, zh = T;
      if (c === TL.SPIKE_U) { zx += 2; zw = 12; zy += 8; zh = 8; }
      else if (c === TL.SPIKE_D) { zx += 2; zw = 12; zh = 8; }
      else if (c === TL.SPIKE_L) { zx += 8; zw = 8; zy += 2; zh = 12; }
      else if (c === TL.SPIKE_R) { zw = 8; zy += 2; zh = 12; }
      else if (c === TL.WATER) { if (world.tileAt(tx, ty - 1) !== TL.WATER) { zy += 6; zh = 10; } }
      if (px < zx + zw && px + pw > zx && py < zy + zh && py + ph > zy) return c === TL.WATER ? 'water' : 'spike';
    }
  }
  if (world.waterY !== undefined && p.y + p.h > world.waterY + 5) return 'water';
  return null;
}
