// Pixel art gerada por código: cada sprite é desenhado pixel a pixel num
// canvas pequeno, recebe contorno automático e, quando tem partes que brilham
// no escuro (olhos, cristais), ganha uma segunda camada "glow".

export const SKINS = [
  { id: 'classica', name: 'Clássica', cost: 0, light: '#ffb45a',
    pal: { o: '#5a1a0f', d: '#c2361b', m: '#f07a22', l: '#ffc23d', c: '#fff2c2', e: '#3a0d07' } },
  { id: 'fatuo', name: 'Fogo-Fátuo', cost: 120, light: '#7cc8ff',
    pal: { o: '#0c2350', d: '#1f5fd1', m: '#3fa2ff', l: '#8fe3ff', c: '#eaffff', e: '#061433' } },
  { id: 'esmeralda', name: 'Esmeralda', cost: 250, light: '#8cff9a',
    pal: { o: '#0b3a1c', d: '#1c8f3d', m: '#3fd16a', l: '#a6f56b', c: '#f2ffd9', e: '#06230f' } },
  { id: 'ametista', name: 'Ametista', cost: 400, light: '#d39cff',
    pal: { o: '#2e0b45', d: '#7a24b8', m: '#b45cf0', l: '#e3a8ff', c: '#fff0ff', e: '#1d0630' } },
  { id: 'sombra', name: 'Sombra', cost: 600, light: '#b7b7ff',
    pal: { o: '#05050c', d: '#262640', m: '#47476b', l: '#8a8ab8', c: '#e6e6ff', e: '#ff5a7a' } },
  { id: 'estelar', name: 'Estelar', cost: -1, light: '#fff0b0', need: 'gems',
    pal: { o: '#6b4a00', d: '#e0a800', m: '#ffd84a', l: '#fff3a8', c: '#ffffff', e: '#4a3000' } },
];

function canvas(w, h) {
  const c = typeof OffscreenCanvas !== 'undefined' && !globalThis.document ? new OffscreenCanvas(w, h) : document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

class Pix {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.c = canvas(w, h);
    this.x = this.c.getContext('2d');
    this.g = null;
  }
  px(x, y, col) { if (!col) return; this.x.fillStyle = col; this.x.fillRect(x | 0, y | 0, 1, 1); }
  rect(x, y, w, h, col) { this.x.fillStyle = col; this.x.fillRect(x, y, w, h); }
  ellipse(cx, cy, rx, ry, col, test) {
    for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) {
      for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1 && (!test || test(x, y))) this.px(x, y, col);
      }
    }
  }
  poly(pts, col) {
    const ys = pts.map((p) => p[1]);
    const y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
    for (let y = y0; y <= y1; y++) {
      const cy = y + 0.5, xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= cy && by > cy) || (by <= cy && ay > cy)) xs.push(ax + ((cy - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        for (let x = Math.ceil(xs[i] - 0.5); x <= Math.floor(xs[i + 1] - 0.5); x++) this.px(x, y, col);
      }
    }
  }
  glow(x, y, col) {
    if (!this.g) { this.g = canvas(this.w, this.h); this.gx = this.g.getContext('2d'); }
    this.gx.fillStyle = col; this.gx.fillRect(x, y, 1, 1);
    this.px(x, y, col);
  }
  outline(col) {
    const img = this.x.getImageData(0, 0, this.w, this.h);
    const a = img.data, w = this.w, h = this.h;
    const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && a[(y * w + x) * 4 + 3] > 0;
    const pts = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (solid(x, y)) continue;
      if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) pts.push([x, y]);
    }
    for (const [x, y] of pts) this.px(x, y, col);
    return this;
  }
  done() { return { img: this.c, glow: this.g, w: this.w, h: this.h }; }
}

