import { defineTrack } from '../_dsl.js';
import part1 from './part1.js';
import part2 from './part2.js';

export default defineTrack({
  id: 'html-css',
  name: 'HTML & CSS',
  short: '</>',
  color: '#ff7a45',
  level: 'principal',
  runtime: 'web',
  lang: 'html',
  category: 'Web',
  tagline: 'Construa páginas de verdade: estrutura com HTML e visual com CSS.',
  description: 'Da primeira tag até layouts responsivos com Flexbox e Grid. Cada exercício tem pré-visualização ao vivo e correção automática.',
}, [...part1, ...part2]);
