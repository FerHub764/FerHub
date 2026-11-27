import { W1 } from './w1.js';
import { W2 } from './w2.js';
import { W3 } from './w3.js';

export const WORLDS = [
  { id: 0, name: 'Grutas de Âmbar', levels: W1 },
  { id: 1, name: 'Minas de Cristal', levels: W2 },
  { id: 2, name: 'Poço das Marés', levels: W3 },
];

export const LEVELS = WORLDS.flatMap((w) => w.levels.map((l) => ({ ...l, world: w.id })));