// ---------- Faísca ----------
// Corpo redondo + chama cujo eixo pode inclinar (corrida, dash, parede).
function ember(pal, o) {
  const W = 20, H = 20;
  const p = new Pix(W, H);
  const cx = 10 + (o.bx || 0), cy = 13.4 + (o.by || 0);
  const rx = o.rx || 5.2, ry = o.ry || 4.5;
  const ang = o.ang || 0; // 0 = chama para cima; positivo = para a direita
  const ax = Math.sin(ang), ay = -Math.cos(ang);
  const L = o.len || 9;
  const curl = o.curl || 0;
  const inBody = (x, y) => {
    const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
    return dx * dx + dy * dy <= 1;
  };
  const inFlame = (x, y) => {
    const px = x + 0.5 - cx, py = y + 0.5 - (cy - ry * 0.25);
    const u = px * ax + py * ay;
    let v = px * -ay + py * ax;
    if (u < 0 || u > L) return false;
    const t = u / L;
    v -= curl * t * t;
    return Math.abs(v) < rx * 0.92 * Math.pow(1 - t, 0.85);
  };
  const heat = (x, y) => {
    const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy - 0.4) / ry;
    let d = Math.sqrt(dx * dx + dy * dy);
    if (!inBody(x, y)) {
      const px = x + 0.5 - cx, py = y + 0.5 - (cy - ry * 0.25);
      d = 0.55 + (px * ax + py * ay) / L * 0.6;
    }
    return d;
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!inBody(x, y) && !inFlame(x, y)) continue;
    const d = heat(x, y);
    p.px(x, y, d < 0.42 ? pal.c : d < 0.68 ? pal.l : d < 0.9 ? pal.m : pal.d);
  }
  p.outline(pal.o);
  // olhos
  const look = o.look || 0;
  const ey = Math.round(cy - 1 + (o.ey || 0));
  const ex1 = Math.round(cx - 2.6 + look), ex2 = Math.round(cx + 1.6 + look);
  if (o.blink) { p.px(ex1, ey + 1, pal.e); p.px(ex2, ey + 1, pal.e); }
  else { p.rect(ex1, ey, 1, 2, pal.e); p.rect(ex2, ey, 1, 2, pal.e); }
  if (o.mouth) p.rect(Math.round(cx - 0.5 + look), ey + 3, 1, 1, pal.e);
  return p.done();
}

export function buildPlayerFrames(skin) {
  const pal = skin.pal;
  const f = {};
  f.idle = [
    ember(pal, { ang: -0.12, curl: 0.8, len: 9 }),
    ember(pal, { ang: 0.05, curl: -0.6, len: 9.6 }),
    ember(pal, { ang: 0.14, curl: -1, len: 9 }),
    ember(pal, { ang: 0.02, curl: 0.6, len: 8.6, blink: true }),
  ];
  f.run = [
    ember(pal, { ang: -0.55, curl: 1.2, len: 9, look: 1, by: 0 }),
    ember(pal, { ang: -0.75, curl: 1.8, len: 9.5, look: 1, by: -1 }),
    ember(pal, { ang: -0.6, curl: 0.6, len: 9, look: 1, by: 0 }),
    ember(pal, { ang: -0.8, curl: 2, len: 10, look: 1, by: -1 }),
  ];
  f.jump = [ember(pal, { ang: -0.15, len: 7, rx: 4.6, ry: 5, look: 1, ey: -1, by: -0.5 })];
  f.fall = [ember(pal, { ang: 0.08, len: 11, rx: 5.4, ry: 4.2, look: 1, ey: 0.5, curl: -1.5 })];
  f.dash = [
    ember(pal, { ang: -1.45, len: 11, rx: 5.6, ry: 4, look: 2, curl: 1 }),
    ember(pal, { ang: -1.35, len: 12, rx: 5.6, ry: 4, look: 2, curl: -1 }),
  ];
  f.wall = [ember(pal, { ang: 0.35, len: 9, rx: 4.6, ry: 4.6, look: -1, curl: -1, bx: 0.5 })];
  f.happy = [ember(pal, { ang: 0, len: 10, rx: 5.2, ry: 4.6, blink: true, mouth: true })];
  return f;
}

export function buildPlayerAll() {
  const out = {};
  for (const s of SKINS) out[s.id] = buildPlayerFrames(s);
  return out;
}

// ---------- inimigos ----------
function slime(frame, pal) {
  const p = new Pix(16, 12);
  const squash = frame === 1;
  const rx = squash ? 7.3 : 6.4, ry = squash ? 4 : 4.8, cy = squash ? 8.4 : 7.6;
  p.ellipse(8, cy, rx, ry, pal.m, (x, y) => y <= 10);
  p.rect(8 - Math.floor(rx), 10, Math.floor(rx) * 2, 1, pal.d);
  p.ellipse(8, cy + 1.5, rx - 1.5, ry - 2.4, pal.d, (x, y) => y > cy + 0.5 && y <= 10);
  p.px(5, Math.round(cy - ry + 1.5), pal.l); p.px(6, Math.round(cy - ry + 1.2), pal.l); p.px(4, Math.round(cy - ry + 2.4), pal.l);
  p.outline(pal.o);
  const ey = Math.round(cy - 1);
  p.glow(6, ey, pal.e); p.glow(6, ey + 1, pal.e); p.glow(10, ey, pal.e); p.glow(10, ey + 1, pal.e);
  return p.done();
}

