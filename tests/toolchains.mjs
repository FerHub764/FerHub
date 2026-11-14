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
  java: () => has('java'),
  c: () => has('gcc'),
  cpp: () => has('g++'),
  go: () => has('go'),
  rust: () => has('rustc'),
  php: () => has('php'),
  sql: () => has('python3'),
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
  // same console formatting as the browser worker, real event loop
  const prelude = `const formatValue = ${formatValue.toString()};
const __out = (...a) => process.stdout.write(a.map((v) => formatValue(v)).join(' ') + '\\n');
console.log = console.info = console.warn = console.error = console.table = __out;
globalThis.alert = __out;
const __inputs = require('fs').readFileSync(0, 'utf8').split('\\n');
let __i = 0;
globalThis.prompt = () => (__i < __inputs.length ? __inputs[__i++] : null);
`;
  const wrapped = `${prelude}\n(async () => { "use strict";\n${code}\n})().catch((e) => { process.stderr.write((e && e.name ? e.name + ': ' + e.message : String(e))); process.exitCode = 1; });`;
  return exec('node', ['-e', wrapped], { input: stdin || '' });
}

const SQL_RUNNER = `
import sqlite3, sys
code = sys.stdin.read()
db = sqlite3.connect(':memory:')
stmts = [s for s in [x.strip() for x in code.split(';')] if s]
out = []
for st in stmts:
    cur = db.execute(st)
    if st.lower().lstrip('(').startswith(('select', 'with')):
        out = ['|'.join('NULL' if v is None else str(v) for v in row) for row in cur.fetchall()]
print('\\n'.join(out))
`;

function compileAndRun(files, compile, runCmd, stdin) {
  const d = tmpdir();
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(d, name), text);
  if (compile) {
    const c = exec(compile[0], compile.slice(1), { cwd: d });
    if (c.error) return { stdout: '', error: 'compilacao: ' + c.error };
  }
  return exec(runCmd[0], runCmd.slice(1), { cwd: d, input: stdin || '' });
}

export function runSnippet(lang, code, stdin = '', { full } = {}) {
  if (lang === 'python') return exec('python3', ['-c', PY_PRELUDE + code], { input: stdin || '' });
  if (lang === 'javascript') return runJs(code, stdin);
  if (lang === 'sql') return exec('python3', ['-c', SQL_RUNNER], { input: code });
  if (lang === 'java') {
    const src = /\bclass\s+\w+/.test(code) ? code : `public class Main {\n  public static void main(String[] args) {\n${code}\n  }\n}`;
    const imports = /import java\.util/.test(src) ? '' : 'import java.util.*;\n';
    return compileAndRun({ 'Main.java': imports + src }, ['javac', '-encoding', 'UTF-8', '-nowarn', 'Main.java'], ['java', '-Duser.language=en', '-Dfile.encoding=UTF-8', '-Dstdout.encoding=UTF-8', '-cp', '.', 'Main'], stdin);
  }
  if (lang === 'c') {
    const src = /\bmain\s*\(/.test(code) ? code : `#include <stdio.h>\n#include <string.h>\n#include <stdlib.h>\n#include <stdbool.h>\nint main(void) {\n${code}\nreturn 0;\n}`;
    return compileAndRun({ 'm.c': src }, ['gcc', '-std=c11', '-w', '-o', 'a.out', 'm.c', '-lm'], ['./a.out'], stdin);
  }
  if (lang === 'cpp') {
    const src = /\bmain\s*\(/.test(code) ? code : `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n${code}\nreturn 0;\n}`;
    return compileAndRun({ 'm.cpp': src }, ['g++', '-std=c++20', '-w', '-o', 'a.out', 'm.cpp'], ['./a.out'], stdin);
  }
  if (lang === 'go') {
    const src = /package main/.test(code) ? code : `package main\n\nimport "fmt"\n\nfunc main() {\n${code}\n}`;
    return compileAndRun({ 'main.go': src }, null, ['go', 'run', 'main.go'], stdin);
  }
  if (lang === 'rust') {
    const src = /fn main/.test(code) ? code : `#![allow(unused)]\nfn main() {\n${code}\n}`;
    return compileAndRun({ 'm.rs': src }, ['rustc', '-A', 'warnings', '-o', 'a.out', 'm.rs'], ['./a.out'], stdin);
  }
  if (lang === 'php') {
    const src = code.trimStart().startsWith('<?php') ? code : '<?php\n' + code;
    return compileAndRun({ 'm.php': src }, null, ['php', 'm.php'], stdin);
  }
  return { stdout: '', error: `sem toolchain para ${lang}` };
}

export { tmpdir, exec };
