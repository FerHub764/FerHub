import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gradeAnswer, gradeQuiz, buildExam, examBank, normalizeText, PASS_RATIO } from '../site/js/engine/assess.js';

const fillQ = { id: 'a', type: 'fill', prompt: 'p', code: '___("oi")', answer: 'print', explanation: '' };
const multiFill = { id: 'b', type: 'fill', prompt: 'p', answer: ['let', 'const'], explanation: '' };
const choiceQ = { id: 'c', type: 'choice', prompt: 'p', options: ['x', 'y'], answer: 1, explanation: '' };
const bugQ = { id: 'd', type: 'find-bug', prompt: 'p', code: 'a\nb\nc', answer: 2, explanation: '' };
const predictQ = { id: 'e', type: 'predict', prompt: 'p', code: 'print(1+1)', answer: '2', explanation: '' };

test('normaliza espacos e caixa', () => {
  assert.equal(normalizeText('  Print  '), 'print');
  assert.equal(normalizeText('a   b\n c'), 'a b c');
  assert.equal(gradeAnswer(fillQ, '  Print '), true);
  assert.equal(gradeAnswer(predictQ, ' 2\n'), true);
});

test('resposta vazia ou ausente e errada sem lancar', () => {
  assert.equal(gradeAnswer(fillQ, ''), false);
  assert.equal(gradeAnswer(fillQ, '   '), false);
  assert.equal(gradeAnswer(fillQ, undefined), false);
  assert.equal(gradeAnswer(choiceQ, null), false);
  assert.equal(gradeAnswer(bugQ, undefined), false);
});

test('aceita alternativas e tipos de questao', () => {
  assert.equal(gradeAnswer(multiFill, 'const'), true);
  assert.equal(gradeAnswer(multiFill, 'var'), false);
  assert.equal(gradeAnswer(choiceQ, 1), true);
  assert.equal(gradeAnswer(choiceQ, '1'), true);
  assert.equal(gradeAnswer(choiceQ, 0), false);
  assert.equal(gradeAnswer(bugQ, 2), true);
  assert.equal(gradeAnswer(bugQ, 3), false);
});

test('70% passa e 69% nao passa', () => {
  assert.equal(PASS_RATIO, 0.7);
  const qs = Array.from({ length: 10 }, (_, i) => ({ ...choiceQ, id: 'q' + i }));
  const answers = {};
  qs.forEach((q, i) => { answers[q.id] = i < 7 ? 1 : 0; });
  assert.deepEqual(gradeQuiz(qs, answers), { score: 70, correct: 7, total: 10, passed: true });
  const qs100 = Array.from({ length: 100 }, (_, i) => ({ ...choiceQ, id: 'q' + i }));
  const a100 = {};
  qs100.forEach((q, i) => { a100[q.id] = i < 69 ? 1 : 0; });
  const r = gradeQuiz(qs100, a100);
  assert.equal(r.score, 69);
  assert.equal(r.passed, false);
});

test('quiz vazio nao passa', () => {
  assert.deepEqual(gradeQuiz([], {}), { score: 0, correct: 0, total: 0, passed: false });
});

const track = {
  id: 't',
  examConfig: { questions: 5, minutes: 10 },
  modules: [
    { id: 'm1', quiz: Array.from({ length: 4 }, (_, i) => ({ ...choiceQ, id: 'm1-q' + i })) },
    { id: 'm2', quiz: Array.from({ length: 4 }, (_, i) => ({ ...choiceQ, id: 'm2-q' + i })) },
  ],
  exam: [{ ...choiceQ, id: 'x1' }],
};

test('banco da prova junta quizzes e extras', () => {
  assert.equal(examBank(track).length, 9);
});

test('buildExam e deterministico por seed e nunca repete', () => {
  const a = buildExam(track, 42).map((q) => q.id);
  const b = buildExam(track, 42).map((q) => q.id);
  const c = buildExam(track, 7).map((q) => q.id);
  assert.equal(a.length, 5);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
  assert.equal(new Set(a).size, a.length);
});

test('buildExam limita ao tamanho do banco', () => {
  const small = { ...track, examConfig: { questions: 50, minutes: 5 } };
  assert.equal(buildExam(small, 1).length, 9);
});
