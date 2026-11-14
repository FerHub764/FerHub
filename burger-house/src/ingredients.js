import * as THREE from 'three';
import { C } from './theme.js';

/* ---------- ruído e utilidades ---------- */
function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function noise2(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x, y, o = 4) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * noise2(x * f, y * f); f *= 2.03; a *= 0.5; } return s; }
const col = (h) => new THREE.Color(h);

function canvasTex(w, h, draw, { srgb = true, repeat } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
function noiseCanvas(ctx, w, h, scale, lo, hi, oct = 4) {
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    // ruído "tileável" por wrap simples
    const n = fbm(x / scale, y / scale, oct);
    const v = Math.round((lo + (hi - lo) * n) * 255);
    const i = (y * w + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

/* ---------- texturas (cache) ---------- */
let T = null;
function textures() {
  if (T) return T;
  T = {};
  T.pores = canvasTex(256, 256, (ctx, w, h) => {
    noiseCanvas(ctx, w, h, 6, 0.78, 1.08, 3);
    for (let i = 0; i < 500; i++) { ctx.fillStyle = `rgba(90,40,10,${Math.random() * 0.12})`; ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
  }, { srgb: false, repeat: [6, 3] });
  T.crumb = canvasTex(256, 256, (ctx, w, h) => {
    noiseCanvas(ctx, w, h, 3, 0.55, 1.15, 4);
    for (let i = 0; i < 900; i++) {
      const v = Math.random();
      ctx.fillStyle = v > 0.5 ? `rgba(255,190,150,${Math.random() * 0.25})` : `rgba(0,0,0,${Math.random() * 0.45})`;
      ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2.2 + 0.4, 0, 7); ctx.fill();
    }
  }, { srgb: false, repeat: [5, 2] });
  T.tomato = canvasTex(512, 512, (ctx, w, h) => {
    const cx = w / 2, cy = h / 2, R = w / 2;
    ctx.fillStyle = C.tomatoSkin; ctx.fillRect(0, 0, w, h);
    let g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 0.93);
    g.addColorStop(0, '#F4644C'); g.addColorStop(1, C.tomatoFlesh);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 0.93, 0, 7); ctx.fill();
    const n = 5;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.3;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
      const gg = ctx.createRadialGradient(R * 0.5, 0, 4, R * 0.5, 0, R * 0.3);
      gg.addColorStop(0, '#FFB08A'); gg.addColorStop(0.7, C.tomatoGel); gg.addColorStop(1, 'rgba(255,110,80,0)');
      ctx.fillStyle = gg; ctx.beginPath(); ctx.ellipse(R * 0.52, 0, R * 0.3, R * 0.2, 0, 0, 7); ctx.fill();
      for (let s = 0; s < 9; s++) {
        ctx.fillStyle = '#F7D774'; ctx.beginPath();
        ctx.ellipse(R * (0.38 + Math.random() * 0.3), (Math.random() - 0.5) * R * 0.22, 7, 4, Math.random() * 3, 0, 7); ctx.fill();
      }
      ctx.restore();
    }
    g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.22);
    g.addColorStop(0, '#FF9C80'); g.addColorStop(1, 'rgba(255,120,90,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 0.22, 0, 7); ctx.fill();
  });
  T.pickle = canvasTex(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#4F6D16'; ctx.fillRect(0, 0, w, h);
    const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 58);
    g.addColorStop(0, '#D7E58C'); g.addColorStop(0.75, '#9DB846'); g.addColorStop(1, '#4F6D16');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(64, 64, 60, 0, 7); ctx.fill();
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; ctx.fillStyle = '#EEF2C0'; ctx.beginPath(); ctx.ellipse(64 + Math.cos(a) * 26, 64 + Math.sin(a) * 26, 5, 3, a, 0, 7); ctx.fill(); }
  });
  return T;
}

