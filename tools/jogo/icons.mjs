// Gera os ícones PNG do app (tela inicial do celular) desenhando a Faísca
// com o mesmo código de pixel art do jogo. Uso: node tools/jogo/icons.mjs
import path from 'node:path';
import fs from 'node:fs';
import { startServer, loadPlaywright } from '../../tests/e2e/server.mjs';

const root = path.resolve('site');
const { server, url } = await startServer(root);
const browser = await loadPlaywright().chromium.launch();
const page = await browser.newPage();
await page.goto(`${url}/jogo/index.html`);
const out = await page.evaluate(async () => {
  const { buildPlayerFrames, SKINS } = await import('./js/sprites.js');
  const fr = buildPlayerFrames(SKINS[0]).happy[0];
  const make = (size, pad) => {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(size / 2, size * 0.58, 0, size / 2, size * 0.58, size * 0.6);
    grd.addColorStop(0, '#5a2414'); grd.addColorStop(0.55, '#24101a'); grd.addColorStop(1, '#0d0710');
    g.fillStyle = grd; g.fillRect(0, 0, size, size);
    const s = Math.floor((size * (1 - pad * 2)) / 20);
    g.imageSmoothingEnabled = false;
    g.drawImage(fr.img, Math.round((size - 20 * s) / 2), Math.round((size - 20 * s) / 2 - s), 20 * s, 20 * s);
    return c.toDataURL('image/png');
  };
  return { i192: make(192, 0.12), i512: make(512, 0.16), apple: make(180, 0.1) };
});
const dir = path.join(root, 'jogo', 'icons');
fs.mkdirSync(dir, { recursive: true });
const save = (name, data) => fs.writeFileSync(path.join(dir, name), Buffer.from(data.split(',')[1], 'base64'));
save('icon-192.png', out.i192);
save('icon-512.png', out.i512);
save('apple-touch-icon.png', out.apple);
console.log('ícones gerados em', dir);
await browser.close();
server.close();
