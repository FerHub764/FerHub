// Runs learner code in the browser.
// JavaScript and Python run inside Web Workers so an infinite loop can be
// stopped (worker.terminate) without freezing the page.

export const DEFAULT_TIMEOUT = 5000;
const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';

// ---------- Pure helpers ----------

export function formatValue(value, seen = new WeakSet(), nested = false) {
  if (typeof value === 'string') return nested ? JSON.stringify(value) : value;
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'function') return `[Function ${value.name || 'anônima'}]`;
  if (typeof value === 'bigint') return value + 'n';
  if (typeof value !== 'object') return String(value);
  if (seen.has(value)) return '[Circular]';
  seen.add(value);
  let out;
  if (Array.isArray(value)) {
    out = '[' + value.map((v) => formatValue(v, seen, true)).join(', ') + ']';
  } else if (value instanceof Map) {
    out = `Map(${value.size}) { ${[...value].map(([k, v]) => `${formatValue(k, seen, true)} => ${formatValue(v, seen, true)}`).join(', ')} }`;
  } else if (value instanceof Set) {
    out = `Set(${value.size}) { ${[...value].map((v) => formatValue(v, seen, true)).join(', ')} }`;
  } else if (value instanceof Error) {
    out = `${value.name}: ${value.message}`;
  } else {
    const entries = Object.entries(value);
    const name = value.constructor && value.constructor !== Object ? value.constructor.name + ' ' : '';
    out = entries.length
      ? `${name}{ ${entries.map(([k, v]) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${formatValue(v, seen, true)}`).join(', ')} }`
      : name + '{}';
  }
  seen.delete(value);
  return out;
}

const normalizeOutput = (text) =>
  String(text).replace(/\r\n?/g, '\n').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '').replace(/^\n+/, '');

export function checkOutput(expected, actual) {
  if (actual === null || actual === undefined) return false;
  return normalizeOutput(expected) === normalizeOutput(actual);
}

export function renderPreview(html, css) {
  const safeCss = String(css || '').replace(/</g, '\\3c ');
  const style = `<style>body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;margin:16px;line-height:1.5;color:#1b1f24}</style><style>${safeCss}</style>`;
  const body = String(html || '');
  if (/<head[^>]*>/i.test(body)) return body.replace(/<head[^>]*>/i, (m) => `${m}<meta charset="utf-8">${style}`);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">${style}</head><body>${body}</body></html>`;
}

export function cleanPythonError(traceback) {
  const text = String(traceback || '').trim();
  const lines = text.split('\n');
  const last = lines[lines.length - 1] || text;
  let lineNo = null;
  for (const l of lines) {
    const m = l.match(/File "<exec>", line (\d+)/);
    if (m) lineNo = m[1];
  }
  return lineNo ? `Linha ${lineNo}: ${last}` : last;
}

// ---------- Workers ----------

function jsWorkerSource() {
  return `
const formatValue = ${formatValue.toString()};
self.onmessage = async (e) => {
  const { code, stdin } = e.data;
  const inputs = String(stdin || '').split('\\n');
  let inputIndex = 0;
  let pending = 0;
  let finished = false;
  let failed = null;
  const send = (msg) => self.postMessage(msg);
  const log = (...args) => send({ type: 'out', text: args.map((a) => formatValue(a)).join(' ') + '\\n' });
  const fakeConsole = { log, info: log, warn: log, error: log, debug: log, table: log };
  const fakePrompt = () => (inputIndex < inputs.length ? inputs[inputIndex++] : null);
  const report = (err) => { failed = failed || ((err && err.name ? err.name + ': ' + err.message : String(err))); };
  const done = () => { if (finished && pending === 0) send({ type: 'done', error: failed }); };
  const realTimeout = self.setTimeout.bind(self);
  const trackedTimeout = (fn, ms, ...args) => {
    pending++;
    return realTimeout(() => {
      pending--;
      try { typeof fn === 'function' && fn(...args); } catch (err) { report(err); }
      done();
    }, ms);
  };
  try {
    const AsyncFunction = (async () => {}).constructor;
    const fn = new AsyncFunction('console', 'prompt', 'setTimeout', 'alert', '"use strict";\\n' + code);
    await fn(fakeConsole, fakePrompt, trackedTimeout, log);
  } catch (err) {
    report(err);
  }
  finished = true;
  // let pending promise callbacks run
  realTimeout(done, 0);
};`;
}

function pyWorkerSource() {
  return `
importScripts(${JSON.stringify(PYODIDE_URL)});
let py = null;
const ready = loadPyodide().then((p) => { py = p; self.postMessage({ type: 'ready' }); })
  .catch((err) => self.postMessage({ type: 'load-error', error: String(err) }));
self.onmessage = async (e) => {
  await ready;
  if (!py) return;
  const { code, stdin } = e.data;
  const inputs = String(stdin || '').split('\\n');
  let inputIndex = 0;
  const decoder = new TextDecoder();
  const send = (text) => self.postMessage({ type: 'out', text });
  py.setStdout({ write: (buf) => { send(decoder.decode(buf)); return buf.length; } });
  py.setStderr({ write: (buf) => { send(decoder.decode(buf)); return buf.length; } });
  py.setStdin({ stdin: () => {
    if (inputIndex >= inputs.length) return undefined;
    const line = inputs[inputIndex++];
    send(line + '\\n');
    return line;
  } });
  try {
    const ns = py.globals.get('dict')();
    await py.runPythonAsync(code, { globals: ns });
    ns.destroy();
    self.postMessage({ type: 'done' });
  } catch (err) {
    self.postMessage({ type: 'done', error: String(err && err.message || err), python: true });
  }
};`;
}

