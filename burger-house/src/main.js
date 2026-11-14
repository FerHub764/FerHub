import gsap from 'gsap';
import { MainScene } from './scene.js';
import { CardRenderer, GrillScene } from './mini.js';
import { Burger } from './ingredients.js';
import { Sound } from './audio.js';
import { INGREDIENTS, BUILD, MENU, SPECIALS, REVIEWS, I18N } from './data.js';
import { isCoarse } from './theme.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { /* ok */ } } };
const icon = (id) => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;

let lang = store.get('bh-lang') === 'en' ? 'en' : 'pt';
const t = (k) => I18N[lang][k] ?? k;
const money = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const progress = (p) => { $('.loader-bar i').style.width = `${p * 100}%`; };

const sound = new Sound();

/* ---------------- cena principal ---------------- */
progress(0.15);
const scene = new MainScene($('#stage'));
progress(0.5);
const stages = $$('[data-stage]');
const layersSection = $('#layers');

/* ---------------- movimento reduzido ---------------- */
let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || store.get('bh-reduce') === '1';
function setReduced(v) {
  reduced = v; scene.reduced = v; if (grill) grill.reduced = v;
  document.documentElement.classList.toggle('reduce', v);
  $('#motionBtn').setAttribute('aria-pressed', String(v));
  store.set('bh-reduce', v ? '1' : '0');
}

/* ---------------- i18n ---------------- */
function applyLang() {
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  $('#langBtn').textContent = lang === 'pt' ? 'EN' : 'PT';
  $('.skip').textContent = lang === 'pt' ? 'Pular para o cardápio' : 'Skip to menu';
  renderMenu(); renderSpecials(); renderReviews(); renderBuild(); renderLayerList(); renderCart();
}

/* ---------------- carrinho ---------------- */
const cart = new Map();
function addToCart(item) {
  const cur = cart.get(item.id);
  if (cur) cur.qty++; else cart.set(item.id, { ...item, qty: 1 });
  renderCart();
  const b = $('#cartCount'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  toast(`${item.name()} ${t('cart.added')}`);
  sound.click(880);
}
function renderCart() {
  const list = $('#cartItems'); list.innerHTML = '';
  let total = 0, count = 0;
  for (const [id, it] of cart) {
    total += it.price * it.qty; count += it.qty;
    const li = document.createElement('li');
    li.innerHTML = `<div class="nm">${it.name()}<small>${it.desc ? it.desc() : money(it.price)}</small></div>
      <div class="sub">${money(it.price * it.qty)}</div>
      <div class="stepper"><button data-a="-" aria-label="${t('less')}: ${it.name()}">${icon('minus')}</button><output>${it.qty}</output><button data-a="+" aria-label="${t('more')}: ${it.name()}">${icon('plus')}</button></div>`;
    li.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      it.qty += b.dataset.a === '+' ? 1 : -1; if (it.qty <= 0) cart.delete(id); renderCart(); sound.click();
    }));
    list.append(li);
  }
  $('#cartEmpty').hidden = cart.size > 0;
  $('#cartTotal').textContent = money(total);
  $('#checkout').disabled = cart.size === 0;
  const badge = $('#cartCount'); badge.hidden = count === 0; badge.textContent = count;
}
let lastFocus = null;
function openCart(open) {
  const c = $('#cart');
  c.classList.toggle('open', open); c.toggleAttribute('inert', !open); c.setAttribute('aria-hidden', String(!open));
  $('#scrim').hidden = !open;
  if (open) { lastFocus = document.activeElement; setTimeout(() => $('#cartClose').focus(), 50); } else lastFocus?.focus();
}
$('#cartBtn').addEventListener('click', () => { openCart(true); sound.click(); });
$('#cartClose').addEventListener('click', () => openCart(false));
$('#scrim').addEventListener('click', () => openCart(false));
addEventListener('keydown', (e) => { if (e.key === 'Escape') { openCart(false); scene.burger.selected && scene.select(null); } });
$('#checkout').addEventListener('click', () => {
  cart.clear(); renderCart();
  $('#cartEmpty').textContent = t('cart.done'); sound.sizzle(1.2, 0.06);
  setTimeout(() => { $('#cartEmpty').textContent = t('cart.empty'); }, 4000);
});

let toastTimer;
function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2200); }

