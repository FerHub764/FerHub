// Module quiz and final exam share the same runner.

import { h, icon, ring, pageTitle } from './components.js';
import { store, trackById, recordQuiz, recordExam, startExamAttempt, setName } from '../app.js';
import { gradeQuiz, gradeAnswer, buildExam, PASS_SCORE } from '../engine/assess.js';
import { isModuleUnlocked, isExamUnlocked } from '../engine/progress.js';
import { renderMarkdown } from '../engine/markdown.js';
import { answerInput, typeLabel } from './question.js';
import { lockedView } from './lesson.js';
import { navigate } from '../router.js';

let activeTimer = null;
function clearTimer() {
  if (activeTimer) clearInterval(activeTimer);
  activeTimer = null;
}
window.addEventListener('hashchange', clearTimer);

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * opts: { track, title, questions, lang, minutes?, onFinish(result) -> resultExtras, backHref, retryHref }
 */
function runner(opts) {
  const { questions, lang } = opts;
  const answers = {};
  let index = 0;
  let finished = false;
  const root = h('div', { class: 'quiz' });
  const timerEl = h('span', { class: 'quiz-timer mono', role: 'timer' });
  let deadline = null;

  if (opts.minutes) {
    deadline = Date.now() + opts.minutes * 60 * 1000;
    clearTimer();
    const tick = () => {
      const left = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      timerEl.replaceChildren(icon('clock'), ' ' + formatTime(left));
      timerEl.classList.toggle('low', left <= 60);
      if (left <= 0 && !finished) finish(true);
    };
    tick();
    activeTimer = setInterval(tick, 1000);
  }

  function answeredCount() {
    return questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== '').length;
  }

  function paint() {
    const q = questions[index];
    const dots = h('div', { class: 'quiz-dots', role: 'tablist', 'aria-label': 'Questões' },
      ...questions.map((qq, i) => h('button', {
        type: 'button',
        class: 'quiz-dot' + (i === index ? ' current' : '') + (answers[qq.id] !== undefined && answers[qq.id] !== '' ? ' answered' : ''),
        'aria-label': `Questão ${i + 1}`,
        onclick: () => { index = i; paint(); },
      })));
    const isLast = index === questions.length - 1;
    root.replaceChildren(
      h('div', { class: 'quiz-top' },
        h('div', null, h('p', { class: 'eyebrow' }, opts.kicker), h('h1', null, opts.title)),
        opts.minutes ? timerEl : null),
      h('div', { class: 'quiz-progress' },
        h('span', { class: 'mono' }, `Questão ${index + 1} de ${questions.length}`),
        h('span', { class: 'mono faint' }, `${answeredCount()} respondida(s)`)),
      dots,
      h('section', { class: 'quiz-card card' },
        h('span', { class: 'pill pill-blue' }, typeLabel(q.type)),
        h('div', { class: 'prose quiz-prompt', html: renderMarkdown(q.prompt) }),
        answerInput(q, {
          lang,
          value: answers[q.id],
          onChange: (v) => {
            answers[q.id] = v;
            if (q.type === 'choice' || q.type === 'find-bug') paint();
            else root.querySelector('.quiz-progress .faint').textContent = `${answeredCount()} respondida(s)`;
          },
        })),
      h('div', { class: 'quiz-nav' },
        h('button', { type: 'button', class: 'btn btn-ghost', disabled: index === 0, onclick: () => { index--; paint(); } }, icon('arrowLeft'), 'Anterior'),
        isLast
          ? h('button', { type: 'button', class: 'btn btn-primary', onclick: () => confirmFinish() }, icon('check'), 'Entregar')
          : h('button', { type: 'button', class: 'btn btn-primary', onclick: () => { index++; paint(); } }, 'Próxima', icon('arrowRight'))));
    const field = root.querySelector('.quiz-card input');
    if (field) field.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !isLast) { index++; paint(); } });
  }

  function confirmFinish() {
    const missing = questions.length - answeredCount();
    if (missing > 0 && !confirm(`Você deixou ${missing} questão(ões) sem resposta. Entregar mesmo assim?`)) return;
    finish(false);
  }

  function finish(timeUp) {
    if (finished) return;
    finished = true;
    clearTimer();
    const result = gradeQuiz(questions, answers);
    const extra = opts.onFinish(result) || {};
    const review = h('ol', { class: 'review-list' }, ...questions.map((q, i) => {
      const ok = gradeAnswer(q, answers[q.id]);
      return h('li', { class: 'review-item ' + (ok ? 'ok' : 'bad') },
        h('details', { open: !ok },
          h('summary', null,
            h('span', { class: 'review-mark' }, icon(ok ? 'check' : 'x')),
            h('span', null, `Questão ${i + 1}`),
            h('span', { class: 'faint small' }, typeLabel(q.type))),
          h('div', { class: 'review-body' },
            h('div', { class: 'prose', html: renderMarkdown(q.prompt) }),
            answerInput(q, { lang, value: answers[q.id], reveal: true }),
            q.explanation ? h('div', { class: 'feedback info' }, icon('bulb'), h('div', { html: renderMarkdown(q.explanation) })) : null)));
    }));
    root.replaceChildren(
      h('section', { class: 'result card ' + (result.passed ? 'passed' : 'failed') },
        ring(result.score, result.score + '%', `${result.correct}/${result.total} certas`, { size: 150, color: result.passed ? 'var(--success)' : 'var(--danger)' }),
        h('div', { class: 'result-copy' },
          timeUp ? h('p', { class: 'pill pill-danger' }, icon('clock'), 'Tempo esgotado') : null,
          h('h1', null, result.passed ? opts.passTitle : 'Quase lá!'),
          h('p', { class: 'hero-lead' }, result.passed ? opts.passText : `Você precisa de ${PASS_SCORE}% para passar. Revise as questões abaixo e tente de novo — não há limite de tentativas.`),
          h('div', { class: 'btn-row' },
            result.passed && extra.primary ? h('a', { class: 'btn btn-primary btn-lg', href: extra.primary.href }, extra.primary.label, icon('arrowRight')) : null,
            h('button', { type: 'button', class: 'btn ' + (result.passed ? '' : 'btn-primary'), onclick: () => navigate(opts.retryHref) }, icon('reset'), 'Tentar de novo'),
            h('a', { class: 'btn btn-ghost', href: opts.backHref }, 'Voltar para a trilha')))),
      h('h2', { class: 'review-title' }, 'Revisão'),
      review);
    window.scrollTo({ top: 0 });
  }

  paint();
  return root;
}

