import { h, icon, progressBar, langBadge, pageTitle } from './components.js';
import { store, tracks, trackById } from '../app.js';
import { trackProgress, findLesson } from '../engine/progress.js';
import { levelForXp, levelTitle, currentStreak } from '../engine/gamification.js';

const CATEGORIES = ['Todas', 'Web', 'Uso geral', 'Sistemas', 'Back-end', 'Dados', 'Mobile', 'Ferramentas'];

export function trackCard(track, state) {
  const p = trackProgress(state, track);
  return h('a', { class: 'track-card', href: `#/trilha/${track.id}`, style: { '--track': track.color } },
    h('div', { class: 'track-card-top' },
      langBadge(track),
      h('div', { class: 'track-card-pills' },
        p.certified ? h('span', { class: 'pill pill-success' }, icon('award'), 'Certificado') : null,
        track.runtime ? h('span', { class: 'pill pill-blue', title: 'O código roda direto no navegador' }, icon('play'), 'Roda aqui') : null)),
    h('h3', null, track.name),
    h('p', { class: 'muted' }, track.tagline),
    h('div', { class: 'track-card-meta mono' },
      h('span', null, `${track.modules.length} módulos`),
      h('span', null, '·'),
      h('span', null, `${p.lessonsTotal} lições`),
      h('span', null, '·'),
      h('span', null, track.level === 'principal' ? 'Trilha completa' : 'Trilha essencial')),
    p.started
      ? h('div', { class: 'track-card-progress' }, h('div', { class: 'progress-label' }, h('span', null, 'Progresso'), h('span', null, p.percent + '%')), progressBar(p.percent, track.color))
      : h('span', { class: 'track-card-cta' }, 'Começar trilha', icon('arrowRight')));
}

function continueCard(state) {
  const last = state.lastVisited;
  const track = last && trackById(last.track);
  const found = track && findLesson(track, last.module, last.lesson);
  if (!found) return null;
  const lvl = levelForXp(state.xp);
  return h('section', { class: 'continue card', style: { '--track': track.color } },
    h('div', { class: 'continue-main' },
      langBadge(track, true),
      h('div', null,
        h('p', { class: 'eyebrow' }, 'Continue de onde parou'),
        h('h3', null, found.lesson.title),
        h('p', { class: 'muted' }, `${track.name} · Módulo ${found.moduleIndex + 1}: ${found.module.title}`))),
    h('div', { class: 'continue-side' },
      h('div', { class: 'continue-stats mono' },
        h('span', null, icon('star'), ` Nível ${lvl.level} · ${levelTitle(lvl.level)}`),
        h('span', null, icon('flame'), ` ${currentStreak(state)} dia(s) seguidos`)),
      h('a', { class: 'btn btn-primary', href: `#/trilha/${track.id}/${found.module.id}/${found.lesson.id}` }, 'Continuar', icon('arrowRight'))));
}

function heroTerminal() {
  const lines = [
    ['c', '# sua primeira linha de código'],
    ['', 'nome = input("Como você se chama? ")'],
    ['', 'print(f"Bem-vindo(a), {nome}!")'],
  ];
  return h('div', { class: 'hero-terminal', 'aria-hidden': 'true' },
    h('div', { class: 'editor-head' }, h('span', { class: 'editor-dots' }, h('i'), h('i'), h('i')), h('span', null, 'primeira_aula.py'), h('span')),
    h('pre', { class: 'hero-code' }, ...lines.map(([k, t], i) => h('span', { class: 'hero-line', style: { '--i': i } }, k === 'c' ? h('span', { class: 'tok-c' }, t) : colorize(t)))),
    h('div', { class: 'hero-out' },
      h('span', { class: 'faint' }, '$ python primeira_aula.py'),
      h('span', null, 'Como você se chama? ', h('b', null, 'Ana')),
      h('span', { class: 'ok' }, 'Bem-vindo(a), Ana!')),
    h('div', { class: 'hero-float hero-float-xp' }, icon('sparkle'), '+10 XP'),
    h('div', { class: 'hero-float hero-float-badge' }, '🌱 Primeiro passo'));
}

function colorize(text) {
  const frag = document.createElement('span');
  frag.innerHTML = text
    .replace(/(".*?")/g, '<span class="tok-s">$1</span>')
    .replace(/\b(print|input)\b/g, '<span class="tok-f">$1</span>');
  return frag;
}