function bat(frame, pal) {
  const p = new Pix(18, 12);
  if (frame === 0) {
    p.poly([[8, 5], [1, 0], [2, 3], [0, 6], [3, 6], [6, 8]], pal.d);
    p.poly([[10, 5], [17, 0], [16, 3], [18, 6], [15, 6], [12, 8]], pal.d);
  } else {
    p.poly([[8, 4], [3, 5], [0, 10], [3, 9], [5, 11], [7, 8]], pal.d);
    p.poly([[10, 4], [15, 5], [18, 10], [15, 9], [13, 11], [11, 8]], pal.d);
  }
  p.ellipse(9, 6, 3.4, 3.4, pal.m);
  p.poly([[6.5, 4], [7, 1], [8.5, 3.5]], pal.m);
  p.poly([[11.5, 4], [11, 1], [9.5, 3.5]], pal.m);
  p.px(8, 8, pal.l); p.px(10, 8, pal.l);
  p.outline(pal.o);
  p.glow(7, 5, pal.e); p.glow(11, 5, pal.e);
  return p.done();
}

function hedgehog(frame, pal) {
  const p = new Pix(18, 13);
  const sp = [[3, 6], [5, 3], [7, 1], [9, 1], [11, 2], [13, 4]];
  for (const [x, y] of sp) p.poly([[x - 1.6, 8], [x + 0.2, y], [x + 1.8, 8]], pal.s);
  p.ellipse(8.5, 9.2, 6.4, 3.8, pal.m, (x, y) => y <= 11);
  p.ellipse(13.5, 9.5, 2.6, 2.2, pal.l);
  p.px(16, 9, pal.o);
  const fy = frame === 0 ? 0 : 1;
  p.rect(4 + fy, 11, 2, 1, pal.d); p.rect(10 - fy, 11, 2, 1, pal.d);
  p.outline(pal.o);
  p.glow(14, 8, pal.e);
  return p.done();
}

function beetle(frame, pal) {
  const p = new Pix(18, 12);
  const lf = frame === 0 ? 0 : 1;
  p.rect(4 + lf, 10, 1, 2, pal.o); p.rect(8 - lf, 10, 1, 2, pal.o); p.rect(12 + lf, 10, 1, 2, pal.o);
  p.ellipse(14, 8, 2.6, 2.4, pal.d);
  p.ellipse(8, 7, 6.2, 4.4, pal.m, (x, y) => y <= 10);
  p.poly([[4, 6], [7, 3], [8, 8]], pal.l);
  p.poly([[9, 3], [12, 5], [10, 9]], pal.l);
  p.px(6, 4, pal.c); p.px(10, 4, pal.c);
  p.outline(pal.o);
  p.glow(15, 7, pal.e);
  return p.done();
}

function turret(frame, pal) {
  const p = new Pix(18, 15);
  p.ellipse(9, 9.5, 7, 5.4, pal.m, (x, y) => y <= 14);
  p.ellipse(9, 11.5, 5, 2.6, pal.l);
  p.ellipse(5.5, 4.6, 2.4, 2.4, pal.m);
  p.ellipse(12.5, 4.6, 2.4, 2.4, pal.m);
  p.rect(2, 14, 14, 1, pal.d);
  if (frame === 1) p.ellipse(15, 9, 2.4, 2.2, pal.o);
  else p.rect(13, 9, 4, 1, pal.o);
  p.outline(pal.o);
  p.glow(5, 4, pal.e); p.glow(12, 4, pal.e); p.glow(13, 4, pal.e); p.glow(6, 4, pal.e);
  return p.done();
}

function drop(pal) {
  const p = new Pix(8, 10);
  p.poly([[4, 0], [6.6, 5], [1.4, 5]], pal.m);
  p.ellipse(4, 6.2, 2.8, 2.8, pal.m);
  p.px(3, 5, pal.l); p.px(3, 6, pal.c);
  p.outline(pal.o);
  return p.done();
}

function drip(pal, rock) {
  const p = new Pix(12, 14);
  p.poly([[1, 0], [11, 0], [6, 9]], rock.m);
  p.poly([[3, 0], [6, 0], [6, 6]], rock.l);
  p.ellipse(6, 11, 2, 2.2, pal.m);
  p.px(5, 10, pal.c);
  p.outline(rock.o);
  return p.done();
}

// ---------- itens ----------
function coin(frame) {
  const p = new Pix(10, 10);
  const rx = [3.6, 2.6, 1.2, 2.6][frame];
  p.ellipse(5, 5, rx, 3.8, '#e0631e');
  p.ellipse(5 - (frame === 3 ? 0.6 : 0), 4.6, Math.max(0.8, rx - 1.2), 2.6, '#ffb23a');
  if (rx > 2) p.px(4, 3, '#fff4c8');
  p.outline('#4a1a08');
  return p.done();
}

