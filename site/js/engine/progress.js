// Progression rules: unlocking, completion percentages, "what's next".

import { PASS_SCORE } from './assess.js';

export const lessonKey = (t, m, l) => `${t}/${m}/${l}`;
export const exerciseKey = (t, m, l, i) => `${t}/${m}/${l}/${i}`;
export const quizKey = (t, m) => `${t}/${m}`;

export const quizPassed = (state, trackId, moduleId) => (state.quizzes[quizKey(trackId, moduleId)] ?? -1) >= PASS_SCORE;

export function isModuleUnlocked(state, track, index) {
  if (index <= 0) return true;
  const prev = track.modules[index - 1];
  return !!prev && quizPassed(state, track.id, prev.id);
}

export function isExamUnlocked(state, track) {
  return track.modules.length > 0 && track.modules.every((m) => quizPassed(state, track.id, m.id));
}

export function isModuleDone(state, track, module) {
  return quizPassed(state, track.id, module.id) && module.lessons.every((l) => state.lessons[lessonKey(track.id, module.id, l.id)]);
}

export function trackProgress(state, track) {
  let lessonsDone = 0;
  let lessonsTotal = 0;
  let quizzesPassed = 0;
  for (const m of track.modules) {
    for (const l of m.lessons) {
      lessonsTotal++;
      if (state.lessons[lessonKey(track.id, m.id, l.id)]) lessonsDone++;
    }
    if (quizPassed(state, track.id, m.id)) quizzesPassed++;
  }
  const units = lessonsTotal + track.modules.length;
  const exam = state.exams[track.id];
  return {
    lessonsDone,
    lessonsTotal,
    quizzesPassed,
    modules: track.modules.length,
    percent: units ? Math.round(((lessonsDone + quizzesPassed) / units) * 100) : 0,
    started: lessonsDone > 0 || quizzesPassed > 0 || Object.keys(state.quizzes).some((k) => k.startsWith(track.id + '/')),
    certified: !!(exam && exam.score >= PASS_SCORE),
    exam: exam || null,
  };
}

/** First pending step: a lesson, a module quiz, or the final exam. */
export function nextLesson(state, track) {
  for (let i = 0; i < track.modules.length; i++) {
    const m = track.modules[i];
    if (!isModuleUnlocked(state, track, i)) break;
    const pending = m.lessons.find((l) => !state.lessons[lessonKey(track.id, m.id, l.id)]);
    if (pending) return { module: m.id, lesson: pending.id };
    if (!quizPassed(state, track.id, m.id)) return { module: m.id, quiz: true };
  }
  if (isExamUnlocked(state, track)) return { exam: true };
  return null;
}

export function findLesson(track, moduleId, lessonId) {
  const moduleIndex = track.modules.findIndex((m) => m.id === moduleId);
  if (moduleIndex < 0) return null;
  const module = track.modules[moduleIndex];
  const lessonIndex = module.lessons.findIndex((l) => l.id === lessonId);
  if (lessonIndex < 0) return null;
  return {
    module,
    moduleIndex,
    lesson: module.lessons[lessonIndex],
    lessonIndex,
    prev: module.lessons[lessonIndex - 1] || null,
    next: module.lessons[lessonIndex + 1] || null,
  };
}
