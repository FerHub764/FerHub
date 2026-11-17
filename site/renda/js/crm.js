import {
  ETAPAS, ORIGENS, adicionarLead, moverEtapa, atualizarLead, adicionarNota, removerLead,
  adicionarTarefa, alternarTarefa, removerTarefa, filtrarLeads, metricas, paraCSV, importarCSV,
  dadosDemo, estadoVazio,
} from './crm-core.js';
import { METODOS } from './data.js';
import { carregar, salvar, aoMudar, aoErro, remoto, sessaoAtual, entrar, sair, sincronizar, ouvirMudancas, souMembro } from './store.js';
import { $, $$, esc, real, pct, data, dataHora, telefoneBonito, toast, iniciarTema, baixar } from './ui.js';

iniciarTema();

const nomeEtapa = Object.fromEntries(ETAPAS.map((e) => [e.id, e.nome]));
const nomeMetodo = Object.fromEntries(METODOS.map((m) => [m.id, m.nome]));
const TITULOS = { painel: 'Painel', leads: 'Contatos', funil: 'Funil de vendas', tarefas: 'Tarefas', ajustes: 'Dados e backup' };

let state = carregar();
let abaAtual = 'painel';
const filtros = { busca: '', etapa: '', origem: '', ordem: 'recentes' };
const selecionados = new Set();
let filtroTarefa = 'abertas';
let leadAberto = null;

function commit(novo, msg) {
  state = salvar(novo);
  if (msg) toast(msg);
}
aoMudar((s) => {
  state = s;
  render();
  if (leadAberto) {
    // preserva o que estiver sendo digitado na ficha quando chega atualização de outra pessoa
    const rascunho = $('#g-nota-txt')?.value;
    const editando = Boolean($('#g-editar'));
    if (!editando) renderGaveta();
    if (rascunho && $('#g-nota-txt')) $('#g-nota-txt').value = rascunho;
  }
});
aoErro((e) => toast(e.message, 'erro'));

// ---------- Opções de selects ----------
const opcoesEtapa = (vazio) => (vazio ? `<option value="">${vazio}</option>` : '') + ETAPAS.map((e) => `<option value="${e.id}">${esc(e.nome)}</option>`).join('');
const opcoesOrigem = (vazio) => (vazio ? `<option value="">${vazio}</option>` : '') + Object.entries(ORIGENS).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('');
const opcoesInteresse = '<option value="">Não informado</option>' + METODOS.map((m) => `<option value="${m.id}">${esc(m.nome)}</option>`).join('');
$('#f-etapa').innerHTML = opcoesEtapa('Todas as etapas');
$('#f-origem').innerHTML = opcoesOrigem('Todas as origens');
$('#sel-etapa').innerHTML = opcoesEtapa();
$('#n-etapa').innerHTML = opcoesEtapa();
$('#n-origem').innerHTML = opcoesOrigem();
$('#n-origem').value = 'manual';
$('#n-interesse').innerHTML = opcoesInteresse;

// ---------- Navegação ----------
function irPara(aba) {
  if (!TITULOS[aba]) aba = 'painel';
  abaAtual = aba;
  $$('.aba').forEach((s) => (s.hidden = s.id !== `aba-${aba}`));
  $$('.abas a').forEach((a) => (a.dataset.aba === aba ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  $('#titulo-aba').textContent = TITULOS[aba];
  document.title = `${TITULOS[aba]} | CRM Renda em Casa`;
  render();
}
window.addEventListener('hashchange', () => irPara(location.hash.slice(1)));

// ---------- Render geral ----------
function render() {
  $('#cont-leads').textContent = state.leads.length;
  $('#cont-tarefas').textContent = state.tarefas.filter((t) => !t.feita).length;
  ({ painel: renderPainel, leads: renderLeads, funil: renderFunil, tarefas: renderTarefas, ajustes: () => {} })[abaAtual]();
}

function estadoVazioHTML() {
  return `<div class="vazio-grande">
    <h2>Nenhum contato ainda</h2>
    <p>Os contatos chegam pelo formulário do site. Você também pode cadastrar à mão ou carregar a demonstração.</p>
    <div class="linha-btns">
      <button class="btn btn-primario" type="button" data-acao="novo">Novo contato</button>
      <button class="btn btn-secundario" type="button" data-acao="demo">Carregar demonstração</button>
    </div></div>`;
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-acao]')?.dataset.acao;
  if (a === 'novo') abrirNovo();
  if (a === 'demo') carregarDemo();
});

