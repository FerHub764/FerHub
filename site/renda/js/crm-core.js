// Núcleo do CRM: funções puras sobre o estado. Sem DOM, testável no Node.

export const ETAPAS = [
  { id: 'novo', nome: 'Novo' },
  { id: 'contatado', nome: 'Contatado' },
  { id: 'qualificado', nome: 'Qualificado' },
  { id: 'proposta', nome: 'Proposta enviada' },
  { id: 'cliente', nome: 'Cliente' },
  { id: 'perdido', nome: 'Perdido' },
];

export const ORIGENS = {
  site: 'Formulário do site',
  teste: 'Teste de perfil',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  indicacao: 'Indicação',
  manual: 'Cadastro manual',
};

const ETAPA_IDS = ETAPAS.map((e) => e.id);
const DIA = 86400000;

export function estadoVazio() {
  return { versao: 1, leads: [], tarefas: [], seq: 1 };
}

function novoId(state, prefixo) {
  const id = `${prefixo}${state.seq}`;
  state.seq += 1;
  return id;
}

const clone = (s) => (typeof structuredClone === 'function' ? structuredClone(s) : JSON.parse(JSON.stringify(s)));

export function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim());
}

export function normalizarTelefone(tel) {
  return String(tel || '').replace(/\D/g, '');
}

/** Retorna lista de erros (vazia se ok). */
export function validarLead(input) {
  const erros = [];
  if (!String(input.nome || '').trim()) erros.push('Informe o nome.');
  const email = String(input.email || '').trim();
  const tel = normalizarTelefone(input.telefone);
  if (!email && !tel) erros.push('Informe um e-mail ou WhatsApp para contato.');
  if (email && !emailValido(email)) erros.push('O e-mail parece incompleto. Confira o formato nome@exemplo.com.');
  if (tel && (tel.length < 10 || tel.length > 13)) erros.push('O WhatsApp precisa ter DDD e número, por exemplo (11) 91234-5678.');
  if (input.etapa && !ETAPA_IDS.includes(input.etapa)) erros.push('Etapa desconhecida.');
  return erros;
}

/** Pontuação 0–100 de quão promissor é o lead. */
export function pontuarLead(lead) {
  let p = 10;
  if (lead.email) p += 15;
  if (lead.telefone) p += 20;
  if (lead.interesse) p += 15;
  if (lead.recomendacoes?.length) p += 10;
  if ((lead.horasSemana || 0) >= 15) p += 10;
  else if ((lead.horasSemana || 0) >= 5) p += 5;
  if (lead.valor > 0) p += 10;
  const bonusEtapa = { novo: 0, contatado: 5, qualificado: 10, proposta: 15, cliente: 20, perdido: -40 };
  p += bonusEtapa[lead.etapa] || 0;
  return Math.max(0, Math.min(100, p));
}

/**
 * Adiciona lead. Se o e-mail (ou telefone) já existe, mescla e registra retorno.
 * Retorna { state, lead, duplicado }.
 */
export function adicionarLead(state, input, agora = Date.now()) {
  const erros = validarLead(input);
  if (erros.length) {
    const e = new Error(erros.join(' '));
    e.erros = erros;
    throw e;
  }
  const s = clone(state);
  const email = String(input.email || '').trim().toLowerCase();
  const telefone = normalizarTelefone(input.telefone);
  const existente = s.leads.find(
    (l) => (email && l.email === email) || (telefone && l.telefone === telefone),
  );
  if (existente) {
    for (const k of ['interesse', 'horasSemana', 'recomendacoes', 'mensagem']) {
      if (input[k] !== undefined && input[k] !== '') existente[k] = input[k];
    }
    if (!existente.email && email) existente.email = email;
    if (!existente.telefone && telefone) existente.telefone = telefone;
    existente.atividades.unshift({ tipo: 'retorno', texto: 'Enviou o formulário novamente.', em: agora });
    existente.atualizadoEm = agora;
    existente.pontuacao = pontuarLead(existente);
    return { state: s, lead: existente, duplicado: true };
  }
  const lead = {
    id: novoId(s, 'L'),
    nome: String(input.nome).trim(),
    email,
    telefone,
    origem: ORIGENS[input.origem] ? input.origem : 'manual',
    etapa: input.etapa || 'novo',
    interesse: input.interesse || '',
    horasSemana: Number(input.horasSemana) || 0,
    recomendacoes: input.recomendacoes || [],
    mensagem: input.mensagem || '',
    valor: Number(input.valor) || 0,
    tags: Array.isArray(input.tags) ? input.tags : [],
    consentimento: Boolean(input.consentimento),
    criadoEm: input.criadoEm || agora,
    atualizadoEm: input.criadoEm || agora,
    atividades: [{ tipo: 'criado', texto: `Lead criado via ${ORIGENS[input.origem] || ORIGENS.manual}.`, em: input.criadoEm || agora }],
  };
  lead.pontuacao = pontuarLead(lead);
  s.leads.unshift(lead);
  return { state: s, lead, duplicado: false };
}

