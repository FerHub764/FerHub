import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateTrack } from '../site/js/engine/validate.js';

const q = (i) => ({ id: 'q' + i, type: 'choice', prompt: 'p', options: ['a', 'b'], answer: 0, explanation: 'e' });
function makeTrack(overrides = {}) {
  const modules = Array.from({ length: 5 }, (_, m) => ({
    id: 'm' + m,
    title: 'M',
    lessons: [{ id: 'l1', title: 'L', content: 'x', exercises: [] }],
    quiz: Array.from({ length: 5 }, (_, i) => ({ ...q(i), id: `m${m}-q${i}` })),
  }));
  return { id: 'x', name: 'X', level: 'extra', runtime: null, examConfig: { questions: 15, minutes: 20 }, modules, exam: [], ...overrides };
}

test('trilha valida nao tem erros', () => {
  assert.deepEqual(validateTrack(makeTrack()), []);
});

test('aponta ids de modulo duplicados', () => {
  const t = makeTrack();
  t.modules[1].id = 'm0';
  assert.ok(validateTrack(t).some((e) => /duplicado/.test(e)));
});

test('aponta modulo sem quiz suficiente', () => {
  const t = makeTrack();
  t.modules[0].quiz = t.modules[0].quiz.slice(0, 2);
  assert.ok(validateTrack(t).some((e) => /quiz/.test(e)));
});

test('aponta resposta fora das opcoes', () => {
  const t = makeTrack();
  t.modules[0].quiz[0].answer = 5;
  assert.ok(validateTrack(t).some((e) => /resposta/.test(e)));
});

test('aponta linha de bug fora do codigo', () => {
  const t = makeTrack();
  t.modules[0].quiz[0] = { id: 'b', type: 'find-bug', prompt: 'p', code: 'a\nb', answer: 3, explanation: '' };
  assert.ok(validateTrack(t).some((e) => /linha/.test(e)));
});

test('aponta contagem de modulos fora da faixa', () => {
  const t = makeTrack({ level: 'principal' });
  assert.ok(validateTrack(t).some((e) => /módulos/.test(e)));
  const t2 = makeTrack();
  t2.modules = t2.modules.slice(0, 3);
  assert.ok(validateTrack(t2).some((e) => /módulos/.test(e)));
});

test('aponta exercicio de codigo sem runtime ou sem saida esperada', () => {
  const t = makeTrack();
  t.modules[0].lessons[0].exercises = [{ type: 'code', prompt: 'p', starter: '', expected: 'x' }];
  assert.ok(validateTrack(t).some((e) => /runtime/.test(e)));
  const t2 = makeTrack({ runtime: 'python' });
  t2.modules[0].lessons[0].exercises = [{ type: 'code', prompt: 'p', starter: '' }];
  assert.ok(validateTrack(t2).some((e) => /esperada/.test(e)));
});

test('aponta banco de prova pequeno e tipo desconhecido', () => {
  const t = makeTrack();
  t.modules.forEach((m) => { m.quiz = m.quiz.slice(0, 3); });
  assert.ok(validateTrack(t).some((e) => /banco/.test(e)));
  const t2 = makeTrack();
  t2.modules[0].quiz[0].type = 'essay';
  assert.ok(validateTrack(t2).some((e) => /tipo/.test(e)));
});
