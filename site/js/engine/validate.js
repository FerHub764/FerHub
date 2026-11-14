// Structural checks for track data files. Returns a list of human-readable errors.

const MODULE_RANGE = { principal: [8, 10], extra: [5, 6] };
const MIN_BANK = { principal: 30, extra: 20 };
const MIN_QUIZ = 5;
const QUESTION_TYPES = new Set(['choice', 'predict', 'fill', 'find-bug']);
const RUNTIMES = new Set(['python', 'javascript']);

function checkQuestion(q, where, errors) {
  if (!q || typeof q !== 'object') {
    errors.push(`${where}: questão inválida`);
    return;
  }
  if (!QUESTION_TYPES.has(q.type)) {
    errors.push(`${where}: tipo desconhecido "${q.type}"`);
    return;
  }
  if (!q.prompt) errors.push(`${where}: sem enunciado`);
  if (q.type === 'choice') {
    if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`${where}: precisa de pelo menos 2 opções`);
    else if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) {
      errors.push(`${where}: resposta fora das opções`);
    }
  } else if (q.type === 'find-bug') {
    const lines = String(q.code || '').split('\n').length;
    if (!q.code) errors.push(`${where}: find-bug sem código`);
    if (!Number.isInteger(q.answer) || q.answer < 1 || q.answer > lines) errors.push(`${where}: linha do bug fora do código`);
  } else {
    const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
    if (!answers.length || answers.some((a) => typeof a !== 'string' || !a.trim())) {
      errors.push(`${where}: resposta vazia`);
    }
  }
}

function checkExercise(ex, where, track, errors) {
  if (ex.type === 'code') {
    if (!RUNTIMES.has(track.runtime)) errors.push(`${where}: exercício de código sem runtime executável na trilha`);
    if (typeof ex.expected !== 'string' || !ex.expected.length) errors.push(`${where}: sem saída esperada`);
    if (!ex.prompt) errors.push(`${where}: sem enunciado`);
  } else if (ex.type === 'web') {
    if (track.runtime !== 'web') errors.push(`${where}: exercício web exige runtime "web"`);
    if (!Array.isArray(ex.checks) || !ex.checks.length) errors.push(`${where}: exercício web sem verificações`);
    if (!ex.prompt) errors.push(`${where}: sem enunciado`);
  } else {
    checkQuestion(ex, where, errors);
  }
}

export function validateTrack(track) {
  const errors = [];
  if (!track || typeof track !== 'object') return ['trilha inválida'];
  const id = track.id || '?';
  if (!track.id) errors.push('trilha sem id');
  if (!track.name) errors.push(`${id}: trilha sem nome`);
  const range = MODULE_RANGE[track.level];
  if (!range) errors.push(`${id}: nível "${track.level}" inválido`);
  const modules = Array.isArray(track.modules) ? track.modules : [];
  if (range && (modules.length < range[0] || modules.length > range[1])) {
    errors.push(`${id}: ${modules.length} módulos (esperado ${range[0]}–${range[1]})`);
  }

  const moduleIds = new Set();
  modules.forEach((m, mi) => {
    const mw = `${id}/${m.id || 'módulo ' + (mi + 1)}`;
    if (!m.id) errors.push(`${mw}: módulo sem id`);
    else if (moduleIds.has(m.id)) errors.push(`${mw}: id de módulo duplicado`);
    moduleIds.add(m.id);
    if (!m.title) errors.push(`${mw}: módulo sem título`);
    if (!Array.isArray(m.lessons) || !m.lessons.length) errors.push(`${mw}: módulo sem lições`);
    const lessonIds = new Set();
    (m.lessons || []).forEach((l, li) => {
      const lw = `${mw}/${l.id || 'lição ' + (li + 1)}`;
      if (!l.id || lessonIds.has(l.id)) errors.push(`${lw}: id de lição ausente ou duplicado`);
      lessonIds.add(l.id);
      if (!l.title) errors.push(`${lw}: lição sem título`);
      if (!l.content) errors.push(`${lw}: lição sem conteúdo`);
      (l.exercises || []).forEach((ex, ei) => checkExercise(ex, `${lw}/exercício ${ei + 1}`, track, errors));
    });
    const quiz = Array.isArray(m.quiz) ? m.quiz : [];
    if (quiz.length < MIN_QUIZ) errors.push(`${mw}: quiz com ${quiz.length} questões (mínimo ${MIN_QUIZ})`);
    quiz.forEach((q, qi) => checkQuestion(q, `${mw}/quiz ${qi + 1}`, errors));
  });

  (track.exam || []).forEach((q, qi) => checkQuestion(q, `${id}/prova ${qi + 1}`, errors));

  const bank = modules.reduce((n, m) => n + (m.quiz || []).length, 0) + (track.exam || []).length;
  const minBank = MIN_BANK[track.level] || 0;
  if (bank < minBank) errors.push(`${id}: banco da prova com ${bank} questões (mínimo ${minBank})`);
  const qIds = new Set();
  [...modules.flatMap((m) => m.quiz || []), ...(track.exam || [])].forEach((q) => {
    if (q && q.id) {
      if (qIds.has(q.id)) errors.push(`${id}: id de questão duplicado "${q.id}"`);
      qIds.add(q.id);
    }
  });
  if (!track.examConfig || !(track.examConfig.questions > 0) || !(track.examConfig.minutes > 0)) {
    errors.push(`${id}: examConfig inválido`);
  }
  return errors;
}
