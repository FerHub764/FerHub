// Faísca: liga renderizador, física, entrada, áudio, telas e progresso.
import { STEP } from './config.js';
import { Renderer } from './render.js';
import { Game } from './game.js';
import { Input } from './input.js';
import { Audio } from './audio.js';
import { WORLDS, LEVELS } from './levels/index.js';
import { TITLE_SCENE } from './levels/scenes.js';
import { loadSave, writeSave, recordCompletion, levelRec, totalGems, fmtTime, clearSave } from './save.js';
import { SKINS, buildPlayerFrames } from './sprites.js';

const $ = (id) => document.getElementById(id);
const app = $('app');
const stage = $('stage');
const canvas = $('screen');

let save = loadSave();
const renderer = new Renderer(canvas);
const input = new Input();
const audio = new Audio();
audio.musicOn = save.settings.music;
audio.sfxOn = save.settings.sfx;
renderer.brightness = save.settings.brightness;

const TOTAL_GEMS = LEVELS.length * 3;
const WORLD_STYLE = [
  { bg: 'linear-gradient(160deg, #3d1e1a 0%, #1f0f15 70%)', acc: '#ffb45a' },
  { bg: 'linear-gradient(160deg, #1f2656 0%, #0d0e27 70%)', acc: '#8fd6ff' },
  { bg: 'linear-gradient(160deg, #0f3b3f 0%, #061619 70%)', acc: '#6ff0d0' },
];

let mode = 'boot';
let game = null;
let scene = null;
let levelIndex = 0;
let lastResult = null;
let isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

// ---------- utilidades de interface ----------
const screens = ['title', 'map', 'pause', 'complete', 'shop', 'settings', 'ending'];
function showScreen(name) {
  app.classList.toggle('playing', name === null || name === 'pause');
  for (const s of screens) $(`scr-${s}`).hidden = s !== name;
  const el = name && $(`scr-${name}`);
  if (el) {
    const f = el.querySelector('.btn:not(:disabled), .lvl:not(.locked)');
    if (f && !isTouch) f.focus({ preventScroll: true });
  }
}

let toastTimer = 0;
function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; app.appendChild(el); }
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 1800);
}

function click(id, fn, sound = 'ui') {
  $(id).addEventListener('click', (e) => { audio.unlock(); if (sound) audio.sfx(sound); fn(e); });
}

function vibrate(ms) {
  if (!save.settings.vibrate) return;
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch { /* sem vibração */ }
}

function keyName(k) {
  const touch = isTouch && !input.usedPad;
  if (k === 'mover') return touch ? '<b>◀ ▶</b>' : input.usedPad ? '<b>direcional</b>' : '<b>← →</b>';
  if (k === 'pulo') return touch ? '<b>PULO</b>' : input.usedPad ? '<b>A</b>' : '<b>Espaço</b>';
  if (k === 'dash') return touch ? '<b>DASH</b>' : input.usedPad ? '<b>B</b>' : '<b>X</b>';
  return k;
}

// ---------- layout ----------
function layout() {
  const W = window.innerWidth, H = window.innerHeight;
  const portrait = H > W * 1.05;
  const handheld = portrait && isTouch;
  app.classList.toggle('portrait', handheld);
  app.classList.toggle('landscape', !handheld);
  app.classList.toggle('touch', isTouch);
  const size = { p: 0.82, m: 1, g: 1.2 }[save.settings.buttons] || 1;
  const base = handheld ? Math.min(76, W * 0.17) : Math.min(78, H * 0.17);
  app.style.setProperty('--btn', `${Math.round(Math.max(46, base * size))}px`);
  if (handheld) {
    const cs = getComputedStyle(app);
    const inner = H - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const padH = Math.max(230, Math.min(inner * 0.4, 330));
    app.style.setProperty('--stage-h', `${Math.round(inner - padH)}px`);
  }
  const r = stage.getBoundingClientRect();
  renderer.resize(r.width, r.height, Math.min(window.devicePixelRatio || 1, 3));
  const cur = game || scene;
  if (cur) cur.setView(renderer.vw, renderer.vh);
  if (scene && scene !== cur) scene.setView(renderer.vw, renderer.vh);
}
window.addEventListener('resize', layout);
window.addEventListener('orientationchange', () => setTimeout(layout, 120));

