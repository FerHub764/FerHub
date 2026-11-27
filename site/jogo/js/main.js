// Faísca: liga renderizador, física, entrada, áudio, telas e progresso.
import { STEP } from './config.js';
import { Renderer } from './render.js';
import { Game } from './game.js';
import { Input } from './input.js';
import { Audio } from './audio.js';
import { WORLDS, LEVELS } from './levels/index.js';
import { TITLE_SCENE } from './levels/scenes.js';
import { loadSave, writeSave, recordCompletion, recordRun, levelRec, totalGems, fmtTime, clearSave } from './save.js';
import { SKINS, buildPlayerFrames } from './sprites.js';
import { RunGame, makeRun, ZONE_NAMES } from './endless.js';
import { ACHIEVEMENTS, checkAchievements } from './achievements.js';

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
renderer.shakeOn = save.settings.shake !== false;

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
let isRun = false;
let isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

// ---------- utilidades de interface ----------
const screens = ['splash', 'title', 'map', 'pause', 'complete', 'shop', 'settings', 'ending', 'ach'];
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

const CUP = '<svg viewBox="0 0 12 12"><path d="M2 1h8v1h1v3h-1v1H9v1H8v1H7v1h1v1h1v1H3v-1h1V9h1V8H4V7H3V6H2V5H1V2h1zm0 2v1h1V3zm7 0v1h1V3z"/></svg>';
let trophyQueue = [];
let trophyBusy = false;
function showTrophies(list) {
  trophyQueue.push(...list);
  if (trophyBusy) return;
  const nextOne = () => {
    const a = trophyQueue.shift();
    if (!a) { trophyBusy = false; return; }
    trophyBusy = true;
    const el = document.createElement('div');
    el.className = 'toast trophy';
    el.innerHTML = `${CUP}<div><small>TROFÉU</small>${a.name}</div>`;
    app.appendChild(el);
    audio.sfx('ach');
    vibrate(40);
    setTimeout(() => { el.remove(); nextOne(); }, 2400);
  };
  nextOne();
}
function achieve() {
  const list = checkAchievements(save);
  if (list.length) { writeSave(save); showTrophies(list); }
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
  let W = window.innerWidth, H = window.innerHeight;
  // "Sempre deitado": com o celular em pé, o jogo inteiro gira 90° e continua em paisagem
  const forceLand = isTouch && save.settings.landscape !== false;
  const rot = forceLand && H > W * 1.05;
  app.classList.toggle('rot', rot);
  if (rot) {
    app.style.width = `${H}px`; app.style.height = `${W}px`; app.style.left = `${W}px`;
    input.rot = { W };
    [W, H] = [H, W];
  } else {
    app.style.width = app.style.height = app.style.left = '';
    input.rot = null;
  }
  const portrait = !forceLand && H > W * 1.05;
  // classes de "tela baixa" calculadas com o tamanho já girado (media queries veem a tela física)
  app.classList.toggle('short', H < 460);
  app.classList.toggle('short-xs', H < 420);
  app.classList.toggle('lowland', W > H && H < 520);
  const handheld = portrait && isTouch;
  app.classList.toggle('portrait', handheld);
  app.classList.toggle('landscape', !handheld);
  app.classList.toggle('touch', isTouch);
  app.classList.toggle('lefty', !!save.settings.lefty);
  const size = { p: 0.82, m: 1, g: 1.2 }[save.settings.buttons] || 1;
  const base = handheld ? Math.min(76, W * 0.17) : Math.min(78, H * 0.17);
  app.style.setProperty('--btn', `${Math.round(Math.max(46, base * size))}px`);
  if (handheld) {
    const cs = getComputedStyle(app);
    const inner = H - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const padH = Math.max(230, Math.min(inner * 0.4, 330));
    app.style.setProperty('--stage-h', `${Math.round(inner - padH)}px`);
  }
  // tamanho de layout (não muda com o giro da tela)
  renderer.resize(stage.clientWidth, stage.clientHeight, Math.min(window.devicePixelRatio || 1, 3));
  const cur = game || scene;
  if (cur) cur.setView(renderer.vw, renderer.vh);
  if (scene && scene !== cur) scene.setView(renderer.vw, renderer.vh);
}
window.addEventListener('resize', layout);
document.addEventListener('fullscreenchange', () => setTimeout(layout, 100));
window.addEventListener('orientationchange', () => setTimeout(layout, 120));