/* ---------------- cardápio (burgers 3D por renderer compartilhado) ---------------- */
const cardR = new CardRenderer(360);
const cardBurgers = new Map();
let hoverCard = null;
function renderMenu() {
  const grid = $('#menuGrid'); grid.innerHTML = '';
  MENU.forEach((m) => {
    const el = document.createElement('article'); el.className = 'card glass';
    el.innerHTML = `<canvas width="360" height="360" role="img" aria-label="${m[lang][0]} 3D"></canvas>
      <h3>${m[lang][0]}</h3><p>${m[lang][1]}</p>
      <div class="card-foot"><span class="price">${money(m.price)}</span><button class="btn btn-primary btn-sm">${t('add')}</button></div>`;
    if (!cardBurgers.has(m.id)) cardBurgers.set(m.id, { b: cardR.make(m.types), rot: -0.5 });
    const st = cardBurgers.get(m.id); st.canvas = el.querySelector('canvas');
    cardR.draw(st.b, st.canvas, st.rot);
    const on = () => { hoverCard = st; }, off = () => { if (hoverCard === st) hoverCard = null; };
    el.addEventListener('pointerenter', on); el.addEventListener('pointerleave', off);
    el.addEventListener('focusin', on); el.addEventListener('focusout', off);
    el.addEventListener('touchstart', () => { on(); setTimeout(off, 2500); }, { passive: true });
    el.querySelector('button').addEventListener('click', () => addToCart({ id: m.id, price: m.price, name: () => m[lang][0] }));
    grid.append(el);
  });
}

/* ---------------- especiais: carrossel 3D ---------------- */
let carIdx = 0, carDrag = null;
const specialImgs = new Map();
function renderSpecials() {
  const ring = $('#ring'); ring.innerHTML = '';
  const dots = $('#dots'); dots.innerHTML = '';
  SPECIALS.forEach((s, i) => {
    const el = document.createElement('article'); el.className = 'slide glass';
    el.setAttribute('role', 'group'); el.setAttribute('aria-label', `${i + 1} / ${SPECIALS.length}: ${s[lang][0]}`);
    const off = Math.round((1 - s.price / s.old) * 100);
    el.innerHTML = `<span class="tag">−${off}%</span><canvas width="330" height="300" role="img" aria-label="${s[lang][0]} 3D"></canvas>
      <h3>${s[lang][0]}</h3><p>${s[lang][1]}</p>
      <div class="card-foot"><span class="price">${money(s.price)}<span class="old"><span class="sr">${t('off')} </span>${money(s.old)}</span></span><button class="btn btn-primary btn-sm">${t('add')}</button></div>`;
    if (!specialImgs.has(s.id)) specialImgs.set(s.id, cardR.make(s.types));
    cardR.draw(specialImgs.get(s.id), el.querySelector('canvas'), -0.7 + i * 0.3);
    el.querySelector('button').addEventListener('click', () => addToCart({ id: 'sp-' + s.id, price: s.price, name: () => s[lang][0] }));
    ring.append(el);
    const d = document.createElement('button'); d.setAttribute('aria-label', s[lang][0]);
    d.addEventListener('click', () => goSlide(i)); dots.append(d);
  });
  layoutCarousel();
}
function layoutCarousel(drag = 0) {
  const n = SPECIALS.length, ang = 360 / n, w = $('#ring').offsetWidth || 290;
  const R = Math.round(w / 2 / Math.tan(Math.PI / n)) + 30;
  $$('.slide').forEach((s, i) => {
    s.style.transform = `rotateY(${i * ang}deg) translateZ(${R}px)`;
    const front = ((carIdx % n) + n) % n === i;
    s.classList.toggle('front', front); s.inert = !front;
  });
  $('#ring').style.transform = `translateZ(${-R}px) rotateY(${-carIdx * ang + drag}deg)`;
  $$('#dots button').forEach((d, i) => d.setAttribute('aria-current', String(((carIdx % n) + n) % n === i)));
}
function goSlide(i) { carIdx = i; layoutCarousel(); sound.click(520); }
$('#prevBtn').addEventListener('click', () => goSlide(carIdx - 1));
$('#nextBtn').addEventListener('click', () => goSlide(carIdx + 1));
$('#carousel').addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') goSlide(carIdx - 1); if (e.key === 'ArrowRight') goSlide(carIdx + 1); });
$('#carousel').addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; carDrag = { x: e.clientX, d: 0 }; $('#ring').classList.add('dragging'); });
addEventListener('pointermove', (e) => { if (!carDrag) return; carDrag.d = (e.clientX - carDrag.x) * 0.25; layoutCarousel(carDrag.d); });
addEventListener('pointerup', () => {
  if (!carDrag) return; $('#ring').classList.remove('dragging');
  const steps = Math.round(carDrag.d / (360 / SPECIALS.length)); carDrag = null; goSlide(carIdx - steps);
});
let carHover = false;
$('#carousel').addEventListener('pointerenter', () => (carHover = true));
$('#carousel').addEventListener('pointerleave', () => (carHover = false));
setInterval(() => { if (!reduced && !carHover && !carDrag && !document.hidden && inView($('#specials'))) { carIdx++; layoutCarousel(); } }, 4500);
function inView(el) { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }

