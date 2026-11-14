import { h, icon, langBadge, ring, pageTitle } from './components.js';
import { store, trackById } from '../app.js';
import { trackProgress, isModuleUnlocked, isExamUnlocked, lessonKey, quizKey, nextLesson, quizPassed } from '../engine/progress.js';

export function nextHref(track, state) {
  const next = nextLesson(state, track);
  if (!next) return null;
  if (next.exam) return `#/trilha/${track.id}/prova`;
  if (next.quiz) return `#/trilha/${track.id}/${next.module}/quiz`;
  return `#/trilha/${track.id}/${next.module}/${next.lesson}`;
}

export function renderTrack({ id }) {
  const track = trackById(id);
  if (!track) return null;
  pageTitle(track.name);
  const state = store.get();
  const p = trackProgress(state, track);
  const next = nextHref(track, state);
  const examOpen = isExamUnlocked(state, track);

  const path = h('ol', { class: 'path' });
  track.modules.forEach((m, i) => {
    const unlocked = isModuleUnlocked(state, track, i);
    const passed = quizPassed(state, track.id, m.id);
    const best = state.quizzes[quizKey(track.id, m.id)];
    const lessonsDone = m.lessons.filter((l) => state.lessons[lessonKey(track.id, m.id, l.id)]).length;
    const status = !unlocked ? 'locked' : passed ? 'done' : 'current';
    path.appendChild(h('li', { class: `module ${status}` },
      h('div', { class: 'module-node mono', 'aria-hidden': 'true' }, status === 'done' ? icon('check') : status === 'locked' ? icon('lock') : String(i + 1)),
      h('div', { class: 'module-card' },
        h('div', { class: 'module-head' },
          h('div', null,
            h('p', { class: 'eyebrow' }, `Módulo ${i + 1}`),
            h('h3', null, m.title),
            h('p', { class: 'muted' }, m.summary)),
          h('div', { class: 'module-meta' },
            h('span', { class: 'pill' }, `${lessonsDone}/${m.lessons.length} lições`),
            best !== undefined ? h('span', { class: 'pill ' + (passed ? 'pill-success' : 'pill-danger') }, `Quiz: ${best}%`) : null)),
        unlocked
          ? h('div', { class: 'module-body' },
            h('ul', { class: 'lesson-list' }, ...m.lessons.map((l, li) => {
              const done = state.lessons[lessonKey(track.id, m.id, l.id)];
              return h('li', null, h('a', { href: `#/trilha/${track.id}/${m.id}/${l.id}`, class: done ? 'done' : '' },
                h('span', { class: 'lesson-check' }, done ? icon('check') : String(li + 1)),
                h('span', null, l.title),
                l.exercises && l.exercises.length ? h('span', { class: 'faint mono small' }, `${l.exercises.length} exerc.`) : null));
            })),
            h('a', { class: 'btn btn-sm ' + (passed ? '' : 'btn-primary'), href: `#/trilha/${track.id}/${m.id}/quiz` }, icon('target'), passed ? 'Refazer quiz' : `Fazer quiz do módulo (${m.quiz.length} questões)`))
          : h('p', { class: 'locked-msg' }, icon('lock'), 'Passe no quiz do módulo anterior com 70% ou mais para desbloquear.'))));
  });

  path.appendChild(h('li', { class: 'module exam ' + (p.certified ? 'done' : examOpen ? 'current' : 'locked') },
    h('div', { class: 'module-node', 'aria-hidden': 'true' }, icon('trophy')),
    h('div', { class: 'module-card exam-card' },
      h('div', null,
        h('p', { class: 'eyebrow' }, 'Prova final'),
        h('h3', null, `Certificado de ${track.name}`),
        h('p', { class: 'muted' }, `${track.examConfig.questions} questões sorteadas de todos os módulos · ${track.examConfig.minutes} minutos · aprovação com 70%.`)),
      p.certified
        ? h('div', { class: 'btn-row' },
          h('a', { class: 'btn btn-success', href: `#/certificado/${track.id}` }, icon('award'), `Ver certificado (${p.exam.score}%)`),
          h('a', { class: 'btn btn-ghost', href: `#/trilha/${track.id}/prova` }, 'Refazer prova'))
        : examOpen
          ? h('a', { class: 'btn btn-primary', href: `#/trilha/${track.id}/prova` }, icon('trophy'), 'Fazer prova final')
          : h('p', { class: 'locked-msg' }, icon('lock'), 'Passe em todos os quizzes de módulo para liberar a prova.'))));

  return h('div', { class: 'track-page', style: { '--track': track.color } },
    h('nav', { class: 'crumbs', 'aria-label': 'Navegação' }, h('a', { href: '#/' }, 'Trilhas'), h('span', null, '/'), h('span', null, track.name)),
    h('header', { class: 'track-hero' },
      h('div', { class: 'track-hero-main' },
        langBadge(track, true),
        h('div', null,
          h('p', { class: 'eyebrow' }, track.category, ' · ', track.level === 'principal' ? 'Trilha completa' : 'Trilha essencial'),
          h('h1', null, track.name),
          h('p', { class: 'hero-lead' }, track.description),
          h('div', { class: 'btn-row' },
            next ? h('a', { class: 'btn btn-primary btn-lg', href: next }, p.started ? 'Continuar' : 'Começar agora', icon('arrowRight')) : null,
            track.runtime ? h('span', { class: 'pill pill-blue' }, icon('play'), track.runtime === 'web' ? 'Pré-visualização ao vivo' : 'Código roda no navegador') : h('span', { class: 'pill' }, icon('book'), 'Exercícios de leitura e lógica')))),
      h('div', { class: 'track-hero-stats' },
        ring(p.percent, p.percent + '%', 'concluído', { size: 132, color: track.color }),
        h('dl', { class: 'mini-stats' },
          h('div', null, h('dt', null, 'Lições'), h('dd', null, `${p.lessonsDone}/${p.lessonsTotal}`)),
          h('div', null, h('dt', null, 'Quizzes'), h('dd', null, `${p.quizzesPassed}/${p.modules}`)),
          h('div', null, h('dt', null, 'Prova'), h('dd', null, p.certified ? `${p.exam.score}%` : '—'))))),
    path);
}
