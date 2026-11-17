import { METODOS, CATEGORIAS, NIVEL_INVESTIMENTO, PERGUNTAS, recomendar, calcularRenda } from './data.js';
import { adicionarLead } from './crm-core.js';
import { carregar, salvar, preferencia } from './store.js';
import { $, $$, esc, real, toast, iniciarTema } from './ui.js';

iniciarTema();

const porId = Object.fromEntries(METODOS.map((m) => [m.id, m]));
const SALARIO_MINIMO = 1518; // referência para comparação

// ---------- Menu mobile ----------
const menuBtn = $('.menu-btn');
const nav = $('#nav');
menuBtn.addEventListener('click', () => {
  const aberto = nav.classList.toggle('aberto');
  menuBtn.setAttribute('aria-expanded', String(aberto));
});
nav.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    nav.classList.remove('aberto');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
});

// ---------- Calculadora ----------
const calc = {
  horas: $('#calc-horas'),
  valor: $('#calc-valor'),
  taxa: $('#calc-taxa'),
  custo: $('#calc-custo'),
  metodo: $('#calc-metodo'),
};
calc.metodo.innerHTML =
  '<option value="">Usar valores de um caminho</option>' +
  METODOS.map((m) => `<option value="${m.id}">${esc(m.nome)}</option>`).join('');

function pintarTrilho(input) {
  const p = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty('--p', `${p}%`);
}

function atualizarCalc() {
  const horasSemana = +calc.horas.value;
  const valorHora = +calc.valor.value;
  const taxaPct = +calc.taxa.value;
  const custoMensal = +calc.custo.value;
  $('#out-horas').textContent = `${horasSemana} h`;
  $('#out-valor').textContent = real(valorHora);
  $('#out-taxa').textContent = `${taxaPct}%`;
  $('#out-custo').textContent = real(custoMensal);
  Object.values(calc).forEach((i) => i.type === 'range' && pintarTrilho(i));
  const r = calcularRenda({ horasSemana, valorHora, taxaPct, custoMensal });
  $('#r-bruto').textContent = real(r.bruto);
  $('#r-taxa').textContent = real(r.taxa);
  $('#r-custo').textContent = real(r.custo);
  $('#r-liquido').textContent = real(r.liquido);
  const vezes = r.liquido / SALARIO_MINIMO;
  const horasMes = Math.round(horasSemana * 4.33);
  $('#r-comparacao').textContent =
    r.liquido <= 0
      ? 'Com esses números os custos engolem a renda. Aumente o preço ou reduza custos.'
      : vezes >= 1
        ? `São cerca de ${horasMes} horas no mês e ${vezes.toFixed(1).replace('.', ',')} salários mínimos de referência.`
        : `São cerca de ${horasMes} horas no mês, ${Math.round(vezes * 100)}% de um salário mínimo de referência.`;
}
Object.values(calc).forEach((i) => i.addEventListener('input', atualizarCalc));
calc.metodo.addEventListener('change', () => {
  const m = porId[calc.metodo.value];
  if (m) simular(m, false);
});

function simular(m, rolar = true) {
  const medio = Math.round((m.hora[0] + m.hora[1]) / 2 / 5) * 5;
  calc.valor.value = Math.max(10, medio);
  calc.taxa.value = m.categoria === 'produto' ? 14 : m.categoria === 'servico' ? 10 : 5;
  calc.custo.value = [60, 150, 400][m.investimento];
  calc.metodo.value = m.id;
  atualizarCalc();
  if (rolar) document.getElementById('calculadora').scrollIntoView({ behavior: 'smooth' });
}
atualizarCalc();

// ---------- Teste de perfil ----------
const quiz = { passo: 0, respostas: { perfis: [] } };
const passosEl = $('#quiz-passos');
const corpoEl = $('#quiz-corpo');