/* ---------------- reviews ---------------- */
function renderReviews() {
  const g = $('#reviewsGrid'); g.innerHTML = '';
  REVIEWS.forEach((r) => {
    const el = document.createElement('figure'); el.className = 'review glass'; el.style.margin = '0';
    el.innerHTML = `<div class="stars" role="img" aria-label="${r.stars}/5">${icon('star').repeat(r.stars)}</div>
      <blockquote style="margin:0"><p>${r[lang]}</p></blockquote>
      <footer><span class="avatar" aria-hidden="true">${r.name[0]}</span><figcaption>${r.name}</figcaption></footer>`;
    el.addEventListener('pointermove', (e) => {
      if (reduced) return;
      const b = el.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
      el.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    g.append(el);
  });
}

/* ---------------- monte o seu ---------------- */
const counts = Object.fromEntries(BUILD.items.map((i) => [i.id, i.start]));
function buildPrice() { return BUILD.base + BUILD.items.reduce((s, i) => s + i.price * counts[i.id], 0); }
function renderBuild() {
  const ul = $('#buildList'); ul.innerHTML = '';
  const base = document.createElement('li');
  base.innerHTML = `<div class="nm">${t('build.base')}<small>${money(BUILD.base)}</small></div><span></span><span></span>`;
  ul.append(base);
  BUILD.items.forEach((it) => {
    const nm = INGREDIENTS[it.id][lang][0];
    const li = document.createElement('li');
    li.innerHTML = `<div class="nm">${nm}<small>+ ${money(it.price)}</small></div><span></span>
      <div class="stepper"><button data-a="-" aria-label="${t('less')}: ${nm}" ${counts[it.id] <= it.min ? 'disabled' : ''}>${icon('minus')}</button>
      <output aria-live="polite">${counts[it.id]}</output>
      <button data-a="+" aria-label="${t('more')}: ${nm}" ${counts[it.id] >= it.max ? 'disabled' : ''}>${icon('plus')}</button></div>`;
    li.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      const d = b.dataset.a === '+' ? 1 : -1;
      counts[it.id] = Math.min(it.max, Math.max(it.min, counts[it.id] + d));
      updateBurger();
      if (d > 0 && it.id === 'patty') sound.sizzle(0.9); else sound.click(d > 0 ? 700 : 420);
      renderBuild();
      ul.querySelector(`li:nth-child(${BUILD.items.indexOf(it) + 2}) button[data-a="${b.dataset.a}"]`)?.focus();
    }));
    ul.append(li);
  });
  $('#buildPrice').textContent = money(buildPrice());
}
function updateBurger() {
  scene.select(null);
  scene.burger.setTypes(Burger.typesFrom(counts), true, (l, removed) => {
    if (!removed) gsap.to(l.userData, { drop: 0, duration: reduced ? 0.01 : 0.9, ease: 'bounce.out' });
  });
  renderLayerList();
}
$('#buildAdd').addEventListener('click', () => {
  const desc = BUILD.items.filter((i) => counts[i.id]).map((i) => `${counts[i.id] > 1 ? counts[i.id] + '× ' : ''}${INGREDIENTS[i.id][lang][0]}`);
  const key = 'custom-' + BUILD.items.map((i) => counts[i.id]).join('');
  const snap = { ...counts };
  addToCart({ id: key, price: buildPrice(), name: () => t('build.name'), desc: () => BUILD.items.filter((i) => snap[i.id]).map((i) => `${snap[i.id] > 1 ? snap[i.id] + '× ' : ''}${INGREDIENTS[i.id][lang][0]}`).join(', ') });
  void desc;
});

