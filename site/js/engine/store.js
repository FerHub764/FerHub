// Progress persistence. Everything lives under one localStorage key.

export const STORAGE_KEY = 'devtrilhas:v1';

export function defaultState() {
  return {
    version: 1,
    name: '',
    xp: 0,
    streak: { count: 0, best: 0, lastDay: null },
    activeDays: [],
    lessons: {},     // "track/module/lesson" -> true
    exercises: {},   // "track/module/lesson/exerciseIndex" -> true
    quizzes: {},     // "track/module" -> best score (0-100)
    exams: {},       // "track" -> { score, date, name }
    examAttempts: {}, // "track" -> number of attempts
    achievements: [],
    lastVisited: null, // { track, module, lesson }
    settings: { theme: 'dark' },
  };
}

const OBJECT_FIELDS = ['lessons', 'exercises', 'quizzes', 'exams', 'examAttempts'];

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function normalize(raw) {
  const base = defaultState();
  if (!isPlainObject(raw)) return base;
  const s = { ...base, ...raw };
  s.name = typeof s.name === 'string' ? s.name.slice(0, 80) : '';
  s.xp = Number.isFinite(s.xp) && s.xp >= 0 ? Math.floor(s.xp) : 0;
  s.streak = { ...base.streak, ...(isPlainObject(raw.streak) ? raw.streak : {}) };
  s.activeDays = Array.isArray(raw.activeDays) ? raw.activeDays.filter((d) => typeof d === 'string').slice(-400) : [];
  for (const f of OBJECT_FIELDS) s[f] = isPlainObject(raw[f]) ? raw[f] : {};
  s.achievements = Array.isArray(raw.achievements) ? raw.achievements.filter((a) => typeof a === 'string') : [];
  s.settings = { ...base.settings, ...(isPlainObject(raw.settings) ? raw.settings : {}) };
  if (s.settings.theme !== 'light') s.settings.theme = 'dark';
  return s;
}

function validateImport(raw) {
  if (!isPlainObject(raw)) return false;
  if ('xp' in raw && !(Number.isFinite(raw.xp) && raw.xp >= 0)) return false;
  for (const f of OBJECT_FIELDS) if (f in raw && !isPlainObject(raw[f])) return false;
  if ('achievements' in raw && !Array.isArray(raw.achievements)) return false;
  return true;
}

export function createStore(storage) {
  let persistent = !!storage;
  let recovered = false;
  let state = defaultState();
  const listeners = new Set();

  if (storage) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          state = normalize(JSON.parse(raw));
        } catch {
          recovered = true;
          state = defaultState();
        }
      }
    } catch {
      persistent = false;
    }
  }

  function save() {
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
      persistent = true;
    } catch {
      persistent = false;
    }
  }

  function emit() {
    for (const fn of listeners) {
      try { fn(state); } catch (e) { console.error(e); }
    }
  }

  return {
    get: () => state,
    get persistent() { return persistent; },
    get recovered() { return recovered; },
    update(fn) {
      const draft = structuredClone(state);
      fn(draft);
      state = normalize(draft);
      save();
      emit();
      return state;
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    exportJSON() {
      return JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
    },
    importJSON(json) {
      let raw;
      try { raw = JSON.parse(json); } catch { throw new Error('Arquivo de backup inválido.'); }
      if (!validateImport(raw)) throw new Error('Arquivo de backup inválido.');
      delete raw.exportedAt;
      state = normalize(raw);
      save();
      emit();
    },
    reset() {
      const theme = state.settings.theme;
      state = defaultState();
      state.settings.theme = theme;
      save();
      emit();
    },
  };
}