// ---------- HUD ----------
const hud = { brasas: $('hud-brasas'), gems: $('hud-gems'), timer: $('timer'), combo: $('combo'), hint: $('hint'), banner: $('banner') };
const livesEl = $('hud-lives');
function updateHud() {
  if (!game) return;
  hud.brasas.textContent = game.brasas;
  hud.gems.hidden = isRun;
  livesEl.hidden = !isRun;
  if (isRun) {
    [...livesEl.children].forEach((el, i) => el.classList.toggle('off', i >= game.lives));
    hud.timer.hidden = false;
    return;
  }
  const g = hud.gems.children;
  game.gems.forEach((gm, i) => {
    if (!g[i]) return;
    g[i].className = 'gem' + (gm.got ? ' on' : gm.had ? ' had' : '');
  });
  hud.timer.hidden = !save.settings.timer;
}
let comboTimer = 0;
function showCombo(n, text) {
  if (!text && n < 2) return;
  hud.combo.innerHTML = text || `COMBO x${n}<small>+${Math.min(n, 8)} BRASAS</small>`;
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
const heroCtxs = [$('t-hero').getContext('2d'), $('sp-hero').getContext('2d')];
let heroFrames = null;
let heroSkin = '';
function drawHero(t) {
  if (heroSkin !== save.skin) { heroFrames = buildPlayerFrames(SKINS.find((s) => s.id === save.skin) || SKINS[0]); heroSkin = save.skin; }
  const fr = heroFrames.idle[((t / 10) | 0) % 4];
  for (const c of heroCtxs) { c.clearRect(0, 0, 20, 20); c.drawImage(fr.img, 0, 0); }
}

// ---------- abertura e orientação ----------
// Tela cheia e trava em paisagem onde o navegador permite (Android); no iPhone vale o giro por CSS.
async function goLandscape() {
  if (!isTouch || save.settings.landscape === false) return;
  const d = document.documentElement;
  try { if (!document.fullscreenElement && d.requestFullscreen) await d.requestFullscreen({ navigationUI: 'hide' }); } catch { /* sem tela cheia aqui */ }
  try { if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape'); } catch { /* sem trava de orientação */ }
  setTimeout(layout, 150);
}

function toSplash() {
  mode = 'splash';
  input.enabled = false;
  $('hud').hidden = true;
  if (!scene) scene = makeScene();
  renderer.prepare(scene);
  showScreen('splash');
  audio.play('title');
}
let starting = false;
async function pressStart() {
  if (mode !== 'splash' || starting) return;
  starting = true;
  audio.unlock();
  audio.sfx('ui');
  goLandscape();
  toTitle();
  starting = false;
}
$('scr-splash').addEventListener('click', pressStart);

function toTitle() {
  game = null;
  mode = 'title';
  input.enabled = false;
  $('hud').hidden = true;
  if (!scene) scene = makeScene();
  renderer.prepare(scene);
  $('t-wallet').textContent = save.wallet;
  $('t-gems').textContent = `${totalGems(save)}/${TOTAL_GEMS}`;
  const runOpen = levelRec(save, '1-1').done;
  $('t-run').classList.toggle('locked', !runOpen);
  $('t-run-best').textContent = !runOpen ? 'termine a fase 1-1' : save.run.best ? `recorde: ${save.run.best} m` : 'corra da escuridão';
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
  complete: (st) => (st.run ? onRunOver(st) : onComplete(st)),
  runover: (st) => onRunOver(st),
  pop: () => { save.stats.pops++; achieve(); },
  zone: (z, n) => { audio.sfx('zone'); showBanner(`ZONA ${n}`, ZONE_NAMES[z]); },
  milestone: (m, bonus) => { audio.sfx(bonus ? 'orb' : 'milestone'); showCombo(0, `${m} m<small>${bonus ? '+1 VIDA' : 'CONTINUE CORRENDO'}</small>`); },
};
const baseCombo = hooks.combo;
hooks.combo = (n) => {
  baseCombo(n);
  if (n > save.stats.bestCombo) { save.stats.bestCombo = n; if (n === 3 || n === 6) achieve(); }
};

function startLevel(i) {
  isRun = false;
  goLandscape();
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

function startRun() {
  if (!levelRec(save, '1-1').done) { toast('Termine a fase 1-1 para liberar o Modo Fuga'); audio.sfx('nope'); return; }
  isRun = true;
  goLandscape();
  const def = makeRun((Math.random() * 1e9) | 0);
  game = new RunGame(def, { skin: save.skin, hooks });
  if (save.run.best >= 20) { game.recordM = save.run.best; game.recordX = game.startX + save.run.best * 16; }
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
  showBanner('MODO FUGA', 'Corra da escuridão!');
  audio.play('rise');
  requestWake();
}

function onRunOver(st) {
  const res = recordRun(save, st);
  mode = 'complete';
  input.enabled = false;
  showHint(null);
  audio.sfx(st.escaped ? 'win' : 'over');
  $('r-title').textContent = st.escaped ? 'Você escapou!' : 'A escuridão te alcançou';
  $('r-sub').textContent = `Modo Fuga · corrida ${save.run.runs}`;
  setRows([
    ['Distância', `${st.distance} m${res.newRecord ? '<span class="badge night">RECORDE</span>' : ''}`],
    ['Recorde', `${save.run.best} m`],
    ['Brasas', `${st.brasas}`],
    ['Inimigos', `${st.kills}`],
    ['Maior combo', st.bestCombo >= 2 ? `x${st.bestCombo}` : '—'],
  ]);
  $('r-next').textContent = 'Correr de novo';
  $('r-retry').hidden = true;
  $('r-map').textContent = 'Menu';
  showScreen('complete');
  $('hud').hidden = true;
  releaseWake();
  achieve();
}

function setRows(rows) {
  $('r-rows').innerHTML = rows.map(([k, v]) => `<div class="statrow"><span>${k}</span><span>${v}</span></div>`).join('');
}

function pause() {
  if (mode !== 'play') return;
  mode = 'pause';
  input.enabled = false;
  input.clear();
  audio.sfx('pause');
  $('p-sub').textContent = isRun ? `Modo Fuga · ${game.distance} m` : `${game.def.id} · ${game.def.name}`;
  $('p-restart').textContent = isRun ? 'Nova corrida' : 'Reiniciar fase';
  $('p-map').textContent = isRun ? 'Desistir' : 'Voltar ao mapa';
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
  const bonus = st.brasas - st.coins;
  const rec = levelRec(save, def.id);
  setRows([
    ['Tempo', fmtTime(st.time) + (res.newRecord && !res.firstClear ? '<span class="badge">RECORDE</span>' : '')],
    ['Brasas', `${st.coins}/${st.coinsTotal}${bonus > 0 ? `  +${bonus} de combo` : ''}`],
    ['Gemas', `<span class="gems">${st.gems.map((g, i) => `<i class="gem${g ? ' on' : rec.gems[i] ? ' had' : ''}${res.newGems[i] ? ' pop' : ''}" style="animation-delay:${0.25 + i * 0.18}s"></i>`).join('')}</span>`],
    ['Maior combo', st.bestCombo >= 2 ? `x${st.bestCombo}` : '—'],
    ['Apagadas', String(st.deaths)],
  ]);
  $('r-retry').hidden = false;
  $('r-map').textContent = 'Mapa';
  const last = levelIndex === LEVELS.length - 1;
  $('r-next').textContent = last ? 'Ver o final' : 'Próxima fase';
  showScreen('complete');
  $('hud').hidden = true;
  releaseWake();
  achieve();
}

// desistir no meio da corrida ainda conta a distância e as brasas
function endRunEarly() {
  if (!game || !isRun) { toTitle(); return; }
  game.lives = 0;
  onRunOver(game.stats());
}

function next() {
  if (isRun) { startRun(); return; }
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
      achieve();
    });
    card.appendChild(b);
    box.appendChild(card);
  }
}
function buildAch() {
  const got = ACHIEVEMENTS.filter((a) => save.ach[a.id]).length;
  $('a-count').textContent = `${got}/${ACHIEVEMENTS.length}`;
  $('achs').innerHTML = ACHIEVEMENTS.map((a) => `<div class="ach${save.ach[a.id] ? ' on' : ''}"><span class="cup">${CUP}</span><div><b>${a.name}</b><span>${a.desc}</span></div></div>`).join('');
  const st = save.stats;
  const mins = Math.round(st.playFrames / 3600);
  $('a-stats').innerHTML = [
    ['Tempo jogado', mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h ${mins % 60} min`],
    ['Inimigos derrotados', st.kills],
    ['Maior combo', st.bestCombo ? `x${st.bestCombo}` : '—'],
    ['Vezes que se apagou', st.deaths],
    ['Brasas ganhas', st.earned],
    ['Recorde no Modo Fuga', `${save.run.best} m`],
  ].map(([k, v]) => `<div class="statrow"><span>${k}</span><span>${v}</span></div>`).join('');
}
function toAch() { mode = 'ach'; buildAch(); showScreen('ach'); }

let shopFrom = 'title';
function toShop(from) { shopFrom = from; mode = 'shop'; buildShop(); showScreen('shop'); }

// ---------- ajustes ----------
let settingsFrom = 'title';
function syncSettings() {
  if (typeof syncInstall === 'function') syncInstall();
  const s = save.settings;
  for (const k of ['music', 'sfx', 'vibrate', 'timer', 'lefty', 'shake', 'landscape']) $(`o-${k}`).setAttribute('aria-pressed', String(!!s[k]));
  for (const b of $('o-bright').children) b.setAttribute('aria-pressed', String(Number(b.dataset.v) === s.brightness));
  for (const b of $('o-buttons').children) b.setAttribute('aria-pressed', String(b.dataset.v === s.buttons));
}
function toSettings(from) { settingsFrom = from; mode = 'settings'; syncSettings(); resetArmed = false; $('o-reset').textContent = 'Apagar progresso'; showScreen('settings'); }
function setSetting(k, v) {
  save.settings[k] = v;
  if (k === 'music') audio.setMusic(v);
  if (k === 'sfx') audio.setSfx(v);
  if (k === 'brightness') renderer.brightness = v;
  if (k === 'shake') renderer.shakeOn = v;
  if (k === 'buttons' || k === 'lefty' || k === 'landscape') layout();
  if (k === 'landscape' && v) goLandscape();
  if (k === 'landscape' && !v) { try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch { /* ok */ } }
  writeSave(save);
  syncSettings();
}
for (const k of ['music', 'sfx', 'vibrate', 'timer', 'lefty', 'shake', 'landscape']) click(`o-${k}`, () => setSetting(k, !save.settings[k]));
for (const b of $('o-bright').children) b.addEventListener('click', () => { audio.sfx('ui'); setSetting('brightness', Number(b.dataset.v)); });
for (const b of $('o-buttons').children) b.addEventListener('click', () => { audio.sfx('ui'); setSetting('buttons', b.dataset.v); });
let resetArmed = false;
click('o-reset', () => {
  if (!resetArmed) { resetArmed = true; $('o-reset').textContent = 'Toque de novo para apagar tudo'; return; }
  save = clearSave();
  audio.setMusic(true); audio.setSfx(true);
  renderer.brightness = 1;
  renderer.shakeOn = true;
  layout();
  scene = makeScene();
  resetArmed = false;
  $('o-reset').textContent = 'Apagar progresso';
  syncSettings();
  toast('Progresso apagado');
}, 'uiBack');

// ---------- botões ----------
click('t-play', () => toMap());
click('t-run', () => startRun());
click('t-ach', () => toAch());
click('a-back', () => toTitle(), 'uiBack');
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
click('b-pill', () => pause(), null);
click('p-resume', () => resume());
click('p-restart', () => (isRun ? startRun() : startLevel(levelIndex)));
click('p-map', () => (isRun ? endRunEarly() : toMap()), 'uiBack');
click('p-music', () => { setSetting('music', !save.settings.music); syncPauseToggles(); });
click('p-sfx', () => { setSetting('sfx', !save.settings.sfx); syncPauseToggles(); });
click('r-next', () => next());
click('r-retry', () => startLevel(levelIndex));
click('r-map', () => (isRun ? toTitle() : toMap()), 'uiBack');
click('e-map', () => { scene = makeScene(); toMap(); });

// vibração curta ao apertar pulo/dash na tela (sensação de botão físico)
input.onPress = () => vibrate(6);
input.onPause = () => {
  audio.unlock();
  if (mode === 'play') pause();
  else if (mode === 'pause') resume();
};
input.onAnyKey = (e) => {
  audio.unlock();
  if (isTouch && !e.repeat) { isTouch = false; layout(); }
  if (mode === 'splash' && !e.repeat) { pressStart(); return; }
  if (e.code === 'Enter' && mode === 'title' && document.activeElement === document.body) toMap();
  if (e.code === 'Escape' && (mode === 'shop' || mode === 'settings' || mode === 'ach')) toTitle();
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
  if (mode === 'title' || mode === 'splash') drawHero(cur.frame);
  syncDashButton();
  if (game && ++hudTick % 6 === 0) {
    if (isRun) hud.timer.textContent = `${game.distance} m`;
    else if (save.settings.timer) hud.timer.textContent = fmtTime(game.time);
  }
}

// anel do botão de dash: aceso quando o dash está carregado
const dashBtn = $('b-dash');
let dashShown = true;
function syncDashButton() {
  const ready = !game || game.player.dashAvail || game.state !== 'play';
  if (ready === dashShown) return;
  dashShown = ready;
  dashBtn.classList.toggle('spent', !ready);
  if (ready) { dashBtn.classList.remove('ready'); void dashBtn.offsetWidth; dashBtn.classList.add('ready'); }
}

function boot() {
  layout();
  scene = makeScene();
  const m = /[?&]fase=([\d-]+)/.exec(location.search);
  const idx = m ? LEVELS.findIndex((l) => l.id === m[1]) : -1;
  if (idx >= 0) startLevel(idx);
  else toSplash();
  requestAnimationFrame((t) => { last = t; frame(t); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => layout());
}

window.__faisca = { get game() { return game; }, get mode() { return mode; }, startLevel, startRun, pressStart, LEVELS };

const hot = window.claude && window.claude.hot;
if (hot && hot.ready) hot.ready(boot); else boot();

// Instalação: no Android o navegador oferece o instalador; no iPhone mostramos o passo a passo.
let installEvt = null;
const installBtn = $('o-install');
const installNote = $('o-install-note');
const isStandalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; syncInstall(); });
window.addEventListener('appinstalled', () => { installEvt = null; toast('Faísca instalada!'); syncInstall(); });
function syncInstall() {
  if (isStandalone) { installBtn.textContent = 'Instalado ✓'; installBtn.disabled = true; installNote.hidden = true; return; }
  installBtn.disabled = false;
  if (installEvt) { installBtn.textContent = 'Instalar'; installNote.hidden = true; return; }
  installBtn.textContent = 'Como instalar';
  installNote.hidden = false;
  installNote.innerHTML = isIOS
    ? 'No iPhone, abra esta página no <b>Safari</b>, toque em <b>Compartilhar</b> (□↑) e depois em <b>Adicionar à Tela de Início</b>.'
    : 'No Chrome do celular, toque nos <b>⋮</b> do canto e escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.';
}
click('o-install', async () => {
  if (installEvt) {
    installEvt.prompt();
    try { await installEvt.userChoice; } catch { /* ignorado */ }
    installEvt = null;
    syncInstall();
    return;
  }
  installNote.hidden = !installNote.hidden;
}, null);

// O service worker vale em https e em localhost (teste no computador).
if ('serviceWorker' in navigator && window.isSecureContext && !window.claude) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