// ---------- HUD ----------
const hud = { brasas: $('hud-brasas'), gems: $('hud-gems'), timer: $('timer'), combo: $('combo'), hint: $('hint'), banner: $('banner') };
function updateHud() {
  if (!game) return;
  hud.brasas.textContent = game.brasas;
  const g = hud.gems.children;
  game.gems.forEach((gm, i) => {
    if (!g[i]) return;
    g[i].className = 'gem' + (gm.got ? ' on' : gm.had ? ' had' : '');
  });
  hud.timer.hidden = !save.settings.timer;
}
let comboTimer = 0;
function showCombo(n) {
  if (n < 2) return;
  hud.combo.innerHTML = `COMBO x${n}<small>+${Math.min(n, 8)} BRASAS</small>`;
  hud.combo.classList.add('show');
  hud.combo.classList.remove('bump');
  void hud.combo.offsetWidth;
  hud.combo.classList.add('bump');
  clearTimeout(comboTimer);
  comboTimer = setTimeout(() => hud.combo.classList.remove('show'), 1400);
}
function showHint(text) {
  if (!text) { hud.hint.classList.remove('show'); return; }
  hud.hint.innerHTML = text.replace(/\{(\w+)\}/g, (_, k) => keyName(k));
  hud.hint.classList.add('show');
}
let bannerTimer = 0;
function showBanner(n, t) {
  $('banner-n').textContent = n;
  $('banner-t').textContent = t;
  hud.banner.classList.add('show');
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => hud.banner.classList.remove('show'), 2200);
}

// ---------- cena de fundo ----------
function makeScene(ending = false) {
  const s = new Game(TITLE_SCENE, { skin: save.skin, demo: true });
  s.exit.lit = true;
  if (ending) { s.darkMul = 0.35; for (const c of s.checkpoints) c.lit = true; }
  renderer.prepare(s);
  s.setView(renderer.vw, renderer.vh);
  return s;
}

// Faísca grande na tela de título
const heroCv = $('t-hero');
const heroCtx = heroCv.getContext('2d');
let heroFrames = null;
let heroSkin = '';
function drawHero(t) {
  if (heroSkin !== save.skin) { heroFrames = buildPlayerFrames(SKINS.find((s) => s.id === save.skin) || SKINS[0]); heroSkin = save.skin; }
  const fr = heroFrames.idle[((t / 10) | 0) % 4];
  heroCtx.clearRect(0, 0, 20, 20);
  heroCtx.drawImage(fr.img, 0, 0);
}

function toTitle() {
  game = null;
  mode = 'title';
  input.enabled = false;
  $('hud').hidden = true;
  if (!scene) scene = makeScene();
  renderer.prepare(scene);
  $('t-wallet').textContent = save.wallet;
  $('t-gems').textContent = `${totalGems(save)}/${TOTAL_GEMS}`;
  showScreen('title');
  audio.play('title');
  releaseWake();
}

// ---------- mapa ----------
const LOCK = '<svg class="lock" viewBox="0 0 10 10" aria-hidden="true"><path d="M3 4.5V3a2 2 0 0 1 4 0v1.5h1V9H2V4.5zm1 0h2V3a1 1 0 0 0-2 0z"/></svg>';
function isUnlocked(i) { return i === 0 || levelRec(save, LEVELS[i - 1].id).done; }

function buildMap() {
  const box = $('worlds');
  box.innerHTML = '';
  let firstOpen = -1;
  LEVELS.forEach((l, i) => { if (firstOpen < 0 && isUnlocked(i) && !levelRec(save, l.id).done) firstOpen = i; });
  WORLDS.forEach((w, wi) => {
    const st = WORLD_STYLE[wi];
    const sec = document.createElement('section');
    sec.className = 'world';
    sec.style.setProperty('--wbg', st.bg);
    sec.style.setProperty('--wacc', st.acc);
    const gems = w.levels.reduce((n, l) => n + levelRec(save, l.id).gems.filter(Boolean).length, 0);
    sec.innerHTML = `<header><span class="wnum">MUNDO ${wi + 1}</span><h3>${w.name}</h3><span class="wgems">◆ ${gems}/${w.levels.length * 3}</span></header>`;
    const grid = document.createElement('div');
    grid.className = 'levels';
    const firstIdx = LEVELS.findIndex((l) => l.id === w.levels[0].id);
    w.levels.forEach((l, k) => {
      const i = firstIdx + k;
      const rec = levelRec(save, l.id);
      const open = isUnlocked(i);
      const b = document.createElement('button');
      b.className = 'lvl' + (rec.done ? ' done' : '') + (open ? '' : ' locked') + (i === firstOpen ? ' next' : '');
      b.disabled = !open;
      b.setAttribute('aria-label', `Fase ${l.id}, ${l.name}${open ? '' : ', bloqueada'}`);
      const gm = rec.gems.map((g) => `<i class="gem${g ? ' on' : ''}"></i>`).join('');
      b.innerHTML = `<span class="ln">${open ? l.id : LOCK}</span><span class="lname">${open ? l.name : '???'}</span><span class="gems">${gm}</span><span class="lt">${rec.bestTime ? fmtTime(rec.bestTime) : ''}</span>`;
      if (open) b.addEventListener('click', () => { audio.unlock(); audio.sfx('ui'); startLevel(i); });
      grid.appendChild(b);
    });
    sec.appendChild(grid);
    if (!isUnlocked(firstIdx)) {
      const p = document.createElement('p');
      p.className = 'wlock';
      p.textContent = `Termine a fase ${LEVELS[firstIdx - 1].id} para abrir este mundo.`;
      sec.appendChild(p);
    }
    box.appendChild(sec);
  });
}