/* ---------- materiais (cache) ---------- */
let M = null;
export function materials() {
  if (M) return M;
  const t = textures();
  M = {
    bun: new THREE.MeshPhysicalMaterial({ vertexColors: true, map: t.pores, bumpMap: t.pores, bumpScale: 0.6, roughness: 0.42, clearcoat: 0.8, clearcoatRoughness: 0.28, sheen: 0.3, sheenColor: col('#FFD9A0') }),
    crumb: new THREE.MeshStandardMaterial({ color: '#E9C68C', map: t.crumb, roughness: 0.9, emissive: col('#7A3A0C'), emissiveIntensity: 0.45, side: THREE.DoubleSide }),
    sesame: new THREE.MeshStandardMaterial({ color: C.sesame, roughness: 0.45 }),
    patty: new THREE.MeshStandardMaterial({ vertexColors: true, map: t.crumb, bumpMap: t.crumb, bumpScale: 2.2, roughness: 0.62 }),
    cheese: new THREE.MeshPhysicalMaterial({ color: C.cheese, roughness: 0.48, clearcoat: 0.2, clearcoatRoughness: 0.35, emissive: col('#C25400'), emissiveIntensity: 0.05, side: THREE.DoubleSide }),
    tomatoSkin: new THREE.MeshPhysicalMaterial({ color: C.tomatoSkin, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 }),
    tomatoCut: new THREE.MeshPhysicalMaterial({ map: t.tomato, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08, emissive: col('#801000'), emissiveIntensity: 0.15 }),
    onion: new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.2 }),
    lettuce: new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.68, side: THREE.DoubleSide, sheen: 0.15, sheenColor: col('#D8F590') }),
    bacon: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.48, side: THREE.DoubleSide }),
    pickleSide: new THREE.MeshStandardMaterial({ color: '#3F5A12', roughness: 0.4 }),
    pickleCut: new THREE.MeshPhysicalMaterial({ map: t.pickle, roughness: 0.3, clearcoat: 0.8 }),
  };
  return M;
}

/* ---------- geometrias ---------- */
const G = new Map();
const cached = (key, fn) => { if (!G.has(key)) G.set(key, fn()); return G.get(key); };
const SEG = { high: 72, low: 40 };

