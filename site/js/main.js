import { registerRoute, setNotFound, startRouter, currentPath } from './router.js';
import { h, icon, toast, pageTitle } from './ui/components.js';
import { store, setTheme } from './app.js';
import { levelForXp, currentStreak } from './engine/gamification.js';
import { renderHome } from './ui/home.js';
import { renderTrack } from './ui/track-map.js';
import { renderLesson } from './ui/lesson.js';
import { renderQuiz, renderExam } from './ui/quiz.js';
import { renderDashboard } from './ui/dashboard.js';
import { renderGlossary } from './ui/glossary.js';
import { renderCertificate } from './ui/certificate-view.js';

registerRoute('/', renderHome);
registerRoute('/painel', renderDashboard);
registerRoute('/glossario', renderGlossary);
registerRoute('/trilha/:id', renderTrack);
registerRoute('/trilha/:id/prova', renderExam);
registerRoute('/trilha/:id/:module/quiz', renderQuiz);
registerRoute('/trilha/:id/:module/:lesson', renderLesson);
registerRoute('/certificado/:id', renderCertificate);

setNotFound(() => {
  pageTitle('Página não encontrada');
  return h('div', { class: 'not-found' },
    h('p', { class: 'nf-code mono' }, '404'),
    h('h1', null, 'Página não encontrada'),
    h('p', { class: 'hero-lead' }, 'Esse endereço não existe — talvez a lição tenha mudado de lugar.'),
    h('pre', { class: 'code nf-snippet' }, h('span', { class: 'tok-k' }, 'if'), ' (pagina == ', h('span', { class: 'tok-k' }, 'null'), ') {\n  ', h('span', { class: 'tok-f' }, 'voltarPara'), '(', h('span', { class: 'tok-s' }, '"início"'), ');\n}'),
    h('a', { class: 'btn btn-primary btn-lg', href: '#/' }, icon('arrowLeft'), 'Voltar ao início'));
});

const NAV = [
  { href: '#/', label: 'Trilhas', icon: 'grid', match: (p) => p === '/' || p.startsWith('/trilha') || p.startsWith('/certificado') },
  { href: '#/painel', label: 'Painel', icon: 'chart', match: (p) => p === '/painel' },
  { href: '#/glossario', label: 'Glossário', icon: 'book', match: (p) => p === '/glossario' },
];

function renderTopbar() {
  const state = store.get();
  const lvl = levelForXp(state.xp);
  const streak = currentStreak(state);
  const path = currentPath();
  const theme = state.settings.theme;
  const bar = document.getElementById('topbar');
  bar.replaceChildren(h('div', { class: 'topbar-inner' },
    h('a', { class: 'logo', href: '#/', 'aria-label': 'DevTrilhas, início' }, h('span', { class: 'logo-mark' }, '>_'), h('span', { class: 'logo-text' }, 'DevTrilhas')),
    h('nav', { class: 'nav', 'aria-label': 'Principal' }, ...NAV.map((n) => h('a', { href: n.href, 'aria-current': n.match(path) ? 'page' : null }, icon(n.icon), h('span', null, n.label)))),
    h('div', { class: 'topbar-stats' },
      h('a', { class: 'chip chip-streak', href: '#/painel', title: 'Dias seguidos estudando' }, icon('flame'), String(streak)),
      h('a', { class: 'chip chip-xp', href: '#/painel', title: `${state.xp} XP` }, icon('sparkle'), h('span', null, String(state.xp)), h('span', { class: 'chip-label' }, ' XP')),
      h('a', { class: 'chip chip-level', href: '#/painel', title: `Nível ${lvl.level}` }, `Nv ${lvl.level}`),
      h('button', {
        type: 'button',
        class: 'icon-btn',
        'aria-label': theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro',
        title: theme === 'dark' ? 'Tema claro' : 'Tema escuro',
        onclick: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      }, icon(theme === 'dark' ? 'sun' : 'moon')))));
}

document.documentElement.dataset.theme = store.get().settings.theme;
store.subscribe(renderTopbar);
renderTopbar();

startRouter(document.getElementById('app'), () => renderTopbar());

if (store.recovered) toast('Não consegui ler seu progresso salvo (arquivo corrompido). Começamos do zero.', { kind: 'warn', emoji: '⚠️', duration: 7000 });
if (!store.persistent) toast('Seu navegador está bloqueando o armazenamento: o progresso não será salvo. Use o backup no Painel.', { kind: 'warn', emoji: '⚠️', duration: 7000 });