function toMap() {
  game = null;
  mode = 'map';
  input.enabled = false;
  $('hud').hidden = true;
  if (!scene) scene = makeScene();
  renderer.prepare(scene);
  $('m-wallet').textContent = save.wallet;
  buildMap();
  showScreen('map');
  audio.play('title');
  releaseWake();
}

// ---------- partida ----------
const hooks = {
  sfx: (n, v) => audio.sfx(n, v),
  hud: () => updateHud(),
  hint: (t) => showHint(t),
  combo: (n) => showCombo(n),
  comboEnd: () => {},
  vibrate: (ms) => vibrate(ms),
  complete: (st) => onComplete(st),
};

function startLevel(i) {
  levelIndex = i;
  const def = LEVELS[i];
  const rec = levelRec(save, def.id);
  game = new Game(def, { skin: save.skin, hooks, gemsHad: rec.gems });
  renderer.prepare(game);
  game.setView(renderer.vw, renderer.vh);
  mode = 'play';
  input.clear();
  input.enabled = true;
  showScreen(null);
  $('hud').hidden = false;
  showHint(null);
  hud.combo.classList.remove('show');
  updateHud();
  showBanner(def.id, def.name);
  audio.play(def.music || game.theme.music);
  requestWake();
}

function pause() {
  if (mode !== 'play') return;
  mode = 'pause';
  input.enabled = false;
  input.clear();
  audio.sfx('pause');
  $('p-sub').textContent = `${game.def.id} · ${game.def.name}`;
  syncPauseToggles();
  showScreen('pause');
}
function resume() {
  if (mode !== 'pause') return;
  mode = 'play';
  input.clear();
  input.enabled = true;
  showScreen(null);
}
function syncPauseToggles() {
  $('p-music').textContent = save.settings.music ? 'Música: sim' : 'Música: não';
  $('p-sfx').textContent = save.settings.sfx ? 'Efeitos: sim' : 'Efeitos: não';
}

function onComplete(st) {
  const res = recordCompletion(save, st);
  lastResult = { st, res };
  mode = 'complete';
  input.enabled = false;
  showHint(null);
  const def = LEVELS[levelIndex];
  $('r-title').textContent = res.firstClear ? 'Fase concluída!' : 'Fase concluída';
  $('r-sub').textContent = `${def.id} · ${def.name}`;
  $('r-time').innerHTML = fmtTime(st.time) + (res.newRecord && !res.firstClear ? '<span class="badge">RECORDE</span>' : '');
  const bonus = st.brasas - st.coins;
  $('r-coins').textContent = `${st.coins}/${st.coinsTotal}${bonus > 0 ? `  +${bonus} de combo` : ''}`;
  $('r-gems').innerHTML = st.gems.map((g, i) => `<i class="gem${g ? ' on' : levelRec(save, def.id).gems[i] ? ' had' : ''}${res.newGems[i] ? ' pop' : ''}" style="animation-delay:${0.25 + i * 0.18}s"></i>`).join('');
  $('r-combo').textContent = st.bestCombo >= 2 ? `x${st.bestCombo}` : '—';
  $('r-deaths').textContent = String(st.deaths);
  const last = levelIndex === LEVELS.length - 1;
  $('r-next').textContent = last ? 'Ver o final' : 'Próxima fase';
  showScreen('complete');
  $('hud').hidden = true;
  releaseWake();
}

function next() {
  if (levelIndex === LEVELS.length - 1) { toEnding(); return; }
  startLevel(levelIndex + 1);
}

