// Minimal Markdown renderer for lesson content.
// Supports: ## / ### headings, paragraphs, - and 1. lists, ~~~ or ``` fences,
// > callouts (💡 tip, ⚠️ warn, otherwise info), | tables |, `code`, **bold**,
// *italic*, [links](url).

import { highlight, resolveLang } from './highlight.js';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function inline(text) {
  const codes = [];
  let s = text.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  });
  s = esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\n]+)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|#)[^)\s]+)\)/g, (_, label, url) => {
      const external = url.startsWith('http');
      return `<a href="${url}"${external ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`;
    });
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[Number(i)])}</code>`);
}

export function codeBlock(code, lang) {
  const l = resolveLang(lang);
  const label = l ? ` data-lang="${esc(lang)}"` : '';
  return `<pre class="code"${label}><code>${highlight(code, l)}</code></pre>`;
}

export function renderMarkdown(src) {
  const lines = String(src).replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let i = 0;
  const isBlockStart = (l) => /^(#{1,4} |~~~|```|> |- |\* |\d+\. |\|)/.test(l);

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    const fence = line.match(/^(~~~|```)\s*([\w+#-]*)/);
    if (fence) {
      const body = [];
      i++;
      while (i < lines.length && !lines[i].startsWith(fence[1])) body.push(lines[i++]);
      i++;
      out.push(codeBlock(body.join('\n'), fence[2]));
      continue;
    }

    const heading = line.match(/^(#{1,4}) (.*)/);
    if (heading) {
      const level = Math.min(4, heading[1].length + 1);
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      i++;
      continue;
    }

    if (line.startsWith('> ')) {
      const body = [];
      while (i < lines.length && lines[i].startsWith('>')) body.push(lines[i++].replace(/^> ?/, ''));
      let text = body.join(' ').trim();
      let kind = 'info';
      let emoji = 'ℹ️';
      if (text.startsWith('💡')) { kind = 'tip'; emoji = '💡'; text = text.slice(2).trim(); }
      else if (text.startsWith('⚠️')) { kind = 'warn'; emoji = '⚠️'; text = text.slice(2).trim(); }
      out.push(`<div class="callout ${kind}"><span class="callout-icon" aria-hidden="true">${emoji}</span><div><p>${inline(text)}</p></div></div>`);
      continue;
    }

    if (/^(- |\* )/.test(line)) {
      const items = [];
      while (i < lines.length && /^(- |\* )/.test(lines[i])) {
        let item = lines[i++].slice(2);
        while (i < lines.length && /^ {2,}\S/.test(lines[i])) item += ' ' + lines[i++].trim();
        items.push(`<li>${inline(item)}</li>`);
      }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        let item = lines[i++].replace(/^\d+\. /, '');
        while (i < lines.length && /^ {2,}\S/.test(lines[i])) item += ' ' + lines[i++].trim();
        items.push(`<li>${inline(item)}</li>`);
      }
      out.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    if (line.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      const cells = (r) => r.replace(/^\||\|\s*$/g, '').split('|').map((c) => c.trim());
      const head = cells(rows[0]);
      const bodyRows = rows.slice(1).filter((r) => !/^\|[\s:|-]+\|?\s*$/.test(r));
      out.push(`<div class="table-wrap"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${bodyRows
        .map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }

    const para = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) para.push(lines[i++]);
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return out.join('\n');
}