// ---------- Painel ----------
function renderPainel() {
  const m = metricas(state);
  const vazio = !m.total;
  $('#painel-vazio').innerHTML = vazio ? estadoVazioHTML() : '';
  $('#kpis').hidden = vazio;
  $('#painel-graficos').hidden = vazio;
  if (vazio) return;
  const delta = m.ultimos7 - m.anteriores7;
  $('#kpis').innerHTML = `
    <dl class="kpi"><dt>Contatos</dt><dd>${m.total}<span class="kpi-sub"><span class="${delta >= 0 ? 'sobe' : 'desce'}">${delta >= 0 ? '+' : ''}${delta}</span> nos últimos 7 dias</span></dd></dl>
    <dl class="kpi"><dt>Taxa de conversão</dt><dd>${pct(m.conversao)}<span class="kpi-sub">${m.porEtapa.cliente} viraram clientes</span></dd></dl>
    <dl class="kpi"><dt>Em negociação</dt><dd>${real(m.pipeline)}<span class="kpi-sub">qualificados e com proposta</span></dd></dl>
    <dl class="kpi kpi-destaque"><dt>Receita fechada</dt><dd>${real(m.receita)}<span class="kpi-sub">ticket médio ${real(m.ticketMedio)}</span></dd></dl>`;

  graficoSerie(m.serie);

  const max = Math.max(1, ...Object.values(m.porEtapa));
  $('#grafico-funil').innerHTML = `<div class="barras-h">${ETAPAS.map((e) => {
    const v = m.porEtapa[e.id];
    return `<div class="barra-h ${e.id}"><span>${esc(e.nome)}</span><span class="trilho"><i style="width:${(v / max) * 100}%"></i></span><span>${v}</span></div>`;
  }).join('')}</div>`;

  const origens = Object.entries(m.porOrigem).sort((a, b) => b[1] - a[1]);
  const maxO = Math.max(1, ...origens.map((o) => o[1]));
  $('#grafico-origem').innerHTML = `<div class="barras-h">${origens.map(([k, v]) => `<div class="barra-h"><span>${esc(ORIGENS[k] || k)}</span><span class="trilho"><i style="width:${(v / maxO) * 100}%"></i></span><span>${v}<span class="taxa">${pct(v / m.total)}</span></span></div>`).join('')}</div>`;

  const ints = Object.entries(m.interesses).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxI = Math.max(1, ...ints.map((o) => o[1]));
  $('#grafico-interesse').innerHTML = ints.length
    ? `<div class="barras-h">${ints.map(([k, v]) => `<div class="barra-h"><span>${esc(nomeMetodo[k] || k)}</span><span class="trilho"><i style="width:${(v / maxI) * 100}%"></i></span><span>${v}</span></div>`).join('')}</div>`
    : '<p class="vazio-msg">Ninguém informou interesse ainda.</p>';

  const hoje = new Date().setHours(0, 0, 0, 0);
  const prox = state.tarefas.filter((t) => !t.feita).sort((a, b) => (a.venceEm || Infinity) - (b.venceEm || Infinity)).slice(0, 5);
  $('#mini-tarefas').innerHTML = prox.length
    ? prox.map((t) => `<li><span>${esc(t.titulo)}</span><span class="prazo ${t.venceEm && t.venceEm < hoje ? 'atrasada' : ''}">${t.venceEm ? (t.venceEm < hoje ? 'Atrasada, ' : '') + data(t.venceEm) : 'Sem prazo'}</span></li>`).join('')
    : '<li class="vazio-msg">Nenhuma tarefa aberta. Bom trabalho.</li>';
}

function graficoSerie(serie) {
  const W = 640, H = 200, P = { t: 12, r: 8, b: 26, l: 28 };
  const max = Math.max(3, ...serie.map((s) => s.total));
  const passo = Math.ceil(max / 3);
  const topo = passo * 3;
  const bw = (W - P.l - P.r) / serie.length;
  const y = (v) => P.t + (H - P.t - P.b) * (1 - v / topo);
  let grade = '';
  for (let v = 0; v <= topo; v += passo) grade += `<line class="linha-grade" x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}"/><text class="eixo" x="${P.l - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
  const barras = serie.map((s, i) => {
    const x = P.l + i * bw + bw * 0.18;
    const w = bw * 0.64;
    const h = Math.max(s.total ? 2 : 0, H - P.b - y(s.total));
    const hoje = i === serie.length - 1;
    const rotulo = i % 2 === serie.length % 2 || hoje ? `<text class="eixo" x="${x + w / 2}" y="${H - 8}" text-anchor="middle">${hoje ? 'hoje' : new Date(s.dia).getDate()}</text>` : '';
    return `<rect class="barra ${hoje ? 'barra-hoje' : ''}" x="${x}" y="${H - P.b - h}" width="${w}" height="${h}" rx="3" tabindex="0" data-i="${i}" aria-label="${data(s.dia)}: ${s.total} contatos"/>${rotulo}`;
  }).join('');
  const total = serie.reduce((s, x) => s + x.total, 0);
  $('#grafico-serie').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Contatos por dia nos últimos 14 dias, total ${total}">${grade}${barras}</svg><p class="grafico-dica" id="serie-dica">Total no período: ${total}. Passe o mouse sobre uma barra para ver o dia.</p>`;
  const mostrar = (el) => {
    const s = serie[+el.dataset.i];
    $('#serie-dica').textContent = `${new Date(s.dia).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}: ${s.total} ${s.total === 1 ? 'contato' : 'contatos'}`;
  };
  $$('#grafico-serie .barra').forEach((b) => {
    b.addEventListener('mouseenter', () => mostrar(b));
    b.addEventListener('focus', () => mostrar(b));
  });
}

