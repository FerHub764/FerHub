// Junta o jogo inteiro num único HTML (sem <html>/<head>/<body>, que a
// hospedagem do artifact acrescenta). Uso: node tools/jogo/build-artifact.mjs <saida.html>
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const out = process.argv[2] || 'faisca.html';
const dir = path.resolve('site/jogo');
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const bundle = execFileSync('npx', ['--yes', 'esbuild@0.28.2', path.join(dir, 'js/main.js'), '--bundle', '--format=iife', '--minify', '--target=es2020', '--legal-comments=none'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const cut = (a, b) => html.slice(html.indexOf(a) + a.length, html.indexOf(b));
const head = cut('<!--build:head-->', '<!--/build:head-->');
const body = cut('<!--build:body-->', '<!--/build:body-->')
  .replace('<script type="module" src="js/main.js"></script>', () => `<script>${bundle.replace(/<\/script/gi, '<\\/script')}</script>`);
const page = `<title>Faísca</title>\n<meta name="description" content="Jogo de plataforma para celular: uma pequena brasa atravessa cavernas escuras com dash, pulo na parede e combos.">\n${head.trim()}\n${body.trim()}\n`;
fs.writeFileSync(out, page);
console.log(`${out}: ${(page.length / 1024).toFixed(0)} KB`);