function paintVertices(geo, fn) {
  const p = geo.attributes.position, colors = new Float32Array(p.count * 3), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) { fn(p.getX(i), p.getY(i), p.getZ(i), c, i); colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

const BUN_R = 1.62, DOME_H = 0.86;
function domeProfile(a) { // a: 0 (aba) → π/2 (topo)
  return { x: BUN_R * Math.pow(Math.cos(a), 0.6), y: 0.1 + DOME_H * Math.pow(Math.sin(a), 0.85) };
}
function bunTopGeo(detail) {
  return cached('bunTop' + detail, () => {
    const pts = [new THREE.Vector2(0.001, 0), new THREE.Vector2(BUN_R * 0.88, 0), new THREE.Vector2(BUN_R * 0.97, 0.02), new THREE.Vector2(BUN_R, 0.06)];
    for (let i = 1; i <= 20; i++) { const d = domeProfile((i / 21) * Math.PI / 2); pts.push(new THREE.Vector2(d.x, d.y)); }
    pts.push(new THREE.Vector2(0.001, 0.1 + DOME_H));
    const g = new THREE.LatheGeometry(pts, SEG[detail]);
    const cBottom = col(C.bunCrumb), cRim = col(C.bunRim), cTop = col(C.bunTop), dark = col('#8A4210');
    paintVertices(g, (x, y, z, c) => {
      const ang = Math.atan2(z, x);
      if (y < 0.04) { c.copy(cBottom).multiplyScalar(0.92 + 0.1 * fbm(x * 2, z * 2)); return; }
      const h = Math.max(0, (y - 0.06) / DOME_H);
      c.copy(cRim).lerp(cTop, Math.min(1, Math.pow(h, 0.7) * 1.15));
      const n = fbm(Math.cos(ang) * 2 + 5, h * 3 + Math.sin(ang) * 2);
      c.lerp(dark, Math.max(0, n - 0.45) * 0.9 * h);
    });
    return g;
  });
}
function sesameMesh(detail) {
  const count = detail === 'high' ? 150 : 70;
  const geo = cached('seed', () => { const s = new THREE.SphereGeometry(0.034, 8, 6); s.scale(1, 0.5, 1.9); return s; });
  const mesh = new THREE.InstancedMesh(geo, materials().sesame, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), n = new THREE.Vector3(), spin = new THREE.Quaternion();
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < count; i++) {
    const a = 0.32 + rnd() * 1.15, th = rnd() * Math.PI * 2;
    const p = domeProfile(a), p2 = domeProfile(a + 0.01);
    const tx = p2.x - p.x, ty = p2.y - p.y; // tangente no perfil → normal = (ty, -tx)
    n.set(ty * Math.cos(th), -tx, ty * Math.sin(th)).normalize();
    if (n.y < 0) n.negate();
    q.setFromUnitVectors(up, n); spin.setFromAxisAngle(up, rnd() * 6.28); q.multiply(spin);
    m.compose(new THREE.Vector3(p.x * Math.cos(th), p.y + 0.008, p.x * Math.sin(th)), q, new THREE.Vector3(1, 1, 1));
    mesh.setMatrixAt(i, m);
  }
  mesh.castShadow = true;
  return mesh;
}
function bunBottomGeo(detail) {
  return cached('bunBottom' + detail, () => {
    const R = BUN_R * 0.99, H = 0.46, pts = [];
    pts.push(new THREE.Vector2(0.001, 0), new THREE.Vector2(R * 0.82, 0), new THREE.Vector2(R * 0.93, 0.03));
    for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + (i / 10) * Math.PI * 0.95; pts.push(new THREE.Vector2(R * 0.93 + Math.cos(a) * 0.09 + 0.0, 0.22 + Math.sin(a) * 0.2)); }
    pts.push(new THREE.Vector2(R * 0.97, H), new THREE.Vector2(R * 0.6, H + 0.012), new THREE.Vector2(0.001, H + 0.02));
    const g = new THREE.LatheGeometry(pts, SEG[detail]);
    const cut = col('#E9B567'), toast = col('#B86A22'), side = col(C.bunRim), under = col('#9C5418');
    paintVertices(g, (x, y, z, c) => {
      const r = Math.hypot(x, z);
      if (y > H - 0.01) { c.copy(cut).lerp(toast, Math.max(0, fbm(x * 2.5, z * 2.5) - 0.35) * 1.4); return; }
      if (y < 0.02) { c.copy(under); return; }
      c.copy(side).lerp(under, 1 - y / H).multiplyScalar(0.92 + 0.15 * fbm(Math.atan2(z, x) * 3, y * 4));
    });
    return g;
  });
}
function pattyGeo(detail) {
  return cached('patty' + detail, () => {
    const R = 1.7, H = 0.46, r = 0.12, pts = [];
    for (let i = 0; i <= 6; i++) pts.push(new THREE.Vector2(0.001 + (R - r) * (i / 6), 0));
    for (let i = 1; i <= 8; i++) { const a = -Math.PI / 2 + (i / 8) * Math.PI / 2; pts.push(new THREE.Vector2(R - r + Math.cos(a) * r, r + Math.sin(a) * r)); }
    for (let i = 1; i <= 5; i++) pts.push(new THREE.Vector2(R + Math.sin((i / 6) * Math.PI) * 0.04, r + (H - 2 * r) * (i / 6)));
    for (let i = 0; i <= 8; i++) { const a = (i / 8) * Math.PI / 2; pts.push(new THREE.Vector2(R - r + Math.cos(a) * r, H - r + Math.sin(a) * r)); }
    for (let i = 1; i <= 6; i++) pts.push(new THREE.Vector2(Math.max(0.001, (R - r) * (1 - i / 6)), H));
    const g = new THREE.LatheGeometry(pts, detail === 'high' ? 110 : 56);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), ang = Math.atan2(z, x), rad = Math.hypot(x, z);
      const k = 1 + 0.035 * (fbm(Math.cos(ang) * 2.2 + 3, Math.sin(ang) * 2.2 + y * 3) - 0.5) * 2;
      const lump = 0.025 * (fbm(x * 4 + 9, z * 4 + y * 3) - 0.5);
      p.setXYZ(i, x * k, y + lump * (rad > 0.2 ? 1 : 0), z * k);
    }
    g.computeVertexNormals();
    const base = col(C.patty), crust = col(C.pattyCrust), charC = col('#170A04');
    paintVertices(g, (x, y, z, c) => {
      const n = fbm(x * 3 + y * 5, z * 3 - y * 5);
      c.copy(base).lerp(crust, n * 0.9);
      const rad = Math.hypot(x, z);
      if (rad > 1.55) c.lerp(charC, Math.max(0, fbm(x * 6, z * 6 + y * 8) - 0.5) * 1.6);
    });
    return g;
  });
}
function cheeseGeo(detail) {
  return cached('cheese' + detail, () => {
    const S = 3.55, seg = detail === 'high' ? 56 : 28;
    const g = new THREE.PlaneGeometry(S, S, seg, seg); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z);
      let y = 0.025 * Math.sin(x * 2.1 + z * 1.3);
      if (r > 1.62) y -= Math.min(0.62, 1.1 * Math.pow(r - 1.62, 1.3));
      // bordas derretidas abraçando a carne
      const k = 1 - 0.22 * Math.max(0, r - 1.68);
      p.setXYZ(i, x * k, y, z * k);
    }
    g.computeVertexNormals();
    return g;
  });
}
function dripGeo() { return cached('drip', () => new THREE.CapsuleGeometry(0.075, 1, 6, 10)); }
function tomatoGeo(detail) { return cached('tomato' + detail, () => new THREE.CylinderGeometry(0.98, 0.95, 0.22, detail === 'high' ? 48 : 28, 1)); }
function onionGeo(R, detail) {
  return cached('onion' + R + detail, () => {
    const g = new THREE.TorusGeometry(R, 0.075, 10, detail === 'high' ? 72 : 40); g.rotateX(Math.PI / 2); g.scale(1, 0.55, 1);
    const outer = col(C.onion), pale = col(C.onionPale);
    paintVertices(g, (x, y, z, c) => { const r = Math.hypot(x, z); c.copy(pale).lerp(outer, THREE.MathUtils.smoothstep(r, R - 0.02, R + 0.06)); });
    return g;
  });
}
function lettuceGeo(detail, variant) {
  return cached('lettuce' + detail + variant, () => {
    const nr = detail === 'high' ? 22 : 12, ns = detail === 'high' ? 180 : 90;
    const pos = [], colors = [], idx = [];
    const dark = col(C.lettuceDark), light = col(C.lettuceLight), c = new THREE.Color();
    const off = variant * 13.7;
    for (let i = 0; i <= nr; i++) {
      const t = i / nr;
      for (let j = 0; j <= ns; j++) {
        const th = (j / ns) * Math.PI * 2;
        const edge = 2.05 * (1 + 0.07 * Math.sin(5 * th + off) + 0.08 * (fbm(Math.cos(th) * 2 + off, Math.sin(th) * 2) - 0.5));
        const r = (0.05 + 0.95 * t) * edge;
        const ruffle = Math.pow(t, 2.2) * (0.13 * Math.sin(th * 11 + off + 3 * fbm(th * 2, off)) + 0.045 * Math.sin(th * 27 + off));
        const y = ruffle - 0.38 * Math.pow(t, 2.5) + 0.06 * (fbm(r * Math.cos(th) * 1.5 + off, r * Math.sin(th) * 1.5) - 0.5);
        pos.push(r * Math.cos(th), y, r * Math.sin(th));
        const vein = Math.pow(Math.abs(Math.sin(th * 6 + off)), 30) * (1 - t) * 0.25;
        c.copy(light).lerp(dark, Math.pow(t, 0.8) * (0.7 + 0.3 * fbm(th * 4, t * 3 + off))).lerp(light, vein);
        colors.push(c.r, c.g, c.b);
      }
    }
    for (let i = 0; i < nr; i++) for (let j = 0; j < ns; j++) {
      const a = i * (ns + 1) + j, b = a + ns + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  });
}
function baconGeo(detail) {
  return cached('bacon' + detail, () => {
    const g = new THREE.PlaneGeometry(3.6, 0.5, detail === 'high' ? 80 : 40, 6); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, 0.09 * Math.sin(x * 3.6) + 0.03 * Math.sin(x * 9 + z * 4)); }
    g.computeVertexNormals();
    const meat = col(C.baconMeat), fat = col(C.baconFat), dark = col('#4A140A');
    paintVertices(g, (x, y, z, c) => {
      const s = Math.sin(z * 22 + Math.sin(x * 2) * 1.5);
      c.copy(meat).lerp(fat, THREE.MathUtils.smoothstep(s, 0.4, 0.8)).lerp(dark, Math.max(0, fbm(x * 3, z * 9) - 0.55) * 1.5);
    });
    return g;
  });
}
function pickleGeo() { return cached('pickle', () => new THREE.CylinderGeometry(0.34, 0.34, 0.06, 24)); }