function gem(ghost) {
  const p = new Pix(14, 14);
  const a = ghost ? ['#4b5a7a', '#7088b0', '#9fb6dd', '#d6e4ff'] : ['#8a0f2d', '#e2264d', '#ff6f7d', '#ffe0e0'];
  p.poly([[7, 1], [13, 6], [7, 13], [1, 6]], a[1]);
  p.poly([[7, 1], [13, 6], [7, 6]], a[2]);
  p.poly([[1, 6], [7, 6], [7, 13]], a[0]);
  p.poly([[4, 4], [7, 1], [7, 5]], a[3]);
  p.outline(ghost ? '#232a3d' : '#3d0613');
  if (!ghost) { p.glow(6, 3, '#ffffff'); p.glow(7, 4, a[3]); }
  return p.done();
}

function orb(frame) {
  const p = new Pix(14, 14);
  const r = [5.2, 5.6, 5.4, 5][frame];
  p.ellipse(7, 7, r, r, '#ff5d1f');
  p.ellipse(7, 7, r - 1.4, r - 1.4, '#ffb43a');
  p.ellipse(7, 7, r - 3, r - 3, '#fff1b8');
  for (let i = 0; i < 4; i++) {
    const a = frame * 0.4 + i * Math.PI / 2;
    p.glow(Math.round(7 + Math.cos(a) * (r + 0.5)), Math.round(7 + Math.sin(a) * (r + 0.5)), '#ffe08a');
  }
  p.outline('#5a1505');
  p.glow(7, 7, '#ffffff'); p.glow(6, 6, '#fff1b8');
  return p.done();
}

function spring(frame) {
  const p = new Pix(16, 12);
  const top = frame === 1 ? 5 : 2;
  p.rect(6, top + 4, 4, 12 - top - 4, '#f1dcb0');
  p.rect(6, top + 4, 1, 12 - top - 4, '#c9a878');
  p.ellipse(8, top + 4, 7.2, frame === 1 ? 3.4 : 4.2, '#e2412f', (x, y) => y <= top + 4);
  p.px(5, top + 1, '#fff2e0'); p.px(10, top + 2, '#fff2e0'); p.px(8, top, '#fff2e0'); p.px(3, top + 3, '#fff2e0'); p.px(12, top + 3, '#fff2e0');
  p.rect(1, top + 4, 14, 1, '#9b2318');
  p.outline('#3a0d07');
  return p.done();
}

function lantern(on) {
  const p = new Pix(14, 30);
  p.rect(6, 10, 2, 20, '#4a2e1e');
  p.rect(6, 10, 1, 20, '#6b4430');
  p.rect(4, 28, 6, 2, '#3a2416');
  p.rect(3, 1, 8, 2, '#3a2a22');
  p.rect(2, 3, 10, 7, '#2b1d17');
  if (on) {
    p.glow(4, 4, '#fff1b0'); p.glow(5, 4, '#ffe07a'); p.glow(6, 4, '#ffe07a'); p.glow(7, 4, '#ffd060'); p.glow(8, 4, '#ffe07a'); p.glow(9, 4, '#ffd060');
    for (let y = 5; y < 9; y++) for (let x = 4; x < 10; x++) p.glow(x, y, (x + y) % 3 === 0 ? '#fff6cc' : '#ffc44a');
  } else {
    for (let y = 4; y < 9; y++) for (let x = 4; x < 10; x++) p.px(x, y, (x + y) % 4 === 0 ? '#5b6472' : '#3a414d');
  }
  p.rect(6, 3, 2, 7, '#2b1d17');
  p.rect(3, 9, 8, 1, '#3a2a22');
  p.rect(6, 0, 2, 1, '#3a2a22');
  p.outline('#120a07');
  return p.done();
}

function brazier(lit) {
  const p = new Pix(34, 26);
  p.rect(12, 14, 10, 10, '#5d4a52');
  p.rect(12, 14, 2, 10, '#7a6670');
  p.rect(9, 23, 16, 3, '#45363d');
  p.poly([[2, 6], [32, 6], [27, 15], [7, 15]], '#6e5a63');
  p.poly([[2, 6], [32, 6], [31, 8], [3, 8]], '#8e7a83');
  for (const x of [9, 15, 21, 26]) p.rect(x, 10, 2, 2, lit ? '#ffb347' : '#3c3036');
  if (lit) { for (const x of [9, 15, 21, 26]) { p.glow(x, 10, '#ffcf6b'); p.glow(x + 1, 11, '#ffcf6b'); } }
  p.outline('#1d1418');
  return p.done();
}