export function renderHome() {
  pageTitle('');
  const state = store.get();
  let filter = 'Todas';
  const grid = h('div', { class: 'track-grid' });
  const chips = h('div', { class: 'filter-chips', role: 'toolbar', 'aria-label': 'Filtrar trilhas' });

  function paintGrid() {
    const visible = tracks.filter((t) => filter === 'Todas' || t.category === filter);
    grid.replaceChildren(...visible.map((t) => trackCard(t, state)));
    chips.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.cat === filter ? 'true' : 'false'));
  }
  for (const cat of CATEGORIES) {
    if (cat !== 'Todas' && !tracks.some((t) => t.category === cat)) continue;
    chips.appendChild(h('button', { type: 'button', class: 'filter-chip', dataset: { cat }, onclick: () => { filter = cat; paintGrid(); } }, cat));
  }
  paintGrid();

  const totalLessons = tracks.reduce((n, t) => n + t.modules.reduce((k, m) => k + m.lessons.length, 0), 0);
  const totalQuestions = tracks.reduce((n, t) => n + t.modules.reduce((k, m) => k + m.quiz.length, 0) + t.exam.length, 0);

  return h('div', { class: 'home' },
    h('section', { class: 'hero' },
      h('div', { class: 'hero-copy' },
        h('p', { class: 'eyebrow' }, icon('terminal'), `Do zero ao avançado · ${tracks.length} trilhas`),
        h('h1', null, 'Aprenda a programar ', h('span', { class: 'hl' }, 'escrevendo código'), ' de verdade.'),
        h('p', { class: 'hero-lead' }, 'Lições curtas, exercícios que rodam no navegador, quizzes que liberam o próximo módulo e uma prova final com certificado. Você escolhe a linguagem e avança no seu ritmo.'),
        h('div', { class: 'btn-row' },
          h('a', { class: 'btn btn-primary btn-lg', href: '#/trilha/python' }, 'Começar com Python', icon('arrowRight')),
          h('a', { class: 'btn btn-lg', href: '#trilhas', onclick: (e) => { e.preventDefault(); document.getElementById('trilhas').scrollIntoView({ behavior: 'smooth' }); } }, 'Ver todas as trilhas')),
        h('dl', { class: 'hero-stats' },
          h('div', null, h('dt', null, 'Trilhas'), h('dd', null, tracks.length)),
          h('div', null, h('dt', null, 'Lições'), h('dd', null, totalLessons)),
          h('div', null, h('dt', null, 'Questões'), h('dd', null, totalQuestions)),
          h('div', null, h('dt', null, 'Custo'), h('dd', null, 'R$ 0')))),
      heroTerminal()),

    continueCard(state),

    h('section', { class: 'how' },
      h('p', { class: 'eyebrow' }, 'Como funciona'),
      h('h2', null, 'Um caminho claro, passo a passo'),
      h('ol', { class: 'how-steps' },
        step('1', 'Escolha uma trilha', 'Cada linguagem tem módulos em ordem, do básico ao avançado.'),
        step('2', 'Estude e pratique', 'Lições curtas com exemplos e exercícios corrigidos na hora.'),
        step('3', 'Passe no quiz', 'Tire 70% ou mais para desbloquear o próximo módulo.'),
        step('4', 'Faça a prova final', 'Questões sorteadas, com tempo. Aprovado? Baixe seu certificado.'))),

    h('section', { class: 'tracks', id: 'trilhas' },
      h('div', { class: 'section-head' },
        h('div', null, h('p', { class: 'eyebrow' }, 'Trilhas'), h('h2', null, 'Escolha o que você quer aprender')),
        chips),
      grid),

    h('section', { class: 'guide card' },
      h('div', null,
        h('p', { class: 'eyebrow' }, icon('bulb'), 'Não sabe por onde começar?'),
        h('h2', null, 'Um guia rápido para escolher')),
      h('ul', { class: 'guide-list' },
        guide('python', 'Nunca programou?', 'Python tem a sintaxe mais amigável. Ótimo para aprender lógica.'),
        guide('html-css', 'Quer criar sites?', 'Comece por HTML e CSS e depois siga para JavaScript.'),
        guide('java', 'Mercado corporativo?', 'Java e C# dominam sistemas de empresas e bancos.'),
        guide('cpp', 'Jogos e desempenho?', 'C e C++ mostram como o computador funciona por dentro.'),
        guide('kotlin', 'Apps de celular?', 'Kotlin para Android, Swift para iPhone.'),
        guide('sql', 'Trabalhar com dados?', 'SQL é a língua dos bancos de dados. Combine com Python.'))));
}

function step(n, title, text) {
  return h('li', { class: 'how-step' }, h('span', { class: 'how-num mono' }, n), h('h3', null, title), h('p', { class: 'muted' }, text));
}

function guide(trackId, q, text) {
  const t = trackById(trackId);
  if (!t) return null;
  return h('li', null, h('a', { href: `#/trilha/${t.id}`, style: { '--track': t.color } }, langBadge(t), h('div', null, h('strong', null, q), h('span', { class: 'muted' }, ' ' + text))));
}