/* ---------- camadas ---------- */
export const ORDER = ['bunBottom', 'patty', 'cheese', 'bacon', 'tomato', 'onion', 'pickles', 'lettuce', 'bunTop'];
export const HEIGHTS = { bunBottom: 0.48, patty: 0.46, cheese: 0.08, bacon: 0.16, tomato: 0.22, onion: 0.1, pickles: 0.07, lettuce: 0.16, bunTop: 0.98 };

function shadowize(o) { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; }

export function makeLayer(type, detail = 'high', variant = 0) {
  const m = materials();
  const g = new THREE.Group();
  switch (type) {
    case 'bunTop': {
      g.add(new THREE.Mesh(bunTopGeo(detail), m.bun));
      g.add(sesameMesh(detail));
      const cut = new THREE.Mesh(cached('bunCut', () => new THREE.CircleGeometry(BUN_R * 0.97, 48)), m.crumb);
      cut.rotation.x = Math.PI / 2; cut.position.y = -0.004; g.add(cut);
      break;
    }
    case 'bunBottom': g.add(new THREE.Mesh(bunBottomGeo(detail), m.bun)); break;
    case 'patty': g.add(new THREE.Mesh(pattyGeo(detail), m.patty)); break;
    case 'cheese': {
      const s = new THREE.Mesh(cheeseGeo(detail), m.cheese); s.rotation.y = 0.5 + Math.PI / 4 + variant * 0.7; s.position.y = 0.04; g.add(s);
      const drips = detail === 'high' ? 6 : 3;
      const H = 3.55 / 2 * 0.98;
      for (let i = 0; i < drips; i++) {
        const side = i % 4, along = ((i * 0.618 + variant * 0.3) % 1 - 0.5) * 1.6;
        let x = H, z = along; if (side === 1) [x, z] = [-H, along]; if (side === 2) [x, z] = [along, H]; if (side === 3) [x, z] = [along, -H];
        const r = Math.hypot(x, z), yEdge = r > 1.62 ? -Math.min(0.62, 1.1 * Math.pow(r - 1.62, 1.3)) : 0, kk = 1 - 0.22 * Math.max(0, r - 1.68);
        const len = 0.18 + 0.3 * ((i * 0.37 + variant * 0.2) % 1);
        const d = new THREE.Mesh(dripGeo(), m.cheese);
        d.scale.set(1, len, 1);
        d.position.set(x * kk * 0.98, yEdge - len * 0.5, z * kk * 0.98);
        s.add(d);
      }
      break;
    }
    case 'tomato': {
      const geo = tomatoGeo(detail);
      const n = 3;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + variant;
        const s = new THREE.Mesh(geo, [m.tomatoSkin, m.tomatoCut, m.tomatoCut]);
        s.position.set(Math.cos(a) * 0.72, 0.11 + i * 0.03, Math.sin(a) * 0.72);
        s.rotation.set(0.05 * Math.sin(i * 2), i, 0.05 * Math.cos(i * 3));
        g.add(s);
      }
      break;
    }
    case 'onion': {
      [1.45, 1.22, 0.98, 0.76].forEach((R, i) => { const r = new THREE.Mesh(onionGeo(R, detail), m.onion); r.position.set(i * 0.03, 0.04 + (i % 2) * 0.03, -i * 0.02); g.add(r); });
      [1.1, 0.88].forEach((R, i) => { const r = new THREE.Mesh(onionGeo(R, detail), m.onion); r.position.set(0.5, 0.09, 0.35 - i * 0.05); r.rotation.z = 0.05; g.add(r); });
      break;
    }
    case 'lettuce': {
      const a = new THREE.Mesh(lettuceGeo(detail, 0), m.lettuce); a.position.y = 0.12; g.add(a);
      if (detail === 'high') { const b = new THREE.Mesh(lettuceGeo(detail, 1), m.lettuce); b.rotation.y = 1.3; b.scale.setScalar(0.94); b.position.y = 0.16; g.add(b); }
      break;
    }
    case 'bacon': {
      for (let i = 0; i < 2; i++) { const b = new THREE.Mesh(baconGeo(detail), m.bacon); b.rotation.y = i * 1.4 + 0.3; b.position.set(0, 0.08 + i * 0.05, (i - 0.5) * 0.3); g.add(b); }
      break;
    }
    case 'pickles': {
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const p = new THREE.Mesh(pickleGeo(), [m.pickleSide, m.pickleCut, m.pickleCut]);
        p.position.set(Math.cos(a) * 0.85, 0.04, Math.sin(a) * 0.85); p.rotation.set(0.08, 0, 0.06 * i); g.add(p);
      }
      break;
    }
  }
  g.userData = { type, height: HEIGHTS[type], drop: 0, pop: 0, cur: null, remove: 0, variant };
  return shadowize(g);
}

