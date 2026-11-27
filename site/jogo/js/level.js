// Converte o mapa em texto de uma fase em dados prontos para o jogo.
// Legenda (o caractere "|" é só régua visual e é ignorado):
//   .  ar            #  rocha           =  plataforma de madeira (atravessável por baixo)
//   i  gelo          X  bloco que desmorona
//   ^ v < >  espinhos (a ponta indica a direção)      ~  água
//   !  marcador invisível onde plataformas móveis voltam
//   P  início        C  lanterna (checkpoint)        E  braseiro (saída)
//   o  brasa         G  gema de chama                f  orbe de fogo (recarrega o dash)
//   J  cogumelo-mola ?  placa com dica               T  tocha   *  cristal (enfeites com luz)
//   s  lodo   b  morcego   h  ouriço   k  besouro de cristal   t  cuspidor   D  goteira
//   M  plataforma móvel horizontal (sequência = largura)    N  plataforma móvel vertical
import { TILE as T } from './config.js';
import { TL } from './physics.js';

const TILES = { '#': TL.SOLID, '=': TL.ONEWAY, '^': TL.SPIKE_U, 'v': TL.SPIKE_D, '<': TL.SPIKE_L, '>': TL.SPIKE_R, '~': TL.WATER, 'i': TL.ICE, '!': TL.MARK, 'X': TL.CRUMBLE };
const ENTS = new Set(['o', 'G', 's', 'b', 'h', 'k', 't', 'D', 'f', 'J', 'C', 'E', 'T', '*', '?']);

export function parseLevel(def) {
  const rows = def.map.map((r) => r.replace(/\|/g, ''));
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const grid = new Uint8Array(w * h);
  const ents = [];
  const platforms = [];
  let start = null;
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < w; x++) {
      const ch = row[x] || '.';
      if (ch === '.' || ch === ' ') continue;
      const t = TILES[ch];
      if (t !== undefined) { grid[y * w + x] = t; continue; }
      if (ch === 'P') { start = { x: x * T + T / 2, y: (y + 1) * T }; continue; }
      if (ch === 'M' || ch === 'N') {
        const prev = platforms[platforms.length - 1];
        if (prev && prev.kind === ch && prev.ty === y && prev.tx + prev.len === x) prev.len++;
        else platforms.push({ kind: ch, tx: x, ty: y, len: 1 });
        continue;
      }
      if (ENTS.has(ch)) {
        const e = { type: ch, tx: x, ty: y, x: x * T, y: y * T };

        ents.push(e);
        continue;
      }
      throw new Error(`Fase ${def.id}: caractere desconhecido "${ch}" em (${x}, ${y})`);
    }
  }
  // Dicas seguem a ordem em que o jogador encontra as placas (da esquerda para a direita).
  ents.filter((e) => e.type === '?').sort((a, b) => a.tx - b.tx || a.ty - b.ty).forEach((e, i) => { e.hint = i; });
  if (!start) throw new Error(`Fase ${def.id}: sem ponto de início (P)`);
  if (!ents.some((e) => e.type === 'E')) throw new Error(`Fase ${def.id}: sem saída (E)`);
  return { id: def.id, w, h, grid, base: grid.slice(), ents, platforms, start };
}

// Mundo mínimo com consulta de blocos, usado pelo jogo e pelo verificador.
export function makeWorld(parsed) {
  const { w, h } = parsed;
  const grid = parsed.base.slice();
  return {
    w, h, grid,
    tileAt(tx, ty) {
      if (tx < 0 || tx >= w) return TL.SOLID;
      if (ty < 0 || ty >= h) return TL.EMPTY;
      return grid[ty * w + tx];
    },
    setTile(tx, ty, c) { if (tx >= 0 && tx < w && ty >= 0 && ty < h) grid[ty * w + tx] = c; },
    platforms: [],
    springs: [],
    orbs: [],
  };
}

export function buildPlatforms(parsed, speed = 0.8) {
  return parsed.platforms.map((p) => ({
    kind: p.kind,
    x: p.tx * T, y: p.ty * T + 2, w: p.len * T, h: 7,
    x0: p.tx * T, y0: p.ty * T + 2,
    dir: p.kind === 'M' ? 1 : -1,
    speed,
    dx: 0, dy: 0,
  }));
}

// Avança uma plataforma móvel; ela volta ao encostar em rocha ou num marcador "!".
export function stepPlatform(pl, world) {
  const blocked = (c) => c === TL.SOLID || c === TL.MARK || c === TL.ICE || c === TL.CRUMBLE;
  const v = pl.dir * pl.speed;
  if (pl.kind === 'M') {
    const edge = v > 0 ? pl.x + pl.w + v : pl.x + v;
    const tx = Math.floor((v > 0 ? edge - 0.001 : edge) / T);
    const ty = Math.floor((pl.y + 1) / T);
    if (blocked(world.tileAt(tx, ty))) { pl.dir = -pl.dir; pl.dx = 0; pl.dy = 0; return; }
    pl.x += v; pl.dx = v; pl.dy = 0;
  } else {
    const edge = v > 0 ? pl.y + pl.h + v : pl.y - 2 + v;
    const ty = Math.floor(edge / T);
    const x0 = Math.floor(pl.x / T), x1 = Math.floor((pl.x + pl.w - 0.001) / T);
    let hit = false;
    for (let tx = x0; tx <= x1; tx++) if (blocked(world.tileAt(tx, ty))) hit = true;
    if (hit || edge < 0 || edge > world.h * T) { pl.dir = -pl.dir; pl.dx = 0; pl.dy = 0; return; }
    pl.y += v; pl.dy = v; pl.dx = 0;
  }
}