function makeWorker(source) {
  const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  const worker = new Worker(url);
  URL.revokeObjectURL(url);
  return worker;
}

function execute(worker, payload, timeoutMs, onTimeout) {
  return new Promise((resolve) => {
    let stdout = '';
    const timer = setTimeout(() => {
      cleanup();
      onTimeout();
      resolve({
        stdout,
        error: `Tempo esgotado: o código rodou por mais de ${Math.round(timeoutMs / 1000)} segundos e foi interrompido. Verifique se há um loop infinito.`,
        timedOut: true,
      });
    }, timeoutMs);
    function onMessage(e) {
      const msg = e.data;
      if (msg.type === 'out') stdout += msg.text;
      else if (msg.type === 'done') {
        cleanup();
        resolve({ stdout, error: msg.error ? (msg.python ? cleanPythonError(msg.error) : msg.error) : undefined });
      }
    }
    function onError(e) {
      cleanup();
      resolve({ stdout, error: e.message || 'Erro ao executar o código.' });
    }
    function cleanup() {
      clearTimeout(timer);
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
    }
    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);
    worker.postMessage(payload);
  });
}

export function runJavaScript(code, { timeoutMs = DEFAULT_TIMEOUT, stdin = '' } = {}) {
  const worker = makeWorker(jsWorkerSource());
  return execute(worker, { code, stdin }, timeoutMs, () => {}).finally(() => worker.terminate());
}

let pyWorker = null;
let pyReady = null;

export function pythonStatus() {
  if (!pyWorker) return 'idle';
  return pyReady && pyReady.done ? 'ready' : 'loading';
}

function ensurePython() {
  if (pyWorker && pyReady) return pyReady.promise;
  pyWorker = makeWorker(pyWorkerSource());
  const state = { done: false };
  state.promise = new Promise((resolve, reject) => {
    const onMsg = (e) => {
      if (e.data.type === 'ready') { state.done = true; pyWorker.removeEventListener('message', onMsg); resolve(); }
      if (e.data.type === 'load-error') { pyWorker.removeEventListener('message', onMsg); reject(new Error(e.data.error)); }
    };
    pyWorker.addEventListener('message', onMsg);
    pyWorker.addEventListener('error', (e) => reject(new Error(e.message || 'falha ao carregar Python')), { once: true });
  });
  pyReady = state;
  return state.promise;
}

function killPython() {
  if (pyWorker) pyWorker.terminate();
  pyWorker = null;
  pyReady = null;
}

export async function runPython(code, { timeoutMs = DEFAULT_TIMEOUT, stdin = '' } = {}) {
  try {
    await Promise.race([
      ensurePython(),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 90000)),
    ]);
  } catch {
    killPython();
    return { stdout: '', error: 'Não foi possível carregar o Python. Verifique sua conexão com a internet e tente de novo.' };
  }
  return execute(pyWorker, { code, stdin }, timeoutMs, killPython);
}

export function runCode(runtime, code, opts) {
  if (runtime === 'python') return runPython(code, opts);
  if (runtime === 'javascript') return runJavaScript(code, opts);
  return Promise.resolve({ stdout: '', error: 'Esta linguagem não roda no navegador.' });
}

// ---------- Web (HTML/CSS) checks ----------

function normColor(doc, value) {
  const probe = doc.createElement('span');
  probe.style.color = value;
  doc.body.appendChild(probe);
  const out = doc.defaultView.getComputedStyle(probe).color;
  probe.remove();
  return out;
}

const COLOR_PROPS = /color|background|border-color|fill|stroke/;

/**
 * checks: [{ selector, exists=true, count, min, text, attr: {name: value|true}, style: {prop: value}, message }]
 */
export function checkWeb(doc, checks) {
  const failures = [];
  for (const c of checks) {
    let els;
    try { els = [...doc.querySelectorAll(c.selector)]; } catch { els = []; }
    const fail = (fallback) => failures.push(c.message || fallback);
    if (c.exists === false) {
      if (els.length) fail(`Não deveria existir "${c.selector}".`);
      continue;
    }
    if (!els.length) { fail(`Não encontrei nenhum elemento "${c.selector}".`); continue; }
    if (c.count !== undefined && els.length !== c.count) { fail(`Esperava ${c.count} elemento(s) "${c.selector}", achei ${els.length}.`); continue; }
    if (c.min !== undefined && els.length < c.min) { fail(`Esperava pelo menos ${c.min} "${c.selector}", achei ${els.length}.`); continue; }
    if (c.text !== undefined && !els.some((el) => el.textContent.toLowerCase().includes(String(c.text).toLowerCase()))) {
      fail(`"${c.selector}" deveria conter o texto "${c.text}".`); continue;
    }
    if (c.attr) {
      const ok = Object.entries(c.attr).every(([name, val]) => els.some((el) => (val === true ? el.hasAttribute(name) : el.getAttribute(name) === val)));
      if (!ok) { fail(`"${c.selector}" não tem o atributo esperado (${Object.keys(c.attr).join(', ')}).`); continue; }
    }
    if (c.style) {
      const win = doc.defaultView;
      const ok = Object.entries(c.style).every(([prop, val]) => els.some((el) => {
        const actual = win.getComputedStyle(el).getPropertyValue(prop).trim();
        if (COLOR_PROPS.test(prop)) return actual.includes(normColor(doc, val));
        return actual === String(val);
      }));
      if (!ok) { fail(`O estilo de "${c.selector}" ainda não está como pedido (${Object.keys(c.style).join(', ')}).`); continue; }
    }
  }
  return { passed: failures.length === 0, failures };
}