/* ---------- burger empilhado ---------- */
export class Burger {
  constructor(types, detail = 'high') {
    this.detail = detail;
    this.group = new THREE.Group();
    this.layers = [];
    this.gap = 0.1; this.explode = 0; this.breath = 1; this.selected = null;
    this.setTypes(types, false);
  }
  static typesFrom(counts) {
    const list = ['bunBottom'];
    const p = counts.patty ?? 1, ch = counts.cheese ?? 0;
    for (let i = 0; i < Math.max(p, ch); i++) { if (i < p) list.push('patty'); if (i < ch) list.push('cheese'); }
    for (const t of ['bacon', 'tomato', 'onion', 'pickles', 'lettuce']) for (let i = 0; i < (counts[t] || 0); i++) list.push(t);
    list.push('bunTop');
    return list;
  }
  /** troca a lista de camadas mantendo as que já existem (para animar) */
  setTypes(types, animate = true, onNew) {
    const pool = new Map();
    for (const l of this.layers) { if (l.userData.remove) continue; const k = l.userData.type; if (!pool.has(k)) pool.set(k, []); pool.get(k).push(l); }
    const next = [];
    const seen = {};
    for (const t of types) {
      seen[t] = (seen[t] || 0) + 1;
      const reuse = pool.get(t)?.shift();
      if (reuse) { next.push(reuse); continue; }
      const l = makeLayer(t, this.detail, seen[t] - 1);
      this.group.add(l);
      if (animate) { l.userData.drop = 5; onNew?.(l); }
      next.push(l);
    }
    for (const arr of pool.values()) for (const l of arr) { l.userData.remove = 1; onNew?.(l, true); }
    this.removing = [...(this.removing || []), ...[...pool.values()].flat()];
    this.layers = next;
  }
  totalHeight(gap = this.gap + this.explode) {
    return this.layers.reduce((s, l) => s + l.userData.height, 0) + gap * (this.layers.length - 1);
  }
  update(t, dt, still = false) {
    const gap = this.gap + this.explode * 0.95;
    const total = this.totalHeight(gap);
    let y = -total / 2;
    const k = 1 - Math.pow(0.0001, dt);
    const selIdx = this.selected ? this.layers.indexOf(this.selected) : -1;
    this.layers.forEach((l, i) => {
      const u = l.userData;
      let target = y + (selIdx >= 0 ? (i > selIdx ? 0.32 : i < selIdx ? -0.2 : 0) : 0);
      const br = still ? 0 : this.breath * 0.045 * Math.sin(t * 1.3 + i * 0.7) * (0.6 + this.explode);
      if (u.cur === null) u.cur = target;
      u.cur += (target - u.cur) * k;
      l.position.y = u.cur + br + u.drop;
      const ps = 1 + u.pop * 0.1;
      l.scale.setScalar(ps);
      l.rotation.y = (still ? 0 : this.breath * 0.04 * Math.sin(t * 0.7 + i)) + u.pop * 0.3;
      l.rotation.z = still ? 0 : this.breath * 0.012 * Math.sin(t * 0.9 + i * 2);
      y += u.height + gap;
    });
    if (this.removing?.length) {
      this.removing = this.removing.filter((l) => {
        l.userData.remove += dt * 2.2;
        const r = l.userData.remove - 1;
        l.position.x = r * 6; l.position.y += dt * 2; l.scale.setScalar(Math.max(0.001, 1 - r));
        if (r >= 1) { this.group.remove(l); return false; }
        return true;
      });
    }
  }
}