// ---------- Contatos (tabela) ----------
$('#busca').addEventListener('input', (e) => { filtros.busca = e.target.value; renderLeads(); });
$('#f-etapa').addEventListener('change', (e) => { filtros.etapa = e.target.value; renderLeads(); });
$('#f-origem').addEventListener('change', (e) => { filtros.origem = e.target.value; renderLeads(); });
$('#f-ordem').addEventListener('change', (e) => { filtros.ordem = e.target.value; renderLeads(); });

function pontosHTML(p) {
  return `<span class="pontos" title="Pontuação ${p} de 100"><i style="--v:${p}%"></i>${p}</span>`;
}

function renderLeads() {
  const tbody = $('#tbody-leads');
  if (!state.leads.length) {
    tbody.innerHTML = `<tr><td colspan="8">${estadoVazioHTML()}</td></tr>`;
    $('#barra-selecao').hidden = true;
    return;
  }
  const lista = filtrarLeads(state.leads, filtros);
  for (const id of [...selecionados]) if (!state.leads.some((l) => l.id === id)) selecionados.delete(id);
  tbody.innerHTML = lista.length
    ? lista.map((l) => `
      <tr data-id="${l.id}">
        <td class="col-check"><input type="checkbox" data-sel="${l.id}" ${selecionados.has(l.id) ? 'checked' : ''} aria-label="Selecionar ${esc(l.nome)}"></td>
        <td><button type="button" class="contato-nome" data-abrir="${l.id}">${esc(l.nome)}</button><span class="contato-sub">${esc(l.email || telefoneBonito(l.telefone))}</span></td>
        <td><span class="etapa-tag e-${l.etapa}">${esc(nomeEtapa[l.etapa])}</span></td>
        <td class="col-esconde">${esc(nomeMetodo[l.interesse] || '—')}</td>
        <td class="col-esconde">${esc(ORIGENS[l.origem] || l.origem)}</td>
        <td>${pontosHTML(l.pontuacao)}</td>
        <td class="col-num">${l.valor ? real(l.valor) : '—'}</td>
        <td class="col-esconde">${data(l.criadoEm)}</td>
      </tr>`).join('')
    : '<tr><td colspan="8" class="vazio-msg">Nenhum contato com esses filtros. Limpe a busca ou escolha outra etapa.</td></tr>';
  atualizarSelecao(lista);
}

function atualizarSelecao(lista = filtrarLeads(state.leads, filtros)) {
  const n = selecionados.size;
  $('#barra-selecao').hidden = n === 0;
  $('#sel-contagem').textContent = `${n} ${n === 1 ? 'selecionado' : 'selecionados'}`;
  const todos = $('#sel-todos');
  todos.checked = lista.length > 0 && lista.every((l) => selecionados.has(l.id));
  todos.indeterminate = n > 0 && !todos.checked;
}

$('#tbody-leads').addEventListener('click', (e) => {
  const cb = e.target.closest('[data-sel]');
  if (cb) {
    cb.checked ? selecionados.add(cb.dataset.sel) : selecionados.delete(cb.dataset.sel);
    atualizarSelecao();
    return;
  }
  if (e.target.closest('.col-check')) return;
  const tr = e.target.closest('tr[data-id]');
  if (tr) abrirGaveta(tr.dataset.id);
});
$('#sel-todos').addEventListener('change', (e) => {
  const lista = filtrarLeads(state.leads, filtros);
  lista.forEach((l) => (e.target.checked ? selecionados.add(l.id) : selecionados.delete(l.id)));
  renderLeads();
});
$('#sel-mover').addEventListener('click', () => {
  const etapa = $('#sel-etapa').value;
  let s = state;
  for (const id of selecionados) s = moverEtapa(s, id, etapa);
  const n = selecionados.size;
  selecionados.clear();
  commit(s, `${n} ${n === 1 ? 'contato movido' : 'contatos movidos'} para ${nomeEtapa[etapa]}.`);
});
$('#sel-excluir').addEventListener('click', () => {
  const n = selecionados.size;
  if (!confirm(`Excluir ${n} ${n === 1 ? 'contato' : 'contatos'}? Essa ação não pode ser desfeita.`)) return;
  let s = state;
  for (const id of selecionados) s = removerLead(s, id);
  selecionados.clear();
  commit(s, `${n} ${n === 1 ? 'contato excluído' : 'contatos excluídos'}.`);
});

