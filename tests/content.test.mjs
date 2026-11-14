// Validates every track file and executes code samples with real toolchains when available.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateTrack } from '../site/js/engine/validate.js';
import { checkOutput } from '../site/js/engine/runner.js';
import { normalizeText } from '../site/js/engine/assess.js';
import { runSnippet, available } from './toolchains.mjs';

const dir = path.resolve('site/js/tracks');
const files = [
  ...fs.readdirSync(dir).filter((f) => f.endsWith('.js') && !f.startsWith('_') && f !== 'index.js').map((f) => path.join(dir, f)),
  ...fs.readdirSync(dir).filter((f) => fs.existsSync(path.join(dir, f, 'index.js'))).map((f) => path.join(dir, f, 'index.js')),
];
const only = process.env.TRACK;

for (const file of files) {
  const { default: track } = await import(pathToFileURL(file));
  if (only && track.id !== only) continue;
  const lang = track.lang || track.runtime || track.id;

  test(`${track.id}: estrutura valida`, () => {
    assert.deepEqual(validateTrack(track), []);
  });

  const items = [];
  for (const m of track.modules) {
    m.lessons.forEach((l) => (l.exercises || []).forEach((ex, i) => items.push({ where: `${m.id}/${l.id}/ex${i + 1}`, q: ex })));
    m.quiz.forEach((q) => items.push({ where: q.id, q }));
  }
  track.exam.forEach((q) => items.push({ where: q.id, q }));

  const codeEx = items.filter(({ q }) => q.type === 'code');
  if (codeEx.length) {
    test(`${track.id}: solucoes dos desafios produzem a saida esperada`, { skip: !available(lang) && `${lang} indisponivel` }, () => {
      for (const { where, q } of codeEx) {
        assert.ok(q.solution, `${where}: desafio sem solucao`);
        const r = runSnippet(lang, q.solution, q.stdin, { full: true });
        assert.equal(r.error, null, `${where}: solucao com erro: ${r.error}`);
        assert.ok(checkOutput(q.expected, r.stdout), `${where}: esperado ${JSON.stringify(q.expected)} obtido ${JSON.stringify(r.stdout)}`);
        const s = runSnippet(lang, q.starter || '', q.stdin, { full: true });
        assert.ok(!(s.error === null && checkOutput(q.expected, s.stdout)), `${where}: o codigo inicial ja passa no desafio`);
      }
    });
  }

  const predicts = items.filter(({ q }) => q.type === 'predict' && /^Qual é a saída/.test(q.prompt) && !q.noVerify);
  if (predicts.length) {
    test(`${track.id}: respostas de "qual e a saida" conferem com a execucao`, { skip: !available(lang) && `${lang} indisponivel` }, () => {
      for (const { where, q } of predicts) {
        const r = runSnippet(lang, q.code, '', { full: false });
        assert.equal(r.error, null, `${where}: codigo com erro: ${r.error}`);
        const expected = Array.isArray(q.answer) ? q.answer[0] : q.answer;
        assert.equal(normalizeText(r.stdout), normalizeText(expected), `${where}: resposta ${JSON.stringify(expected)} mas a execucao deu ${JSON.stringify(r.stdout)}`);
      }
    });
  }
}
