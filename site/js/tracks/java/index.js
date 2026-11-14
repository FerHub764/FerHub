import { defineTrack } from '../_dsl.js';
import part1 from './part1.js';
import part2 from './part2.js';

export default defineTrack({
  id: 'java',
  name: 'Java',
  short: 'Java',
  color: '#ff5d73',
  level: 'principal',
  runtime: null,
  lang: 'java',
  category: 'Back-end',
  tagline: 'Robusta e tipada. Base de sistemas corporativos, bancos e Android.',
  description: 'Sintaxe, tipos, métodos, orientação a objetos, coleções e exceções. Os exercícios treinam leitura de código, previsão de saída e caça a erros.',
}, [...part1, ...part2]);
