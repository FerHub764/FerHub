// Persistência no navegador. Tudo protegido: se o armazenamento falhar, o app segue em memória.
import { estadoVazio } from './crm-core.js';

const CHAVE = 'renda-em-casa:crm:v1';
let memoria = null;
const ouvintes = new Set();

export function carregar() {
  if (memoria) return memoria;
  try {
    const bruto = localStorage.getItem(CHAVE);
    memoria = bruto ? JSON.parse(bruto) : estadoVazio();
  } catch {
    memoria = estadoVazio();
  }
  if (!memoria || !Array.isArray(memoria.leads)) memoria = estadoVazio();
  return memoria;
}

export function salvar(state) {
  memoria = state;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(state));
  } catch {
    /* modo privado ou sem espaço: mantém só em memória */
  }
  ouvintes.forEach((fn) => fn(state));
  return state;
}

export function aoMudar(fn) {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

// Sincroniza entre abas (ex.: site aberto numa aba e CRM na outra)
try {
  window.addEventListener('storage', (e) => {
    if (e.key !== CHAVE) return;
    memoria = null;
    const s = carregar();
    ouvintes.forEach((fn) => fn(s));
  });
} catch {
  /* fora do navegador */
}

export function preferencia(chave, valor) {
  const k = `renda-em-casa:pref:${chave}`;
  try {
    if (valor === undefined) return localStorage.getItem(k);
    localStorage.setItem(k, valor);
  } catch {
    return null;
  }
  return valor;
}