function sign() {
  const p = new Pix(16, 16);
  p.rect(7, 9, 2, 7, '#5a3a26');
  p.rect(1, 2, 14, 8, '#a8743f');
  p.rect(1, 2, 14, 1, '#d29b5c');
  p.rect(1, 9, 14, 1, '#7a4f2a');
  p.rect(7, 3, 2, 4, '#3a220f');
  p.rect(7, 8, 2, 1, '#3a220f');
  p.outline('#22140a');
  return p.done();
}

function torch(frame) {
  const p = new Pix(10, 18);
  p.rect(4, 9, 2, 9, '#4a2e1e');
  p.rect(2, 8, 6, 2, '#6a5a50');
  const h = [6, 7, 5][frame];
  p.poly([[2, 8], [5 + (frame - 1), 8 - h], [8, 8]], '#ff6a1f');
  p.poly([[3.4, 8], [5 + (frame - 1) * 0.5, 9 - h * 0.7], [6.6, 8]], '#ffd34a');
  p.outline('#1b0f08');
  for (let y = 9 - h; y < 8; y++) p.glow(5, y, '#fff1a8');
  return p.done();
}

function crystal(variant) {
  const p = new Pix(14, 14);
  const cols = variant === 0 ? ['#2c7fd6', '#5fc8ff', '#c9f4ff'] : ['#a03ad6', '#e07bff', '#ffd6ff'];
  p.poly([[2, 14], [3, 6], [5, 4], [6, 14]], cols[0]);
  p.poly([[5, 14], [6, 3], [8, 0], [10, 3], [10, 14]], cols[1]);
  p.poly([[9, 14], [10, 7], [12, 5], [13, 14]], cols[0]);
  p.poly([[7, 2], [8, 0], [8, 12]], cols[2]);
  p.outline(variant === 0 ? '#0b2140' : '#2b0b40');
  p.glow(8, 2, '#ffffff'); p.glow(8, 3, cols[2]); p.glow(3, 7, cols[2]); p.glow(11, 7, cols[2]);
  return p.done();
}

export const ENEMY_PAL = [
  { // mundo 1
    slime: { o: '#1d0a22', d: '#4a1c55', m: '#7a2f86', l: '#c07ac8', e: '#ffe9a8' },
    bat: { o: '#120910', d: '#3a1f33', m: '#5c3550', l: '#8d5a7d', e: '#ff4a3a' },
    hog: { o: '#1a0e08', d: '#3a2416', m: '#7a5232', l: '#c49a6a', s: '#e8dcc4', e: '#ffd23a' },
    beetle: { o: '#0a1a24', d: '#1d3c52', m: '#3fa6c8', l: '#9fe6ff', c: '#ffffff', e: '#ff7a3a' },
    turret: { o: '#08202a', d: '#0f4050', m: '#1f7f8f', l: '#7fd8d0', e: '#ffe066' },
    drop: { o: '#0b3247', m: '#45b8ef', l: '#a8e8ff', c: '#ffffff' },
  },
];

export function buildSprites() {
  const P = ENEMY_PAL[0];
  const rock = { o: '#140c10', m: '#5b4048', l: '#7d5e66' };
  return {
    player: buildPlayerAll(),
    slime: [slime(0, P.slime), slime(1, P.slime)],
    bat: [bat(0, P.bat), bat(1, P.bat)],
    hog: [hedgehog(0, P.hog), hedgehog(1, P.hog)],
    beetle: [beetle(0, P.beetle), beetle(1, P.beetle)],
    turret: [turret(0, P.turret), turret(1, P.turret)],
    drop: drop(P.drop),
    drip: drip(P.drop, rock),
    coin: [0, 1, 2, 3].map(coin),
    gem: gem(false),
    gemGhost: gem(true),
    orb: [0, 1, 2, 3].map(orb),
    spring: [spring(0), spring(1)],
    lantern: [lantern(false), lantern(true)],
    brazier: [brazier(false), brazier(true)],
    sign: sign(),
    torch: [0, 1, 2].map(torch),
    crystal: [crystal(0), crystal(1)],
  };
}

// Desenha a Faísca num canvas qualquer (loja, ícones, telas).
export function drawPlayerPreview(ctx, frames, scale, x, y, frame = 'idle', i = 0) {
  const fr = frames[frame][i % frames[frame].length];
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(fr.img, x, y, fr.w * scale, fr.h * scale);
}
