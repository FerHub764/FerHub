// THE FILM — Sal & Malte Gastrobar · Black November (9:16). Pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, S = globalThis.SCORE, Studio = globalThis.Studio, Shots = globalThis.Shots;
  const { BEAT, ev, clock, T } = S;
  const { clamp, lerp, ease, pulse } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const CX = SAFE.x + SAFE.w / 2; // centre of the safe column (right edge is platform UI)
  const C = {
    wood: '#2A1A12', wood2: '#4A2E1E', amber: '#F2A93B', beer: '#F4B03E', cream: '#F6EBD6', foam: '#FFF8EA',
    terra: '#C8553D', green: '#3E7B5A', black: '#0E0B09', gold: '#F2C14E', ink: '#1A120D', red: '#B83A2E',
  };
  const DISPLAY = 'Bungee', MARK = 'Permanent Marker', HAND = 'Caveat', SANS = '"Inter", system-ui, sans-serif';
  const hop = (t, amp) => amp * Math.sin(Math.PI * clock.phase(t));
  const beatPulse = (t, from) => pulse(t, from + Math.floor((t - from) / BEAT) * BEAT, 7);
  const pop = (t, t0, d = 0.3) => ease.outBack(clamp((t - t0) / d), 2.4);
  const fadeIn = (t, t0, d = 0.3) => clamp((t - t0) / d);

  // ---------- shared pieces ----------
  function barBg(ctx, t, top = C.wood, bottom = '#140C08') {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, top); g.addColorStop(1, bottom);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // string lights across the top
    const sag = (x) => 150 + 70 * Math.sin((x / W) * Math.PI);
    G.line(ctx, Array.from({ length: 13 }, (_, i) => [i * W / 12, sag(i * W / 12)]), { color: 'rgba(0,0,0,0.6)', lw: 3, seed: 2 });
    for (let i = 0; i < 12; i++) {
      const x = (i + 0.5) * W / 12, y = sag(x) + 18;
      const fl = 0.75 + 0.25 * Math.sin(t * 3 + i * 1.7);
      const gl = ctx.createRadialGradient(x, y, 0, x, y, 60);
      gl.addColorStop(0, `rgba(255,200,110,${0.55 * fl})`); gl.addColorStop(1, 'rgba(255,200,110,0)');
      ctx.fillStyle = gl; ctx.fillRect(x - 60, y - 60, 120, 120);
      G.ellipse(ctx, x, y, 10, 13, { fill: '#FFD98A', lw: 2, seed: i });
    }
    // bokeh
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 18; i++) {
      const x = U.hash(i, 1) * W, y = 300 + U.hash(i, 2) * (H - 500) + Math.sin(t * 0.6 + i) * 12, r = 20 + U.hash(i, 3) * 50;
      ctx.fillStyle = `rgba(242,169,59,${0.05 + 0.05 * U.hash(i, 4)})`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  function title(ctx, str, x, y, size, o = {}) {
    G.text(ctx, str, x, y, { size, fam: DISPLAY, weight: 400, color: o.color || C.cream, align: o.align || 'center', stroke: o.stroke || C.ink, strokeW: o.strokeW || Math.max(6, size * 0.12), alpha: o.alpha == null ? 1 : o.alpha, boil: o.boil == null ? 0.4 : o.boil });
  }
  function hand(ctx, str, x, y, size, o = {}) {
    G.text(ctx, str, x, y, { size, fam: o.fam || HAND, weight: 700, color: o.color || C.cream, align: o.align || 'center', alpha: o.alpha == null ? 1 : o.alpha, stroke: o.stroke, strokeW: o.strokeW || 6 });
  }
  function chip(ctx, str, x, y, t, t0, o = {}) {
    const p = pop(t, t0, 0.28);
    if (p <= 0) return;
    const size = o.size || 38;
    const w = G.measure(ctx, str, size, SANS, 800) + 52, h = size * 1.55;
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p); ctx.rotate(o.rot || 0);
    G.rrect(ctx, -w / 2, -h / 2, w, h, h / 2, { fill: o.fill || C.amber, lw: 4, seed: Math.round(t0 * 10) });
    G.text(ctx, str, 0, size * 0.36, { size, fam: SANS, weight: 800, color: o.color || C.ink, align: 'center', boil: 0.2 });
    ctx.restore();
  }
  function blackBadge(ctx, t, y) {
    // the hook: visible from the first second of every early shot
    const p = pop(t, 0.35, 0.35);
    if (p <= 0) return;
    ctx.save(); ctx.translate(CX, y); ctx.scale(p, p); ctx.rotate(-0.03 + 0.01 * Math.sin(t * 3));
    const w = 640, h = 84;
    G.rrect(ctx, -w / 2, -h / 2, w, h, 16, { fill: C.black, lw: 5, seed: 5 });
    G.text(ctx, 'BLACK NOVEMBER · 30% OFF', 0, 15, { size: 40, fam: DISPLAY, weight: 400, color: C.gold, align: 'center', boil: 0.2 });
    ctx.restore();
  }

  // ---------- 1. the chopp fills up ----------
  function chopp(ctx, cx, base, s, level, t, foamT) {
    const gw = 260 * s, gh = 460 * s, top = base - gh;
    // handle
    G.shape(ctx, G.rrPts(cx + gw / 2 - 10 * s, top + 90 * s, 110 * s, 250 * s, 50 * s), { fill: 'rgba(255,255,255,0.12)', lw: 7, seed: 31 });
    // beer
    const ly = lerp(base - 20 * s, top + 40 * s, level);
    if (level > 0) {
      ctx.save();
      ctx.beginPath(); ctx.rect(cx - gw / 2 + 8, ly, gw - 16, base - ly - 14); ctx.clip();
      const g = ctx.createLinearGradient(0, ly, 0, base); g.addColorStop(0, '#F7C350'); g.addColorStop(1, '#D9861E');
      ctx.fillStyle = g; ctx.fillRect(cx - gw / 2, ly, gw, base - ly);
      for (let i = 0; i < 26; i++) { // bubbles rising
        const bx = cx - gw / 2 + 25 + U.hash(i, 7) * (gw - 50);
        const by = base - 20 - (((t * (60 + U.hash(i, 8) * 80)) + U.hash(i, 9) * 400) % Math.max(1, base - ly));
        ctx.fillStyle = 'rgba(255,245,210,0.6)'; ctx.beginPath(); ctx.arc(bx, by, 3 + U.hash(i, 5) * 4, 0, 7); ctx.fill();
      }
      ctx.restore();
    }
    // foam head
    const fp = foamT == null ? 0 : ease.outBack(clamp(foamT / 0.35), 3);
    const foamH = lerp(14, 70, Math.max(level > 0.85 ? (level - 0.85) / 0.15 : 0, fp)) * s;
    if (level > 0.05) {
      const fy = ly - foamH * 0.6;
      for (let i = 0; i < 6; i++) G.ellipse(ctx, cx - gw / 2 + 25 + i * (gw - 50) / 5, fy, 42 * s, foamH * 0.7, { fill: C.foam, lw: 4, seed: 40 + i });
      // overflow drips after the foam moment
      if (foamT != null && foamT > 0) {
        for (let i = 0; i < 3; i++) {
          const dx = cx - gw / 2 + 4 + (i === 2 ? gw - 8 : i * 40);
          const len = Math.min(170, foamT * 260) * s * (0.6 + 0.4 * U.hash(i, 3));
          G.rrect(ctx, dx - 14, fy, 28, len, 14, { fill: C.foam, lw: 4, seed: 50 + i });
        }
      }
    }
    // glass
    G.shape(ctx, G.polyPts([[cx - gw / 2, top], [cx + gw / 2, top], [cx + gw / 2 - 16 * s, base], [cx - gw / 2 + 16 * s, base]], 20), { fill: 'rgba(255,255,255,0.10)', lw: 8, seed: 33 });
    G.line(ctx, [[cx - gw / 2 + 34 * s, top + 40 * s], [cx - gw / 2 + 44 * s, base - 40 * s]], { color: 'rgba(255,255,255,0.45)', lw: 10, seed: 34 });
  }
  function shotIntro(ctx, t) {
    barBg(ctx, t);
    // bar counter
    G.rrect(ctx, -40, 1290, W + 80, 120, 20, { fill: C.wood2, lw: 6, seed: 21, hatch: { color: 'rgba(0,0,0,0.25)', gap: 14 } });
    const base = 1300;
    const level = clamp((t - ev.pourStart) / (ev.foam - ev.pourStart - 0.1));
    const foamT = t >= ev.foam ? t - ev.foam : null;
    // tap + stream
    const tapUp = t >= ev.foam ? -600 * ease.inCubic(clamp((t - ev.foam) / 0.25)) : 0; // the tap flies off as the title lands
    ctx.save(); ctx.translate(0, tapUp);
    G.rrect(ctx, CX - 40, 370, 80, 140, 18, { fill: '#B9B2A8', lw: 6, seed: 61 });
    G.rrect(ctx, CX - 110, 330, 220, 60, 20, { fill: C.terra, lw: 6, seed: 62 });
    hand(ctx, 'chopp', CX, 372, 44, { color: C.cream });
    ctx.restore();
    if (t > ev.pourStart && t < ev.foam - 0.05) {
      const wob = Math.sin(t * 30) * 3;
      G.rrect(ctx, CX - 9 + wob, 510, 18, lerp(base - 20, base - 460 + 40, level) - 510, 9, { fill: C.beer, lw: 3, seed: Math.floor(t * 12) });
    }
    const s = 1 + 0.06 * (foamT != null ? Math.exp(-foamT * 6) : 0);
    chopp(ctx, CX - 40, base, s, level, t, foamT);
    if (t < ev.foam) {
      hand(ctx, 'Chopp gelado saindo...', CX, 1490, 64, { stroke: C.ink, strokeW: 10, alpha: fadeIn(t, 0.8, 0.4) * (1 - fadeIn(t, ev.foam - 0.3, 0.3)) });
    } else {
      // title stamps on the foam moment
      const p = pop(t, ev.foam, 0.35);
      ctx.save(); ctx.translate(CX, 560); ctx.scale(p, p); ctx.rotate(-0.04);
      title(ctx, 'SAL & MALTE', 0, 0, 108, { color: C.amber });
      title(ctx, 'GASTROBAR', 0, 110, 72, { color: C.cream });
      ctx.restore();
      if (p > 0.9) G.rays(ctx, CX, 560, { n: 20, r0: 360, r1: 460, color: C.amber, lw: 5, alpha: 0.6 * Math.exp(-(t - ev.foam) * 2.5), spin: t * 0.4 });
      hand(ctx, 'Guarulhos · SP', CX, 760, 54, { alpha: fadeIn(t, ev.foam + BEAT, 0.3), color: C.gold });
    }
    if (t >= ev.foam) { const f = 0.75 * Math.exp(-(t - ev.foam) * 14); if (f > 0.01) { ctx.fillStyle = `rgba(255,236,190,${f})`; ctx.fillRect(0, 0, W, H); } }
    blackBadge(ctx, t, SAFE.y + 30);
  }

  // ---------- 2. comida ----------
  function feijoada(ctx, x, y, s) {
    G.ellipse(ctx, x, y + 30 * s, 150 * s, 50 * s, { fill: '#1C1410', lw: 6, seed: 71 });
    G.rrect(ctx, x - 150 * s, y - 40 * s, 300 * s, 80 * s, 30 * s, { fill: '#2B211C', lw: 6, seed: 72 });
    G.ellipse(ctx, x, y - 40 * s, 140 * s, 36 * s, { fill: '#3A1E16', lw: 5, seed: 73 });
    for (let i = 0; i < 9; i++) G.ellipse(ctx, x - 100 * s + U.hash(i, 1) * 200 * s, y - 45 * s + U.hash(i, 2) * 14 * s, 14 * s, 8 * s, { fill: '#160B08', lw: 2, seed: 80 + i });
    G.ellipse(ctx, x + 60 * s, y - 48 * s, 26 * s, 12 * s, { fill: '#F08C2E', lw: 3, seed: 91 }); // orange slice
    G.ellipse(ctx, x - 50 * s, y - 50 * s, 22 * s, 10 * s, { fill: '#7A3B2A', lw: 3, seed: 92 }); // linguiça
  }
  function parmegiana(ctx, x, y, s) {
    G.rrect(ctx, x - 150 * s, y + 10 * s, 300 * s, 60 * s, 28 * s, { fill: '#D99A4E', lw: 6, seed: 101 });
    G.rrect(ctx, x - 160 * s, y - 25 * s, 320 * s, 44 * s, 16 * s, { fill: '#B5652E', lw: 6, seed: 102 }); // breaded steak
    G.shape(ctx, G.wobble(G.polyPts([[x - 150 * s, y - 30 * s], [x + 150 * s, y - 30 * s], [x + 120 * s, y + 10 * s], [x + 60 * s, y - 5 * s], [x, y + 18 * s], [x - 80 * s, y - 2 * s], [x - 140 * s, y + 6 * s]], 18), 4, 3), { fill: '#FFE08A', lw: 4, seed: 103 }); // cheese drip
    G.rrect(ctx, x - 140 * s, y - 50 * s, 280 * s, 26 * s, 12 * s, { fill: C.red, lw: 4, seed: 104 }); // sauce
    G.shape(ctx, G.ellPts(x, y - 60 * s, 150 * s, 60 * s).filter((p) => p[1] <= y - 60 * s), { fill: '#E1A560', lw: 6, seed: 105, closed: true }); // top bun
    for (let i = 0; i < 6; i++) G.ellipse(ctx, x - 80 * s + i * 32 * s, y - 92 * s + (i % 2) * 10 * s, 5 * s, 3 * s, { fill: C.cream, lw: 1, seed: 110 + i });
  }
  function porcao(ctx, x, y, s) {
    G.ellipse(ctx, x, y + 20 * s, 160 * s, 55 * s, { fill: C.cream, lw: 6, seed: 121 });
    for (let i = 0; i < 14; i++) {
      const a = U.hash(i, 3) * 0.8 - 0.4, px = x - 110 * s + U.hash(i, 4) * 220 * s, py = y + U.hash(i, 5) * 30 * s;
      ctx.save(); ctx.translate(px, py); ctx.rotate(a);
      G.rrect(ctx, -10 * s, -45 * s, 20 * s, 80 * s, 6 * s, { fill: '#F3C24A', lw: 3, seed: 130 + i });
      ctx.restore();
    }
    G.ellipse(ctx, x + 110 * s, y + 10 * s, 34 * s, 18 * s, { fill: C.red, lw: 3, seed: 150 });
  }
  function caldo(ctx, x, y, s, t) {
    for (let i = 0; i < 3; i++) {
      const sx = x - 50 * s + i * 50 * s;
      G.line(ctx, Array.from({ length: 6 }, (_, k) => [sx + Math.sin(t * 3 + k + i) * 10 * s, y - 60 * s - k * 22 * s]), { color: 'rgba(255,255,255,0.5)', lw: 5, seed: 160 + i });
    }
    G.shape(ctx, G.ellPts(x, y - 30 * s, 140 * s, 110 * s).filter((p) => p[1] >= y - 30 * s), { fill: C.terra, lw: 6, seed: 161, closed: true });
    G.ellipse(ctx, x, y - 30 * s, 140 * s, 32 * s, { fill: '#E7B04E', lw: 5, seed: 162 });
    G.ellipse(ctx, x + 30 * s, y - 34 * s, 16 * s, 8 * s, { fill: C.green, lw: 2, seed: 163 });
    G.ellipse(ctx, x - 40 * s, y - 28 * s, 12 * s, 7 * s, { fill: C.green, lw: 2, seed: 164 });
  }
  const DISH_DRAW = { feijoada, parmegiana, porcao, caldo };
  function shotComida(ctx, t) {
    barBg(ctx, t, '#3A2316', '#1A0F09');
    // table
    G.rrect(ctx, SAFE.x - 10, 560, SAFE.w + 20, 900, 40, { fill: '#7A4A2B', lw: 7, seed: 201, hatch: { color: 'rgba(0,0,0,0.18)', gap: 22, angle: 0.05 } });
    title(ctx, 'COMIDA BRASILEIRA', CX, SAFE.y + 150, 66, { color: C.amber });
    hand(ctx, 'caseira, com toque autoral', CX, SAFE.y + 240, 64, { alpha: fadeIn(t, T(3, 0.25), 0.3) });
    const cells = [[CX - 225, 760], [CX + 225, 760], [CX - 225, 1150], [CX + 225, 1150]];
    S.dishes.forEach((d, i) => {
      const p = pop(t, d.t, 0.3);
      if (p <= 0) return;
      const [x, y] = cells[i];
      const bob = t > d.t + 0.3 ? -hop(t, 6) : 0;
      ctx.save(); ctx.translate(x, y + bob); ctx.scale(p, p);
      DISH_DRAW[d.key](ctx, 0, 0, 0.95, t);
      ctx.restore();
      hand(ctx, d.label, x, y + 150, d.label.length > 12 ? 44 : 54, { alpha: fadeIn(t, d.t + 0.1, 0.2), color: C.cream, stroke: C.ink, strokeW: 8 });
    });
  }

  // ---------- 3. música ao vivo ----------
  const SINGER = { skin: Ch.SKIN_TONES[3], hair: '#1D1410', hairStyle: 'curly', outfit: 'shirt', shirt: C.terra, collar: C.cream, bottoms: 'pants', shorts: '#2C2A36', build: 'regular' };
  const PERC = { skin: Ch.SKIN_TONES[4], hair: '#151010', hairStyle: 'buzz', facialHair: 'trimmed', outfit: 'tee', shirt: C.green, print: 'S&M', printColor: C.cream, bottoms: 'pants', shorts: '#2A2A2A', build: 'broad', headwear: 'cap', headwearColor: C.black };
  function shotMusica(ctx, t) {
    barBg(ctx, t, '#241430', '#120A0E');
    // telão with a match
    const tx = CX + 130, ty = 590, tw = 330, th = 200;
    G.rrect(ctx, tx - tw / 2, ty - th / 2, tw, th, 14, { fill: '#111', lw: 6, seed: 301 });
    G.rrect(ctx, tx - tw / 2 + 14, ty - th / 2 + 14, tw - 28, th - 28, 6, { fill: '#2F8A4A', lw: 2, seed: 302 });
    G.line(ctx, [[tx, ty - th / 2 + 14], [tx, ty + th / 2 - 14]], { color: 'rgba(255,255,255,0.7)', lw: 3, seed: 303 });
    const bx = tx + Math.sin(t * 2.4) * 110, by = ty + Math.cos(t * 3.1) * 50;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx, by, 10, 0, 7); ctx.fill();
    hand(ctx, 'esportes no telão', tx, ty + 150, 46, { color: C.gold });
    // stage + spotlight
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const sp = ctx.createRadialGradient(CX - 110, 1250, 10, CX - 110, 1250, 520);
    sp.addColorStop(0, 'rgba(255,210,140,0.35)'); sp.addColorStop(1, 'rgba(255,210,140,0)');
    ctx.fillStyle = sp; ctx.fillRect(0, 700, W, 900);
    ctx.restore();
    G.rrect(ctx, -40, 1290, W + 80, 260, 10, { fill: '#3A2418', lw: 6, seed: 305, hatch: { color: 'rgba(0,0,0,0.25)', gap: 18 } });
    const k = 0.9;
    Ch.person(ctx, { x: CX - 230, y: 1300 - hop(t, 10), pose: 'stand', s: k, style: SINGER, gesture: 'mic', eyes: 'happy', mouth: clock.phase(t) < 0.5 ? 'open' : 'o', blush: 0.3 });
    Ch.person(ctx, { x: CX + 170, y: 1300 - hop(t + BEAT / 2, 8), pose: 'stand', s: k, style: PERC, gesture: 'clap', eyes: 'happy', mouth: 'grin' });
    // floating notes = the melody
    for (const n of S.leadA) {
      const a = t - n.t;
      if (a < 0 || a > 1.6) continue;
      const x = CX - 150 + (n.midi - 67) * 22 + Math.sin(a * 5 + n.midi) * 20, y = 840 - a * 260 - (n.midi - 67) * 8;
      const al = 1 - a / 1.6;
      G.text(ctx, n.dur > BEAT * 0.7 ? '♫' : '♪', x, y, { size: 70 * pop(t, n.t, 0.2), fam: SANS, weight: 700, color: C.gold, alpha: al, align: 'center' });
    }
    title(ctx, 'MÚSICA AO VIVO', CX, SAFE.y + 120, 72, { color: C.gold });
    hand(ctx, 'toda semana', CX, SAFE.y + 200, 60);
    const ch = ['PAGODE', 'SERTANEJO', 'MPB'];
    ch.forEach((c, i) => chip(ctx, c, CX + (i - 1) * 290, 1400, t, T(5, 1 + i * 0.5), { size: 36, fill: [C.amber, C.cream, C.terra][i], color: i === 2 ? C.cream : C.ink, rot: (i - 1) * 0.04 }));
  }

  // ---------- 4. família, amigos, pet ----------
  const DAD = { skin: Ch.SKIN_TONES[2], hair: '#3B2416', hairStyle: 'short', facialHair: 'stubble', outfit: 'shirt', shirt: '#3D6E9E', bottoms: 'pants', shorts: '#2B2B33' };
  const MOM = { skin: Ch.SKIN_TONES[3], hair: '#2A1A12', hairStyle: 'ponytail', outfit: 'dress', shirt: C.amber };
  const KID = { skin: Ch.SKIN_TONES[3], hair: '#2A1A12', hairStyle: 'curly', outfit: 'tee', shirt: C.green, bottoms: 'shorts', shorts: '#E0703E' };
  function shotGalera(ctx, t) {
    barBg(ctx, t, '#2E3A26', '#121A0E');
    // garden floor + balloons (aniversários)
    G.rrect(ctx, -40, 1260, W + 80, 300, 10, { fill: '#5D7A3A', lw: 6, seed: 401, hatch: { color: 'rgba(0,0,0,0.15)', gap: 16 } });
    [[CX + 330, 560, C.terra], [CX + 250, 600, C.gold], [CX + 400, 640, '#6FB0D8']].forEach(([x, y, c], i) => {
      const yy = y + Math.sin(t * 2 + i) * 14;
      G.line(ctx, [[x, yy + 70], [x + 10, yy + 260]], { color: 'rgba(255,255,255,0.6)', lw: 3, seed: 410 + i });
      G.ellipse(ctx, x, yy, 56, 70, { fill: c, lw: 5, seed: 420 + i });
    });
    const k = 0.82;
    Ch.person(ctx, { x: CX - 270, y: 1280, pose: 'stand', s: k, style: DAD, gesture: 'cheer', eyes: 'happy', mouth: 'grin' });
    Ch.person(ctx, { x: CX - 60, y: 1280, pose: 'stand', s: k, style: MOM, gesture: 'wave', eyes: 'happy', mouth: 'smile', blush: 0.4 });
    Ch.person(ctx, { x: CX + 120, y: 1290 - hop(t, 40), pose: 'stand', s: 0.55, style: KID, gesture: 'cheer', eyes: 'happy', mouth: 'open' });
    const barking = S.barks.some((b) => t >= b && t < b + 0.22);
    Ch.dog(ctx, { x: CX + 300, y: 1290, s: 1.05, color: '#C98A4B', t, happy: 1, pose: 'sit', bark: barking, look: -0.6 });
    for (const b of S.barks) if (t >= b && t < b + 0.5) {
      const a = (t - b) / 0.5;
      G.text(ctx, 'AU!', CX + 250 - a * 30, 1080 - a * 60, { size: 64 * pop(t, b, 0.15), fam: MARK, weight: 400, color: C.gold, alpha: 1 - a, align: 'center', stroke: C.ink, strokeW: 8 });
    }
    // hearts drift up
    for (let i = 0; i < 5; i++) {
      const p = ((t - T(7)) * 0.4 + i / 5) % 1;
      G.heart(ctx, CX - 200 + i * 110, 1100 - p * 400, 0.5 + 0.2 * U.hash(i, 2), { fill: i % 2 ? C.terra : '#E0506A', seed: 430 + i });
    }
    title(ctx, 'FAMÍLIA, AMIGOS', CX, SAFE.y + 110, 66, { color: C.amber });
    title(ctx, '& O SEU PET', CX, SAFE.y + 195, 66, { color: C.cream });
    const items = [['ESPAÇO KIDS', C.amber, C.ink], ['PET FRIENDLY', C.cream, C.ink], ['ANIVERSÁRIOS', C.terra, C.cream]];
    items.forEach(([s, f, c], i) => chip(ctx, s, CX, SAFE.y + 300 + i * 82, t, T(7, 0.5 + i * 0.75), { size: 36, fill: f, color: c, rot: (i - 1) * 0.03 }));
  }

  // ---------- 5. the breath ----------
  function shotBreath(ctx, t) {
    ctx.fillStyle = C.black; ctx.fillRect(0, 0, W, H);
    const words = ['E', 'em', 'novembro...'];
    const full = words.join(' ');
    const size = 110;
    let x = CX - G.measure(ctx, full, size, HAND) / 2;
    words.forEach((w, i) => {
      const t0 = T(9) + 0.1 + i * BEAT * 0.75;
      const a = fadeIn(t, t0, 0.2);
      G.text(ctx, w, x, H / 2 - 120 + (1 - a) * 20, { size, fam: HAND, weight: 700, color: C.cream, alpha: a });
      x += G.measure(ctx, w + ' ', size, HAND);
    });
    if (t >= ev.breath) { // a single gold spark holds the breath
      const r = 6 + 3 * Math.sin((t - ev.breath) * 20);
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(CX, H / 2 + 20, r, 0, 7); ctx.fill();
    }
  }

  // ---------- 6. BLACK NOVEMBER ----------
  function shotDrop(ctx, t) {
    ctx.fillStyle = C.black; ctx.fillRect(0, 0, W, H);
    // rotating gold sunburst behind everything
    ctx.save(); ctx.translate(CX, 900); ctx.rotate((t - ev.drop) * 0.25);
    ctx.globalAlpha = 0.18 + 0.12 * beatPulse(t, ev.drop);
    for (let i = 0; i < 24; i++) {
      ctx.fillStyle = i % 2 ? C.gold : '#7A5A12';
      const a0 = (i / 24) * Math.PI * 2, a1 = ((i + 1) / 24) * Math.PI * 2, R = 2000;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * R, Math.sin(a0) * R); ctx.lineTo(Math.cos(a1) * R, Math.sin(a1) * R); ctx.fill();
    }
    ctx.restore();
    // BLACK — letters stamp on 16ths
    const size = 170, word = S.stamps;
    const total = word.reduce((a, s) => a + G.measure(ctx, s.c, size, DISPLAY, 400), 0);
    let x = CX - total / 2;
    for (const s of word) {
      const w = G.measure(ctx, s.c, size, DISPLAY, 400);
      const p = clamp((t - s.t) / 0.08);
      if (p > 0) {
        const sc = lerp(1.8, 1, ease.outCubic(p));
        ctx.save(); ctx.translate(x + w / 2, 560); ctx.scale(sc, sc);
        title(ctx, s.c, 0, 0, size, { color: C.cream, stroke: C.gold, strokeW: 10, alpha: p });
        ctx.restore();
      }
      x += w;
    }
    // NOVEMBER slides in
    const nv = ease.outCubic(clamp((t - T(10, 1.25)) / 0.3));
    if (nv > 0) title(ctx, 'NOVEMBER', CX + (1 - nv) * 600, 720, 112, { color: C.gold, stroke: C.ink, strokeW: 10, alpha: nv });
    // 30% OFF slam
    if (t >= ev.pct) {
      const p = ease.outBack(clamp((t - ev.pct) / 0.22), 2);
      const bp = 1 + 0.04 * beatPulse(t, ev.pct);
      ctx.save(); ctx.translate(CX, 1040); ctx.rotate(-0.06); ctx.scale(lerp(2.4, 1, clamp(p)) * bp, lerp(2.4, 1, clamp(p)) * bp);
      G.rrect(ctx, -420, -150, 840, 300, 40, { fill: C.gold, lw: 8, seed: 601 });
      G.text(ctx, '30% OFF', 0, 55, { size: 140, fam: DISPLAY, weight: 400, color: C.black, align: 'center', boil: 0.2 });
      ctx.restore();
    }
    hand(ctx, 'para consumo no local', CX, 1290, 60, { alpha: fadeIn(t, T(11, 0.5), 0.3) });
    const until = pop(t, T(11, 2), 0.3);
    if (until > 0) {
      ctx.save(); ctx.translate(CX, 1400); ctx.scale(until, until);
      title(ctx, 'ATÉ 01/12', 0, 0, 72, { color: C.cream, stroke: C.terra, strokeW: 8 });
      ctx.restore();
    }
    if (t >= ev.drop) G.confetti(ctx, t, ev.drop, { n: 140, seed: 9, spawn: 3, x0: 0, x1: W });
  }

  // ---------- 7. end card ----------
  function shotEnd(ctx, t) {
    barBg(ctx, t, '#3A2316', '#140C08');
    const t0 = ev.endCard;
    const lp = pop(t, t0, 0.35);
    ctx.save(); ctx.translate(CX, SAFE.y + 120); ctx.scale(lp, lp); ctx.rotate(-0.03);
    title(ctx, 'SAL & MALTE', 0, 0, 96, { color: C.amber });
    title(ctx, 'GASTROBAR', 0, 90, 60, { color: C.cream });
    ctx.restore();
    const star = fadeIn(t, t0 + BEAT, 0.3);
    if (star > 0) {
      for (let i = 0; i < 5; i++) G.star(ctx, CX - 190 + i * 52, SAFE.y + 300, 20, { fill: i < 4 ? C.gold : '#C9A445', seed: 700 + i });
      hand(ctx, '4.6 no Google', CX + 150, SAFE.y + 316, 52, { alpha: star, align: 'left' });
    }
    // reservation card
    const cp = pop(t, t0 + BEAT * 2, 0.35);
    if (cp > 0) {
      ctx.save(); ctx.translate(CX, 760); ctx.scale(cp, cp);
      G.rrect(ctx, -420, -170, 840, 340, 36, { fill: C.cream, lw: 7, seed: 710 });
      G.text(ctx, 'RESERVE PELO WHATSAPP', 0, -80, { size: 44, fam: SANS, weight: 800, color: C.terra, align: 'center', boil: 0.2 });
      G.text(ctx, '(11) 97054-6124', 0, 30, { size: 92, fam: DISPLAY, weight: 400, color: C.ink, align: 'center', boil: 0.2 });
      G.text(ctx, '@salemaltegastrobar', 0, 118, { size: 46, fam: SANS, weight: 700, color: C.wood2, align: 'center', boil: 0.2 });
      ctx.restore();
    }
    const lines = [
      ['Rua São Jorge, 60 · Macedo · Guarulhos', 46],
      ['Ter–Qui 16h–00h · Sex 16h–01h', 42],
      ['Sáb 11h–01h · Dom 11h–20h', 42],
    ];
    lines.forEach(([s, size], i) => G.text(ctx, s, CX, 1040 + i * 66, { size, fam: SANS, weight: 700, color: C.cream, align: 'center', alpha: fadeIn(t, t0 + BEAT * (3 + i * 0.5), 0.3), boil: 0.2 }));
    // black november reminder pill
    const bp = pop(t, T(14), 0.3);
    if (bp > 0) {
      ctx.save(); ctx.translate(CX, 1330); ctx.scale(bp * (1 + 0.03 * beatPulse(t, T(14))), bp * (1 + 0.03 * beatPulse(t, T(14)))); ctx.rotate(0.03);
      G.rrect(ctx, -400, -60, 800, 120, 60, { fill: C.black, lw: 6, seed: 720 });
      G.text(ctx, '30% OFF ATÉ 01/12', 0, 22, { size: 58, fam: DISPLAY, weight: 400, color: C.gold, align: 'center', boil: 0.2 });
      ctx.restore();
    }
    hand(ctx, 'salemalte.com.br', CX, 1460, 50, { alpha: fadeIn(t, T(14, 2), 0.3), color: C.gold });
  }

  const film = Shots.film([
    { at: 0, draw: (ctx, t) => shotIntro(ctx, t), cam: Shots.push(1.0, 1.05) },
    { at: T(3), draw: (ctx, t) => shotComida(ctx, t), in: { type: 'whip', dir: 'left', dur: 0.2 }, cam: Shots.push(1.0, 1.04) },
    { at: T(5), draw: (ctx, t) => shotMusica(ctx, t), in: { type: 'whip', dir: 'left', dur: 0.2 }, cam: Shots.push(1.02, 1.0) },
    { at: T(7), draw: (ctx, t) => shotGalera(ctx, t), in: { type: 'whip', dir: 'left', dur: 0.2 }, cam: Shots.push(1.0, 1.04) },
    { at: T(9), draw: (ctx, t) => shotBreath(ctx, t), in: { type: 'dip', color: '#000', dur: 0.3 } },
    { at: ev.drop, draw: (ctx, t) => shotDrop(ctx, t), in: 'flash', cam: Shots.combine(Shots.shake(22, ev.drop), Shots.shake(16, ev.pct)) },
    { at: ev.endCard, draw: (ctx, t) => shotEnd(ctx, t), in: 'flash' },
  ]);

  Studio.film({ draw: film, fadeOut: 0.9, post: { paper: 0.25, vignette: 0.4, grain: 0.05 } });
})();
