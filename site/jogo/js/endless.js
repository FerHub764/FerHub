// Modo Fuga da Escuridão: uma corrida montada com trechos sorteados.
// Cada trecho tem 16 colunas e chão na linha 14 nas duas pontas, então
// qualquer sequência se encaixa. A escuridão avança pela esquerda e fica
// mais rápida quanto mais longe você vai.
import { TILE as T } from './config.js';
import { Game } from './game.js';
import { THEMES } from './themes.js';

export const CHUNK_W = 16;
const A = '................';
const F = '################';

// zone: 0 âmbar, 1 cristal, 2 marés (omitida = qualquer uma)
export const CHUNKS = [
  { id: 'plano', tier: 1, rows: [A, A, A, A, A, A, A, '.......oo.......', '.....o....o.....', A, A, A, F, F, F, F] },
  { id: 'lodo', tier: 1, rows: [A, A, A, A, A, A, '......ooo.......', A, A, A, A, '........s.......', F, F, F, F] },
  { id: 'buraco', tier: 1, rows: [A, A, A, A, A, A, A, '......ooo.......', A, A, A, A, '######...#######', '######...#######', '######...#######', '######...#######'] },
  { id: 'degrau', tier: 1, rows: [A, A, A, A, A, A, A, A, A, '.....ooooo......', '....########....', '....########....', F, F, F, F] },
  { id: 'morcego', tier: 1, rows: [A, A, A, A, A, '........b.......', A, A, '......oooo......', A, A, A, F, F, F, F] },
  { id: 'espinhos', tier: 1, rows: [A, A, A, A, A, A, A, A, '.....oooo.......', A, A, '.....^^^^.......', F, F, F, F] },
  { id: 'plataforma', tier: 2, rows: [A, A, A, A, A, A, A, '......oooo......', A, '......====......', A, A, '###..........###', '###..........###', '###..........###', '###..........###'] },
  { id: 'ourico', tier: 2, rows: [A, A, A, A, A, A, A, A, '..........oo....', A, A, '.......h........', F, F, F, F] },
  { id: 'vao', tier: 2, rows: [A, A, A, A, A, A, A, '....oooooooo....', A, A, A, A, '####........####', '####........####', '####........####', '####........####'] },
  { id: 'mola', tier: 2, rows: [A, A, A, '.......ooo......', '.......###......', '.......###......', '.......###......', '.......###......', '.......###......', '.......###......', '.......###......', '.....J.###......', F, F, F, F] },
  { id: 'orbes', tier: 3, rows: [A, A, A, A, A, '.....o...o......', A, '......f...f.....', A, A, A, A, '##............##', '##............##', '##............##', '##............##'] },
  { id: 'pilares', tier: 2, rows: [A, A, A, A, A, A, A, A, '.....o...o......', A, '.....#...#......', '.....#...#......', '##...#...#....##', '##...#...#....##', '##...#...#....##', '##...#...#....##'] },
  { id: 'combo', tier: 2, rows: [A, A, A, A, A, A, A, '.....oo..oo.....', A, A, '.....s...s......', '.....##..##.....', '###..##..##..###', '###..##..##..###', '###..##..##..###', '###..##..##..###'] },
  { id: 'tunel', tier: 2, rows: ['...##########...', '...##########...', '...##########...', '...##########...', '...##########...', '...##########...', '...##########...', '...##########...', '...##########...', A, '....oo....oo....', '........h.......', F, F, F, F] },
  { id: 'parede', tier: 2, rows: ['....#...........', '....#...........', '....#..o........', '....#....#......', '....#..o.#......', '....#....#......', '....#..o.#......', '....#....#......', '....#..o.#......', '.........#......', '.........#......', '.........#......', F, F, F, F] },
  { id: 'parede-espinho', tier: 3, rows: ['....#...........', '....#...........', '....#..o........', '....#....#......', '....#..o.#......', '....#...<#......', '....#..o.#......', '....#>...#......', '....#..o.#......', '.........#......', '.........#......', '.........#......', F, F, F, F] },
  { id: 'teto-espinho', tier: 3, rows: ['..############..', '..############..', '..############..', '..############..', '..############..', '..############..', '..############..', '..############..', '....vvvvvvvv....', A, A, '...o........o...', '######....######', '######....######', '######....######', '######....######'] },
  { id: 'espinho-plat', tier: 3, rows: [A, A, A, A, A, '.......b........', A, '...........o....', A, '....==....==....', A, '..^^^^^^^^^^^^..', F, F, F, F] },
  { id: 'morcego-vao', tier: 2, rows: [A, A, A, A, A, A, '.......b........', A, '....o......o....', A, '.......==.......', A, '####........####', '####........####', '####........####', '####........####'] },
  { id: 'gelo', tier: 1, zone: 1, rows: [A, A, A, A, A, A, A, A, '.......oo.......', A, A, A, 'iiiiii...iiiiiii', '######...#######', '######...#######', '######...#######'] },
  { id: 'gelo-besouro', tier: 2, zone: 1, rows: [A, A, A, A, A, A, A, A, '......ooo.......', A, A, '..........k.....', 'iiiiiiiiiiiiiiii', F, F, F] },
  { id: 'desmorona', tier: 2, zone: 1, rows: [A, A, A, A, A, A, A, A, A, A, '....oooooooo....', A, '###XXXXXXXXXX###', '###..........###', '###..........###', '###..........###'] },
  { id: 'trilho', tier: 2, zone: 1, rows: [A, A, A, A, A, A, A, A, '.....oooooo.....', A, A, A, '##!MM........!##', '##............##', '##............##', '##............##'] },
  { id: 'gelo-vao', tier: 2, zone: 1, rows: [A, A, A, A, A, A, A, '........ooo.....', A, A, A, A, 'iiiiiiii.....iii', '########.....###', '########.....###', '########.....###'] },
  { id: 'goteiras', tier: 1, zone: 2, rows: ['..############..', '..############..', '..############..', '..############..', '..############..', '..############..', '..############..', '.....D....D.....', A, A, A, '...oo....oo.....', F, F, F, F] },
  { id: 'lagoa', tier: 2, zone: 2, rows: [A, A, A, A, A, A, A, A, A, '......o..o......', A, '......#..#......', '###~~~#~~#~~~###', '###~~~#~~#~~~###', F, F] },
  { id: 'cuspidor', tier: 2, zone: 2, rows: [A, A, A, A, A, A, A, A, '.....ooo........', '............t...', '...........###..', '...........###..', F, F, F, F] },
  { id: 'lagoa-mola', tier: 3, zone: 2, rows: [A, A, A, A, A, '...........f....', A, A, A, A, '.......J........', '.......#........', '##~~~~~#~~~~~~##', '##~~~~~#~~~~~~##', F, F] },
];

