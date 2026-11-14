// Question rendering for lessons (practice), quizzes/exams (test) and reviews.

import { h, icon } from './components.js';
import { gradeAnswer } from '../engine/assess.js';
import { codeBlock, inline, renderMarkdown } from '../engine/markdown.js';
import { highlight } from '../engine/highlight.js';
import { createEditor } from './editor.js';
import { runCode, checkOutput, renderPreview, checkWeb, pythonStatus } from '../engine/runner.js';

const KEYS = 'ABCDEFGH';
const TYPE_LABEL = {
  choice: 'Múltipla escolha',
  predict: 'Qual é a saída?',
  fill: 'Complete o código',
  'find-bug': 'Encontre o erro',
  code: 'Desafio de código',
  web: 'Desafio HTML/CSS',
};

export const typeLabel = (type) => TYPE_LABEL[type] || 'Questão';

function md(text) {
  return h('div', { class: 'prose', html: renderMarkdown(text || '') });
}

/**
 * Renders just the answer input for a question.
 * opts: { lang, value, onChange(value), locked, reveal }
 */
export function answerInput(q, { lang, value, onChange, locked = false, reveal = false } = {}) {
  const wrap = h('div', { class: 'answer' });

  if (q.code && q.type !== 'find-bug') wrap.appendChild(h('div', { html: codeBlock(q.code, lang) }));

  if (q.type === 'choice') {
    const list = h('div', { class: 'options', role: 'group', 'aria-label': 'Opções' });
    q.options.forEach((opt, i) => {
      const selected = value === i;
      const cls = ['option'];
      if (reveal && i === q.answer) cls.push('correct');
      else if (reveal && selected && i !== q.answer) cls.push('wrong');
      const btn = h('button', {
        type: 'button',
        class: cls.join(' '),
        'aria-pressed': selected ? 'true' : 'false',
        disabled: locked || reveal,
        onclick: () => onChange && onChange(i),
      }, h('span', { class: 'option-key' }, KEYS[i]), h('span', { html: inline(opt) }));
      list.appendChild(btn);
    });
    wrap.appendChild(list);
  } else if (q.type === 'find-bug') {
    const box = h('div', { class: 'bug-lines', role: 'group', 'aria-label': 'Clique na linha com erro' });
    String(q.code).split('\n').forEach((line, i) => {
      const n = i + 1;
      const cls = ['bug-line'];
      if (reveal && n === q.answer) cls.push('correct');
      else if (reveal && value === n && n !== q.answer) cls.push('wrong');
      box.appendChild(h('button', {
        type: 'button',
        class: cls.join(' '),
        'aria-pressed': value === n ? 'true' : 'false',
        'aria-label': `Linha ${n}: ${line.trim() || '(vazia)'}`,
        disabled: locked || reveal,
        onclick: () => onChange && onChange(n),
      }, h('span', { class: 'ln' }, n), h('span', { html: highlight(line, lang) || ' ' })));
    });
    wrap.appendChild(h('p', { class: 'muted small' }, 'Clique na linha que contém o erro.'));
    wrap.appendChild(box);
  } else {
    const input = h('input', {
      class: 'input mono',
      type: 'text',
      value: value ?? '',
      placeholder: q.type === 'predict' ? 'Digite o que aparece na tela (várias linhas? separe com espaço)' : 'Digite o trecho que falta',
      'aria-label': 'Sua resposta',
      autocomplete: 'off',
      spellcheck: 'false',
      disabled: locked || reveal,
      oninput: (e) => onChange && onChange(e.target.value),
    });
    wrap.appendChild(h('div', { class: 'fill-row' }, input));
    if (reveal) {
      const accepted = Array.isArray(q.answer) ? q.answer : [q.answer];
      wrap.appendChild(h('p', { class: 'muted small', style: { marginTop: '8px' } }, 'Resposta esperada: ', h('code', { class: 'answer-code' }, accepted[0])));
    }
  }
  return wrap;
}

function feedback(ok, text) {
  return h('div', { class: 'feedback ' + (ok === true ? 'ok' : ok === false ? 'bad' : 'info'), role: 'status' },
    icon(ok === true ? 'check' : ok === false ? 'x' : 'bulb'),
    h('div', { html: renderMarkdown(text) }));
}