function comLead(state, id, fn) {
  const s = clone(state);
  const lead = s.leads.find((l) => l.id === id);
  if (!lead) throw new Error('Lead não encontrado.');
  fn(lead, s);
  lead.pontuacao = pontuarLead(lead);
  return s;
}

export function moverEtapa(state, id, etapa, agora = Date.now()) {
  if (!ETAPA_IDS.includes(etapa)) throw new Error('Etapa desconhecida.');
  return comLead(state, id, (lead) => {
    if (lead.etapa === etapa) return;
    const de = ETAPAS.find((e) => e.id === lead.etapa)?.nome;
    const para = ETAPAS.find((e) => e.id === etapa).nome;
    lead.etapa = etapa;
    lead.atualizadoEm = agora;
    lead.atividades.unshift({ tipo: 'etapa', texto: `Movido de ${de} para ${para}.`, em: agora });
  });
}

export function atualizarLead(state, id, campos, agora = Date.now()) {
  return comLead(state, id, (lead) => {
    const permitidos = ['nome', 'email', 'telefone', 'interesse', 'valor', 'tags', 'origem', 'horasSemana', 'mensagem'];
    for (const k of permitidos) {
      if (!(k in campos)) continue;
      let v = campos[k];
      if (k === 'email') v = String(v || '').trim().toLowerCase();
      if (k === 'telefone') v = normalizarTelefone(v);
      if (k === 'valor' || k === 'horasSemana') v = Number(v) || 0;
      lead[k] = v;
    }
    const erros = validarLead(lead);
    if (erros.length) throw new Error(erros.join(' '));
    lead.atualizadoEm = agora;
    lead.atividades.unshift({ tipo: 'edicao', texto: 'Dados atualizados.', em: agora });
  });
}

export function adicionarNota(state, id, texto, agora = Date.now()) {
  const t = String(texto || '').trim();
  if (!t) throw new Error('Escreva a nota antes de salvar.');
  return comLead(state, id, (lead) => {
    lead.atividades.unshift({ tipo: 'nota', texto: t, em: agora });
    lead.atualizadoEm = agora;
  });
}

export function removerLead(state, id) {
  const s = clone(state);
  s.leads = s.leads.filter((l) => l.id !== id);
  s.tarefas = s.tarefas.filter((t) => t.leadId !== id);
  return s;
}

export function adicionarTarefa(state, { titulo, leadId = null, venceEm = null }, agora = Date.now()) {
  const t = String(titulo || '').trim();
  if (!t) throw new Error('Dê um título à tarefa.');
  const s = clone(state);
  s.tarefas.unshift({ id: novoId(s, 'T'), titulo: t, leadId, venceEm, feita: false, criadaEm: agora });
  return s;
}

export function alternarTarefa(state, id) {
  const s = clone(state);
  const t = s.tarefas.find((x) => x.id === id);
  if (t) t.feita = !t.feita;
  return s;
}

export function removerTarefa(state, id) {
  const s = clone(state);
  s.tarefas = s.tarefas.filter((t) => t.id !== id);
  return s;
}