export const START_CHUNK = { id: 'inicio', rows: [A, A, A, A, A, A, A, A, A, A, A, '...P............', F, F, F, F] };
export const LANTERN_CHUNK = { id: 'lanterna', rows: [A, A, A, A, A, A, '..........T.....', A, A, A, A, '...C......oo....', F, F, F, F] };
export const EXIT_CHUNK = { id: 'saida', rows: [A, A, A, A, A, A, '.......T....T...', A, A, A, A, '..........E.....', F, F, F, F] };

export const ZONE_LEN = 14;
const LANTERN_EVERY = 7;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function zoneOfChunk(i) { return Math.floor(i / ZONE_LEN) % 3; }

// Monta o mapa de uma corrida. Mesma semente = mesma corrida.
export function makeRun(seed, count = 120) {
  const rand = rng(seed);
  const list = [START_CHUNK];
  const recent = [];
  for (let i = 1; i < count - 1; i++) {
    if (i % LANTERN_EVERY === 0) { list.push(LANTERN_CHUNK); continue; }
    const zone = zoneOfChunk(i);
    const maxTier = i < 6 ? 1 : i < 24 ? 2 : 3;
    const pool = CHUNKS.filter((c) => (c.zone === undefined || c.zone === zone) && c.tier <= maxTier && !recent.includes(c.id));
    // trechos da dificuldade atual aparecem mais
    let total = 0;
    const weights = pool.map((c) => { const w = c.tier === maxTier ? 3 : 1; total += w; return w; });
    let r = rand() * total, pick = pool[0];
    for (let k = 0; k < pool.length; k++) { r -= weights[k]; if (r <= 0) { pick = pool[k]; break; } }
    list.push(pick);
    recent.push(pick.id);
    if (recent.length > 3) recent.shift();
  }
  list.push(EXIT_CHUNK);
  const map = [];
  for (let y = 0; y < 18; y++) map.push(list.map((c) => (y < 2 ? F : c.rows[y - 2])).join(''));
  return {
    id: `fuga-${seed}`,
    name: 'Fuga da Escuridão',
    world: 0,
    music: 'rise',
    glowWater: true,
    hints: [],
    map,
    run: { zones: list.map((_, i) => zoneOfChunk(i)), chunks: list.map((c) => c.id) },
  };
}

