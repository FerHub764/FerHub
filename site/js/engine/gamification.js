// XP, levels, daily streak and achievements. Pure functions over State.

export const XP = {
  lesson: 10,
  exercise: 5,
  quizPass: 50,
  quizPerfect: 20,
  examPass: 200,
};

const threshold = (level) => 100 * (level - 1) ** 2;

export function levelForXp(xp) {
  const total = Math.max(0, Math.floor(xp || 0));
  let level = 1;
  while (threshold(level + 1) <= total) level++;
  return {
    level,
    current: total - threshold(level),
    next: threshold(level + 1) - threshold(level),
    total,
  };
}

export const LEVEL_TITLES = [
  'Curioso', 'Aprendiz', 'Explorador', 'Codificador', 'Construtor',
  'Desenvolvedor', 'Arquiteto', 'Mestre do Código', 'Lenda', 'Guru',
];

export function levelTitle(level) {
  return LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1];
}

export function awardXp(state, amount) {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  state.xp += Math.floor(amount);
  return Math.floor(amount);
}

export function todayString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function previousDay(day) {
  const [y, m, d] = day.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function touchStreak(state, today = todayString()) {
  const s = state.streak;
  if (s.lastDay === today) return;
  s.count = s.lastDay === previousDay(today) ? s.count + 1 : 1;
  s.best = Math.max(s.best || 0, s.count);
  s.lastDay = today;
  if (!state.activeDays.includes(today)) state.activeDays.push(today);
}

/** Streak that is still alive (today or yesterday counted). */
export function currentStreak(state, today = todayString()) {
  const { lastDay, count } = state.streak;
  if (lastDay === today || lastDay === previousDay(today)) return count;
  return 0;
}

// ---------- Achievements ----------

const lessonCount = (s) => Object.keys(s.lessons).length;
const passedQuizzes = (s) => Object.values(s.quizzes).filter((v) => v >= 70).length;
const certCount = (s) => Object.values(s.exams).filter((e) => e && e.score >= 70).length;
const tracksTouched = (s) => new Set(Object.keys(s.lessons).map((k) => k.split('/')[0])).size;

export const ACHIEVEMENTS = [
  { id: 'first-lesson', emoji: '🌱', title: 'Primeiro passo', description: 'Conclua sua primeira lição.', test: (s) => lessonCount(s) >= 1 },
  { id: 'ten-lessons', emoji: '📚', title: 'Ritmo de estudo', description: 'Conclua 10 lições.', test: (s) => lessonCount(s) >= 10 },
  { id: 'fifty-lessons', emoji: '🧠', title: 'Devorador de conteúdo', description: 'Conclua 50 lições.', test: (s) => lessonCount(s) >= 50 },
  { id: 'hundred-lessons', emoji: '🏔️', title: 'Centenário', description: 'Conclua 100 lições.', test: (s) => lessonCount(s) >= 100 },
  { id: 'first-quiz', emoji: '✅', title: 'Aprovado!', description: 'Passe no seu primeiro quiz de módulo.', test: (s) => passedQuizzes(s) >= 1 },
  { id: 'perfect-quiz', emoji: '💯', title: 'Gabaritou', description: 'Tire 100% em um quiz.', test: (s) => Object.values(s.quizzes).some((v) => v === 100) },
  { id: 'ten-quizzes', emoji: '🎯', title: 'Atirador de elite', description: 'Passe em 10 quizzes.', test: (s) => passedQuizzes(s) >= 10 },
  { id: 'first-cert', emoji: '🎓', title: 'Certificado', description: 'Passe na prova final de uma trilha.', test: (s) => certCount(s) >= 1 },
  { id: 'three-certs', emoji: '🏆', title: 'Colecionador', description: 'Conquiste 3 certificados.', test: (s) => certCount(s) >= 3 },
  { id: 'polyglot', emoji: '🌍', title: 'Poliglota', description: 'Estude lições em 5 trilhas diferentes.', test: (s) => tracksTouched(s) >= 5 },
  { id: 'streak-3', emoji: '🔥', title: 'Pegando fogo', description: 'Estude 3 dias seguidos.', test: (s) => (s.streak.best || 0) >= 3 },
  { id: 'streak-7', emoji: '⚡', title: 'Semana perfeita', description: 'Estude 7 dias seguidos.', test: (s) => (s.streak.best || 0) >= 7 },
  { id: 'streak-30', emoji: '🌋', title: 'Imparável', description: 'Estude 30 dias seguidos.', test: (s) => (s.streak.best || 0) >= 30 },
  { id: 'level-5', emoji: '⭐', title: 'Nível 5', description: 'Alcance o nível 5.', test: (s) => levelForXp(s.xp).level >= 5 },
  { id: 'level-10', emoji: '🌟', title: 'Nível 10', description: 'Alcance o nível 10.', test: (s) => levelForXp(s.xp).level >= 10 },
  {
    id: 'track-complete', emoji: '🧩', title: 'Trilha completa', description: 'Conclua todas as lições de uma trilha.',
    test: (s, tracks) => tracks.some((t) => t.modules.length > 0 && t.modules.every((m) => m.lessons.every((l) => s.lessons[`${t.id}/${m.id}/${l.id}`]))),
  },
];

/** Adds newly earned achievement ids to state and returns them. */
export function evaluateAchievements(state, tracks) {
  const earned = [];
  for (const a of ACHIEVEMENTS) {
    if (state.achievements.includes(a.id)) continue;
    if (a.test(state, tracks)) {
      state.achievements.push(a.id);
      earned.push(a.id);
    }
  }
  return earned;
}

export function achievementById(id) {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
