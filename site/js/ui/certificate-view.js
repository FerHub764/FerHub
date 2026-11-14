import { h, icon, toast, pageTitle } from './components.js';
import { store, trackById, setName } from '../app.js';
import { renderCertificate as drawCertificate, downloadCertificate, slugify } from '../engine/certificate.js';
import { PASS_SCORE } from '../engine/assess.js';
import { lockedView } from './lesson.js';

export function renderCertificate({ id }) {
  const track = trackById(id);
  if (!track) return null;
  const state = store.get();
  const exam = state.exams[track.id];
  if (!exam || exam.score < PASS_SCORE) return lockedView(track, 'Passe na prova final desta trilha para receber o certificado.');
  pageTitle(`Certificado · ${track.name}`);

  const canvas = h('canvas', { class: 'cert-canvas', role: 'img', 'aria-label': `Certificado de ${track.name}` });
  const nameInput = h('input', { class: 'input', id: 'cert-name', maxlength: 60, value: state.name || exam.name || '', autocomplete: 'name' });
  const error = h('p', { class: 'field-error', role: 'alert' });
  const codeEl = h('span', { class: 'mono' });

  const draw = () => {
    const code = drawCertificate(canvas, {
      name: nameInput.value.trim() || 'Seu nome',
      trackName: track.name,
      trackId: track.id,
      trackColor: track.color,
      short: track.short,
      score: exam.score,
      date: exam.date,
    });
    codeEl.textContent = code;
  };

  const save = async () => {
    const name = nameInput.value.trim();
    if (name.length < 2) {
      error.textContent = 'Digite seu nome antes de baixar o certificado.';
      nameInput.focus();
      return;
    }
    error.textContent = '';
    setName(name);
    draw();
    await downloadCertificate(canvas, `certificado-${track.id}-${slugify(name)}.png`);
    toast('Certificado baixado!', { emoji: '🎓' });
  };

  nameInput.addEventListener('input', () => { error.textContent = ''; draw(); });
  // fonts may still be loading on first paint
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  requestAnimationFrame(draw);

  return h('div', { class: 'cert-page', style: { '--track': track.color } },
    h('nav', { class: 'crumbs', 'aria-label': 'Navegação' }, h('a', { href: '#/' }, 'Trilhas'), h('span', null, '/'), h('a', { href: `#/trilha/${track.id}` }, track.name), h('span', null, '/'), h('span', null, 'Certificado')),
    h('header', { class: 'cert-head' },
      h('div', null,
        h('p', { class: 'eyebrow' }, icon('award'), 'Certificado'),
        h('h1', null, `Parabéns! Você concluiu ${track.name}.`),
        h('p', { class: 'hero-lead' }, `Nota final: ${exam.score}%. Confira seu nome e baixe o certificado em PNG para compartilhar.`)),
      h('div', { class: 'cert-actions card' },
        h('div', { class: 'field' }, h('label', { for: 'cert-name' }, 'Nome no certificado'), nameInput, error),
        h('button', { type: 'button', class: 'btn btn-primary btn-lg', onclick: save }, icon('download'), 'Baixar PNG'),
        h('p', { class: 'faint small' }, 'Código de verificação: ', codeEl))),
    h('div', { class: 'cert-frame' }, canvas));
}