/* ---------------- lista de camadas (seção explode) ---------------- */
function renderLayerList() {
  const ol = $('#layerList'); ol.innerHTML = '';
  [...scene.burger.layers].reverse().forEach((l) => {
    const [n, d] = INGREDIENTS[l.userData.type][lang];
    const li = document.createElement('li'); li.innerHTML = `${n}<small>${d}</small>`; ol.append(li);
  });
}

/* ---------------- chapa (Sobre) ---------------- */
const grill = new GrillScene($('#grill'), sound);
new IntersectionObserver(([e]) => { grill.visible = e.isIntersecting; if (e.isIntersecting) grill.resize(); sound.setAmbient(e.isIntersecting && !sound.muted); }, { rootMargin: '100px' }).observe($('#grill'));

/* ---------------- interação com o burger ---------------- */
const INTERACTIVE = 'a,button,input,textarea,label,select,.glass,.carousel,.cart,.toast';
let down = null, clicks = [], activeStage = 'hero';
const tip = $('#layerTip');
scene.onSelect = (layer) => {
  if (!layer) { tip.hidden = true; return; }
  const [n, d] = INGREDIENTS[layer.userData.type][lang];
  tip.querySelector('b').textContent = n; tip.querySelector('p').textContent = d; tip.hidden = false;
  sound.click(760);
};
addEventListener('pointerdown', (e) => {
  sound.ensure();
  if (e.button !== 0 || e.target.closest(INTERACTIVE) || activeStage === 'layers') return;
  const hit = scene.pick(e.clientX, e.clientY);
  if (!hit) { if (scene.burger.selected) scene.select(null); return; }
  down = { x: e.clientX, y: e.clientY, lx: e.clientX, hit, vel: 0, t: performance.now() };
  scene.dragging = true; cursorEl.classList.add('grab');
});
addEventListener('pointermove', (e) => {
  if (!isCoarse) scene.mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  cursorEl.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; cursorEl.style.opacity = 1;
  const over = e.target.closest?.('a,button,.card,.slide,input,textarea,canvas#grill');
  cursorEl.classList.toggle('hover', !!over);
  if (!down) return;
  const dx = e.clientX - down.lx; down.lx = e.clientX;
  scene.yaw += dx * 0.012; down.vel = dx * 0.012 * 60;
});
addEventListener('pointerup', (e) => {
  if (!down) return;
  scene.dragging = false; cursorEl.classList.remove('grab');
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
  if (moved < 6) {
    scene.select(down.hit);
    const now = performance.now(); clicks = clicks.filter((c) => now - c < 2500); clicks.push(now);
    if (clicks.length >= 5) { clicks = []; scene.rainIngredients(); toast(t('rain')); sound.sizzle(1.4, 0.06); }
  } else scene.yawVel = down.vel;
  down = null;
});
addEventListener('pointercancel', () => { down = null; scene.dragging = false; });

/* ---------------- cursor ---------------- */
const cursorEl = $('#cursor');
if (matchMedia('(pointer: fine)').matches) document.documentElement.classList.add('custom-cursor');

