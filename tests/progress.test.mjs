import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultState } from '../site/js/engine/store.js';
import { isModuleUnlocked, isExamUnlocked, trackProgress, nextLesson, lessonKey, quizKey, findLesson } from '../site/js/engine/progress.js';

const track = {
  id: 'py',
  modules: [
    { id: 'a', lessons: [{ id: 'l1' }, { id: 'l2' }], quiz: [] },
    { id: 'b', lessons: [{ id: 'l1' }], quiz: [] },
    { id: 'c', lessons: [{ id: 'l1' }], quiz: [] },
  ],
};

test('primeiro modulo sempre liberado; demais exigem 70 no quiz anterior', () => {
  const s = defaultState();
  assert.equal(isModuleUnlocked(s, track, 0), true);
  assert.equal(isModuleUnlocked(s, track, 1), false);
  s.quizzes[quizKey('py', 'a')] = 69;
  assert.equal(isModuleUnlocked(s, track, 1), false);
  s.quizzes[quizKey('py', 'a')] = 70;
  assert.equal(isModuleUnlocked(s, track, 1), true);
  assert.equal(isModuleUnlocked(s, track, 2), false);
});

test('prova liberada so com todos os quizzes aprovados', () => {
  const s = defaultState();
  s.quizzes['py/a'] = 80; s.quizzes['py/b'] = 90;
  assert.equal(isExamUnlocked(s, track), false);
  s.quizzes['py/c'] = 70;
  assert.equal(isExamUnlocked(s, track), true);
});

test('trackProgress conta licoes e quizzes', () => {
  const s = defaultState();
  s.lessons[lessonKey('py', 'a', 'l1')] = true;
  s.quizzes['py/a'] = 100;
  const p = trackProgress(s, track);
  assert.equal(p.lessonsDone, 1);
  assert.equal(p.lessonsTotal, 4);
  assert.equal(p.quizzesPassed, 1);
  assert.equal(p.percent, Math.round((2 / 7) * 100));
  assert.equal(p.started, true);
  assert.equal(p.certified, false);
  assert.equal(trackProgress(defaultState(), track).started, false);
});

test('nextLesson aponta a primeira licao pendente em modulo liberado', () => {
  const s = defaultState();
  assert.deepEqual(nextLesson(s, track), { module: 'a', lesson: 'l1' });
  s.lessons['py/a/l1'] = true;
  s.lessons['py/a/l2'] = true;
  assert.deepEqual(nextLesson(s, track), { module: 'a', quiz: true });
  s.quizzes['py/a'] = 90;
  assert.deepEqual(nextLesson(s, track), { module: 'b', lesson: 'l1' });
});

test('findLesson devolve indices e vizinhos', () => {
  const r = findLesson(track, 'a', 'l2');
  assert.equal(r.moduleIndex, 0);
  assert.equal(r.lessonIndex, 1);
  assert.equal(r.prev.id, 'l1');
  assert.equal(r.next, null);
  assert.equal(findLesson(track, 'zz', 'l1'), null);
});