// ---------- Funil (kanban) ----------
function renderFunil() {
  const k = $('#kanban');
  if (!state.leads.length) { k.innerHTML = estadoVazioHTML(); return; }
  k.innerHTML = ETAPAS.map((e) => {
    const leads = state.leads.filter((l) => l.etapa === e.id).sort((a, b) => b.pontuacao - a.pontuacao);
    const soma = leads.reduce((s, l) => s + l.valor, 0);
    return `
      <section class="coluna" data-etapa="${e.id}" aria-label="${esc(e.nome)}">
        <div class="coluna-cab"><h2>${esc(e.nome)}</h2><span>${leads.length}${soma ? ` · ${real(soma)}` : ''}</span></div>
        <ul class="cartoes">
          ${leads.map((l) => `
            <li class="cartao" draggable="true" data-id="${l.id}">
              <div class="cartao-topo"><strong>${esc(l.nome)}</strong>${l.valor ? `<span class="valor">${real(l.valor)}</span>` : ''}</div>
              <span class="meta">${esc(nomeMetodo[l.interesse] || 'Interesse não informado')}</span>
              <div class="cartao-topo">${pontosHTML(l.pontuacao)}
                <label class="sr-only" for="mv-${l.id}">Mover ${esc(l.nome)} para</label>
                <select id="mv-${l.id}" data-mover="${l.id}">${ETAPAS.map((x) => `<option value="${x.id}" ${x.id === l.etapa ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}</select>
              </div>
            </li>`).join('')}
        </ul>
      </section>`;
  }).join('');
}
const kanban = $('#kanban');
let arrastado = null;
kanban.addEventListener('dragstart', (e) => {
  const c = e.target.closest('.cartao');
  if (!c) return;
  arrastado = c.dataset.id;
  c.classList.add('arrastando');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', arrastado);
});
kanban.addEventListener('dragend', (e) => {
  e.target.closest('.cartao')?.classList.remove('arrastando');
  $$('.coluna.alvo').forEach((c) => c.classList.remove('alvo'));
});
kanban.addEventListener('dragover', (e) => {
  const col = e.target.closest('.coluna');
  if (!col || !arrastado) return;
  e.preventDefault();
  $$('.coluna.alvo').forEach((c) => c !== col && c.classList.remove('alvo'));
  col.classList.add('alvo');
});
kanban.addEventListener('drop', (e) => {
  const col = e.target.closest('.coluna');
  if (!col || !arrastado) return;
  e.preventDefault();
  const id = arrastado;
  arrastado = null;
  const lead = state.leads.find((l) => l.id === id);
  if (lead && lead.etapa !== col.dataset.etapa) commit(moverEtapa(state, id, col.dataset.etapa), `${lead.nome} movido para ${nomeEtapa[col.dataset.etapa]}.`);
  else render();
});
kanban.addEventListener('change', (e) => {
  const id = e.target.dataset.mover;
  if (!id) return;
  const lead = state.leads.find((l) => l.id === id);
  commit(moverEtapa(state, id, e.target.value), `${lead.nome} movido para ${nomeEtapa[e.target.value]}.`);
});
kanban.addEventListener('click', (e) => {
  if (e.target.closest('select')) return;
  const c = e.target.closest('.cartao');
  if (c) abrirGaveta(c.dataset.id);
});

// ---------- Tarefas ----------
function renderTarefas() {
  $('#t-lead').innerHTML = '<option value="">Nenhum</option>' + state.leads.map((l) => `<option value="${l.id}">${esc(l.nome)}</option>`).join('');
  const hoje = new Date().setHours(0, 0, 0, 0);
  const lista = state.tarefas.filter((t) => ({
    abertas: !t.feita,
    atrasadas: !t.feita && t.venceEm && t.venceEm < hoje,
    feitas: t.feita,
    todas: true,
  })[filtroTarefa]).sort((a, b) => a.feita - b.feita || (a.venceEm || Infinity) - (b.venceEm || Infinity));
  const nomeLead = Object.fromEntries(state.leads.map((l) => [l.id, l.nome]));
  $('#lista-tarefas').innerHTML = lista.length
    ? lista.map((t) => {
      const atrasada = !t.feita && t.venceEm && t.venceEm < hoje;
      return `<li class="tarefa ${t.feita ? 'feita' : ''}">
        <input type="checkbox" data-alternar="${t.id}" ${t.feita ? 'checked' : ''} aria-label="Concluir ${esc(t.titulo)}">
        <div class="tarefa-texto">
          <span class="tarefa-titulo">${esc(t.titulo)}</span>
          ${t.leadId && nomeLead[t.leadId] ? `<br><button type="button" class="link-lead" data-abrir-lead="${t.leadId}">${esc(nomeLead[t.leadId])}</button>` : ''}
        </div>
        <span class="prazo ${atrasada ? 'atrasada' : ''}">${t.venceEm ? (atrasada ? 'Atrasada, ' : '') + data(t.venceEm) : 'Sem prazo'}</span>
        <button type="button" class="icone-btn" data-remover-tarefa="${t.id}" aria-label="Excluir tarefa ${esc(t.titulo)}">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/></svg>
        </button>
      </li>`;
    }).join('')
    : `<li class="tarefa vazio-msg">${filtroTarefa === 'atrasadas' ? 'Nada atrasado.' : filtroTarefa === 'feitas' ? 'Nenhuma tarefa concluída ainda.' : 'Nenhuma tarefa aberta. Crie uma acima.'}</li>`;
}
$('#t-filtro').addEventListener('click', (e) => {
  const c = e.target.closest('.chip');
  if (!c) return;
  filtroTarefa = c.dataset.f;
  $$('#t-filtro .chip').forEach((x) => x.setAttribute('aria-checked', String(x === c)));
  renderTarefas();
});
$('#form-tarefa').addEventListener('submit', (e) => {
  e.preventDefault();
  const titulo = $('#t-titulo').value;
  const d = $('#t-data').value;
  try {
    commit(adicionarTarefa(state, { titulo, leadId: $('#t-lead').value || null, venceEm: d ? new Date(`${d}T12:00`).getTime() : null }), 'Tarefa adicionada.');
    $('#t-titulo').value = '';
    $('#t-data').value = '';
    $('#t-titulo').focus();
  } catch (err) {
    toast(err.message, 'erro');
    $('#t-titulo').focus();
  }
});
$('#lista-tarefas').addEventListener('click', (e) => {
  const alt = e.target.closest('[data-alternar]')?.dataset.alternar;
  if (alt) { const t = state.tarefas.find((x) => x.id === alt); commit(alternarTarefa(state, alt), t.feita ? 'Tarefa reaberta.' : 'Tarefa concluída.'); return; }
  const rem = e.target.closest('[data-remover-tarefa]')?.dataset.removerTarefa;
  if (rem) { commit(removerTarefa(state, rem), 'Tarefa excluída.'); return; }
  const lead = e.target.closest('[data-abrir-lead]')?.dataset.abrirLead;
  if (lead) abrirGaveta(lead);
});

// ---------- Gaveta do contato ----------
const gaveta = $('#gaveta');
function abrirGaveta(id) {
  leadAberto = id;
  renderGaveta();
  if (!gaveta.open) gaveta.showModal();
}
gaveta.addEventListener('close', () => { leadAberto = null; });
gaveta.addEventListener('click', (e) => { if (e.target === gaveta) gaveta.close(); });

function renderGaveta(editando = false) {
  const l = state.leads.find((x) => x.id === leadAberto);
  if (!l) { gaveta.close(); return; }
  const wa = l.telefone ? `https://wa.me/${l.telefone.length <= 11 ? '55' : ''}${l.telefone}?text=${encodeURIComponent(`Olá, ${l.nome.split(' ')[0]}! Aqui é da Renda em Casa, sobre o plano que você pediu.`)}` : '';
  const tarefas = state.tarefas.filter((t) => t.leadId === l.id && !t.feita);
  $('#gaveta-in').innerHTML = `
    <div class="modal-cab">
      <div><h2 id="g-nome">${esc(l.nome)}</h2><span class="etapa-tag e-${l.etapa}">${esc(nomeEtapa[l.etapa])}</span> ${pontosHTML(l.pontuacao)}</div>
      <button type="button" class="fechar" data-g="fechar" aria-label="Fechar">×</button>
    </div>
    <div class="contato-acoes">
      ${wa ? `<a class="btn btn-primario btn-pequeno" href="${wa}" target="_blank" rel="noopener">Chamar no WhatsApp</a>` : ''}
      ${l.email ? `<a class="btn btn-secundario btn-pequeno" href="mailto:${esc(l.email)}?subject=${encodeURIComponent('Seu plano Renda em Casa')}">Enviar e-mail</a>` : ''}
      <button type="button" class="btn btn-secundario btn-pequeno" data-g="editar">${editando ? 'Cancelar edição' : 'Editar dados'}</button>
    </div>
    <section>
      <h3>Etapa</h3>
      <div class="etapas-trilho">${ETAPAS.map((e) => `<button type="button" data-etapa="${e.id}" aria-pressed="${e.id === l.etapa}">${esc(e.nome)}</button>`).join('')}</div>
    </section>
    ${editando ? `
    <form class="editar-form" id="g-editar" novalidate>
      <div class="grade-2">
        <div class="campo"><label for="e-nome">Nome</label><input id="e-nome" name="nome" value="${esc(l.nome)}"></div>
        <div class="campo"><label for="e-email">E-mail</label><input id="e-email" name="email" type="email" value="${esc(l.email)}"></div>
        <div class="campo"><label for="e-tel">WhatsApp</label><input id="e-tel" name="telefone" value="${esc(l.telefone)}"></div>
        <div class="campo"><label for="e-valor">Valor (R$)</label><input id="e-valor" name="valor" type="number" min="0" value="${l.valor || ''}"></div>
        <div class="campo"><label for="e-int">Interesse</label><select id="e-int" name="interesse">${opcoesInteresse}</select></div>
        <div class="campo"><label for="e-origem">Origem</label><select id="e-origem" name="origem">${opcoesOrigem()}</select></div>
      </div>
      <div class="campo"><label for="e-tags">Tags</label><input id="e-tags" name="tags" value="${esc((l.tags || []).join(', '))}" placeholder="separe por vírgula"></div>
      <div class="form-erros" id="e-erros" role="alert"></div>
      <div class="linha-btns"><button class="btn btn-primario" type="submit">Salvar alterações</button></div>
    </form>` : `
    <dl class="dados">
      <dt>E-mail</dt><dd>${esc(l.email || '—')}</dd>
      <dt>WhatsApp</dt><dd>${esc(telefoneBonito(l.telefone) || '—')}</dd>
      <dt>Interesse</dt><dd>${esc(nomeMetodo[l.interesse] || '—')}</dd>
      <dt>Recomendados</dt><dd>${l.recomendacoes?.length ? esc(l.recomendacoes.map((r) => nomeMetodo[r] || r).join(', ')) : '—'}</dd>
      <dt>Tempo livre</dt><dd>${l.horasSemana ? `${l.horasSemana <= 5 ? 'até 5' : l.horasSemana <= 15 ? '5 a 15' : 'mais de 15'} h/semana` : '—'}</dd>
      <dt>Origem</dt><dd>${esc(ORIGENS[l.origem] || l.origem)}</dd>
      <dt>Valor</dt><dd>${l.valor ? real(l.valor) : '—'}</dd>
      <dt>Tags</dt><dd>${l.tags?.length ? esc(l.tags.join(', ')) : '—'}</dd>
      <dt>Consentimento</dt><dd>${l.consentimento ? 'Autorizou contato (LGPD)' : 'Não registrado'}</dd>
      <dt>Entrada</dt><dd>${dataHora(l.criadoEm)}</dd>
    </dl>`}
    <section>
      <h3>Próximo passo</h3>
      <form class="nota-form" id="g-tarefa">
        <div class="grade-2" style="margin:0">
          <div class="campo"><label for="g-t-titulo" class="sr-only">Tarefa</label><input id="g-t-titulo" placeholder="Ex.: Ligar na quinta"></div>
          <div class="campo"><label for="g-t-data" class="sr-only">Prazo</label><input id="g-t-data" type="date"></div>
        </div>
        <div class="linha-btns"><button class="btn btn-secundario btn-pequeno" type="submit">Criar tarefa</button></div>
      </form>
      ${tarefas.length ? `<ul class="mini-tarefas">${tarefas.map((t) => `<li><span>${esc(t.titulo)}</span><span class="prazo">${t.venceEm ? data(t.venceEm) : 'Sem prazo'}</span></li>`).join('')}</ul>` : ''}
    </section>
    <section>
      <h3>Anotações e histórico</h3>
      <form class="nota-form" id="g-nota">
        <label for="g-nota-txt" class="sr-only">Nova anotação</label>
        <textarea id="g-nota-txt" class="campo" placeholder="O que foi conversado?" style="width:100%;padding:.6em .8em;border:2px solid var(--borda);border-radius:var(--r-pequeno);background:var(--cartao)"></textarea>
        <div class="linha-btns"><button class="btn btn-secundario btn-pequeno" type="submit">Salvar anotação</button></div>
      </form>
      <ol class="linha-tempo" style="margin-top:1rem">${l.atividades.map((a) => `<li class="${a.tipo}"><time datetime="${new Date(a.em).toISOString()}">${dataHora(a.em)}</time>${esc(a.texto)}</li>`).join('')}</ol>
    </section>
    <div><button type="button" class="btn btn-perigo btn-pequeno" data-g="excluir">Excluir contato</button></div>`;
  if (editando) {
    $('#e-int').value = l.interesse || '';
    $('#e-origem').value = l.origem;
    $('#e-nome').focus();
  }
}

$('#gaveta-in').addEventListener('click', (e) => {
  const g = e.target.closest('[data-g]')?.dataset.g;
  const l = state.leads.find((x) => x.id === leadAberto);
  if (!l) return;
  if (g === 'fechar') gaveta.close();
  if (g === 'editar') renderGaveta(!$('#g-editar'));
  if (g === 'excluir' && confirm(`Excluir ${l.nome}? Essa ação não pode ser desfeita.`)) {
    gaveta.close();
    commit(removerLead(state, l.id), 'Contato excluído.');
  }
  const etapa = e.target.closest('[data-etapa]')?.dataset.etapa;
  if (etapa && etapa !== l.etapa) commit(moverEtapa(state, l.id, etapa), `Movido para ${nomeEtapa[etapa]}.`);
});
$('#gaveta-in').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = leadAberto;
  try {
    if (e.target.id === 'g-nota') {
      commit(adicionarNota(state, id, $('#g-nota-txt').value), 'Anotação salva.');
      $('#g-nota-txt')?.focus();
    }
    if (e.target.id === 'g-tarefa') {
      const d = $('#g-t-data').value;
      commit(adicionarTarefa(state, { titulo: $('#g-t-titulo').value, leadId: id, venceEm: d ? new Date(`${d}T12:00`).getTime() : null }), 'Tarefa criada.');
    }
    if (e.target.id === 'g-editar') {
      const fd = Object.fromEntries(new FormData(e.target));
      fd.tags = String(fd.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
      commit(atualizarLead(state, id, fd), 'Alterações salvas.');
    }
  } catch (err) {
    const box = $('#e-erros');
    if (box && e.target.id === 'g-editar') box.textContent = err.message;
    else toast(err.message, 'erro');
  }
});

// ---------- Novo contato ----------
const modalNovo = $('#modal-novo');
function abrirNovo() {
  $('#form-novo').reset();
  $('#n-origem').value = 'manual';
  $('#novo-erros').textContent = '';
  modalNovo.showModal();
  $('#n-nome').focus();
}
$('#btn-novo').addEventListener('click', abrirNovo);
modalNovo.addEventListener('click', (e) => { if (e.target === modalNovo || e.target.closest('[data-fechar]')) modalNovo.close(); });
$('#form-novo').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = Object.fromEntries(new FormData(e.target));
  fd.tags = String(fd.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
  try {
    const { state: s, lead, duplicado } = adicionarLead(state, fd);
    commit(s, duplicado ? `${lead.nome} já existia e foi atualizado.` : `${lead.nome} adicionado.`);
    modalNovo.close();
  } catch (err) {
    $('#novo-erros').textContent = err.message;
  }
});

