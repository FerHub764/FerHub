// Runs code snippets with local compilers/interpreters to verify lesson content.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { formatValue } from '../site/js/engine/runner.js';

const has = (cmd) => spawnSync('sh', ['-c', `command -v ${cmd}`]).status === 0;
const TOOLS = {
  python: () => has('python3'),
  javascript: () => true,
};
const cache = {};
export function available(lang) {
  if (!(lang in TOOLS)) return false;
  if (!(lang in cache)) cache[lang] = TOOLS[lang]();
  return cache[lang];
}

const PY_PRELUDE = `import builtins as _b, sys as _s
def _input(prompt=''):
    _s.stdout.write(str(prompt))
    line = _s.stdin.readline()
    if line == '':
        raise EOFError('EOF when reading a line')
    line = line.rstrip('\\n')
    _s.stdout.write(line + '\\n')
    return line
_b.input = _input
`;

function tmpdir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'dt-'));
}

function exec(cmd, args, { input = '', cwd } = {}) {
  const r = spawnSync(cmd, args, { input, cwd, encoding: 'utf8', timeout: 20000 });
  if (r.error) return { stdout: r.stdout || '', error: String(r.error) };
  return { stdout: r.stdout, error: r.status === 0 ? null : (r.stderr || `exit ${r.status}`).trim().split('\n').slice(-3).join(' | ') };
}

function runJs(code, stdin) {
  // emulate the browser worker: same console formatting
  const inputs = String(stdin || '').split('\n');
  let i = 0;
  let out = '';
  const log = (...a) => { out += a.map((v) => formatValue(v)).join(' ') + '\n'; };
  const fakeConsole = { log, info: log, warn: log, error: log, table: log };
  try {
    const timers = [];
    const fakeTimeout = (fn, ms) => timers.push([ms || 0, timers.length, fn]);
    new Function('console', 'prompt', 'setTimeout', 'alert', '"use strict";\n' + code)(fakeConsole, () => (i < inputs.length ? inputs[i++] : null), fakeTimeout, log);
    // run timers in time order (single level)
    timers.sort((a, b) => a[0] - b[0] || a[1] - b[1]).forEach(([, , fn]) => fn());
    return { stdout: out, error: null };
  } catch (e) {
    return { stdout: out, error: `${e.name}: ${e.message}` };
  }
}

export function runSnippet(lang, code, stdin = '', { full } = {}) {
  if (lang === 'python') return exec('python3', ['-c', PY_PRELUDE + code], { input: stdin || '' });
  if (lang === 'javascript') return runJs(code, stdin);
  return { stdout: '', error: `sem toolchain para ${lang}` };
}

export { tmpdir, exec };