export function renderQuiz({ id, module: moduleId }) {
  const track = trackById(id);
  if (!track) return null;
  const moduleIndex = track.modules.findIndex((m) => m.id === moduleId);
  if (moduleIndex < 0) return null;
  const module = track.modules[moduleIndex];
  const state = store.get();
  if (!isModuleUnlocked(state, track, moduleIndex)) return lockedView(track, 'Passe no quiz do módulo anterior para liberar este quiz.');
  pageTitle(`Quiz: ${module.title}`);
  const nextModule = track.modules[moduleIndex + 1];
  const lang = track.lang || track.runtime || track.id;

  return h('div', { class: 'quiz-page', style: { '--track': track.color } },
    h('nav', { class: 'crumbs', 'aria-label': 'Navegação' },
      h('a', { href: '#/' }, 'Trilhas'), h('span', null, '/'),
      h('a', { href: `#/trilha/${track.id}` }, track.name), h('span', null, '/'),
      h('span', null, `Quiz do módulo ${moduleIndex + 1}`)),
    runner({
      track,
      lang,
      kicker: `${track.name} · Módulo ${moduleIndex + 1}`,
      title: `Quiz: ${module.title}`,
      questions: module.quiz,
      backHref: `#/trilha/${track.id}`,
      retryHref: `#/trilha/${track.id}/${module.id}/quiz`,
      passTitle: 'Módulo concluído! 🎉',
      passText: nextModule ? `Você desbloqueou o módulo ${moduleIndex + 2}: ${nextModule.title}.` : 'Você passou em todos os módulos. A prova final está liberada!',
      onFinish: (result) => {
        recordQuiz(track.id, module.id, result.score);
        if (!result.passed) return {};
        return nextModule
          ? { primary: { href: `#/trilha/${track.id}/${nextModule.id}/${nextModule.lessons[0].id}`, label: 'Começar próximo módulo' } }
          : { primary: { href: `#/trilha/${track.id}/prova`, label: 'Ir para a prova final' } };
      },
    }));
}