// ---------- Dados ----------
const hojeArquivo = () => new Date().toISOString().slice(0, 10);
$('#exp-csv').addEventListener('click', () => {
  if (!state.leads.length) return toast('Não há contatos para exportar.', 'erro');
  baixar(`contatos-${hojeArquivo()}.csv`, '﻿' + paraCSV(state.leads), 'text/csv');
  toast('Planilha baixada.');
});
$('#exp-json').addEventListener('click', () => {
  baixar(`backup-crm-${hojeArquivo()}.json`, JSON.stringify(state, null, 2), 'application/json');
  toast('Backup baixado.');
});
$('#imp-arquivo').addEventListener('change', async (e) => {
  const arq = e.target.files[0];
  if (!arq) return;
  const texto = (await arq.text()).replace(/^﻿/, '');
  e.target.value = '';
  try {
    if (arq.name.endsWith('.json')) {
      const s = JSON.parse(texto);
      if (!Array.isArray(s.leads) || !Array.isArray(s.tarefas)) throw new Error('O arquivo não é um backup deste CRM.');
      if (!confirm('Restaurar o backup substitui todos os dados atuais. Continuar?')) return;
      commit(s, `Backup restaurado com ${s.leads.length} contatos.`);
    } else {
      const r = importarCSV(state, texto);
      commit(r.state, `${r.importados} contatos importados.${r.erros.length ? ` ${r.erros.length} linhas ignoradas.` : ''}`);
      if (r.erros.length) console.warn(r.erros);
    }
  } catch (err) {
    toast(`Não foi possível importar: ${err.message}`, 'erro');
  }
});
function carregarDemo() {
  if (state.leads.length && !confirm('Substituir os dados atuais pela demonstração?')) return;
  commit(dadosDemo(), 'Demonstração carregada com 20 contatos.');
}
$('#btn-demo').addEventListener('click', carregarDemo);
$('#btn-limpar').addEventListener('click', () => {
  if (!confirm('Apagar todos os contatos e tarefas deste navegador?')) return;
  commit(estadoVazio(), 'Todos os dados foram apagados.');
});

