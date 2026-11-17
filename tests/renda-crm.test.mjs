import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  estadoVazio, adicionarLead, validarLead, moverEtapa, adicionarNota, atualizarLead, removerLead,
  adicionarTarefa, alternarTarefa, filtrarLeads, metricas, paraCSV, lerCSV, importarCSV, dadosDemo, pontuarLead,
} from '../site/renda/js/crm-core.js';
import { recomendar, calcularRenda, METODOS } from '../site/renda/js/data.js';

const AGORA = Date.UTC(2026, 10, 17, 15);

test('valida nome e contato obrigatórios', () => {
  assert.ok(validarLead({}).length >= 2);
  assert.deepEqual(validarLead({ nome: 'Ana', email: 'ana@exemplo.com' }), []);
  assert.match(validarLead({ nome: 'Ana', email: 'ana@' }).join(), /e-mail/);
  assert.match(validarLead({ nome: 'Ana', telefone: '123' }).join(), /WhatsApp/);
  assert.deepEqual(validarLead({ nome: 'Ana', telefone: '(11) 91234-5678' }), []);
});

test('adiciona lead sem mutar o estado original', () => {
  const s0 = estadoVazio();
  const { state, lead, duplicado } = adicionarLead(s0, { nome: ' Ana ', email: 'ANA@Exemplo.com', origem: 'site' }, AGORA);
  assert.equal(s0.leads.length, 0);
  assert.equal(state.leads.length, 1);
  assert.equal(lead.nome, 'Ana');
  assert.equal(lead.email, 'ana@exemplo.com');
  assert.equal(lead.etapa, 'novo');
  assert.equal(duplicado, false);
  assert.equal(lead.atividades[0].tipo, 'criado');
});

test('mescla duplicado pelo e-mail ou telefone', () => {
  let { state } = adicionarLead(estadoVazio(), { nome: 'Ana', email: 'ana@exemplo.com' }, AGORA);
  const r = adicionarLead(state, { nome: 'Ana S.', email: 'ana@exemplo.com', telefone: '11912345678', interesse: 'aulas' }, AGORA + 1);
  assert.equal(r.duplicado, true);
  assert.equal(r.state.leads.length, 1);
  assert.equal(r.lead.interesse, 'aulas');
  assert.equal(r.lead.telefone, '11912345678');
  const r2 = adicionarLead(r.state, { nome: 'Outra', telefone: '(11) 91234-5678' }, AGORA + 2);
  assert.equal(r2.duplicado, true);
});

test('move etapa, anota e registra histórico', () => {
  let { state, lead } = adicionarLead(estadoVazio(), { nome: 'Bia', email: 'bia@exemplo.com' }, AGORA);
  state = moverEtapa(state, lead.id, 'proposta', AGORA + 10);
  state = adicionarNota(state, lead.id, 'Pediu orçamento', AGORA + 20);
  const l = state.leads[0];
  assert.equal(l.etapa, 'proposta');
  assert.equal(l.atividades[0].texto, 'Pediu orçamento');
  assert.match(l.atividades[1].texto, /Novo para Proposta/);
  assert.throws(() => moverEtapa(state, lead.id, 'xyz'));
  assert.throws(() => adicionarNota(state, lead.id, '  '));
});

test('atualiza campos permitidos e rejeita dados inválidos', () => {
  let { state, lead } = adicionarLead(estadoVazio(), { nome: 'Caio', email: 'caio@exemplo.com' }, AGORA);
  state = atualizarLead(state, lead.id, { valor: '250', tags: ['vip'], etapa: 'cliente' });
  assert.equal(state.leads[0].valor, 250);
  assert.equal(state.leads[0].etapa, 'novo', 'etapa só muda via moverEtapa');
  assert.throws(() => atualizarLead(state, lead.id, { nome: '' }));
});

test('remove lead junto com suas tarefas', () => {
  let { state, lead } = adicionarLead(estadoVazio(), { nome: 'Davi', email: 'd@exemplo.com' }, AGORA);
  state = adicionarTarefa(state, { titulo: 'Ligar', leadId: lead.id }, AGORA);
  state = adicionarTarefa(state, { titulo: 'Geral' }, AGORA);
  state = removerLead(state, lead.id);
  assert.equal(state.leads.length, 0);
  assert.deepEqual(state.tarefas.map((t) => t.titulo), ['Geral']);
});

