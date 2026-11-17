// Persistência. Dois modos:
//  - local: localStorage do navegador (padrão, quando config.js está vazio)
//  - remoto: Supabase, com login, tempo real e caixa de entrada do formulário público
import { estadoVazio, diferencas, estadoDeLinhas, processarInscricoes } from './crm-core.js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const CHAVE = 'renda-em-casa:crm:v1';
const SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm';

export const remoto = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let memoria = null;
let base = null; // último estado confirmado no banco (modo remoto)
const ouvintes = new Set();
const ouvintesErro = new Set();
const avisar = (s) => ouvintes.forEach((fn) => fn(s));
const falhar = (e) => ouvintesErro.forEach((fn) => fn(e));

export function aoMudar(fn) { ouvintes.add(fn); return () => ouvintes.delete(fn); }
export function aoErro(fn) { ouvintesErro.add(fn); return () => ouvintesErro.delete(fn); }

// ---------- Leitura e gravação ----------
export function carregar() {
  if (memoria) return memoria;
  if (remoto) return (memoria = estadoVazio());
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
  if (remoto) empurrar(state);
  else {
    try { localStorage.setItem(CHAVE, JSON.stringify(state)); } catch { /* modo privado: fica em memória */ }
  }
  avisar(state);
  return state;
}

// Sincroniza entre abas no modo local
try {
  window.addEventListener('storage', (e) => {
    if (remoto || e.key !== CHAVE) return;
    memoria = null;
    avisar(carregar());
  });
} catch { /* fora do navegador */ }

// ---------- Supabase ----------
let sb = null;
async function cliente() {
  if (!sb) {
    const { createClient } = await import(SUPABASE_CDN);
    sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return sb;
}

const TABELAS = { leads: 'crm_leads', tarefas: 'crm_tarefas' };
let fila = Promise.resolve();
let pendentes = 0;
export const sincronizando = () => pendentes > 0;

function empurrar(novo) {
  const d = diferencas(base || estadoVazio(), novo);
  base = novo;
  pendentes++;
  fila = fila
    .then(async () => {
      const c = await cliente();
      for (const k of ['leads', 'tarefas']) {
        if (d[k].gravar.length) {
          const agora = new Date().toISOString();
          const { error } = await c.from(TABELAS[k]).upsert(d[k].gravar.map((x) => ({ id: x.id, dados: x, atualizado_em: agora })));
          if (error) throw error;
        }
        if (d[k].apagar.length) {
          const { error } = await c.from(TABELAS[k]).delete().in('id', d[k].apagar);
          if (error) throw error;
        }
      }
    })
    .catch((e) => {
      falhar(new Error(`Não foi possível salvar no banco: ${e.message}. Recarregue a página para ver os dados atuais.`));
    })
    .finally(() => { pendentes--; });
  return fila;
}

async function lerTudo(c, tabela) {
  const linhas = [];
  for (let de = 0; ; de += 1000) {
    const { data, error } = await c.from(tabela).select('id, dados').range(de, de + 999);
    if (error) throw error;
    linhas.push(...data);
    if (data.length < 1000) return linhas;
  }
}

/** Baixa contatos e tarefas e puxa as inscrições novas do formulário. */
export async function sincronizar() {
  const c = await cliente();
  await fila; // espera gravações pendentes
  const [leads, tarefas] = await Promise.all([lerTudo(c, TABELAS.leads), lerTudo(c, TABELAS.tarefas)]);
  let s = estadoDeLinhas(leads, tarefas);
  base = s;
  // "Reserva" as inscrições apagando-as e recebendo as linhas apagadas: duas pessoas não processam a mesma
  const { data: inscricoes, error } = await c.from('inscricoes').delete().not('id', 'is', null).select('*');
  if (error) throw error;
  let novos = 0;
  if (inscricoes?.length) {
    const r = processarInscricoes(s, inscricoes);
    s = r.state;
    novos = r.novos;
  }
  const mudou = JSON.stringify(s) !== JSON.stringify(memoria);
  if (inscricoes?.length) salvar(s);
  else if (mudou) { memoria = s; avisar(s); }
  return { novos };
}

let canal = null;
let espera = null;
export async function ouvirMudancas() {
  const c = await cliente();
  if (canal) return;
  const agendar = () => {
    clearTimeout(espera);
    espera = setTimeout(() => sincronizar().catch((e) => falhar(e)), 500);
  };
  canal = c
    .channel('crm')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_leads' }, agendar)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_tarefas' }, agendar)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inscricoes' }, agendar)
    .subscribe();
}

export async function sessaoAtual() {
  const c = await cliente();
  const { data } = await c.auth.getSession();
  return data.session;
}

export async function entrar(email, senha) {
  const c = await cliente();
  const { data, error } = await c.auth.signInWithPassword({ email, password: senha });
  if (error) throw new Error(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message);
  return data.session;
}

/** true se o usuário logado está na tabela crm_membros (a regra de segurança só mostra a própria linha a membros). */
export async function souMembro() {
  const c = await cliente();
  const { data, error } = await c.from('crm_membros').select('email').limit(1);
  if (error) throw error;
  return data.length > 0;
}

export async function sair() {
  const c = await cliente();
  if (canal) { await c.removeChannel(canal); canal = null; }
  await c.auth.signOut();
  memoria = null;
  base = null;
}

/** Usado pelo formulário público no modo remoto: só insere, nunca lê. */
export async function enviarInscricao(d) {
  const c = await cliente();
  const { error } = await c.from('inscricoes').insert({
    nome: d.nome,
    email: d.email || null,
    telefone: d.telefone || null,
    interesse: d.interesse || null,
    horas_semana: Number(d.horasSemana) || null,
    origem: d.origem === 'teste' ? 'teste' : 'site',
    recomendacoes: d.recomendacoes || [],
    consentimento: true,
  });
  if (error) throw new Error('Não conseguimos registrar agora. Verifique sua internet e tente de novo.');
}

// ---------- Preferências do visitante (sempre locais) ----------
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
