// Shared app context: store, tracks and the actions that award progress.

import { createStore } from './engine/store.js';
import { awardXp, touchStreak, evaluateAchievements, achievementById, levelForXp, XP } from './engine/gamification.js';
import { lessonKey, exerciseKey, quizKey } from './engine/progress.js';
import { PASS_SCORE } from './engine/assess.js';
import { TRACKS } from './tracks/index.js';
import { toast } from './ui/components.js';

function safeStorage() {
  try {
    const s = window.localStorage;
    const probe = '__devtrilhas_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export const store = createStore(safeStorage());
export const tracks = TRACKS;
export const trackById = (id) => tracks.find((t) => t.id === id) || null;

/** Wraps a progress change: streak, XP, achievements and feedback toasts. */
function progress(mutator) {
  const before = levelForXp(store.get().xp).level;
  let gained = 0;
  let earned = [];
  store.update((s) => {
    gained = mutator(s) || 0;
    if (gained > 0) {
      touchStreak(s);
      awardXp(s, gained);
    }
    earned = evaluateAchievements(s, tracks);
  });
  const after = levelForXp(store.get().xp).level;
  if (gained > 0) toast(`+${gained} XP`, { kind: 'xp', emoji: '⚡', duration: 2200 });
  if (after > before) toast(`Você subiu para o nível ${after}!`, { kind: 'achievement', emoji: '🚀', duration: 4000 });
  for (const id of earned) {
    const a = achievementById(id);
    if (a) toast(h2(a), { kind: 'achievement', emoji: a.emoji, duration: 4500 });
  }
  return gained;
}

const h2 = (a) => `Conquista desbloqueada: ${a.title}`;

export function completeLesson(trackId, moduleId, lessonId) {
  return progress((s) => {
    const key = lessonKey(trackId, moduleId, lessonId);
    if (s.lessons[key]) return 0;
    s.lessons[key] = true;
    return XP.lesson;
  });
}

export function completeExercise(trackId, moduleId, lessonId, index, { revealed = false } = {}) {
  return progress((s) => {
    const key = exerciseKey(trackId, moduleId, lessonId, index);
    if (s.exercises[key]) return 0;
    s.exercises[key] = true;
    return revealed ? 0 : XP.exercise;
  });
}

export function recordQuiz(trackId, moduleId, score) {
  return progress((s) => {
    const key = quizKey(trackId, moduleId);
    const best = s.quizzes[key] ?? -1;
    let gained = 0;
    if (score >= PASS_SCORE && best < PASS_SCORE) gained += XP.quizPass;
    if (score === 100 && best < 100) gained += XP.quizPerfect;
    s.quizzes[key] = Math.max(best, score);
    if (!gained) touchStreak(s);
    return gained;
  });
}

export function startExamAttempt(trackId) {
  store.update((s) => { s.examAttempts[trackId] = (s.examAttempts[trackId] || 0) + 1; });
}

export function recordExam(trackId, score) {
  return progress((s) => {
    const prev = s.exams[trackId];
    let gained = 0;
    if (score >= PASS_SCORE && !(prev && prev.score >= PASS_SCORE)) gained = XP.examPass;
    if (!prev || score > prev.score) s.exams[trackId] = { score, date: new Date().toISOString(), name: s.name };
    if (!gained) touchStreak(s);
    return gained;
  });
}

export function setLastVisited(trackId, moduleId, lessonId) {
  const last = store.get().lastVisited;
  if (last && last.track === trackId && last.module === moduleId && last.lesson === lessonId) return;
  store.update((s) => { s.lastVisited = { track: trackId, module: moduleId, lesson: lessonId }; });
}

export function setName(name) {
  store.update((s) => { s.name = String(name || '').trim().slice(0, 60); });
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#f5f3ee' : '#0a0e14');
  store.update((s) => { s.settings.theme = theme; });
}