test('tarefas alternam e exigem título', () => {
  let s = adicionarTarefa(estadoVazio(), { titulo: 'X' }, AGORA);
  s = alternarTarefa(s, s.tarefas[0].id);
  assert.equal(s.tarefas[0].feita, true);
  assert.throws(() => adicionarTarefa(s, { titulo: '' }));
});

test('filtra por busca, etapa e ordena', () => {
  const s = dadosDemo(AGORA);
  const clientes = filtrarLeads(s.leads, { etapa: 'cliente' });
  assert.ok(clientes.every((l) => l.etapa === 'cliente'));
  const busca = filtrarLeads(s.leads, { busca: 'ana souza' });
  assert.equal(busca.length, 1);
  const ord = filtrarLeads(s.leads, { ordem: 'pontuacao' });
  for (let i = 1; i < ord.length; i++) assert.ok(ord[i - 1].pontuacao >= ord[i].pontuacao);
});

test('métricas somam receita, pipeline e série diária', () => {
  let s = estadoVazio();
  s = adicionarLead(s, { nome: 'A', email: 'a@exemplo.com', etapa: 'cliente', valor: 200 }, AGORA).state;
  s = adicionarLead(s, { nome: 'B', email: 'b@exemplo.com', etapa: 'proposta', valor: 100 }, AGORA).state;
  s = adicionarLead(s, { nome: 'C', email: 'c@exemplo.com', etapa: 'perdido' }, AGORA).state;
  const m = metricas(s, AGORA);
  assert.equal(m.total, 3);
  assert.equal(m.receita, 200);
  assert.equal(m.pipeline, 100);
  assert.equal(m.taxaGanho, 0.5);
  assert.equal(m.serie.length, 14);
  assert.equal(m.serie.at(-1).total, 3);
});

test('CSV ida e volta preserva aspas, vírgulas e tags', () => {
  let s = adicionarLead(estadoVazio(), { nome: 'Eva "Doces", ME', email: 'eva@exemplo.com', tags: ['a', 'b'], valor: 90 }, AGORA).state;
  const csv = paraCSV(s.leads);
  const linhas = lerCSV(csv);
  assert.equal(linhas[0].nome, 'Eva "Doces", ME');
  assert.equal(linhas[0].tags, 'a|b');
  const r = importarCSV(estadoVazio(), csv, AGORA);
  assert.equal(r.importados, 1);
  assert.deepEqual(r.state.leads[0].tags, ['a', 'b']);
  assert.equal(r.state.leads[0].valor, 90);
});

test('importação relata linhas inválidas sem abortar', () => {
  const r = importarCSV(estadoVazio(), 'nome,email\nOk,ok@exemplo.com\n,sem@nome.com\n', AGORA);
  assert.equal(r.importados, 1);
  assert.equal(r.erros.length, 1);
  assert.match(r.erros[0], /Linha 3/);
});

test('pontuação fica entre 0 e 100', () => {
  assert.equal(pontuarLead({ etapa: 'perdido' }), 0);
  const p = pontuarLead({ email: 'x', telefone: 'y', interesse: 'z', recomendacoes: [1], horasSemana: 30, valor: 10, etapa: 'cliente' });
  assert.equal(p, 100);
});

test('dados de demonstração são válidos e determinísticos', () => {
  const a = dadosDemo(AGORA);
  const b = dadosDemo(AGORA);
  assert.equal(a.leads.length, 20);
  assert.deepEqual(a.leads.map((l) => l.etapa), b.leads.map((l) => l.etapa));
  assert.ok(a.leads.every((l) => l.nome.includes('(demo)')));
});

test('recomendação respeita perfil, investimento e urgência', () => {
  const r = recomendar({ perfis: ['ensino'], investimento: 0, urgencia: 2, horas: 15 });
  assert.equal(r[0].metodo.id, 'aulas');
  const cozinha = recomendar({ perfis: ['cozinha'], investimento: 2, urgencia: 2 });
  assert.equal(cozinha[0].metodo.id, 'doces');
  assert.equal(r.length, METODOS.length);
});

test('calculadora desconta taxa e custo sem ficar negativa', () => {
  const r = calcularRenda({ horasSemana: 10, valorHora: 40, taxaPct: 10, custoMensal: 100 });
  assert.ok(Math.abs(r.bruto - 1732) < 1);
  assert.ok(Math.abs(r.liquido - (1732 - 173.2 - 100)) < 1);
  assert.equal(calcularRenda({ horasSemana: 1, valorHora: 10, custoMensal: 1000 }).liquido, 0);
});
