// Compact helpers for writing track content files.
//
// Multi-line text uses the `md` tag: it keeps backslashes literal (so "\n" in
// code samples stays "\n"), strips common indentation, and turns \` into `
// and \${ into ${.

export function dedent(text) {
  const lines = String(text).replace(/^\n/, '').replace(/\n[ \t]*$/, '').split('\n');
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^[ \t]*/)[0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min)).join('\n');
}

export function md(strings, ...values) {
  const raw = String.raw({ raw: strings.raw }, ...values);
  return dedent(raw.replace(/\\`/g, '`').replace(/\\\$\{/g, '${'));
}

const clean = (s) => (typeof s === 'string' ? s : s);

export const choice = (prompt, options, answer, explanation = '', code) =>
  ({ type: 'choice', prompt, options, answer, explanation, ...(code ? { code: clean(code) } : {}) });

export const predict = (prompt, code, answer, explanation = '') =>
  ({ type: 'predict', prompt, code, answer, explanation });

export const fill = (prompt, code, answer, explanation = '') =>
  ({ type: 'fill', prompt, code, answer, explanation });

export const bug = (prompt, code, answer, explanation = '') =>
  ({ type: 'find-bug', prompt, code, answer, explanation });

/** Runnable exercise (python/javascript tracks). Output compared with `expected`. */
export const run = (prompt, starter, expected, { hint, solution, stdin } = {}) =>
  ({ type: 'code', prompt, starter, expected, hint, solution, stdin });

/** HTML/CSS exercise checked against the rendered preview. */
export const web = (prompt, { html = '', css = '', checks, hint, solution }) =>
  ({ type: 'web', prompt, html, css, checks, hint, solution });

export const lesson = (title, content, exercises = []) => ({ title, content, exercises });

export const mod = (id, title, summary, lessons, quiz) => ({ id, title, summary, lessons, quiz });

export function defineTrack(meta, modules, exam = []) {
  const principal = meta.level === 'principal';
  return {
    runtime: null,
    examConfig: principal ? { questions: 25, minutes: 40 } : { questions: 15, minutes: 25 },
    ...meta,
    modules: modules.map((m) => ({
      ...m,
      lessons: m.lessons.map((l, i) => ({ id: 'l' + (i + 1), ...l })),
      quiz: m.quiz.map((q, i) => ({ id: `${m.id}-q${i + 1}`, ...q })),
    })),
    exam: exam.map((q, i) => ({ id: `prova-q${i + 1}`, ...q })),
  };
}
