import { defineTrack } from '../_dsl.js';
import part1 from './part1.js';
import part2 from './part2.js';

export default defineTrack({
  id: 'python',
  name: 'Python',
  short: 'Py',
  color: '#4fa3ff',
  level: 'principal',
  runtime: 'python',
  lang: 'python',
  category: 'Uso geral',
  tagline: 'A linguagem mais amigável para começar. Lógica, automação, dados e IA.',
  description: 'Do primeiro print até orientação a objetos. Você vai escrever e rodar Python de verdade aqui no navegador, sem instalar nada.',
}, [...part1, ...part2]);