/* ---------------- header / nav / toolbar ---------------- */
const header = $('.site-header');
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 30), { passive: true });
$('#navBtn').addEventListener('click', () => { const o = !$('#nav').classList.contains('open'); $('#nav').classList.toggle('open', o); $('#navBtn').setAttribute('aria-expanded', String(o)); });
$$('#nav a').forEach((a) => a.addEventListener('click', () => { $('#nav').classList.remove('open'); $('#navBtn').setAttribute('aria-expanded', 'false'); }));
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) $$('#nav a').forEach((a) => a.classList.toggle('active', a.hash === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach((s) => io.observe(s));
$('#langBtn').addEventListener('click', () => { lang = lang === 'pt' ? 'en' : 'pt'; store.set('bh-lang', lang); applyLang(); sound.click(); });
const muteBtn = $('#muteBtn');
function syncMute() { muteBtn.innerHTML = icon(sound.muted ? 'mute' : 'vol'); muteBtn.setAttribute('aria-pressed', String(sound.muted)); }
muteBtn.addEventListener('click', () => { sound.ensure(); sound.setMuted(!sound.muted); syncMute(); if (sound.muted) sound.setAmbient(false); else { sound.click(); sound.setAmbient(grill.visible); } });
$('#motionBtn').addEventListener('click', () => setReduced(!reduced));
document.addEventListener('click', (e) => { if (e.target.closest('a.btn, .nav a')) sound.click(); });

/* ---------------- contato ---------------- */
$('#contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target, st = $('#formStatus');
  const bad = [];
  if (!f.name.value.trim()) bad.push(f.name);
  if (!/^\S+@\S+\.\S+$/.test(f.email.value)) bad.push(f.email);
  if (!f.msg.value.trim()) bad.push(f.msg);
  [f.name, f.email, f.msg].forEach((i) => i.setAttribute('aria-invalid', String(bad.includes(i))));
  if (bad.length) { st.textContent = t('contact.err'); st.className = 'form-status err'; bad[0].focus(); return; }
  st.textContent = t('contact.ok'); st.className = 'form-status ok'; f.reset(); sound.click(880);
});

/* ---------------- âncoras por seção (câmera acompanha o scroll) ---------------- */
const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
function updateAnchor() {
  const vh = innerHeight; let best = null, bestD = Infinity;
  for (const el of stages) {
    const r = el.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - vh / 2);
    if (d < bestD) { bestD = d; best = { el, r }; }
  }
  const { el, r } = best, A = scene.anchor;
  scene.offscreen = r.bottom < -vh * 0.3 || r.top > vh * 1.3;
  activeStage = el.dataset.stage;
  A.x = (r.left + r.width / 2) / innerWidth; A.y = (r.top + r.height / 2) / vh;
  A.h = Math.min(r.height * 0.86, r.width * 0.82) / vh;
  if (activeStage === 'hero') { A.tilt = 0.24; A.explode = 0.1; A.yaw = 0; }
  if (activeStage === 'build') { A.tilt = 0.32; A.explode = 0.12; A.yaw = 0; A.h *= 0.8; }
  let focus = null;
  if (activeStage === 'layers') {
    if (scene.burger.selected) scene.select(null);
    const lr = layersSection.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -lr.top / (lr.height - vh)));
    A.explode = 0.1 + smooth(0.04, 0.25, p) * (1 - smooth(0.8, 0.97, p)) * 1.0;
    A.tilt = 0.24 + 0.32 * Math.sin(Math.PI * p);
    A.yaw = p * Math.PI * 1.2;
    const layers = scene.burger.layers, n = layers.length;
    const q = (p - 0.25) / 0.55;
    const idx = q >= 0 && q < 1 ? Math.floor(q * n) : -1;
    focus = idx >= 0 ? layers[n - 1 - idx] : null;
    $$('#layerList li').forEach((li, i) => li.classList.toggle('on', i === idx));
  }
  if (activeStage !== 'layers' && !scene.burger.selected) scene.burger.layers.forEach((l) => { if (!gsap.isTweening(l.userData)) l.userData.pop *= 0.9; });
  if (activeStage === 'layers') scene.burger.layers.forEach((l) => { l.userData.pop += ((l === focus ? 1 : 0) - l.userData.pop) * 0.12; });
}

/* ---------------- loop ---------------- */
let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  if (document.hidden) return;
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  updateAnchor();
  scene.frame();
  if (scene.burger.selected) {
    const s = scene.screenOf(scene.burger.selected);
    const rad = scene.rig.scale.x * 2 * innerHeight / scene.visH;
    if (innerWidth < 820) { tip.style.left = `${innerWidth / 2}px`; tip.style.top = `${Math.min(innerHeight - 140, s.y + rad * 0.4)}px`; }
    else { tip.style.left = `${Math.max(280, s.x - rad - 16)}px`; tip.style.top = `${Math.max(110, Math.min(innerHeight - 90, s.y))}px`; }
  }
  grill.frame();
  if (hoverCard && hoverCard.canvas.isConnected) { hoverCard.rot += dt * (reduced ? 0 : 1.8); cardR.draw(hoverCard.b, hoverCard.canvas, hoverCard.rot); }
}

/* ---------------- start ---------------- */
setReduced(reduced);
syncMute();
applyLang();
progress(0.85);
Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]).then(() => {
  scene.frame(); progress(1);
  setTimeout(() => {
    $('#loader').classList.add('done');
    scene.intro();
    requestAnimationFrame(loop);
  }, reduced ? 100 : 700);
});
window.__bh = { scene };
