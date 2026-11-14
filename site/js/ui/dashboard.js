import { h, icon, progressBar, ring, langBadge, toast, pageTitle } from './components.js';
import { store, tracks, setName } from '../app.js';
import { trackProgress } from '../engine/progress.js';
import { levelForXp, levelTitle, currentStreak, ACHIEVEMENTS, todayString, previousDay } from '../engine/gamification.js';
import { render } from '../router.js';

function heatmap(state) {
  const days = new Set(state.activeDays);
  const cells = [];
  let day = todayString();
  for (let i = 0; i < 7 * 16; i++) {
    cells.unshift(day);
    day = previousDay(day);
  }
  // align columns to weeks
  const first = new Date(cells[0] + 'T12:00:00');
  const pad = first.getDay();
  return h('div', { class: 'heatmap-wrap' },
    h('div', { class: 'heatmap', role: 'img', 'aria-label': `Dias de estudo nas últimas 16 semanas: ${cells.filter((d) => days.has(d)).length}` },
      ...Array.from({ length: pad }, () => h('span', { class: 'heat-cell empty' })),
      ...cells.map((d) => h('span', { class: 'heat-cell' + (days.has(d) ? ' on' : ''), title: d.split('-').reverse().join('/') }))),
    h('div', { class: 'heat-legend faint small' }, 'Últimas 16 semanas', h('span', { class: 'heat-cell' }), 'sem estudo', h('span', { class: 'heat-cell on' }), 'estudou'));
}

function stat(label, value, iconName, sub) {
  return h('div', { class: 'stat-tile' },
    h('span', { class: 'stat-icon' }, icon(iconName)),
    h('div', null, h('p', { class: 'stat-value' }, value), h('p', { class: 'stat-label' }, label), sub ? h('p', { class: 'faint small' }, sub) : null));
}

function download(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const a = h('a', { href: URL.createObjectURL(blob), download: filename });
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}

export function renderDashboard() {
  pageTitle('Painel');
  const state = store.get();
  const lvl = levelForXp(state.xp);
  const lessons = Object.keys(state.lessons).length;
  const quizzes = Object.values(state.quizzes).filter((v) => v >= 70).length;
  const certs = Object.values(state.exams).filter((e) => e.score >= 70).length;
  const streak = currentStreak(state);

  const nameInput = h('input', { class: 'input', id: 'profile-name', value: state.name, maxlength: 60, placeholder: 'Como quer ser chamado(a)?' });
  const saveName = () => { setName(nameInput.value); toast('Nome salvo.', { emoji: '✅' }); };

  const started = tracks.map((t) => ({ t, p: trackProgress(state, t) })).filter((x) => x.p.started || x.p.certified);
  const fileInput = h('input', {
    type: 'file',
    accept: 'application/json,.json',
    class: 'visually-hidden',
    id: 'import-file',
    onchange: async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        store.importJSON(await file.text());
        toast('Progresso importado com sucesso!', { emoji: '📥' });
        render();
      } catch (err) {
        toast(err.message, { kind: 'warn', emoji: '⚠️' });
      }
    },
  });

  return h('div', { class: 'dashboard' },
    h('header', { class: 'dash-hero card' },
      ring((lvl.current / lvl.next) * 100, String(lvl.level), 'nível', { size: 140 }),
      h('div', { class: 'dash-profile' },
        h('p', { class: 'eyebrow' }, levelTitle(lvl.level)),
        h('h1', null, state.name ? `Olá, ${state.name}!` : 'Seu painel'),
        h('div', { class: 'progress-label' }, h('span', null, `${state.xp} XP no total`), h('span', null, `faltam ${lvl.next - lvl.current} XP para o nível ${lvl.level + 1}`)),
        progressBar((lvl.current / lvl.next) * 100),
        h('div', { class: 'field inline-field' },
          h('label', { for: 'profile-name' }, 'Seu nome'),
          h('div', { class: 'fill-row' }, nameInput, h('button', { type: 'button', class: 'btn', onclick: saveName }, 'Salvar'))))),

    h('section', { class: 'stat-grid' },
      stat('Sequência atual', `${streak} ${streak === 1 ? 'dia' : 'dias'}`, 'flame', `Recorde: ${state.streak.best || 0}`),
      stat('Lições concluídas', lessons, 'book'),
      stat('Quizzes aprovados', quizzes, 'target'),
      stat('Certificados', certs, 'award')),

    h('section', { class: 'card' },
      h('h2', { class: 'card-title' }, 'Constância'),
      heatmap(state)),

    h('section', { class: 'dash-cols' },
      h('div', { class: 'card' },
        h('h2', { class: 'card-title' }, 'Suas trilhas'),
        started.length
          ? h('ul', { class: 'dash-tracks' }, ...started.map(({ t, p }) => h('li', null,
            h('a', { href: `#/trilha/${t.id}`, style: { '--track': t.color } },
              langBadge(t),
              h('div', { class: 'dash-track-info' },
                h('div', { class: 'progress-label' }, h('strong', null, t.name), h('span', null, p.percent + '%')),
                progressBar(p.percent, t.color),
                h('span', { class: 'faint small' }, `${p.lessonsDone}/${p.lessonsTotal} lições · ${p.quizzesPassed}/${p.modules} quizzes${p.certified ? ` · prova ${p.exam.score}%` : ''}`)),
              p.certified ? h('a', { class: 'pill pill-success', href: `#/certificado/${t.id}` }, icon('award'), 'Certificado') : null))))
          : h('div', { class: 'empty' }, h('p', null, 'Você ainda não começou nenhuma trilha.'), h('a', { class: 'btn btn-primary', href: '#/' }, 'Escolher trilha'))),
      h('div', { class: 'card' },
        h('h2', { class: 'card-title' }, `Conquistas · ${state.achievements.length}/${ACHIEVEMENTS.length}`),
        h('ul', { class: 'badges' }, ...ACHIEVEMENTS.map((a) => {
          const got = state.achievements.includes(a.id);
          return h('li', { class: 'badge' + (got ? ' got' : ''), title: a.description },
            h('span', { class: 'badge-emoji', 'aria-hidden': 'true' }, got ? a.emoji : '🔒'),
            h('strong', null, a.title),
            h('span', { class: 'faint small' }, a.description),
            h('span', { class: 'visually-hidden' }, got ? 'conquistada' : 'bloqueada'));
        })))),

    h('section', { class: 'card backup' },
      h('div', null,
        h('h2', { class: 'card-title' }, 'Backup do progresso'),
        h('p', { class: 'muted' }, store.persistent
          ? 'Seu progresso fica salvo neste navegador. Exporte um arquivo para levar a outro computador ou não perder nada se limpar os dados do navegador.'
          : 'Atenção: este navegador está bloqueando o armazenamento local, então o progresso será perdido ao fechar a página. Exporte um backup antes de sair.')),
      h('div', { class: 'btn-row' },
        h('button', { type: 'button', class: 'btn', onclick: () => download(`devtrilhas-backup-${todayString()}.json`, store.exportJSON()) }, icon('download'), 'Exportar'),
        h('label', { class: 'btn', for: 'import-file', tabindex: '0', onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } } }, icon('upload'), 'Importar'),
        fileInput,
        h('button', {
          type: 'button',
          class: 'btn btn-danger',
          onclick: () => {
            if (!confirm('Apagar TODO o seu progresso? Esta ação não pode ser desfeita.')) return;
            store.reset();
            toast('Progresso apagado.', { emoji: '🧹' });
            render();
          },
        }, icon('reset'), 'Apagar progresso'))));
}
