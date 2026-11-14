import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkOutput, renderPreview, formatValue, cleanPythonError } from '../site/js/engine/runner.js';

test('checkOutput ignora espacos finais e linhas vazias no fim', () => {
  assert.equal(checkOutput('Olá\nMundo', 'Olá  \nMundo\n\n'), true);
  assert.equal(checkOutput('a\nb', 'a\r\nb'), true);
  assert.equal(checkOutput('Olá', 'olá'), false);
  assert.equal(checkOutput('1\n2', '1\n3'), false);
  assert.equal(checkOutput('x', undefined), false);
});

test('renderPreview monta documento com css', () => {
  const doc = renderPreview('<h1>Oi</h1>', 'h1 { color: red; }');
  assert.match(doc, /<!doctype html>/i);
  assert.match(doc, /h1 \{ color: red; \}/);
  assert.match(doc, /<h1>Oi<\/h1>/);
  const full = renderPreview('<html><head><title>t</title></head><body>x</body></html>', 'p{}');
  assert.equal((full.match(/<head/g) || []).length, 1);
  assert.match(full, /p\{\}/);
});

test('renderPreview nao deixa o css fechar a tag style', () => {
  const doc = renderPreview('<p>x</p>', '</style><script>alert(1)</script>');
  assert.doesNotMatch(doc, /<script>alert/);
});

test('formatValue imita o console', () => {
  assert.equal(formatValue('oi'), 'oi');
  assert.equal(formatValue(3.5), '3.5');
  assert.equal(formatValue([1, 'a', true]), '[1, "a", true]');
  assert.equal(formatValue({ nome: 'Ana', idade: 3 }), '{ nome: "Ana", idade: 3 }');
  assert.equal(formatValue(null), 'null');
  assert.equal(formatValue(undefined), 'undefined');
  assert.equal(formatValue([]), '[]');
  assert.equal(formatValue({}), '{}');
  const cyc = {}; cyc.self = cyc;
  assert.equal(formatValue(cyc), '{ self: [Circular] }');
});

test('cleanPythonError mostra so o essencial', () => {
  const tb = 'Traceback (most recent call last):\n  File "/lib/python312.zip/_pyodide/_base.py", line 573, in eval_code_async\n    await CodeRunner(\n  File "<exec>", line 2, in <module>\nNameError: name \'x\' is not defined';
  assert.equal(cleanPythonError(tb), 'Linha 2: NameError: name \'x\' is not defined');
});
