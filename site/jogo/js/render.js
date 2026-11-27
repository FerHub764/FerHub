// Desenho do mundo: blocos pré-renderizados, fundo com paralaxe, entidades,
// partículas e a luz. O canvas interno tem baixa resolução e é ampliado em
// escala inteira para manter os pixels nítidos.
import { TILE as T } from './config.js';
import { TL } from './physics.js';
import { THEMES } from './themes.js';
import { buildSprites } from './sprites.js';

const hash = (x, y, s = 0) => {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

function hex(c) {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a, b, t) {
  const A = hex(a), B = hex(b);
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)},${Math.round(A[1] + (B[1] - A[1]) * t)},${Math.round(A[2] + (B[2] - A[2]) * t)})`;
}

function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// ---------- fonte de pixel 3x5 para números flutuantes ----------
const GLYPHS = {
  '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111',
  '4': '101101111001001', '5': '111100111001111', '6': '111100111101111', '7': '111001010010010',
  '8': '111101111101111', '9': '111101111001111', 'x': '000101010101000', '+': '000010111010000',
  '!': '010010010000010', '-': '000000111000000',
};
export function drawPixelText(ctx, text, x, y, color, shadow = '#000') {
  const w = text.length * 4 - 1;
  let cx = Math.round(x - w / 2);
  y = Math.round(y);
  for (const ch of text) {
    const g = GLYPHS[ch];
    if (g) {
      for (let i = 0; i < 15; i++) {
        if (g[i] !== '1') continue;
        const gx = cx + (i % 3), gy = y + ((i / 3) | 0);
        ctx.fillStyle = shadow; ctx.fillRect(gx, gy + 1, 1, 1);
        ctx.fillStyle = color; ctx.fillRect(gx, gy, 1, 1);
      }
    }
    cx += 4;
  }
}

// ---------- blocos ----------
function solidish(c) { return c === TL.SOLID || c === TL.CRUMBLE; }

// Margem de rocha desenhada acima e abaixo da fase, para telas mais altas que o mapa.
export const PAD_ROWS = 12;
const SEG = 32;

// Desenha as colunas [c0, c1) da fase num canvas próprio. Fases longas (Modo Fuga)
// são desenhadas aos pedaços; cada pedaço pode ter a paleta do seu trecho.
export function prerenderTiles(parsed, theme, c0 = 0, c1 = parsed.w) {
  const { w, h } = parsed;
  const PR = PAD_ROWS;
  const H0 = h + PR * 2;
  const M = 4;
  const sx0 = Math.max(0, c0 - M), sx1 = Math.min(w, c1 + M);
  const lw = sx1 - sx0;
  // grade estendida: linhas extras repetem a primeira/última linha (só rocha)
  const base = new Uint8Array(lw * H0);
  for (let y = 0; y < H0; y++) for (let x = 0; x < lw; x++) {
    const sy = Math.min(h - 1, Math.max(0, y - PR));
    const c = parsed.base[sy * w + x + sx0];
    base[y * lw + x] = y - PR === sy ? c : (c === TL.SOLID ? TL.SOLID : TL.EMPTY);
  }
  const W = lw * T, H = H0 * T;
  const cv = mk(W, H);
  const g = cv.getContext('2d');
  const R = theme.rock;
  const at = (x, y) => {
    if (y < 0 || y >= H0) return TL.SOLID;
    if (x < 0 || x >= lw) {
      const gx = x + sx0;
      if (gx < 0 || gx >= w) return TL.SOLID;
      const sy = Math.min(h - 1, Math.max(0, y - PR));
      const c = parsed.base[sy * w + gx];
      return y - PR === sy ? c : (c === TL.SOLID ? TL.SOLID : TL.EMPTY);
    }
    return base[y * lw + x];
  };
  const isRock = (x, y) => at(x, y) === TL.SOLID;

  // profundidade de cada bloco (distância até o ar) para escurecer o miolo
  const depth = new Uint8Array(lw * H0).fill(9);
  const q = [];
  for (let y = 0; y < H0; y++) for (let x = 0; x < lw; x++) {
    if (!isRock(x, y)) { depth[y * lw + x] = 0; q.push(x, y); }
  }
  for (let i = 0; i < q.length; i += 2) {
    const x = q[i], y = q[i + 1], d = depth[y * lw + x];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= lw || ny >= H0) continue;
      const k = ny * lw + nx;
      if (depth[k] > d + 1) { depth[k] = d + 1; q.push(nx, ny); }
    }
  }
  const shade = [R.base, R.base, mix(R.base, R.deep, 0.55), R.deep];

  for (let ty = 0; ty < H0; ty++) for (let lx = 0; lx < lw; lx++) {
    const c = base[ty * lw + lx];
    const tx = lx + sx0;
    const X = lx * T, Y = ty * T, GX = tx * T;
    if (c === TL.SOLID) {
      const d = Math.min(3, depth[ty * lw + lx]);
      g.fillStyle = shade[d];
      g.fillRect(X, Y, T, T);
      for (let py = 0; py < T; py++) for (let px = 0; px < T; px++) {
        const n = hash(GX + px, Y + py, 1);
        if (n < 0.07) { g.fillStyle = d >= 2 ? R.deep : R.dark; g.fillRect(X + px, Y + py, 1, 1); }
        else if (n > 0.965 && d < 2) { g.fillStyle = R.light; g.fillRect(X + px, Y + py, 1, 1); }
      }
      if (d <= 1 && hash(tx, ty, 2) > 0.45) {
        const px = 2 + Math.floor(hash(tx, ty, 3) * 9), py = 4 + Math.floor(hash(tx, ty, 4) * 8);
        g.fillStyle = R.light; g.fillRect(X + px, Y + py, 3, 1);
        g.fillStyle = R.dark; g.fillRect(X + px, Y + py + 1, 3, 1); g.fillRect(X + px + 3, Y + py, 1, 1);
      }
      const up = isRock(lx, ty - 1), dn = isRock(lx, ty + 1);
      const lf = isRock(lx - 1, ty), rt = isRock(lx + 1, ty);
      if (!lf) { g.fillStyle = R.dark; g.fillRect(X, Y, 2, T); g.fillStyle = R.light; g.fillRect(X + 2, Y + 2, 1, T - 4); }
      if (!rt) { g.fillStyle = R.dark; g.fillRect(X + T - 2, Y, 2, T); }
      if (!dn) {
        g.fillStyle = R.dark; g.fillRect(X, Y + T - 3, T, 3);
        if (hash(tx, ty, 5) > 0.55) {
          const px = 3 + Math.floor(hash(tx, ty, 6) * 10), len = 2 + Math.floor(hash(tx, ty, 7) * 5);
          g.fillStyle = R.hang; g.fillRect(X + px, Y + T, 1, len);
          if (len > 4) g.fillRect(X + px - 1, Y + T + len - 2, 1, 2);
        }
      }
      if (!up) {
        for (let px = 0; px < T; px++) {
          const gd = 2 + Math.floor(hash(GX + px, Y, 8) * 2.6);
          g.fillStyle = R.top; g.fillRect(X + px, Y, 1, gd);
          g.fillStyle = R.topD; g.fillRect(X + px, Y + gd, 1, 1);
        }
        g.fillStyle = R.topL; g.fillRect(X, Y, T, 1);
        for (let k = 0; k < 3; k++) {
          if (hash(tx, ty, 10 + k) > 0.5) {
            const px = Math.floor(hash(tx, ty, 20 + k) * 15), bh = 1 + Math.floor(hash(tx, ty, 30 + k) * 3);
            g.fillStyle = k === 1 ? R.topL : R.top;
            g.fillRect(X + px, Y - bh, 1, bh);
          }
        }
      }
    } else if (c === TL.ICE) {
      g.fillStyle = '#3d7fb4'; g.fillRect(X, Y, T, T);
      g.fillStyle = '#7cc6ec'; g.fillRect(X, Y, T, 3);
      g.fillStyle = '#d4f4ff'; g.fillRect(X, Y, T, 1);
      g.fillStyle = '#2a5a8c'; g.fillRect(X, Y + T - 2, T, 2);
      g.fillStyle = '#9fdcff';
      for (let k = 0; k < 6; k++) g.fillRect(X + 3 + k, Y + 5 + k, 1, 1);
      g.fillRect(X + 10, Y + 4, 1, 1); g.fillRect(X + 11, Y + 5, 1, 1);
    } else if (c === TL.ONEWAY) {
      const [m, l, dk] = theme.wood;
      g.fillStyle = m; g.fillRect(X, Y, T, 5);
      g.fillStyle = l; g.fillRect(X, Y, T, 1);
      g.fillStyle = dk; g.fillRect(X, Y + 4, T, 1);
      if (tx % 2 === 0) g.fillRect(X, Y + 1, 1, 3);
      g.fillStyle = '#d8c6a0'; g.fillRect(X + 3, Y + 2, 1, 1); g.fillRect(X + 12, Y + 2, 1, 1);
      const L = at(lx - 1, ty), Rr = at(lx + 1, ty);
      if (L !== TL.ONEWAY || Rr !== TL.ONEWAY) {
        g.fillStyle = dk;
        const sx = L !== TL.ONEWAY ? X + 2 : X + T - 4;
        g.fillRect(sx, Y + 5, 2, 4);
      }
    } else if (c >= TL.SPIKE_U && c <= TL.SPIKE_R) {
      drawSpikes(g, X, Y, c, theme.spike);
    }
  }
  outlinePass(g, W, H, R.edge);
  if (sx0 === c0 && sx1 === c1) return cv;
  const out = mk((c1 - c0) * T, H);
  out.getContext('2d').drawImage(cv, -(c0 - sx0) * T, 0);
  return out;
}

function drawSpikes(g, X, Y, c, [l, m, d]) {
  for (let k = 0; k < 3; k++) {
    for (let i = 0; i < 6; i++) {
      // triângulo de 5 de base por 6 de altura
      const half = Math.round((5 - i) / 2.2);
      for (let j = -half; j <= half; j++) {
        const col = j < 0 ? l : j === 0 ? m : d;
        let px, py;
        const off = 3 + k * 5;
        if (c === TL.SPIKE_U) { px = X + off + j; py = Y + 15 - i; }
        else if (c === TL.SPIKE_D) { px = X + off + j; py = Y + i; }
        else if (c === TL.SPIKE_R) { px = X + i; py = Y + off + j; }
        else { px = X + 15 - i; py = Y + off + j; }
        g.fillStyle = col; g.fillRect(px, py, 1, 1);
      }
    }
  }
  g.fillStyle = d;
  if (c === TL.SPIKE_U) g.fillRect(X, Y + 15, T, 1);
  if (c === TL.SPIKE_D) g.fillRect(X, Y, T, 1);
  if (c === TL.SPIKE_R) g.fillRect(X, Y, 1, T);
  if (c === TL.SPIKE_L) g.fillRect(X + 15, Y, 1, T);
}

function outlinePass(g, W, H, col) {
  const img = g.getImageData(0, 0, W, H);
  const a = img.data;
  const [r, gg, b] = hex(col);
  const mark = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (a[i * 4 + 3] !== 0) continue;
    if ((x > 0 && a[(i - 1) * 4 + 3]) || (x < W - 1 && a[(i + 1) * 4 + 3]) || (y > 0 && a[(i - W) * 4 + 3]) || (y < H - 1 && a[(i + W) * 4 + 3])) mark[i] = 1;
  }
  for (let i = 0; i < W * H; i++) if (mark[i]) { a[i * 4] = r; a[i * 4 + 1] = gg; a[i * 4 + 2] = b; a[i * 4 + 3] = 255; }
  g.putImageData(img, 0, 0);
}

// ---------- fundo ----------
function makeParallax(theme, wi) {
  const W = 640, H = 480;
  const layers = [];
  const specs = [
    { col: theme.far, f: 0.18, yf: 0.12, top: 70, bot: 90, amp: 40, seed: 1 },
    { col: theme.mid, f: 0.42, yf: 0.3, top: 40, bot: 60, amp: 55, seed: 2 },
  ];
  for (const s of specs) {
    const c = mk(W, H);
    const g = c.getContext('2d');
    const prof = (x, k) => {
      let v = 0;
      for (let i = 1; i <= 4; i++) v += Math.sin((x / W) * Math.PI * 2 * (i * 2 + k) + s.seed * i * 1.7) / i;
      return v;
    };
    g.fillStyle = s.col;
    for (let x = 0; x < W; x++) {
      const t = s.top + prof(x, 0) * s.amp * 0.5;
      g.fillRect(x, 0, 1, Math.max(0, t));
      const b = s.bot + prof(x, 1) * s.amp * 0.5;
      g.fillRect(x, H - b, 1, b);
    }
    // estalactites e estalagmites
    for (let i = 0; i < 26; i++) {
      const x = Math.floor(hash(i, s.seed, 40) * W), len = 30 + hash(i, s.seed, 41) * 110, wd = 6 + hash(i, s.seed, 42) * 18;
      const top = s.top + prof(x, 0) * s.amp * 0.5 - 4;
      for (let y = 0; y < len; y++) {
        const hw = wd * (1 - y / len) * 0.5;
        g.fillRect(Math.round(x - hw), Math.round(top + y), Math.max(1, Math.round(hw * 2)), 1);
        g.fillRect(Math.round((x + W / 2 - hw) % W), Math.round(H - (s.bot + prof((x + W / 2) % W, 1) * s.amp * 0.5) - y + 4), Math.max(1, Math.round(hw * 2)), 1);
      }
    }
    if (wi === 1 && s.seed === 2) {
      for (let i = 0; i < 16; i++) {
        const x = hash(i, 7, 50) * W, y = H - 60 - hash(i, 7, 51) * 60, hgt = 8 + hash(i, 7, 52) * 18;
        g.fillStyle = i % 3 ? '#2a5c9a' : '#6a3aa0';
        g.beginPath(); g.moveTo(x - 4, y + hgt); g.lineTo(x, y); g.lineTo(x + 4, y + hgt); g.fill();
      }
    }
    if (wi === 2 && s.seed === 1) {
      for (let i = 0; i < 5; i++) {
        const x = Math.floor(hash(i, 9, 60) * W);
        g.fillStyle = 'rgba(120,220,220,0.12)';
        g.fillRect(x, 0, 3 + (i % 2) * 2, H);
      }
    }
    layers.push({ c, f: s.f, yf: s.yf, W, H });
  }
  return layers;
}

// ---------- luz ----------
function makeLightSprite() {
  const S = 128;
  const c = mk(S, S);
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.35, 'rgba(255,255,255,0.75)');
  grd.addColorStop(0.7, 'rgba(255,255,255,0.25)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, S, S);
  return c;
}

export class Renderer {
  constructor(screen) {
    this.screen = screen;
    this.sctx = screen.getContext('2d');
    this.buf = mk(384, 216);
    this.g = this.buf.getContext('2d');
    this.lightC = mk(384, 216);
    this.lg = this.lightC.getContext('2d');
    this.sprites = buildSprites();
    this.lightSprite = makeLightSprite();
    this.tints = new Map();
    this.vw = 384; this.vh = 216; this.scale = 1;
    this.levelCache = new Map();
    this.parallax = THEMES.map((t, i) => makeParallax(t, i));
    this.brightness = 1;
    this.shakeOn = true;
    this.motes = [];
  }

  resize(cssW, cssH, dpr) {
    const devW = Math.max(1, Math.round(cssW * dpr)), devH = Math.max(1, Math.round(cssH * dpr));
    const scale = Math.max(1, Math.round(Math.sqrt((devW * devH) / (360 * 212))));
    const vw = Math.ceil(devW / scale), vh = Math.ceil(devH / scale);
    this.scale = scale; this.vw = vw; this.vh = vh;
    this.buf.width = vw; this.buf.height = vh;
    this.lightC.width = vw; this.lightC.height = vh;
    this.screen.width = vw * scale; this.screen.height = vh * scale;
    this.screen.style.width = `${(vw * scale) / dpr}px`;
    this.screen.style.height = `${(vh * scale) / dpr}px`;
  }

  tint(color) {
    let c = this.tints.get(color);
    if (!c) {
      c = mk(128, 128);
      const g = c.getContext('2d');
      g.drawImage(this.lightSprite, 0, 0);
      g.globalCompositeOperation = 'source-in';
      g.fillStyle = color;
      g.fillRect(0, 0, 128, 128);
      this.tints.set(color, c);
    }
    return c;
  }

  prepare(game) {
    const key = game.def.id;
    let segs = this.levelCache.get(key);
    if (!segs) {
      segs = new Map();
      this.levelCache.set(key, segs);
      // poucos mapas na memória: celulares têm limite para canvas
      while (this.levelCache.size > 2) this.levelCache.delete(this.levelCache.keys().next().value);
    }
    this.segs = segs;
    this.segGame = game;
    this.motes = [];
    const n = Math.ceil(game.parsed.w / SEG);
    if (n <= 12) for (let k = 0; k < n; k++) this.segment(k);
  }

  segment(k) {
    let c = this.segs.get(k);
    if (!c) {
      const game = this.segGame;
      const theme = game.themeAt ? game.themeAt(k * SEG) : game.theme;
      c = prerenderTiles(game.parsed, theme, k * SEG, Math.min(game.parsed.w, (k + 1) * SEG));
      this.segs.set(k, c);
      if (this.segs.size > 14) {
        for (const key of this.segs.keys()) { if (Math.abs(key - k) > 3) { this.segs.delete(key); break; } }
      }
    }
    return c;
  }

  drawTiles(cx) {
    const n = Math.ceil(this.segGame.parsed.w / SEG);
    const k0 = Math.max(0, Math.floor(cx / (SEG * T))), k1 = Math.min(n - 1, Math.floor((cx + this.vw) / (SEG * T)));
    for (let k = k0; k <= k1; k++) this.g.drawImage(this.segment(k), k * SEG * T, -PAD_ROWS * T);
    // desenha com antecedência o próximo pedaço, um por quadro
    if (k1 + 1 < n && !this.segs.has(k1 + 1)) this.segment(k1 + 1);
    else if (k0 - 1 >= 0 && !this.segs.has(k0 - 1)) this.segment(k0 - 1);
  }

  // ---------- quadro ----------
  draw(game) {
    const g = this.g, vw = this.vw, vh = this.vh;
    const th = game.theme;
    const cam = game.cam;
    let sx = 0, sy = 0;
    if (game.shake > 0 && this.shakeOn) { sx = Math.round((Math.random() - 0.5) * game.shake); sy = Math.round((Math.random() - 0.5) * game.shake); }
    const cx = Math.round(cam.x) + sx, cy = Math.round(cam.y) + sy;
    const t = game.frame;

    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
    g.fillStyle = th.bg;
    g.fillRect(0, 0, vw, vh);
    const layers = this.parallax[game.worldIndex];
    const midY = (game.parsed.h * T) / 2;
    for (const L of layers) {
      const ox = -(((cx * L.f) % L.W) + L.W) % L.W;
      const oy = Math.round((vh - L.H) / 2 - (cy + vh / 2 - midY) * L.yf);
      for (let x = ox; x < vw; x += L.W) g.drawImage(L.c, Math.round(x), oy);
    }
    this.drawMotes(game, cx, cy, false);

    g.save();
    g.translate(-cx, -cy);
    const sp = this.sprites;
    const vis = (x, y, m = 40) => x > cx - m && x < cx + vw + m && y > cy - m && y < cy + vh + m;

    for (const d of game.decor) {
      if (!vis(d.x, d.y)) continue;
      if (d.type === 'T') this.spr(sp.torch[((t / 6) | 0) % 3], d.x + 3, d.y - 2);
      else if (d.type === '*') this.spr(sp.crystal[d.v], d.x + 1, d.y + 2);
      else if (d.type === '?') this.spr(sp.sign, d.x, d.y);
    }
    for (const c of game.checkpoints) {
      if (!vis(c.x, c.y)) continue;
      this.spr(sp.lantern[c.lit ? 1 : 0], c.x + 1, c.y + T - 30);
    }
    if (game.exit) {
      const e = game.exit;
      this.spr(sp.brazier[e.lit ? 1 : 0], e.x + 8 - 17, e.y + T - 26);
    }

    this.drawTiles(cx);

    for (const c of game.crumbles) {
      if (c.state === 'gone' || !vis(c.x, c.y)) continue;
      const shx = c.state === 'shake' ? Math.round(Math.sin(t * 2.3) * 1) : 0;
      this.drawCrumble(c.x + shx, c.y, th, c.state === 'shake');
    }
    if (game.recordX && vis(game.recordX, cy + vh / 2, 60)) this.drawRecordFlag(game, cy);
    for (const pl of game.platforms) {
      if (!vis(pl.x, pl.y, 60)) continue;
      this.drawPlatform(pl, th, game.worldIndex);
    }
    for (const s of game.springs) {
      if (!vis(s.x, s.y)) continue;
      this.spr(sp.spring[s.anim > 0 ? 1 : 0], s.x, s.y + 4);
    }
    for (const c of game.coins) {
      if (c.got || !vis(c.x, c.y)) continue;
      const fr = sp.coin[((t / 6 + c.phase) | 0) % 4];
      this.spr(fr, Math.round(c.x - 5), Math.round(c.y - 5 + Math.sin(t / 14 + c.phase) * 1.5));
    }
    for (const gm of game.gems) {
      if (gm.got || !vis(gm.x, gm.y)) continue;
      this.spr(gm.had ? sp.gemGhost : sp.gem, gm.x - 7, Math.round(gm.y - 7 + Math.sin(t / 18) * 2));
    }
    for (const o of game.orbs) {
      if (!vis(o.x, o.y)) continue;
      if (o.cd > 0) {
        g.globalAlpha = 0.35;
        g.fillStyle = '#ff9a4a';
        for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + t / 20; g.fillRect(Math.round(o.x + Math.cos(a) * 5), Math.round(o.y + Math.sin(a) * 5), 1, 1); }
        g.globalAlpha = 1;
      } else this.spr(sp.orb[((t / 5) | 0) % 4], o.x - 7, Math.round(o.y - 7 + Math.sin(t / 10) * 1));
    }
    for (const d of game.drips) {
      if (!vis(d.x, d.y, 200)) continue;
      const rock = sp.drip;
      g.drawImage(rock.img, 0, 0, 12, 9, d.x + 2, d.y, 12, 9);
      if (d.state !== 'wait') {
        const shx = d.state === 'shake' ? (t % 4 < 2 ? 1 : -1) : 0;
        g.drawImage(rock.img, 2, 8, 8, 6, d.x + 4 + shx, Math.round(d.dy), 8, 6);
      }
    }
    for (const e of game.enemies) {
      if (e.dead || !vis(e.x, e.y)) continue;
      this.drawEnemy(e, t);
    }
    for (const pr of game.shots) this.spr(sp.drop, Math.round(pr.x - 4), Math.round(pr.y - 5));

    this.drawPlayer(game, t);
    this.drawParticles(game, false);
    this.drawWater(game, cx, cy, t);
    g.restore();

    this.drawLighting(game, cx, cy, t);

    // camadas que brilham no escuro
    g.save();
    g.translate(-cx, -cy);
    g.globalCompositeOperation = 'lighter';
    for (const e of game.enemies) if (!e.dead && vis(e.x, e.y)) this.drawEnemy(e, t, true);
    for (const d of game.decor) {
      if (!vis(d.x, d.y)) continue;
      if (d.type === 'T') this.spr(sp.torch[((t / 6) | 0) % 3], d.x + 3, d.y - 2, true);
      else if (d.type === '*') this.spr(sp.crystal[d.v], d.x + 1, d.y + 2, true);
    }
    for (const c of game.checkpoints) if (c.lit && vis(c.x, c.y)) this.spr(sp.lantern[1], c.x + 1, c.y + T - 30, true);
    if (game.exit && game.exit.lit) this.spr(sp.brazier[1], game.exit.x + 8 - 17, game.exit.y + T - 26, true);
    for (const gm of game.gems) if (!gm.got && !gm.had && vis(gm.x, gm.y)) this.spr(sp.gem, gm.x - 7, Math.round(gm.y - 7 + Math.sin(t / 18) * 2), true);
    for (const o of game.orbs) if (o.cd <= 0 && vis(o.x, o.y)) this.spr(sp.orb[((t / 5) | 0) % 4], o.x - 7, Math.round(o.y - 7 + Math.sin(t / 10) * 1), true);
    this.drawParticles(game, true);
    g.globalCompositeOperation = 'source-over';
    for (const p of game.popups) {
      const a = Math.min(1, p.life / 20);
      g.globalAlpha = a;
      drawPixelText(g, p.text, p.x, p.y, p.color);
    }
    g.globalAlpha = 1;
    g.restore();
    this.drawMotes(game, cx, cy, true);
    if (game.chase) this.drawChase(game, cx, cy);

    if (game.flash > 0) {
      g.fillStyle = `rgba(255,240,210,${Math.min(this.shakeOn ? 0.7 : 0.25, game.flash / 20)})`;
      g.fillRect(0, 0, vw, vh);
    }
    if (game.iris < 1) this.drawIris(game, cx, cy);

    const s = this.sctx;
    s.imageSmoothingEnabled = false;
    s.drawImage(this.buf, 0, 0, vw * this.scale, vh * this.scale);
  }

  spr(fr, x, y, glow = false, flip = false) {
    const im = glow ? fr.glow : fr.img;
    if (!im) return;
    const g = this.g;
    if (flip) {
      g.save();
      g.translate(Math.round(x) + fr.w, Math.round(y));
      g.scale(-1, 1);
      g.drawImage(im, 0, 0);
      g.restore();
    } else g.drawImage(im, Math.round(x), Math.round(y));
  }

  drawEnemy(e, t, glow = false) {
    const sp = this.sprites;
    const fr2 = ((t / 10) | 0) % 2;
    let fr, x, y;
    const flip = e.face < 0;
    switch (e.type) {
      case 's': fr = sp.slime[fr2]; break;
      case 'b': fr = sp.bat[((t / 6) | 0) % 2]; break;
      case 'h': fr = sp.hog[fr2]; break;
      case 'k': fr = sp.beetle[fr2]; break;
      case 't': fr = sp.turret[e.mouth > 0 ? 1 : 0]; break;
      default: return;
    }
    x = e.x + e.w / 2 - fr.w / 2;
    y = e.y + e.h - fr.h + (e.type === 'b' ? 2 : 0);
    if (e.flash > 0 && !glow) {
      this.spr(fr, x, y, false, flip);
      return;
    }
    this.spr(fr, x, y, glow, flip);
  }

  drawPlayer(game, t) {
    const p = game.player;
    if (!game.playerVisible) return;
    const spent = !p.dashAvail && game.state === 'play';
    const set = spent ? this.sprites.playerSpent : this.sprites.player;
    const frames = set[game.skin] || set.classica;
    const g = this.g;
    // rastro do dash
    for (const a of game.afterimages) {
      g.globalAlpha = a.life / 14 * 0.5;
      const fr = frames.dash[0];
      this.spr(fr, a.x - 10 + 5, a.y + 12 - 18, false, a.face < 0);
    }
    g.globalAlpha = 1;
    let fr;
    let flip = p.facing < 0;
    if (game.state === 'win') fr = frames.happy[0];
    else if (p.dashing > 0) fr = frames.dash[((t / 2) | 0) % 2];
    else if (p.sliding) { fr = frames.wall[0]; flip = p.wallDir > 0; }
    else if (!p.onGround) fr = p.vy < -0.4 ? frames.jump[0] : frames.fall[0];
    else if (Math.abs(p.vx) > 0.3) fr = frames.run[((t / 5) | 0) % 4];
    else fr = frames.idle[((t / 10) | 0) % 4];
    const sqx = game.squash.x, sqy = game.squash.y;
    const bx = p.x + 5, by = p.y + 12;
    if (Math.abs(sqx - 1) < 0.02 && Math.abs(sqy - 1) < 0.02) {
      this.spr(fr, bx - 10, by - 18, false, flip);
    } else {
      g.save();
      g.translate(Math.round(bx), Math.round(by));
      g.scale(flip ? -sqx : sqx, sqy);
      g.drawImage(fr.img, -10, -18);
      g.restore();
    }
  }

  drawCrumble(x, y, th, cracking) {
    const g = this.g, R = th.rock;
    g.fillStyle = R.edge; g.fillRect(x, y, T, T);
    g.fillStyle = R.dark; g.fillRect(x + 1, y + 1, T - 2, T - 2);
    g.fillStyle = R.base; g.fillRect(x + 1, y + 1, T - 3, T - 4);
    g.fillStyle = R.light; g.fillRect(x + 1, y + 1, T - 3, 1);
    g.fillStyle = cracking ? '#ffcf8a' : R.edge;
    g.fillRect(x + 7, y + 2, 1, 4); g.fillRect(x + 6, y + 6, 1, 3); g.fillRect(x + 8, y + 9, 1, 4);
    g.fillRect(x + 3, y + 8, 3, 1); g.fillRect(x + 10, y + 5, 3, 1);
  }

  drawPlatform(pl, th, wi) {
    const g = this.g;
    const x = Math.round(pl.x), y = Math.round(pl.y);
    const [m, l, d] = th.wood;
    g.fillStyle = th.rock.edge; g.fillRect(x - 1, y - 1, pl.w + 2, pl.h + 2);
    g.fillStyle = m; g.fillRect(x, y, pl.w, pl.h);
    g.fillStyle = l; g.fillRect(x, y, pl.w, 1);
    g.fillStyle = d; g.fillRect(x, y + pl.h - 2, pl.w, 2);
    for (let k = 0; k < pl.w; k += 8) { g.fillStyle = d; g.fillRect(x + k, y + 1, 1, pl.h - 3); }
    g.fillStyle = wi === 1 ? '#c8d2ff' : '#e8c27a';
    g.fillRect(x + 2, y + 2, 2, 2); g.fillRect(x + pl.w - 4, y + 2, 2, 2);
    // engrenagem/corrente embaixo
    g.fillStyle = th.rock.edge;
    g.fillRect(x + pl.w / 2 - 2, y + pl.h + 1, 4, 2);
  }

  drawWater(game, cx, cy, t) {
    const g = this.g;
    const [body, surf, foam] = game.theme.water;
    const w = game.parsed.w;
    const x0 = Math.max(0, Math.floor(cx / T)), x1 = Math.min(w - 1, Math.floor((cx + this.vw) / T));
    const y0 = Math.max(0, Math.floor(cy / T)), y1 = Math.min(game.parsed.h - 1, Math.floor((cy + this.vh) / T));
    const world = game.world;
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      if (world.tileAt(tx, ty) !== TL.WATER) continue;
      const X = tx * T, Y = ty * T;
      const top = world.tileAt(tx, ty - 1) !== TL.WATER;
      if (!top) { g.fillStyle = body; g.fillRect(X, Y, T, T); continue; }
      for (let px = 0; px < T; px++) {
        const wy = Math.round(5 + Math.sin((X + px) / 5 + t / 12) * 1.2 + Math.sin((X + px) / 11 - t / 20));
        g.fillStyle = body; g.fillRect(X + px, Y + wy, 1, T - wy);
        g.fillStyle = surf; g.fillRect(X + px, Y + wy, 1, 1);
        if ((X + px + ((t / 8) | 0)) % 9 === 0) { g.fillStyle = foam; g.fillRect(X + px, Y + wy, 1, 1); }
      }
    }
    if (game.world.waterY !== undefined) {
      const wyBase = game.world.waterY;
      const bottom = Math.max(cy + this.vh, wyBase) + 4;
      for (let px = cx; px < cx + this.vw; px++) {
        const wy = Math.round(wyBase + Math.sin(px / 6 + t / 9) * 1.6 + Math.sin(px / 13 - t / 15) * 1.2);
        g.fillStyle = body; g.fillRect(px, wy, 1, bottom - wy);
        g.fillStyle = surf; g.fillRect(px, wy, 1, 1);
        if ((px + ((t / 6) | 0)) % 7 === 0) { g.fillStyle = foam; g.fillRect(px, wy - 1, 1, 1); }
      }
    }
  }

  drawParticles(game, glowPass) {
    const g = this.g;
    for (const p of game.particles) {
      if (!!p.glow !== glowPass) continue;
      const a = Math.min(1, p.life / Math.max(1, p.max * 0.4));
      g.globalAlpha = a * (p.alpha || 1);
      g.fillStyle = p.color;
      const s = p.size;
      if (p.ring) {
        const r = (1 - p.life / p.max) * p.r;
        for (let i = 0; i < 16; i++) {
          const an = (i / 16) * Math.PI * 2;
          g.fillRect(Math.round(p.x + Math.cos(an) * r), Math.round(p.y + Math.sin(an) * r), 1, 1);
        }
      } else g.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s);
    }
    g.globalAlpha = 1;
  }

  drawMotes(game, cx, cy, front) {
    const g = this.g, vw = this.vw, vh = this.vh;
    const th = game.theme;
    if (this.motes.length === 0) {
      for (let i = 0; i < 46; i++) this.motes.push({ x: Math.random() * 1000, y: Math.random() * 1000, z: 0.3 + Math.random() * 0.9, ph: Math.random() * 6.28 });
    }
    const t = game.frame;
    g.fillStyle = th.mote;
    for (let i = 0; i < this.motes.length; i++) {
      const m = this.motes[i];
      if ((m.z > 0.95) !== front) continue;
      let vx = 0, vy = 0;
      if (th.moteKind === 'ember') { vy = -0.18 * m.z; vx = Math.sin(t / 60 + m.ph) * 0.1; }
      else if (th.moteKind === 'sparkle') { vx = Math.sin(t / 90 + m.ph) * 0.06; vy = Math.cos(t / 80 + m.ph) * 0.05; }
      else { vy = -0.12 * m.z; vx = Math.sin(t / 40 + m.ph) * 0.08; }
      m.x += vx; m.y += vy;
      const px = ((m.x - cx * m.z * 0.6) % vw + vw) % vw;
      const py = ((m.y - cy * m.z * 0.6) % vh + vh) % vh;
      let a = 0.25 + 0.35 * m.z;
      if (th.moteKind === 'sparkle') a *= 0.5 + 0.5 * Math.sin(t / 12 + m.ph * 3);
      g.globalAlpha = Math.max(0, a);
      const s = m.z > 1.05 ? 2 : 1;
      if (th.moteKind === 'bubble' && s === 2) { g.fillRect(px, py, 1, 1); g.fillRect(px + 1, py + 1, 1, 1); }
      else g.fillRect(px | 0, py | 0, s, s);
    }
    g.globalAlpha = 1;
  }

  drawLighting(game, cx, cy, t) {
    const lg = this.lg, vw = this.vw, vh = this.vh;
    const th = game.theme;
    const dark = Math.max(0, Math.min(0.95, th.dark * this.brightness * (game.darkMul ?? 1)));
    if (dark <= 0.01) return;
    lg.globalCompositeOperation = 'source-over';
    lg.globalAlpha = 1;
    lg.clearRect(0, 0, vw, vh);
    lg.fillStyle = th.ambient;
    lg.globalAlpha = dark;
    lg.fillRect(0, 0, vw, vh);
    lg.globalCompositeOperation = 'destination-out';
    const lights = game.collectLights(cx, cy, vw, vh);
    for (const L of lights) {
      lg.globalAlpha = Math.min(1, L.i);
      const r = L.r;
      lg.drawImage(this.lightSprite, L.x - cx - r, L.y - cy - r, r * 2, r * 2);
    }
    lg.globalCompositeOperation = 'source-over';
    lg.globalAlpha = 1;
    const g = this.g;
    g.drawImage(this.lightC, 0, 0);
    g.globalCompositeOperation = 'lighter';
    for (const L of lights) {
      if (!L.c) continue;
      g.globalAlpha = (L.glow ?? 0.22) * Math.min(1, L.i);
      const r = L.r * 0.8;
      g.drawImage(this.tint(L.c), L.x - cx - r, L.y - cy - r, r * 2, r * 2);
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  }

  // Bandeira no ponto do recorde do Modo Fuga
  drawRecordFlag(game, cy) {
    const g = this.g;
    const x = Math.round(game.recordX);
    let gy = 0;
    const tx = Math.floor(x / T);
    for (let ty = 2; ty < game.parsed.h; ty++) { const c = game.world.tileAt(tx, ty); if (c === TL.SOLID || c === TL.ICE || c === TL.ONEWAY) { gy = ty * T; break; } }
    if (!gy) gy = 14 * T;
    const t = game.frame;
    g.fillStyle = '#d8c6ff'; g.fillRect(x, gy - 34, 1, 34);
    const wave = Math.round(Math.sin(t / 10));
    g.fillStyle = '#a983f0'; g.fillRect(x + 1, gy - 34 + wave, 12, 7);
    g.fillStyle = '#6f3bb4'; g.fillRect(x + 1, gy - 28 + wave, 12, 1);
    drawPixelText(g, String(game.recordM), x + 7, gy - 32 + wave, '#ffffff', '#2a0e4a');
  }

  // A Escuridão do Modo Fuga: uma parede viva que engole a tela pela esquerda.
  drawChase(game, cx, cy) {
    const g = this.g, vw = this.vw, vh = this.vh;
    const t = game.frame;
    const ex = game.chase.x - cx;
    const p = game.player;
    const dist = (p.x - game.chase.x) / T;
    if (dist < 16) {
      const a = Math.max(0, Math.min(0.75, (1 - dist / 16) * 0.75));
      const grd = g.createLinearGradient(0, 0, vw * 0.45, 0);
      grd.addColorStop(0, `rgba(40,6,60,${a})`);
      grd.addColorStop(1, 'rgba(40,6,60,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, vw * 0.45, vh);
    }
    if (ex < -30) return;
    const edge = (y) => Math.round(ex + Math.sin((y + cy) / 9 + t / 8) * 5 + Math.sin((y + cy) / 23 - t / 13) * 8);
    g.fillStyle = '#040107';
    for (let y = 0; y < vh; y += 2) { const x = edge(y); if (x > 0) g.fillRect(0, y, Math.min(vw, x), 2); }
    g.globalCompositeOperation = 'lighter';
    for (let y = 0; y < vh; y += 2) {
      const x = edge(y);
      if (x < -6 || x > vw) continue;
      g.fillStyle = 'rgba(150,60,210,0.35)'; g.fillRect(x - 2, y, 3, 2);
      g.fillStyle = 'rgba(80,20,120,0.25)'; g.fillRect(x + 1, y, 7, 2);
    }
    // olhos que piscam dentro da escuridão
    for (let i = 0; i < 4; i++) {
      const ey = ((i * 97 + 40) % Math.max(60, vh - 30)) + 15;
      const exx = edge(ey) - 18 - (i % 2) * 22;
      const blink = Math.sin(t / 40 + i * 2.1) > -0.85;
      if (exx < 4 || !blink) continue;
      g.fillStyle = i % 2 ? '#ff3a6a' : '#b066ff';
      g.fillRect(exx, ey, 2, 1); g.fillRect(exx + 6, ey, 2, 1);
    }
    g.globalCompositeOperation = 'source-over';
  }

  drawIris(game, cx, cy) {
    const lg = this.lg, vw = this.vw, vh = this.vh;
    const p = game.irisAt || { x: game.player.x + 5, y: game.player.y + 6 };
    const maxR = Math.hypot(vw, vh);
    const r = Math.max(0, game.iris) * maxR;
    lg.globalCompositeOperation = 'source-over';
    lg.globalAlpha = 1;
    lg.clearRect(0, 0, vw, vh);
    lg.fillStyle = '#05030a';
    lg.fillRect(0, 0, vw, vh);
    lg.globalCompositeOperation = 'destination-out';
    lg.beginPath();
    lg.arc(p.x - cx, p.y - cy, r, 0, Math.PI * 2);
    lg.fill();
    lg.globalCompositeOperation = 'source-over';
    this.g.drawImage(this.lightC, 0, 0);
  }
}
