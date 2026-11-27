// Progresso salvo no navegador. Toda leitura/escrita é protegida: em janela
// anônima ou com armazenamento bloqueado o jogo segue funcionando, só não salva.
const KEY = 'faisca.save.v1';

export function defaultSave() {
  return {
    levels: {},          // id -> { done, gems:[b,b,b], bestTime, bestCoins, bestCombo }
    wallet: 0,
    owned: ['classica'],
    skin: 'classica',
    settings: { music: true, sfx: true, vibrate: true, brightness: 1, timer: true, buttons: 'm' },
    stats: { deaths: 0, kills: 0, playFrames: 0 },
    ending: false,
  };
}

export function loadSave() {
  const base = defaultSave();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const s = JSON.parse(raw);
    return { ...base, ...s, settings: { ...base.settings, ...(s.settings || {}) }, stats: { ...base.stats, ...(s.stats || {}) } };
  } catch {
    return base;
  }
}

export function writeSave(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch { return false; }
}

export function clearSave() {
  try { localStorage.removeItem(KEY); } catch { /* sem armazenamento */ }
  return defaultSave();
}

export function levelRec(save, id) {
  return save.levels[id] || { done: false, gems: [false, false, false], bestTime: 0, bestCoins: 0, bestCombo: 0 };
}

export function totalGems(save) {
  let n = 0;
  for (const id in save.levels) n += (save.levels[id].gems || []).filter(Boolean).length;
  return n;
}

// Registra o fim de uma fase e devolve o que mudou (para a tela de resultado).
export function recordCompletion(save, st) {
  const rec = levelRec(save, st.id);
  const newGems = st.gems.map((g, i) => g && !rec.gems[i]);
  const result = {
    newRecord: !rec.bestTime || st.time < rec.bestTime,
    firstClear: !rec.done,
    newGems,
  };
  rec.done = true;
  rec.gems = rec.gems.map((g, i) => g || st.gems[i]);
  rec.bestTime = rec.bestTime ? Math.min(rec.bestTime, st.time) : st.time;
  rec.bestCoins = Math.max(rec.bestCoins || 0, st.coins);
  rec.bestCombo = Math.max(rec.bestCombo || 0, st.bestCombo);
  save.levels[st.id] = rec;
  save.wallet += st.brasas;
  save.stats.deaths += st.deaths;
  save.stats.kills += st.kills;
  save.stats.playFrames += st.time;
  writeSave(save);
  return result;
}

export function fmtTime(frames) {
  const s = frames / 60;
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${String(m).padStart(2, '0')}:${r.toFixed(2).padStart(5, '0')}`;
}
