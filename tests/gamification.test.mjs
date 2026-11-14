import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultState } from '../site/js/engine/store.js';
import {
  levelForXp, awardXp, touchStreak, evaluateAchievements, ACHIEVEMENTS, XP, previousDay,
} from '../site/js/engine/gamification.js';

const tracks = [
  { id: 'python', modules: [{ id: 'm1', lessons: [{ id: 'l1' }, { id: 'l2' }] }] },
  { id: 'go', modules: [{ id: 'm1', lessons: [{ id: 'l1' }] }] },
];

test('niveis por faixas 100*(n-1)^2', () => {
  assert.deepEqual(levelForXp(0), { level: 1, current: 0, next: 100, total: 0 });
  assert.equal(levelForXp(99).level, 1);
  assert.equal(levelForXp(100).level, 2);
  assert.equal(levelForXp(399).level, 2);
  assert.equal(levelForXp(400).level, 3);
  assert.deepEqual(levelForXp(450), { level: 3, current: 50, next: 500, total: 450 });
});

test('awardXp soma e ignora valores invalidos', () => {
  const s = defaultState();
  awardXp(s, 10);
  awardXp(s, -5);
  awardXp(s, NaN);
  assert.equal(s.xp, 10);
  assert.ok(XP.lesson > 0 && XP.quizPass > XP.lesson && XP.examPass > XP.quizPass);
});

test('streak: consecutivo incrementa, mesmo dia mantem, pular zera', () => {
  const s = defaultState();
  touchStreak(s, '2026-11-10');
  assert.equal(s.streak.count, 1);
  touchStreak(s, '2026-11-10');
  assert.equal(s.streak.count, 1);
  touchStreak(s, '2026-11-11');
  assert.equal(s.streak.count, 2);
  touchStreak(s, '2026-11-13');
  assert.equal(s.streak.count, 1);
  assert.equal(s.streak.best, 2);
  assert.deepEqual(s.activeDays, ['2026-11-10', '2026-11-11', '2026-11-13']);
});

test('previousDay atravessa meses e anos', () => {
  assert.equal(previousDay('2026-03-01'), '2026-02-28');
  assert.equal(previousDay('2027-01-01'), '2026-12-31');
});

test('conquistas disparam uma unica vez', () => {
  const s = defaultState();
  assert.deepEqual(evaluateAchievements(s, tracks), []);
  s.lessons['python/m1/l1'] = true;
  assert.deepEqual(evaluateAchievements(s, tracks), ['first-lesson']);
  assert.deepEqual(evaluateAchievements(s, tracks), []);
  assert.deepEqual(s.achievements, ['first-lesson']);
});

test('conquista de prova final e de quiz perfeito', () => {
  const s = defaultState();
  s.quizzes['python/m1'] = 100;
  s.exams.python = { score: 80, date: '2026-11-10' };
  const got = evaluateAchievements(s, tracks);
  assert.ok(got.includes('first-quiz'));
  assert.ok(got.includes('perfect-quiz'));
  assert.ok(got.includes('first-cert'));
});

test('todas as conquistas tem titulo, descricao e emoji', () => {
  assert.ok(ACHIEVEMENTS.length >= 12);
  for (const a of ACHIEVEMENTS) {
    assert.ok(a.id && a.title && a.description && a.emoji, a.id);
  }
});