function toEnding() {
  game = null;
  mode = 'ending';
  save.ending = true;
  writeSave(save);
  scene = makeScene(true);
  $('e-gems').textContent = `${totalGems(save)}/${TOTAL_GEMS}`;
  $('e-deaths').textContent = String(save.stats.deaths);
  $('e-kills').textContent = String(save.stats.kills);
  const missing = TOTAL_GEMS - totalGems(save);
  $('e-note').textContent = missing > 0
    ? `Ainda faltam ${missing} gemas escondidas. Com todas, a chama Estelar aparece na loja.`
    : 'Você achou todas as gemas! A chama Estelar está liberada na loja.';
  showScreen('ending');
  audio.play('ending');
}

// ---------- loja ----------
function skinAvailable(s) {
  if (s.need === 'gems') return totalGems(save) >= TOTAL_GEMS;
  return true;
}
function buildShop() {
  $('s-wallet').textContent = save.wallet;
  const box = $('skins');
  box.innerHTML = '';
  for (const s of SKINS) {
    const owned = save.owned.includes(s.id);
    const eq = save.skin === s.id;
    const card = document.createElement('div');
    card.className = 'skin' + (eq ? ' eq' : '');
    const cv = document.createElement('canvas');
    cv.width = 20; cv.height = 20;
    const fr = buildPlayerFrames(s);
    cv.getContext('2d').drawImage(fr.idle[0].img, 0, 0);
    card.appendChild(cv);
    const nm = document.createElement('div');
    nm.className = 'sn';
    nm.textContent = s.name;
    card.appendChild(nm);
    const b = document.createElement('button');
    b.className = 'btn small' + (owned ? ' ghost' : '');
    if (eq) { b.textContent = 'Em uso'; b.disabled = true; }
    else if (owned) b.textContent = 'Usar';
    else if (s.need === 'gems') { b.textContent = skinAvailable(s) ? 'Pegar' : `◆ ${TOTAL_GEMS} gemas`; b.disabled = !skinAvailable(s); }
    else { b.innerHTML = `<span class="ico-brasa"></span> ${s.cost}`; b.disabled = save.wallet < s.cost; }
    b.addEventListener('click', () => {
      audio.unlock();
      if (owned || (s.need === 'gems' && skinAvailable(s))) {
        if (!owned) save.owned.push(s.id);
        save.skin = s.id;
        audio.sfx(owned ? 'ui' : 'buy');
      } else if (save.wallet >= s.cost) {
        save.wallet -= s.cost;
        save.owned.push(s.id);
        save.skin = s.id;
        audio.sfx('buy');
        toast(`${s.name} é sua!`);
      } else { audio.sfx('nope'); return; }
      writeSave(save);
      scene = makeScene(mode === 'ending');
      buildShop();
    });
    card.appendChild(b);
    box.appendChild(card);
  }
}
let shopFrom = 'title';
function toShop(from) { shopFrom = from; mode = 'shop'; buildShop(); showScreen('shop'); }

// ---------- ajustes ----------
let settingsFrom = 'title';
function syncSettings() {
  const s = save.settings;
  for (const k of ['music', 'sfx', 'vibrate', 'timer']) $(`o-${k}`).setAttribute('aria-pressed', String(!!s[k]));
  for (const b of $('o-bright').children) b.setAttribute('aria-pressed', String(Number(b.dataset.v) === s.brightness));
  for (const b of $('o-buttons').children) b.setAttribute('aria-pressed', String(b.dataset.v === s.buttons));
}
function toSettings(from) { settingsFrom = from; mode = 'settings'; syncSettings(); resetArmed = false; $('o-reset').textContent = 'Apagar progresso'; showScreen('settings'); }
function setSetting(k, v) {
  save.settings[k] = v;
  if (k === 'music') audio.setMusic(v);
  if (k === 'sfx') audio.setSfx(v);
  if (k === 'brightness') renderer.brightness = v;
  if (k === 'buttons') layout();
  writeSave(save);
  syncSettings();
}
for (const k of ['music', 'sfx', 'vibrate', 'timer']) click(`o-${k}`, () => setSetting(k, !save.settings[k]));
for (const b of $('o-bright').children) b.addEventListener('click', () => { audio.sfx('ui'); setSetting('brightness', Number(b.dataset.v)); });
for (const b of $('o-buttons').children) b.addEventListener('click', () => { audio.sfx('ui'); setSetting('buttons', b.dataset.v); });
let resetArmed = false;
click('o-reset', () => {
  if (!resetArmed) { resetArmed = true; $('o-reset').textContent = 'Toque de novo para apagar tudo'; return; }
  save = clearSave();
  audio.setMusic(true); audio.setSfx(true);
  renderer.brightness = 1;
  scene = makeScene();
  resetArmed = false;
  $('o-reset').textContent = 'Apagar progresso';
  syncSettings();
  toast('Progresso apagado');
}, 'uiBack');

