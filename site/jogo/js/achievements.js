// Conquistas: cada uma é uma regra sobre o progresso salvo.
import { totalGems } from './save.js';

const done = (s, id) => !!(s.levels[id] && s.levels[id].done);

export const ACHIEVEMENTS = [
  { id: 'primeira', name: 'Primeira Luz', desc: 'Conclua a fase 1-1.', test: (s) => done(s, '1-1') },
  { id: 'combo3', name: 'Trinca de Fogo', desc: 'Faça um combo x3.', test: (s) => s.stats.bestCombo >= 3 },
  { id: 'combo6', name: 'Incêndio', desc: 'Faça um combo x6.', test: (s) => s.stats.bestCombo >= 6 },
  { id: 'intocavel', name: 'Intocável', desc: 'Conclua uma fase sem se apagar.', test: (s) => !!s.stats.flawless },
  { id: 'colecionador', name: 'Colecionador', desc: 'Pegue todas as brasas de uma fase.', test: (s) => !!s.stats.allCoins },
  { id: 'relampago', name: 'Relâmpago', desc: 'Termine a fase 1-1 em menos de 35 segundos.', test: (s) => done(s, '1-1') && s.levels['1-1'].bestTime <= 35 * 60 },
  { id: 'mundo1', name: 'Grutas Acesas', desc: 'Termine o Mundo 1.', test: (s) => done(s, '1-4') },
  { id: 'mundo2', name: 'Cristal Vivo', desc: 'Termine o Mundo 2.', test: (s) => done(s, '2-4') },
  { id: 'final', name: 'A Luz Voltou', desc: 'Termine a fase 3-4.', test: (s) => done(s, '3-4') },
  { id: 'gemas12', name: 'Garimpeiro', desc: 'Junte 12 gemas de chama.', test: (s) => totalGems(s) >= 12 },
  { id: 'gemas36', name: 'Coração de Gema', desc: 'Junte as 36 gemas de chama.', test: (s) => totalGems(s) >= 36 },
  { id: 'fuga300', name: 'Fôlego', desc: 'Corra 300 m no Modo Fuga.', test: (s) => s.run.best >= 300 },
  { id: 'fuga1000', name: 'Inalcançável', desc: 'Corra 1000 m no Modo Fuga.', test: (s) => s.run.best >= 1000 },
  { id: 'escapou', name: 'Além da Escuridão', desc: 'Chegue ao fim de uma corrida no Modo Fuga.', test: (s) => !!s.run.escaped },
  { id: 'estouro', name: 'Estoura-Gotas', desc: 'Estoure 10 gotas com o dash.', test: (s) => s.stats.pops >= 10 },
  { id: 'cacador', name: 'Caçador da Noite', desc: 'Derrote 100 inimigos.', test: (s) => s.stats.kills >= 100 },
  { id: 'loja', name: 'Nova Chama', desc: 'Compre uma chama na loja.', test: (s) => s.owned.length > 1 },
  { id: 'rico', name: 'Fornalha', desc: 'Ganhe 1000 brasas no total.', test: (s) => s.stats.earned >= 1000 },
];

// Marca as conquistas recém-cumpridas e devolve a lista delas.
export function checkAchievements(save) {
  const out = [];
  for (const a of ACHIEVEMENTS) {
    if (save.ach[a.id]) continue;
    let ok = false;
    try { ok = a.test(save); } catch { ok = false; }
    if (ok) { save.ach[a.id] = Date.now(); out.push(a); }
  }
  return out;
}