function renderQuiz() {
  const total = PERGUNTAS.length;
  passosEl.innerHTML = PERGUNTAS.map((_, i) => {
    const cls = i < quiz.passo ? 'feito' : i === quiz.passo ? 'atual' : '';
    return `<li class="${cls}"><span class="sr-only">Pergunta ${i + 1}${i < quiz.passo ? ', respondida' : ''}</span></li>`;
  }).join('');
  if (quiz.passo >= total) return renderResultado();
  const q = PERGUNTAS[quiz.passo];
  const resp = quiz.respostas[q.id];
  const pressionado = (v) => (q.multiplo ? (resp || []).includes(v) : resp === v);
  corpoEl.innerHTML = `
    <p class="quiz-contador">Pergunta ${quiz.passo + 1} de ${total}</p>
    <h3 class="quiz-pergunta" tabindex="-1">${esc(q.texto)}</h3>
    <div class="opcoes" role="group" aria-label="${esc(q.texto)}">
      ${q.opcoes.map((o) => `<button type="button" class="opcao" data-valor="${esc(o.valor)}" aria-pressed="${pressionado(o.valor)}"><span class="marcador" aria-hidden="true"></span>${esc(o.rotulo)}</button>`).join('')}
    </div>
    <div class="quiz-nav">
      <button type="button" class="btn btn-secundario" data-acao="voltar" ${quiz.passo === 0 ? 'hidden' : ''}>Voltar</button>
      ${q.multiplo ? `<button type="button" class="btn btn-primario" data-acao="avancar" ${(resp || []).length ? '' : 'disabled'}>Ver resultado</button>` : ''}
    </div>`;
}

function renderResultado() {
  const top = recomendar(quiz.respostas).slice(0, 3);
  preferencia('quiz', JSON.stringify({ respostas: quiz.respostas, top: top.map((t) => t.metodo.id) }));
  corpoEl.innerHTML = `
    <h3 class="quiz-pergunta" tabindex="-1">Seus três melhores caminhos</h3>
    <p>Com ${quiz.respostas.horas <= 5 ? 'pouco tempo' : 'o tempo que você tem'} e ${quiz.respostas.investimento === 0 ? 'sem investir nada' : 'o investimento possível'}, estes são os que mais combinam com você.</p>
    <ol class="resultado-lista">
      ${top.map(({ metodo: m }, i) => `
        <li class="resultado">
          ${i === 0 ? '<span class="selo">Mais indicado</span>' : ''}
          <h3>${esc(m.nome)}</h3>
          <p>${esc(m.resumo)}</p>
          <p><strong>${real(m.hora[0])} a ${real(m.hora[1])}</strong> por hora, primeira renda em cerca de ${m.semanasPrimeiraRenda} ${m.semanasPrimeiraRenda === 1 ? 'semana' : 'semanas'}.</p>
          <div class="acoes">
            <button type="button" class="btn btn-primario btn-pequeno" data-plano="${m.id}">Quero esse plano</button>
            <button type="button" class="btn btn-secundario btn-pequeno" data-ver="${m.id}">Ver passo a passo</button>
          </div>
        </li>`).join('')}
    </ol>
    <div class="quiz-nav"><button type="button" class="btn btn-secundario" data-acao="refazer">Refazer o teste</button></div>`;
}

corpoEl.addEventListener('click', (e) => {
  const op = e.target.closest('.opcao');
  const acao = e.target.closest('[data-acao]')?.dataset.acao;
  const q = PERGUNTAS[quiz.passo];
  if (op && q) {
    const bruto = op.dataset.valor;
    const valor = q.multiplo ? bruto : Number(bruto);
    if (q.multiplo) {
      const lista = quiz.respostas.perfis;
      const i = lista.indexOf(valor);
      if (i >= 0) lista.splice(i, 1);
      else if (lista.length < 3) lista.push(valor);
      else return toast('Escolha no máximo três. Desmarque uma para trocar.');
      renderQuiz();
      corpoEl.querySelector(`[data-valor="${valor}"]`)?.focus();
    } else {
      quiz.respostas[q.id] = valor;
      quiz.passo++;
      renderQuiz();
      $('.quiz-pergunta', corpoEl)?.focus();
    }
    return;
  }
  if (acao === 'voltar') { quiz.passo = Math.max(0, quiz.passo - 1); renderQuiz(); }
  if (acao === 'avancar') { quiz.passo++; renderQuiz(); $('.quiz-pergunta', corpoEl)?.focus(); }
  if (acao === 'refazer') { quiz.passo = 0; quiz.respostas = { perfis: [] }; renderQuiz(); }
  const ver = e.target.closest('[data-ver]')?.dataset.ver;
  if (ver) abrirModal(porId[ver]);
  const plano = e.target.closest('[data-plano]')?.dataset.plano;
  if (plano) irParaFormulario(plano);
});
renderQuiz();

