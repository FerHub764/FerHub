# Renda em Casa

Site sobre como ganhar dinheiro trabalhando de casa, com CRM integrado.

## Páginas

- `index.html`: calculadora de renda (recibo interativo), teste de perfil com recomendação,
  catálogo de 12 caminhos com filtros e passo a passo, detector de golpes, plano de 30 dias
  com progresso salvo, formulário de captação (com consentimento LGPD) e perguntas frequentes.
- `crm.html`: painel com indicadores e gráficos, lista de contatos com busca, filtros e ações em
  lote, funil em kanban (arrastar e soltar), ficha do contato com histórico, notas e tarefas,
  lista de tarefas com prazos, exportação/importação CSV e backup JSON, dados de demonstração.

## Como funciona

HTML, CSS e JavaScript puros, sem etapa de build. Os contatos ficam no `localStorage` do navegador;
o site e o CRM compartilham os dados quando abertos no mesmo navegador (inclusive entre abas).
Para uso em equipe, troque `js/store.js` por um backend (Supabase, Firebase, Google Planilhas).

A lógica do CRM fica em `js/crm-core.js` (funções puras) e é testada em `tests/renda-crm.test.mjs`:

    npm test
    npm start   # abre em http://localhost:8080/renda/