// ---------- botões ----------
click('t-play', () => toMap());
click('t-shop', () => toShop('title'));
click('t-settings', () => toSettings('title'));
click('btn-full', () => {
  const d = document.documentElement;
  try {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (d.requestFullscreen) d.requestFullscreen({ navigationUI: 'hide' }).then(() => setTimeout(layout, 100)).catch(() => toast('Tela cheia indisponível aqui'));
    else toast('Tela cheia indisponível aqui');
  } catch { toast('Tela cheia indisponível aqui'); }
});
click('m-back', () => toTitle(), 'uiBack');
click('m-shop', () => toShop('map'));
click('s-back', () => (shopFrom === 'map' ? toMap() : toTitle()), 'uiBack');
click('o-back', () => (settingsFrom === 'map' ? toMap() : toTitle()), 'uiBack');
click('btn-pause', () => pause(), null);
click('p-resume', () => resume());
click('p-restart', () => startLevel(levelIndex));
click('p-map', () => toMap(), 'uiBack');
click('p-music', () => { setSetting('music', !save.settings.music); syncPauseToggles(); });
click('p-sfx', () => { setSetting('sfx', !save.settings.sfx); syncPauseToggles(); });
click('r-next', () => next());
click('r-retry', () => startLevel(levelIndex));
click('r-map', () => toMap(), 'uiBack');
click('e-map', () => { scene = makeScene(); toMap(); });

input.onPause = () => {
  audio.unlock();
  if (mode === 'play') pause();
  else if (mode === 'pause') resume();
};
input.onAnyKey = (e) => {
  audio.unlock();
  if (isTouch && !e.repeat) { isTouch = false; layout(); }
  if (e.code === 'Enter' && mode === 'title' && document.activeElement === document.body) toMap();
};
input.bindTouch($('pad'), { left: $('b-left'), right: $('b-right'), jump: $('b-jump'), dash: $('b-dash') }, () => {
  if (!isTouch) { isTouch = true; layout(); }
});
window.addEventListener('pointerdown', (e) => {
  audio.unlock();
  if (e.pointerType === 'touch' && !isTouch) { isTouch = true; layout(); }
}, true);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (mode === 'play') pause(); audio.suspend(); }
  else { audio.resume(); if (mode === 'play' || mode === 'pause') requestWake(); }
});

// ---------- tela ligada ----------
let wake = null;
async function requestWake() {
  try { if (navigator.wakeLock && !wake) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } } catch { wake = null; }
}
function releaseWake() { try { if (wake) wake.release(); } catch { /* ok */ } wake = null; }

// ---------- laço principal ----------
let last = performance.now();
let acc = 0;
let hudTick = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  const cur = game || scene;
  if (!cur) return;
  if (mode !== 'pause') {
    acc += dt;
    let n = 0;
    while (acc >= STEP && n < 5) {
      const inp = input.frame();
      cur.update(inp);
      if (scene && cur === scene) scene.demoCamX = 150 + Math.sin(scene.frame / 420) * 70;
      acc -= STEP;
      n++;
    }
    if (n >= 5) acc = 0;
  }
  renderer.draw(cur);
  if (mode === 'title') drawHero(cur.frame);
  if (game && ++hudTick % 6 === 0 && save.settings.timer) hud.timer.textContent = fmtTime(game.time);
}

function boot() {
  layout();
  scene = makeScene();
  const m = /[?&]fase=([\d-]+)/.exec(location.search);
  const idx = m ? LEVELS.findIndex((l) => l.id === m[1]) : -1;
  if (idx >= 0) startLevel(idx);
  else toTitle();
  requestAnimationFrame((t) => { last = t; frame(t); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => layout());
}

window.__faisca = { get game() { return game; }, get mode() { return mode; }, startLevel, LEVELS };

const hot = window.claude && window.claude.hot;
if (hot && hot.ready) hot.ready(boot); else boot();

if ('serviceWorker' in navigator && location.protocol === 'https:' && !window.claude) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
