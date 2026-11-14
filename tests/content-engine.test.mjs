import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown, inline } from '../site/js/engine/markdown.js';
import { highlight } from '../site/js/engine/highlight.js';
import { md, dedent, defineTrack, choice, lesson, mod } from '../site/js/tracks/_dsl.js';

test('md mantem barras literais, remove indentacao e desfaz escapes', () => {
  const s = md`
    print("a\nb")
    use \`code\` and \${x}
  `;
  assert.equal(s, 'print("a\\nb")\nuse `code` and ${x}');
  assert.equal(dedent('\n  a\n    b\n'), 'a\n  b');
});

test('markdown: titulos, listas, codigo, callout e tabela', () => {
  const html = renderMarkdown('## Titulo\n\nTexto com `x < 1` e **forte**.\n\n- um\n- dois\n\n~~~python\nprint(1)\n~~~\n\n> 💡 Dica boa\n\n| a | b |\n|---|---|\n| 1 | 2 |');
  assert.match(html, /<h3>Titulo<\/h3>/);
  assert.match(html, /<code>x &lt; 1<\/code>/);
  assert.match(html, /<strong>forte<\/strong>/);
  assert.match(html, /<ul><li>um<\/li><li>dois<\/li><\/ul>/);
  assert.match(html, /<pre class="code" data-lang="python">/);
  assert.match(html, /callout tip/);
  assert.match(html, /<td>2<\/td>/);
});

test('markdown escapa html do conteudo', () => {
  assert.doesNotMatch(inline('<script>alert(1)</script>'), /<script>/);
  assert.doesNotMatch(inline('[x](javascript:alert(1))'), /href/);
});

test('highlight marca palavras-chave, strings e comentarios', () => {
  const out = highlight('def f(x):\n    return "oi" # c', 'python');
  assert.match(out, /<span class="tok-k">def<\/span>/);
  assert.match(out, /<span class="tok-s">"oi"<\/span>/);
  assert.match(out, /<span class="tok-c"># c<\/span>/);
  assert.match(highlight('<p class="a">x</p>', 'html'), /tok-tag/);
  assert.doesNotMatch(highlight('<b>', 'text'), /<b>/);
});

test('defineTrack gera ids e examConfig padrao', () => {
  const t = defineTrack({ id: 'x', name: 'X', level: 'extra' }, [
    mod('base', 'Base', 'r', [lesson('A', 'c'), lesson('B', 'c')], [choice('p', ['a', 'b'], 0)]),
  ]);
  assert.deepEqual(t.modules[0].lessons.map((l) => l.id), ['l1', 'l2']);
  assert.equal(t.modules[0].quiz[0].id, 'base-q1');
  assert.deepEqual(t.examConfig, { questions: 15, minutes: 25 });
});
