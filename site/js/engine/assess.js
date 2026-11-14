// Grading for quizzes, exercises and the final exam.

export const PASS_RATIO = 0.7;
export const PASS_SCORE = 70;

export function normalizeText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim().replace(/\s+/g, ' ').toLowerCase();
}

export function gradeAnswer(question, given) {
  if (given === null || given === undefined) return false;
  switch (question.type) {
    case 'choice':
    case 'find-bug': {
      if (given === '') return false;
      const n = Number(given);
      return Number.isInteger(n) && n === question.answer;
    }
    case 'predict':
    case 'fill': {
      const g = normalizeText(given);
      if (!g) return false;
      const accepted = Array.isArray(question.answer) ? question.answer : [question.answer];
      return accepted.some((a) => normalizeText(a) === g);
    }
    default:
      return false;
  }
}

export function gradeQuiz(questions, answers) {
  const total = questions.length;
  if (!total) return { score: 0, correct: 0, total: 0, passed: false };
  let correct = 0;
  for (const q of questions) if (gradeAnswer(q, answers[q.id])) correct++;
  const ratio = correct / total;
  return { score: Math.round(ratio * 100), correct, total, passed: ratio >= PASS_RATIO };
}

export function examBank(track) {
  const fromQuizzes = track.modules.flatMap((m) => m.quiz || []);
  return [...fromQuizzes, ...(track.exam || [])];
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffled(list, seed) {
  const rand = mulberry32(seed);
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildExam(track, seed) {
  const bank = examBank(track);
  const n = Math.min(track.examConfig?.questions ?? 20, bank.length);
  return shuffled(bank, seed).slice(0, n);
}
