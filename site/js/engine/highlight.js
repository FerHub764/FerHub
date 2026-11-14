// Tiny regex-based syntax highlighter. Returns HTML.

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const KW = {
  python: 'and as assert async await break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield match case self',
  javascript: 'async await break case catch class const continue debugger default delete do else export extends false finally for from function if import in instanceof let new null of return static super switch this throw true try typeof undefined var void while yield',
  typescript: 'any as async await boolean break case catch class const continue default do else enum export extends false finally for from function if implements import in interface let new null number of private public readonly return string switch this throw true try type typeof undefined var void while',
  java: 'abstract boolean break byte case catch char class continue default do double else enum extends false final finally float for if implements import instanceof int interface long new null package private protected public return short static super switch this throw throws true try var void while record String',
  c: 'auto break case char const continue default do double else enum extern float for goto if int long register return short signed sizeof static struct switch typedef union unsigned void volatile while NULL bool true false include define',
  cpp: 'auto bool break case catch char class const constexpr continue default delete do double else enum explicit false float for friend if inline int long namespace new nullptr operator private protected public return short signed sizeof static struct switch template this throw true try typedef typename union unsigned using virtual void while include std string vector cout cin endl',
  csharp: 'abstract as base bool break case catch char class const continue decimal default do double else enum false finally float for foreach if in int interface internal is long namespace new null object out override private protected public readonly ref return static string struct switch this throw true try using var virtual void while async await get set record',
  go: 'break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var nil true false int string bool float64 error byte rune make len append',
  rust: 'as async await break const continue crate else enum false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while Some None Ok Err String Vec i32 i64 u32 u8 f64 bool usize str Option Result',
  php: 'abstract and array as break case catch class const continue default do echo else elseif empty extends false final for foreach function if implements include interface isset list namespace new null or print private protected public require return static switch throw true try use var while fn match',
  kotlin: 'as break class continue data do else false for fun if in interface is null object override package private protected public return super this throw true try typealias val var when while Int String Boolean Double List listOf mutableListOf println',
  swift: 'as break case catch class continue default defer do else enum extension false for func guard if import in init inout is let nil private protocol public return self static struct switch throw throws true try var where while Int String Bool Double print',
  sql: 'select from where and or not insert into values update set delete create table drop alter add primary key foreign references join inner left right outer on group by order having limit as distinct count sum avg min max null is in like between union all index view integer int text varchar real date default unique case when then else end asc desc',
  bash: 'git cd ls mkdir echo cat rm mv cp touch init add commit push pull clone status log branch checkout switch merge rebase remote fetch diff stash reset restore tag',
};
KW.html = '';
KW.css = '';

const COMMENT = {
  python: ['#'], bash: ['#'], sql: ['--'], php: ['//', '#'],
};

const cache = {};
function buildRegex(lang) {
  if (cache[lang]) return cache[lang];
  const line = (COMMENT[lang] || ['//']).map((c) => c.replace(/[/#-]/g, '\\$&') + '[^\\n]*').join('|');
  const block = lang === 'python' ? '"""[\\s\\S]*?"""|\'\'\'[\\s\\S]*?\'\'\'' : '\\/\\*[\\s\\S]*?\\*\\/';
  const parts = [
    `(?<c>${block}|${line})`,
    `(?<s>"(?:\\\\.|[^"\\\\\\n])*"|'(?:\\\\.|[^'\\\\\\n])*'${lang === 'javascript' || lang === 'typescript' || lang === 'go' ? '|`[\\s\\S]*?`' : ''})`,
    '(?<n>\\b\\d+(?:\\.\\d+)?[fFLdm]?\\b)',
    '(?<w>[A-Za-z_$@][\\w$]*)',
  ];
  cache[lang] = new RegExp(parts.join('|'), 'g');
  return cache[lang];
}

function highlightCode(code, lang) {
  const words = new Set((KW[lang] || KW.javascript).split(' '));
  const ci = lang === 'sql';
  const re = buildRegex(lang);
  let out = '';
  let last = 0;
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index));
    const text = m[0];
    const g = m.groups;
    if (g.c !== undefined) out += `<span class="tok-c">${esc(text)}</span>`;
    else if (g.s !== undefined) out += `<span class="tok-s">${esc(text)}</span>`;
    else if (g.n !== undefined) out += `<span class="tok-n">${esc(text)}</span>`;
    else {
      const key = ci ? text.toLowerCase() : text;
      const next = code.slice(re.lastIndex).match(/^\s*\(/);
      if (words.has(key)) out += `<span class="tok-k">${esc(text)}</span>`;
      else if (next) out += `<span class="tok-f">${esc(text)}</span>`;
      else if (/^[A-Z][a-z]/.test(text) && lang !== 'sql') out += `<span class="tok-t">${esc(text)}</span>`;
      else if (text.startsWith('$') || text.startsWith('@')) out += `<span class="tok-a">${esc(text)}</span>`;
      else out += esc(text);
    }
    last = re.lastIndex;
  }
  return out + esc(code.slice(last));
}

function highlightHtml(code) {
  let out = '';
  const re = /(<!--[\s\S]*?-->)|(<\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?>)|(<!DOCTYPE[^>]*>)/g;
  let last = 0;
  let m;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index));
    if (m[1]) out += `<span class="tok-c">${esc(m[1])}</span>`;
    else if (m[6]) out += `<span class="tok-c">${esc(m[6])}</span>`;
    else {
      const attrs = esc(m[4]).replace(/([\w-:@]+)(=)(&quot;[^&]*?&quot;|"[^"]*"|'[^']*')?/g,
        (_, n, eq, v) => `<span class="tok-a">${n}</span>${eq}${v ? `<span class="tok-s">${v}</span>` : ''}`);
      out += `<span class="tok-p">${esc(m[2])}</span><span class="tok-tag">${m[3]}</span>${attrs}<span class="tok-p">${esc(m[5])}</span>`;
    }
    last = re.lastIndex;
  }
  return out + esc(code.slice(last));
}

function highlightCss(code) {
  return code.replace(/\/\*[\s\S]*?\*\/|([^{}]+)(\{)|([\w-]+)(\s*:\s*)([^;{}]+)(;?)|[^]/g, (m, sel, br, prop, colon, val, semi) => {
    if (m.startsWith('/*')) return `<span class="tok-c">${esc(m)}</span>`;
    if (sel !== undefined) return `<span class="tok-tag">${esc(sel)}</span>${br}`;
    if (prop !== undefined) {
      const v = esc(val).replace(/(#[0-9a-fA-F]{3,8}|\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms|fr|deg)?\b)/g, '<span class="tok-n">$1</span>');
      return `<span class="tok-a">${esc(prop)}</span>${colon}${v}${semi}`;
    }
    return esc(m);
  });
}

const ALIASES = { js: 'javascript', py: 'python', 'c++': 'cpp', cs: 'csharp', 'c#': 'csharp', sh: 'bash', shell: 'bash', git: 'bash', ts: 'typescript', xml: 'html', kt: 'kotlin', rs: 'rust' };

export function resolveLang(lang) {
  const l = String(lang || '').toLowerCase();
  return ALIASES[l] || l;
}

export function highlight(code, lang) {
  const l = resolveLang(lang);
  if (l === 'html') return highlightHtml(code);
  if (l === 'css') return highlightCss(code);
  if (!l || l === 'text' || l === 'txt' || l === 'output') return esc(code);
  return highlightCode(code, l);
}
