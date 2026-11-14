import { defineTrack } from '../_dsl.js';
import part1 from './part1.js';
import part2 from './part2.js';

export default defineTrack({
  id: 'cpp',
  name: 'C++',
  short: 'C++',
  color: '#6c8cff',
  level: 'principal',
  runtime: null,
  lang: 'cpp',
  category: 'Sistemas',
  tagline: 'Desempenho máximo. Jogos, motores gráficos, sistemas embarcados.',
  description: 'Compilação, tipos, controle de fluxo, funções, vetores, ponteiros, classes, herança e a biblioteca padrão (STL).',
}, [...part1, ...part2]);