export function filtrarLeads(leads, { busca = '', etapa = '', origem = '', ordem = 'recentes' } = {}) {
  const q = busca.trim().toLowerCase();
  let r = leads.filter((l) => {
    if (etapa && l.etapa !== etapa) return false;
    if (origem && l.origem !== origem) return false;
    if (!q) return true;
    return [l.nome, l.email, l.telefone, l.interesse, ...(l.tags || [])].join(' ').toLowerCase().includes(q);
  });
  const ord = {
    recentes: (a, b) => b.criadoEm - a.criadoEm,
    antigos: (a, b) => a.criadoEm - b.criadoEm,
    pontuacao: (a, b) => b.pontuacao - a.pontuacao,
    valor: (a, b) => b.valor - a.valor,
    nome: (a, b) => a.nome.localeCompare(b.nome, 'pt-BR'),
  }[ordem];
  if (ord) r = [...r].sort(ord);
  return r;
}

export function metricas(state, agora = Date.now(), dias = 14) {
  const leads = state.leads;
  const porEtapa = Object.fromEntries(ETAPA_IDS.map((e) => [e, 0]));
  const porOrigem = {};
  let receita = 0;
  let pipeline = 0;
  for (const l of leads) {
    porEtapa[l.etapa] = (porEtapa[l.etapa] || 0) + 1;
    porOrigem[l.origem] = (porOrigem[l.origem] || 0) + 1;
    if (l.etapa === 'cliente') receita += l.valor;
    if (l.etapa === 'qualificado' || l.etapa === 'proposta') pipeline += l.valor;
  }
  const inicioHoje = new Date(agora);
  inicioHoje.setHours(0, 0, 0, 0);
  const serie = [];
  for (let i = dias - 1; i >= 0; i--) {
    const ini = inicioHoje.getTime() - i * DIA;
    serie.push({ dia: ini, total: leads.filter((l) => l.criadoEm >= ini && l.criadoEm < ini + DIA).length });
  }
  const fechados = porEtapa.cliente + porEtapa.perdido;
  const atrasadas = state.tarefas.filter((t) => !t.feita && t.venceEm && t.venceEm < inicioHoje.getTime()).length;
  const ultimos7 = leads.filter((l) => l.criadoEm >= agora - 7 * DIA).length;
  const anteriores7 = leads.filter((l) => l.criadoEm < agora - 7 * DIA && l.criadoEm >= agora - 14 * DIA).length;
  const interesses = {};
  for (const l of leads) if (l.interesse) interesses[l.interesse] = (interesses[l.interesse] || 0) + 1;
  return {
    total: leads.length,
    porEtapa,
    porOrigem,
    receita,
    pipeline,
    conversao: leads.length ? porEtapa.cliente / leads.length : 0,
    taxaGanho: fechados ? porEtapa.cliente / fechados : 0,
    ticketMedio: porEtapa.cliente ? receita / porEtapa.cliente : 0,
    serie,
    ultimos7,
    anteriores7,
    tarefasAbertas: state.tarefas.filter((t) => !t.feita).length,
    tarefasAtrasadas: atrasadas,
    interesses,
  };
}

// ---------- CSV ----------
const COLUNAS = ['id', 'nome', 'email', 'telefone', 'origem', 'etapa', 'interesse', 'valor', 'pontuacao', 'tags', 'criadoEm'];

function celula(v) {
  const s = String(v ?? '');
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function paraCSV(leads) {
  const linhas = [COLUNAS.join(',')];
  for (const l of leads) {
    linhas.push(
      COLUNAS.map((c) => {
        if (c === 'tags') return celula((l.tags || []).join('|'));
        if (c === 'criadoEm') return celula(new Date(l.criadoEm).toISOString());
        return celula(l[c]);
      }).join(','),
    );
  }
  return linhas.join('\n');
}

export function lerCSV(texto) {
  const linhas = [];
  let atual = [''];
  let aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    if (aspas) {
      if (ch === '"' && texto[i + 1] === '"') { atual[atual.length - 1] += '"'; i++; }
      else if (ch === '"') aspas = false;
      else atual[atual.length - 1] += ch;
    } else if (ch === '"') aspas = true;
    else if (ch === ',') atual.push('');
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && texto[i + 1] === '\n') i++;
      linhas.push(atual);
      atual = [''];
    } else atual[atual.length - 1] += ch;
  }
  if (atual.length > 1 || atual[0] !== '') linhas.push(atual);
  if (!linhas.length) return [];
  const cab = linhas[0].map((c) => c.trim());
  return linhas.slice(1).filter((l) => l.some((c) => c.trim())).map((l) => Object.fromEntries(cab.map((c, i) => [c, l[i] ?? ''])));
}