// Atalho: tecla N abre novo contato
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey && !/input|textarea|select/i.test(document.activeElement.tagName) && !document.querySelector('dialog[open]')) {
    e.preventDefault();
    abrirNovo();
  }
});

// ---------- Conexão e inicialização ----------
function renderConexao(email) {
  $('#status-conexao').innerHTML = remoto
    ? `<p class="status-linha"><span class="status-ponto on"></span>Conectado ao banco online (Supabase)</p>
       <p>Os contatos ficam no banco da equipe e todo mundo vê as mudanças em tempo real. Você entrou como <strong>${esc(email || '')}</strong>.</p>
       <div class="linha-btns"><button class="btn btn-secundario" type="button" id="btn-sincronizar">Sincronizar agora</button><button class="btn btn-secundario" type="button" id="btn-sair">Sair</button></div>`
    : `<p class="status-linha"><span class="status-ponto"></span>Modo local: dados só neste navegador</p>
       <p>O site e o CRM compartilham os contatos quando abertos no mesmo navegador. Para a equipe usar junto, de qualquer lugar, preencha <code>js/config.js</code> com os dados do Supabase (veja <code>supabase/LEIAME.md</code> no repositório). Respeite a LGPD: guarde só o necessário e atenda pedidos de exclusão.</p>`;
}
document.addEventListener('click', async (e) => {
  if (e.target.id === 'btn-sair') { await sair(); location.reload(); }
  if (e.target.id === 'btn-sincronizar') {
    try { const r = await sincronizar(); toast(r.novos ? `${r.novos} novos contatos do site.` : 'Tudo atualizado.'); }
    catch (err) { toast(err.message, 'erro'); }
  }
});

