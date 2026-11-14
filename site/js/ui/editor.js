// Code editor: textarea with a highlighted overlay.

import { h } from './components.js';
import { highlight } from '../engine/highlight.js';

const INDENT = { python: '    ', java: '    ', csharp: '    ', c: '    ', cpp: '    ', rust: '    ', go: '\t', php: '    ', kotlin: '    ', swift: '    ' };

export function createEditor({ value = '', lang = 'text', label = 'Editor de código', filename, onChange, onRun, rows } = {}) {
  const indent = INDENT[lang] || '  ';
  const code = h('code');
  const pre = h('pre', { 'aria-hidden': 'true' }, code);
  const lineCount = Math.max(rows || 0, String(value).split('\n').length + 1, 5);
  const area = h('textarea', {
    spellcheck: 'false',
    autocapitalize: 'off',
    autocomplete: 'off',
    autocorrect: 'off',
    'aria-label': label,
    rows: Math.min(lineCount, 24),
  });
  area.value = value;
  let escaped = false;

  function paint() {
    // trailing newline keeps the overlay height in sync with the textarea
    code.innerHTML = highlight(area.value, lang) + '\n';
    pre.scrollTop = area.scrollTop;
    pre.scrollLeft = area.scrollLeft;
  }

  function insert(text) {
    const { selectionStart: s, selectionEnd: e } = area;
    area.setRangeText(text, s, e, 'end');
    area.dispatchEvent(new Event('input'));
  }

  area.addEventListener('input', () => { paint(); onChange && onChange(area.value); });
  area.addEventListener('scroll', () => { pre.scrollTop = area.scrollTop; pre.scrollLeft = area.scrollLeft; });
  area.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { escaped = true; return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun && onRun();
      return;
    }
    if (e.key === 'Tab' && !escaped) {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: end, value: v } = area;
      if (e.shiftKey) {
        const lineStart = v.lastIndexOf('\n', s - 1) + 1;
        if (v.startsWith(indent, lineStart)) {
          area.setRangeText('', lineStart, lineStart + indent.length, 'preserve');
          area.selectionStart = area.selectionEnd = Math.max(lineStart, s - indent.length);
          area.dispatchEvent(new Event('input'));
        }
      } else if (s !== end && v.slice(s, end).includes('\n')) {
        const lineStart = v.lastIndexOf('\n', s - 1) + 1;
        const block = v.slice(lineStart, end).replace(/^/gm, indent);
        area.setRangeText(block, lineStart, end, 'select');
        area.dispatchEvent(new Event('input'));
      } else insert(indent);
      return;
    }
    escaped = false;
    if (e.key === 'Enter' && !e.shiftKey) {
      const { selectionStart: s, value: v } = area;
      const lineStart = v.lastIndexOf('\n', s - 1) + 1;
      const current = v.slice(lineStart, s);
      let lead = current.match(/^[ \t]*/)[0];
      if (/[:{[(]\s*$/.test(current)) lead += indent;
      e.preventDefault();
      insert('\n' + lead);
    }
  });
  area.addEventListener('blur', () => { escaped = false; });

  paint();

  const el = h('div', { class: 'editor' },
    h('div', { class: 'editor-head' },
      h('span', { class: 'row', style: { gap: '10px' } },
        h('span', { class: 'editor-dots', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
        h('span', null, filename || lang)),
      h('span', { class: 'editor-hint' }, onRun ? 'Ctrl + Enter executa · Esc + Tab sai' : 'Esc + Tab sai do editor')),
    h('div', { class: 'editor-body' }, pre, area));

  return {
    el,
    textarea: area,
    getValue: () => area.value,
    setValue(v) { area.value = v; paint(); onChange && onChange(v); },
  };
}