/** Practice card used inside lessons. */
export function practiceQuestion(q, { lang, done = false, number, onSolved } = {}) {
  let value = null;
  let attempts = 0;
  let solved = done;
  const card = h('section', { class: 'exercise' + (solved ? ' is-correct' : '') });
  const body = h('div');
  const fb = h('div');
  const actions = h('div', { class: 'exercise-actions' });

  function paint(reveal = false) {
    body.replaceChildren(answerInput(q, {
      lang,
      value,
      reveal,
      locked: solved && !reveal,
      onChange: (v) => {
        value = v;
        if (q.type === 'choice' || q.type === 'find-bug') paint();
      },
    }));
  }

  function check() {
    if (value === null || value === '' || value === undefined) {
      fb.replaceChildren(feedback(null, 'Escolha ou digite uma resposta primeiro.'));
      return;
    }
    attempts++;
    if (gradeAnswer(q, value)) {
      solved = true;
      card.classList.add('is-correct');
      paint(true);
      fb.replaceChildren(feedback(true, `**Correto!** ${q.explanation || ''}`));
      renderActions();
      onSolved && onSolved({ revealed: false });
    } else {
      fb.replaceChildren(feedback(false, attempts >= 2 ? 'Ainda não. Releia a explicação acima ou veja a resposta.' : 'Não é isso. Tente de novo!'));
      renderActions();
    }
  }

  function reveal() {
    solved = true;
    paint(true);
    fb.replaceChildren(feedback(null, `**Resposta:** ${q.explanation || ''}`));
    renderActions();
    onSolved && onSolved({ revealed: true });
  }

  function renderActions() {
    actions.replaceChildren();
    if (solved) return;
    actions.appendChild(h('button', { type: 'button', class: 'btn btn-primary btn-sm', onclick: check }, icon('check'), 'Verificar'));
    if (attempts >= 2) actions.appendChild(h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: reveal }, icon('eye'), 'Ver resposta'));
  }

  card.append(
    h('div', { class: 'exercise-head' },
      h('h3', null, icon(q.type === 'find-bug' ? 'bug' : 'target'), number ? `Exercício ${number}` : 'Exercício'),
      h('span', { class: 'pill pill-blue' }, typeLabel(q.type))),
    h('div', { class: 'exercise-prompt' }, md(q.prompt)),
    body, actions, fb);
  paint(solved);
  if (solved) fb.replaceChildren(feedback(true, `**Concluído.** ${q.explanation || ''}`));
  renderActions();
  return card;
}

/** Runnable code exercise (Python / JavaScript). */
export function codeExercise(ex, { runtime, lang, done = false, number, onSolved } = {}) {
  let solved = done;
  let running = false;
  const card = h('section', { class: 'exercise' + (solved ? ' is-correct' : '') });
  const out = h('pre', { 'aria-live': 'polite' });
  const status = h('span');
  const fb = h('div');
  const editor = createEditor({
    value: ex.starter || '',
    lang,
    filename: runtime === 'python' ? 'main.py' : 'main.js',
    label: 'Seu código',
    onRun: () => run(true),
  });
  const runBtn = h('button', { type: 'button', class: 'btn btn-primary btn-sm', onclick: () => run(true) }, icon('play'), 'Executar e verificar');
  const actions = h('div', { class: 'exercise-actions' }, runBtn);
  let showedHint = false;

  if (ex.hint) {
    const hintBtn = h('button', {
      type: 'button',
      class: 'btn btn-ghost btn-sm',
      onclick: () => {
        if (showedHint) return;
        showedHint = true;
        fb.replaceChildren(feedback(null, `**Dica:** ${ex.hint}`));
      },
    }, icon('bulb'), 'Dica');
    actions.appendChild(hintBtn);
  }
  if (ex.solution) {
    actions.appendChild(h('button', {
      type: 'button',
      class: 'btn btn-ghost btn-sm',
      onclick: () => {
        if (!confirm('Ver a solução? Você não ganhará XP por este exercício.')) return;
        editor.setValue(ex.solution);
        if (!solved) {
          solved = true;
          card.classList.add('is-correct');
          onSolved && onSolved({ revealed: true });
        }
      },
    }, icon('eye'), 'Ver solução'));
  }
  actions.appendChild(h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: () => editor.setValue(ex.starter || '') }, icon('reset'), 'Restaurar'));

  async function run(verify) {
    if (running) return;
    running = true;
    runBtn.disabled = true;
    out.className = '';
    if (runtime === 'python' && pythonStatus() !== 'ready') {
      out.textContent = 'Preparando o Python no navegador (só na primeira vez, pode levar alguns segundos)…';
    } else out.textContent = 'Executando…';
    status.textContent = '';
    const result = await runCode(runtime, editor.getValue(), { stdin: ex.stdin || '' });
    running = false;
    runBtn.disabled = false;
    out.replaceChildren();
    if (result.stdout) out.appendChild(document.createTextNode(result.stdout));
    if (result.error) out.appendChild(h('span', { class: 'err' }, (result.stdout ? '\n' : '') + result.error));
    if (!result.stdout && !result.error) out.appendChild(h('span', { class: 'faint' }, '(nenhuma saída)'));
    if (!verify) return;
    const ok = !result.error && checkOutput(ex.expected, result.stdout);
    if (ok) {
      status.replaceChildren(h('span', { class: 'ok' }, '✔ saída correta'));
      fb.replaceChildren(feedback(true, '**Perfeito!** A saída bate com o esperado.'));
      if (!solved) {
        solved = true;
        card.classList.add('is-correct');
        onSolved && onSolved({ revealed: false });
      }
    } else {
      status.replaceChildren(h('span', { class: 'err' }, '✘ ainda não'));
      fb.replaceChildren(feedback(false, result.error
        ? 'Seu código gerou um erro. Leia a mensagem no console: ela indica a linha e o tipo do problema.'
        : 'A saída ainda não é a esperada. Compare com cuidado (maiúsculas, espaços e pontuação contam).'),
      h('details', { class: 'expected' }, h('summary', null, 'Ver saída esperada'), h('pre', { class: 'code' }, ex.expected)));
    }
  }

  card.append(...[
    h('div', { class: 'exercise-head' },
      h('h3', null, icon('terminal'), number ? `Desafio ${number}` : 'Desafio'),
      h('span', { class: 'pill pill-accent' }, solved ? 'Concluído' : 'Prática')),
    h('div', { class: 'exercise-prompt' }, md(ex.prompt)),
    ex.stdin ? h('p', { class: 'muted small' }, 'Entrada simulada (o que o usuário "digita"): ', h('code', null, ex.stdin.replace(/\n/g, ' ⏎ '))) : null,
    editor.el,
    actions,
    h('div', { class: 'console' }, h('div', { class: 'console-head' }, h('span', null, 'Console'), status), out),
    fb].filter(Boolean));
  if (solved) fb.replaceChildren(feedback(true, '**Desafio concluído.** Você pode continuar experimentando.'));
  return card;
}