export const ZONE_NAMES = THEMES.map((t) => t.name);

export class RunGame extends Game {
  constructor(def, opts = {}) {
    super(def, opts);
    this.isRun = true;
    this.lives = 3;
    this.zones = def.run.zones;
    this.zone = 0;
    this.chase = { x: this.spawn.x - 18 * T };
    this.grace = 150;
    this.startX = this.spawn.x;
    this.maxX = this.spawn.x;
  }

  themeAt(tx) { return THEMES[this.zones[Math.min(this.zones.length - 1, Math.floor(tx / CHUNK_W))]]; }

  get distance() { return Math.max(0, Math.floor((this.maxX - this.startX) / T)); }

  update(input) {
    if (this.state === 'over') { this.frame++; this.updateParticles(); return; }
    super.update(input);
    const p = this.player;
    if (this.state === 'play' && p.x > this.maxX) {
      const before = this.distance;
      this.maxX = p.x;
      if (Math.floor(this.distance / 100) > Math.floor(before / 100)) {
        const m = Math.floor(this.distance / 100) * 100;
        const bonus = m % 500 === 0 && this.lives < 3;
        if (bonus) { this.lives++; this.emit('hud'); }
        this.emit('milestone', m, bonus);
      }
    }
    const ci = Math.min(this.zones.length - 1, Math.max(0, Math.floor((p.x + 5) / (CHUNK_W * T))));
    const z = this.zones[ci];
    if (z !== this.zone) {
      this.zone = z;
      this.theme = THEMES[z];
      this.worldIndex = z;
      this.flash = 14;
      this.emit('zone', z, Math.floor(ci / ZONE_LEN) + 1);
    }
    this.updateChase();
  }

  updateChase() {
    if (this.state !== 'play') return;
    const p = this.player;
    if (this.grace > 0) { this.grace--; return; }
    const ci = Math.floor(p.x / (CHUNK_W * T));
    const sp = Math.min(1.85, 0.9 + ci * 0.009);
    this.chase.x += sp;
    this.chase.x = Math.max(this.chase.x, p.x - 22 * T);
    if (this.frame % 2 === 0) {
      const y = this.cam.y + Math.random() * this.vh;
      this.particles.push({ x: this.chase.x + Math.random() * 6, y, vx: Math.random() * 0.8, vy: (Math.random() - 0.5) * 0.4, life: 40, max: 40, color: Math.random() < 0.5 ? '#3a1050' : '#12061c', size: 2, grav: 0, alpha: 0.9 });
    }
    if (p.x + 2 < this.chase.x) this.die('dark');
  }

  die(cause) {
    const was = this.state;
    super.die(cause);
    if (was === 'play' && this.state === 'dead') {
      this.lives--;
      this.emit('hud');
    }
  }

  respawn() {
    if (this.lives <= 0) {
      this.state = 'over';
      this.iris = 0;
      this.emit('runover', this.stats());
      return;
    }
    super.respawn();
    this.chase.x = this.spawn.x - 15 * T;
    this.grace = 110;
  }

  stats() {
    return { ...super.stats(), run: true, distance: this.distance, escaped: this.state === 'win', lives: this.lives };
  }
}