export function renderExam({ id }) {
  const track = trackById(id);
  if (!track) return null;
  const state = store.get();
  if (!isExamUnlocked(state, track)) return lockedView(track, 'Passe em todos os quizzes de módulo para liberar a prova final.');
  pageTitle(`Prova final: ${track.name}`);
  const wrap = h('div', { class: 'quiz-page', style: { '--track': track.color } });
  const lang = track.lang || track.runtime || track.id;
  const nameInput = h('input', { class: 'input', id: 'exam-name', value: state.name || '', maxlength: 60, placeholder: 'Seu nome completo', autocomplete: 'name' });
  const error = h('p', { class: 'field-error', role: 'alert' });
  const best = state.exams[track.id];
  const { questions: n, minutes } = track.examConfig;

  function start() {
    const name = nameInput.value.trim();
    if (name.length < 2) {
      error.textContent = 'Digite seu nome (ele vai no certificado).';
      nameInput.focus();
      return;
    }
    setName(name);
    startExamAttempt(track.id);
    const questions = buildExam(track, (Date.now() ^ (Math.random() * 1e9)) >>> 0);
    wrap.replaceChildren(
      h('nav', { class: 'crumbs', 'aria-label': 'Navegação' }, h('a', { href: `#/trilha/${track.id}` }, track.name), h('span', null, '/'), h('span', null, 'Prova final')),
      runner({
        track,
        lang,
        kicker: `${track.name} · Prova final`,
        title: 'Prova final',
        questions,
        minutes,
        backHref: `#/trilha/${track.id}`,
        retryHref: `#/trilha/${track.id}/prova`,
        passTitle: 'Aprovado! 🎓',
        passText: `Parabéns, ${name}! Você concluiu a trilha de ${track.name}. Seu certificado está pronto.`,
        onFinish: (result) => {
          recordExam(track.id, result.score);
          return result.passed ? { primary: { href: `#/certificado/${track.id}`, label: 'Ver meu certificado' } } : {};
        },
      }));
  }

  wrap.append(
    h('nav', { class: 'crumbs', 'aria-label': 'Navegação' }, h('a', { href: '#/' }, 'Trilhas'), h('span', null, '/'), h('a', { href: `#/trilha/${track.id}` }, track.name), h('span', null, '/'), h('span', null, 'Prova final')),
    h('section', { class: 'exam-intro card' },
      h('div', { class: 'exam-intro-icon' }, icon('trophy')),
      h('p', { class: 'eyebrow' }, `${track.name} · Prova final`),
      h('h1', null, 'Pronto para o certificado?'),
      h('ul', { class: 'exam-rules' },
        h('li', null, icon('target'), `${Math.min(n, track.modules.reduce((k, m) => k + m.quiz.length, 0) + track.exam.length)} questões sorteadas de todos os módulos`),
        h('li', null, icon('clock'), `${minutes} minutos — ao acabar o tempo, a prova é entregue automaticamente`),
        h('li', null, icon('award'), `Aprovação com ${PASS_SCORE}% ou mais; você pode tentar quantas vezes quiser`),
        best ? h('li', null, icon('star'), `Sua melhor nota até agora: ${best.score}%`) : null),
      h('div', { class: 'field' },
        h('label', { for: 'exam-name' }, 'Nome para o certificado'),
        nameInput, error),
      h('div', { class: 'btn-row' },
        h('button', { type: 'button', class: 'btn btn-primary btn-lg', onclick: start }, 'Começar prova', icon('arrowRight')),
        h('a', { class: 'btn btn-ghost', href: `#/trilha/${track.id}` }, 'Voltar'))));
  nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') start(); });
  return wrap;
}