/** HTML/CSS exercise with live preview. */
export function webExercise(ex, { done = false, number, onSolved } = {}) {
  let solved = done;
  const card = h('section', { class: 'exercise' + (solved ? ' is-correct' : '') });
  const frame = h('iframe', { class: 'preview-frame', sandbox: 'allow-same-origin', title: 'Pré-visualização' });
  const fb = h('div');
  let timer = null;
  const refresh = () => {
    clearTimeout(timer);
    timer = setTimeout(() => { frame.srcdoc = renderPreview(htmlEd.getValue(), cssEd.getValue()); }, 250);
  };
  const htmlEd = createEditor({ value: ex.html, lang: 'html', filename: 'index.html', label: 'Código HTML', onChange: refresh });
  const cssEd = createEditor({ value: ex.css, lang: 'css', filename: 'style.css', label: 'Código CSS', onChange: refresh });

  function verify() {
    frame.srcdoc = renderPreview(htmlEd.getValue(), cssEd.getValue());
    frame.onload = () => {
      frame.onload = null;
      const result = checkWeb(frame.contentDocument, ex.checks);
      if (result.passed) {
        fb.replaceChildren(feedback(true, '**Muito bem!** Tudo certo com o seu HTML/CSS.'));
        if (!solved) {
          solved = true;
          card.classList.add('is-correct');
          onSolved && onSolved({ revealed: false });
        }
      } else {
        fb.replaceChildren(feedback(false, 'Quase lá:\n\n' + result.failures.map((f) => '- ' + f).join('\n')));
      }
    };
  }

  const actions = h('div', { class: 'exercise-actions' },
    h('button', { type: 'button', class: 'btn btn-primary btn-sm', onclick: verify }, icon('check'), 'Verificar'),
    ex.hint ? h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: () => fb.replaceChildren(feedback(null, `**Dica:** ${ex.hint}`)) }, icon('bulb'), 'Dica') : null,
    ex.solution ? h('button', {
      type: 'button',
      class: 'btn btn-ghost btn-sm',
      onclick: () => {
        if (!confirm('Ver a solução? Você não ganhará XP por este exercício.')) return;
        htmlEd.setValue(ex.solution.html ?? htmlEd.getValue());
        cssEd.setValue(ex.solution.css ?? cssEd.getValue());
        if (!solved) { solved = true; card.classList.add('is-correct'); onSolved && onSolved({ revealed: true }); }
      },
    }, icon('eye'), 'Ver solução') : null,
    h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: () => { htmlEd.setValue(ex.html); cssEd.setValue(ex.css); } }, icon('reset'), 'Restaurar'));

  card.append(
    h('div', { class: 'exercise-head' },
      h('h3', null, icon('code'), number ? `Desafio ${number}` : 'Desafio'),
      h('span', { class: 'pill pill-accent' }, solved ? 'Concluído' : 'Prática')),
    h('div', { class: 'exercise-prompt' }, md(ex.prompt)),
    h('div', { class: 'web-editors' }, htmlEd.el, cssEd.el),
    h('p', { class: 'eyebrow', style: { marginTop: '16px' } }, 'Pré-visualização ao vivo'),
    frame, actions, fb);
  frame.srcdoc = renderPreview(ex.html, ex.css);
  if (solved) fb.replaceChildren(feedback(true, '**Desafio concluído.**'));
  return card;
}
