import { defineTrack } from '../_dsl.js';
import part1 from './part1.js';
import part2 from './part2.js';

export default defineTrack({
  id: 'javascript',
  name: 'JavaScript',
  short: 'JS',
  color: '#f5d547',
  level: 'principal',
  runtime: 'javascript',
  lang: 'javascript',
  category: 'Web',
  tagline: 'A linguagem da web. Dá vida às páginas e também roda em servidores.',
  description: 'Variáveis, funções, arrays, objetos, DOM e programação assíncrona. Todo o código roda aqui mesmo, no seu navegador.',
}, [...part1, ...part2]);
