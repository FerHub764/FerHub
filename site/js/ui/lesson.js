import { h, icon, progressBar, pageTitle } from './components.js';
import { store, trackById, completeLesson, completeExercise, setLastVisited } from '../app.js';
import { findLesson, isModuleUnlocked, lessonKey, exerciseKey, quizKey } from '../engine/progress.js';
import { renderMarkdown } from '../engine/markdown.js';
import { practiceQuestion, codeExercise, webExercise } from './question.js';
import { navigate } from '../router.js';

export function lockedView(track, message) {
  return h('div', { class: 'empty card' },
    h('div', { class: 'empty-icon' }, icon('lock')),
    h('h2', null, 'Conteúdo bloqueado'),
    h('p', null, message),
    h('a', { class: 'btn btn-primary', href: `#/trilha/${track.id}` }, 'Voltar para a trilha'));
}

export function renderLesson({ id, module: moduleId, lesson: lessonId }) {
  const track = trackById(id);
  if (!track) return null;
  const found = findLesson(track, moduleId, lessonId);
  if (!found) return null;
  const { module, moduleIndex, lesson, lessonIndex, prev, next } = found;
  const state = store.get();
  if (!isModuleUnlocked(state, track, moduleIndex)) {
    return lockedView(track, 'Passe no quiz do módulo anterior com 70% ou mais para liberar este módulo.');
  }
  pageTitle(`${lesson.title} · ${track.name}`);
  setLastVisited(track.id, module.id, lesson.id);

  const lang = track.lang || track.runtime || track.id;
  const exercises = (lesson.exercises || []).map((ex, i) => {
    const done = !!state.exercises[exerciseKey(track.id, module.id, lesson.id, i)];
    const onSolved = ({ revealed }) => completeExercise(track.id, module.id, lesson.id, i, { revealed });
    const number = i + 1;
    if (ex.type === 'code') return codeExercise(ex, { runtime: track.runtime, lang, done, number, onSolved });
    if (ex.type === 'web') return webExercise(ex, { done, number, onSolved });
    return practiceQuestion(ex, { lang, done, number, onSolved });
  });

  const isDone = () => !!store.get().lessons[lessonKey(track.id, module.id, lesson.id)];
  const nextTarget = next
    ? { href: `#/trilha/${track.id}/${module.id}/${next.id}`, label: 'Próxima lição' }
    : { href: `#/trilha/${track.id}/${module.id}/quiz`, label: 'Ir para o quiz do módulo' };

  const finish = h('button', {
    type: 'button',
    class: 'btn btn-primary btn-lg',
    onclick: () => {
      completeLesson(track.id, module.id, lesson.id);
      navigate(nextTarget.href);
    },
  }, isDone() ? nextTarget.label : 'Concluir lição', icon('arrowRight'));

  const lessonsDone = module.lessons.filter((l) => state.lessons[lessonKey(track.id, module.id, l.id)]).length;
  const best = state.quizzes[quizKey(track.id, module.id)];

  const side = h('aside', { class: 'lesson-side' },
    h('div', { class: 'side-card' },
      h('p', { class: 'eyebrow' }, `Módulo ${moduleIndex + 1}`),
      h('h3', null, module.title),
      h('div', { class: 'progress-label' }, h('span', null, 'Lições'), h('span', null, `${lessonsDone}/${module.lessons.length}`)),
      progressBar((lessonsDone / module.lessons.length) * 100, track.color),
      h('ol', { class: 'side-lessons' }, ...module.lessons.map((l, i) => {
        const done = state.lessons[lessonKey(track.id, module.id, l.id)];
        return h('li', null, h('a', {
          href: `#/trilha/${track.id}/${module.id}/${l.id}`,
          class: (l.id === lesson.id ? 'active ' : '') + (done ? 'done' : ''),
          'aria-current': l.id === lesson.id ? 'page' : null,
        }, h('span', { class: 'lesson-check' }, done ? icon('check') : String(i + 1)), h('span', null, l.title)));
      })),
      h('a', { class: 'btn btn-sm side-quiz', href: `#/trilha/${track.id}/${module.id}/quiz` }, icon('target'), best !== undefined ? `Quiz do módulo · ${best}%` : 'Quiz do módulo')));

  return h('div', { class: 'lesson-page', style: { '--track': track.color } },
    h('nav', { class: 'crumbs', 'aria-label': 'Navegação' },
      h('a', { href: '#/' }, 'Trilhas'), h('span', null, '/'),
      h('a', { href: `#/trilha/${track.id}` }, track.name), h('span', null, '/'),
      h('span', null, `Módulo ${moduleIndex + 1}`)),
    h('div', { class: 'lesson-layout' },
      h('article', { class: 'lesson-main' },
        h('header', { class: 'lesson-head' },
          h('p', { class: 'eyebrow' }, `Lição ${lessonIndex + 1} de ${module.lessons.length}`),
          h('h1', null, lesson.title)),
        h('div', { class: 'prose', html: renderMarkdown(lesson.content) }),
        exercises.length ? h('h2', { class: 'practice-title' }, icon('code'), 'Hora de praticar') : null,
        ...exercises,
        h('footer', { class: 'lesson-nav' },
          prev
            ? h('a', { class: 'btn btn-ghost', href: `#/trilha/${track.id}/${module.id}/${prev.id}` }, icon('arrowLeft'), 'Anterior')
            : h('a', { class: 'btn btn-ghost', href: `#/trilha/${track.id}` }, icon('arrowLeft'), 'Mapa da trilha'),
          finish)),
      side));
}