/** Importa linhas de CSV; retorna { state, importados, erros }. */
export function importarCSV(state, texto, agora = Date.now()) {
  let s = state;
  let importados = 0;
  const erros = [];
  lerCSV(texto).forEach((row, i) => {
    try {
      const r = adicionarLead(
        s,
        {
          nome: row.nome,
          email: row.email,
          telefone: row.telefone,
          origem: row.origem || 'manual',
          etapa: ETAPA_IDS.includes(row.etapa) ? row.etapa : 'novo',
          interesse: row.interesse,
          valor: row.valor,
          tags: row.tags ? row.tags.split('|').filter(Boolean) : [],
          criadoEm: row.criadoEm && !Number.isNaN(Date.parse(row.criadoEm)) ? Date.parse(row.criadoEm) : undefined,
        },
        agora,
      );
      s = r.state;
      if (!r.duplicado) importados++;
    } catch (e) {
      erros.push(`Linha ${i + 2}: ${e.message}`);
    }
  });
  return { state: s, importados, erros };
}

// ---------- Dados de demonstração ----------
const NOMES = ['Ana Souza', 'Bruno Lima', 'Carla Mendes', 'Diego Rocha', 'Elisa Prado', 'Fábio Nunes', 'Gabriela Reis', 'Heitor Alves', 'Isabela Costa', 'João Pires', 'Karina Melo', 'Lucas Teixeira', 'Marina Duarte', 'Nicolas Barros', 'Olívia Campos', 'Paulo Freitas', 'Renata Sales', 'Sérgio Moura', 'Tatiane Lopes', 'Vinícius Ramos'];
const INTERESSES = ['redacao', 'design', 'aulas', 'doces', 'assistente', 'social', 'video', 'artesanato', 'programacao', 'costura'];

/** Gera dados fictícios determinísticos para explorar o CRM. */
export function dadosDemo(agora = Date.now()) {
  let semente = 7;
  const rnd = () => ((semente = (semente * 9301 + 49297) % 233280) / 233280);
  let s = estadoVazio();
  const origens = Object.keys(ORIGENS);
  NOMES.forEach((nome, i) => {
    const primeiro = nome.split(' ')[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const etapa = ETAPA_IDS[Math.floor(rnd() * ETAPA_IDS.length)];
    const r = adicionarLead(
      s,
      {
        nome: `${nome} (demo)`,
        email: `${primeiro}${i}@exemplo.com`,
        telefone: rnd() > 0.3 ? `1199${String(1000000 + Math.floor(rnd() * 8999999)).slice(0, 7)}` : '',
        origem: origens[Math.floor(rnd() * origens.length)],
        etapa,
        interesse: INTERESSES[Math.floor(rnd() * INTERESSES.length)],
        horasSemana: [5, 15, 30][Math.floor(rnd() * 3)],
        valor: ['qualificado', 'proposta', 'cliente'].includes(etapa) ? Math.round(97 + rnd() * 400) : 0,
        tags: rnd() > 0.6 ? ['mentoria'] : [],
        criadoEm: agora - Math.floor(rnd() * 13.9 * DIA),
      },
      agora,
    );
    s = r.state;
  });
  s = adicionarTarefa(s, { titulo: 'Ligar para leads novos de ontem', venceEm: agora - DIA }, agora);
  s = adicionarTarefa(s, { titulo: 'Enviar guia de precificação', leadId: s.leads[0].id, venceEm: agora + DIA }, agora);
  s = adicionarTarefa(s, { titulo: 'Revisar propostas abertas', venceEm: agora + 3 * DIA }, agora);
  return s;
}