async function abrirCRM(sessao) {
  $('#tela-login').hidden = true;
  $('#carregando').hidden = false;
  try {
    if (!(await souMembro())) {
      await sair();
      $('#carregando').hidden = true;
      $('#tela-login').hidden = false;
      $('#login-erros').textContent = `O e-mail ${sessao?.user?.email || ''} entrou, mas não está autorizado no CRM. Adicione-o na tabela crm_membros do Supabase.`;
      return;
    }
    const r = await sincronizar();
    await ouvirMudancas();
    if (r.novos) toast(`${r.novos} ${r.novos === 1 ? 'novo contato chegou' : 'novos contatos chegaram'} pelo site.`);
  } catch (err) {
    const msg = /permission|policy|row-level/i.test(err.message)
      ? 'Seu e-mail não está na lista de membros do CRM. Peça para adicioná-lo na tabela crm_membros.'
      : `Não foi possível carregar os dados: ${err.message}`;
    toast(msg, 'erro');
  }
  $('#carregando').hidden = true;
  $('#app').hidden = false;
  state = carregar();
  renderConexao(sessao?.user?.email);
  irPara(location.hash.slice(1) || 'painel');
}

async function iniciar() {
  if (!remoto) {
    renderConexao();
    irPara(location.hash.slice(1) || 'painel');
    return;
  }
  $('#app').hidden = true;
  $('#carregando').hidden = false;
  let sessao = null;
  try { sessao = await sessaoAtual(); } catch (err) { toast(`Sem conexão com o banco: ${err.message}`, 'erro'); }
  $('#carregando').hidden = true;
  if (sessao) return abrirCRM(sessao);
  $('#tela-login').hidden = false;
  $('#l-email').focus();
  $('#form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const botao = $('#form-login button');
    botao.disabled = true;
    $('#login-erros').textContent = '';
    try {
      abrirCRM(await entrar($('#l-email').value.trim(), $('#l-senha').value));
    } catch (err) {
      $('#login-erros').textContent = err.message;
    } finally {
      botao.disabled = false;
    }
  });
}
iniciar();