// ---------- Catálogo ----------
const filtro = { cat: '', busca: '', invest: 2, ordem: 'rapido' };
const chipsEl = $('#filtro-cat');
chipsEl.innerHTML = [['', 'Todos'], ...Object.entries(CATEGORIAS)]
  .map(([v, r]) => `<button type="button" class="chip" role="radio" data-cat="${v}" aria-checked="${v === ''}">${esc(r)}</button>`)
  .join('');
chipsEl.addEventListener('click', (e) => {
  const c = e.target.closest('.chip');
  if (!c) return;
  filtro.cat = c.dataset.cat;
  $$('.chip', chipsEl).forEach((x) => x.setAttribute('aria-checked', String(x === c)));
  renderCaminhos();
});
$('#filtro-busca').addEventListener('input', (e) => { filtro.busca = e.target.value; renderCaminhos(); });
$('#filtro-invest').addEventListener('change', (e) => { filtro.invest = +e.target.value; renderCaminhos(); });
$('#filtro-ordem').addEventListener('change', (e) => { filtro.ordem = e.target.value; renderCaminhos(); });

function semAcento(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function renderCaminhos() {
  const q = semAcento(filtro.busca.trim());
  const ord = {
    rapido: (a, b) => a.semanasPrimeiraRenda - b.semanasPrimeiraRenda,
    hora: (a, b) => b.hora[1] - a.hora[1],
    invest: (a, b) => a.investimento - b.investimento,
  }[filtro.ordem];
  const lista = METODOS.filter(
    (m) =>
      (!filtro.cat || m.categoria === filtro.cat) &&
      m.investimento <= filtro.invest &&
      (!q || semAcento([m.nome, m.resumo, ...m.plataformas].join(' ')).includes(q)),
  ).sort(ord);
  $('#caminhos-contagem').textContent = `${lista.length} ${lista.length === 1 ? 'caminho encontrado' : 'caminhos encontrados'}`;
  $('#lista-caminhos').innerHTML = lista.length
    ? lista.map((m) => `
      <li>
        <button type="button" class="caminho" data-ver="${m.id}">
          <span class="caminho-cat">${esc(CATEGORIAS[m.categoria])}</span>
          <h3>${esc(m.nome)}</h3>
          <p>${esc(m.resumo)}</p>
          <dl class="caminho-fatos">
            <div><dt>Por hora</dt><dd>${real(m.hora[0])}–${real(m.hora[1])}</dd></div>
            <div><dt>Investimento</dt><dd>${NIVEL_INVESTIMENTO[m.investimento]}</dd></div>
            <div><dt>1ª renda</dt><dd>~${m.semanasPrimeiraRenda} sem.</dd></div>
          </dl>
        </button>
      </li>`).join('')
    : '<li class="vazio">Nenhum caminho com esses filtros. Tente “Qualquer” no investimento ou limpe a busca.</li>';
}
$('#lista-caminhos').addEventListener('click', (e) => {
  const id = e.target.closest('[data-ver]')?.dataset.ver;
  if (id) abrirModal(porId[id]);
});
renderCaminhos();

// ---------- Modal ----------
const modal = $('#modal-caminho');
function abrirModal(m) {
  $('#modal-conteudo').innerHTML = `
    <div class="modal-cab">
      <div>
        <p class="caminho-cat">${esc(CATEGORIAS[m.categoria])}</p>
        <h2 id="modal-titulo">${esc(m.nome)}</h2>
      </div>
      <button type="button" class="fechar" data-fechar aria-label="Fechar">×</button>
    </div>
    <p>${esc(m.resumo)}</p>
    <dl class="modal-fatos">
      <div><dt>Valor por hora</dt><dd>${real(m.hora[0])} a ${real(m.hora[1])}</dd></div>
      <div><dt>Investimento</dt><dd>${NIVEL_INVESTIMENTO[m.investimento]}</dd></div>
      <div><dt>Primeira renda</dt><dd>Cerca de ${m.semanasPrimeiraRenda} ${m.semanasPrimeiraRenda === 1 ? 'semana' : 'semanas'}</dd></div>
    </dl>
    <h3>Passo a passo</h3>
    <ol class="passos-lista">${m.passos.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>
    <h3>Onde encontrar clientes</h3>
    <ul class="tags">${m.plataformas.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
    <p class="aviso"><strong>Atenção:</strong> ${esc(m.cuidado)}</p>
    <div class="modal-acoes">
      <button type="button" class="btn btn-primario" data-plano="${m.id}">Quero esse plano</button>
      <button type="button" class="btn btn-secundario" data-simular="${m.id}">Simular renda</button>
    </div>`;
  modal.showModal();
}
modal.addEventListener('click', (e) => {
  if (e.target === modal || e.target.closest('[data-fechar]')) return modal.close();
  const sim = e.target.closest('[data-simular]')?.dataset.simular;
  if (sim) { modal.close(); simular(porId[sim]); }
  const plano = e.target.closest('[data-plano]')?.dataset.plano;
  if (plano) { modal.close(); irParaFormulario(plano); }
});

// ---------- Detector de golpes ----------
const SINAIS = [
  ['Pede pagamento de taxa, kit ou cadastro para liberar a vaga', 3],
  ['Promete renda garantida ou valor fixo alto sem experiência', 2],
  ['Você ganha mais trazendo pessoas do que vendendo algo', 3],
  ['Pressão para decidir hoje: “últimas vagas”', 1],
  ['Pede senha, código do WhatsApp ou foto de documento cedo demais', 3],
  ['Pagam por curtir vídeos ou avaliar produtos e depois pedem depósito', 3],
  ['Empresa sem CNPJ, endereço ou avaliações que você consiga verificar', 2],
];
$('#sinais').innerHTML = SINAIS.map(([t, p], i) => `<li><label><input type="checkbox" value="${p}" data-i="${i}"><span>${esc(t)}</span></label></li>`).join('');
$('#sinais').addEventListener('change', () => {
  const marcados = $$('#sinais input:checked');
  const risco = marcados.reduce((s, i) => s + +i.value, 0);
  const pctRisco = Math.min(100, Math.round((risco / 6) * 100));
  const arco = $('#medidor-valor');
  arco.setAttribute('stroke-dasharray', `${marcados.length ? Math.max(4, pctRisco) : 0} 100`);
  let cor = 'var(--verde)';
  let rotulo = 'Nenhum sinal marcado';
  let texto = 'Marque os itens ao lado conforme a proposta que você recebeu.';
  if (risco >= 3) {
    cor = 'var(--alerta)';
    rotulo = 'Risco alto de golpe';
    texto = 'Não pague nada e não envie dados. Denuncie o perfil na plataforma e, se perdeu dinheiro, registre boletim de ocorrência.';
  } else if (risco > 0) {
    cor = 'var(--moeda)';
    rotulo = 'Atenção';
    texto = 'Pesquise o CNPJ no site da Receita, busque avaliações e nunca pague antes de receber.';
  }
  arco.setAttribute('stroke', cor);
  $('#medidor-rotulo').textContent = rotulo;
  $('#medidor-texto').textContent = texto;
});

// ---------- Plano de 30 dias ----------
const SEMANAS = [
  ['Escolher e preparar', ['Escolher um único caminho', 'Definir horário fixo na semana', 'Separar um canto de trabalho', 'Calcular seu preço mínimo']],
  ['Mostrar o que faz', ['Criar 3 amostras ou produtos de vitrine', 'Montar portfólio ou catálogo simples', 'Configurar WhatsApp Business', 'Criar perfil em uma plataforma']],
  ['Buscar os primeiros clientes', ['Avisar 20 pessoas da sua rede', 'Enviar 5 propostas por dia', 'Oferecer condição para os 3 primeiros', 'Anotar cada contato no CRM']],
  ['Entregar e ajustar', ['Entregar no prazo combinado', 'Pedir depoimento e indicação', 'Revisar o preço com base nas horas reais', 'Planejar o mês seguinte']],
];
let plano = {};
try { plano = JSON.parse(preferencia('plano30') || '{}'); } catch { plano = {}; }
function renderSemanas() {
  $('#semanas').innerHTML = SEMANAS.map(([titulo, itens], s) => {
    const feitos = itens.filter((_, i) => plano[`${s}-${i}`]).length;
    return `
      <li class="semana">
        <span class="semana-num" aria-hidden="true">${s + 1}</span>
        <h3>Semana ${s + 1}: ${esc(titulo)}</h3>
        <ul>${itens.map((t, i) => `<li><label><input type="checkbox" data-k="${s}-${i}" ${plano[`${s}-${i}`] ? 'checked' : ''}><span>${esc(t)}</span></label></li>`).join('')}</ul>
        <div class="semana-barra" role="progressbar" aria-label="Progresso da semana ${s + 1}" aria-valuemin="0" aria-valuemax="${itens.length}" aria-valuenow="${feitos}"><i style="width:${(feitos / itens.length) * 100}%"></i></div>
      </li>`;
  }).join('');
}
$('#semanas').addEventListener('change', (e) => {
  const k = e.target.dataset.k;
  if (!k) return;
  plano[k] = e.target.checked;
  preferencia('plano30', JSON.stringify(plano));
  const foco = k;
  renderSemanas();
  $(`[data-k="${foco}"]`)?.focus();
});
renderSemanas();

// ---------- Formulário de lead ----------
const form = $('#form-lead');
const selInteresse = $('#f-interesse');
selInteresse.innerHTML = '<option value="">Ainda não sei</option>' + METODOS.map((m) => `<option value="${m.id}">${esc(m.nome)}</option>`).join('');

function irParaFormulario(id) {
  selInteresse.value = id;
  const q = quiz.respostas.horas;
  if (q) $('#f-horas').value = String(q);
  document.getElementById('contato').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => $('#f-nome').focus({ preventScroll: true }), 450);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const errosEl = $('#form-erros');
  $$('[aria-invalid]', form).forEach((i) => i.removeAttribute('aria-invalid'));
  if (!fd.get('consentimento')) {
    errosEl.innerHTML = 'Marque a autorização de contato para receber o plano.';
    $('#f-consent').focus();
    return;
  }
  let quizSalvo = null;
  try { quizSalvo = JSON.parse(preferencia('quiz') || 'null'); } catch { /* sem teste */ }
  try {
    const { state, lead, duplicado } = adicionarLead(carregar(), {
      nome: fd.get('nome'),
      email: fd.get('email'),
      telefone: fd.get('telefone'),
      interesse: fd.get('interesse'),
      horasSemana: fd.get('horasSemana'),
      origem: quizSalvo ? 'teste' : 'site',
      recomendacoes: quizSalvo?.top || [],
      consentimento: true,
    });
    salvar(state);
    errosEl.innerHTML = '';
    form.hidden = true;
    const ok = $('#form-ok');
    ok.hidden = false;
    $('#ok-nome').textContent = lead.nome.split(' ')[0];
    const m = porId[lead.interesse];
    $('#ok-texto').textContent = duplicado
      ? 'Já tínhamos seu contato e atualizamos suas preferências. Fique de olho no e-mail e no WhatsApp.'
      : `Seu pedido foi registrado${m ? ` para ${m.nome.toLowerCase()}` : ''}. Enquanto isso, comece pela semana 1 do plano.`;
    ok.focus();
    toast(duplicado ? 'Contato atualizado.' : 'Plano solicitado.');
  } catch (err) {
    errosEl.innerHTML = `<ul>${(err.erros || [err.message]).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    if (/nome/i.test(err.message)) $('#f-nome').setAttribute('aria-invalid', 'true');
    if (/e-mail/i.test(err.message)) $('#f-email').setAttribute('aria-invalid', 'true');
    if (/WhatsApp/i.test(err.message)) $('#f-tel').setAttribute('aria-invalid', 'true');
    $('[aria-invalid="true"]', form)?.focus();
  }
});
$('#ok-novo').addEventListener('click', () => {
  form.reset();
  form.hidden = false;
  $('#form-ok').hidden = true;
  $('#f-nome').focus();
});
