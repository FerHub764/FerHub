# Passagem de contexto: site "Renda em Casa" + CRM

Resumo da conversa anterior (sessão na nuvem), para a sessão local continuar de onde parou.
Responda sempre em português do Brasil.

## Pedido original do usuário

"Crie um site completo com CRM, design interativo e etc, tema: Como ganhar dinheiro em casa."
Depois pediu para ligar o CRM a um banco online e, por fim, para eu atuar no PC/Chrome dele.

## O que está pronto (branch `claude/youthful-planck-g07jyh`)

Tudo em `site/renda/` (HTML, CSS e JS puros, sem build):

- `index.html`: página principal. Calculadora de renda (recibo interativo), teste de perfil com
  recomendação, 12 caminhos com filtros e modal, detector de golpes, plano de 30 dias (progresso
  salvo), formulário de captação com consentimento LGPD, FAQ, tema claro/escuro.
- `crm.html`: painel com KPIs e gráficos, contatos (busca, filtros, ações em lote), funil kanban
  (arrastar e soltar), ficha do contato (histórico, notas, tarefas, WhatsApp/e-mail), tarefas,
  exportar/importar CSV, backup JSON, dados de demonstração, login e tempo real no modo online.
- `js/crm-core.js`: lógica pura do CRM (testada). `js/data.js`: catálogo, quiz e calculadora.
- `js/store.js`: dois modos. **Local** (localStorage) quando `js/config.js` está vazio;
  **Online** (Supabase) quando tem URL e chave.
- `tests/renda-crm.test.mjs`: 18 testes, todos passando (`npm test`). Incluídos no CI (`.github/workflows/pages.yml`).
- `supabase/schema.sql` e `supabase/LEIAME.md`: banco, regras de segurança (RLS) e passo a passo.
- Skill `supabase-server` instalada em `.claude/skills/` e pacote `@supabase/server` no `package.json`
  (o site atual NÃO usa esse pacote; seria para uma Edge Function anti-spam futura).

Prévia publicada (modo local): https://claude.ai/artifact/1uzAr4YcesfM2ZysgXirzJ

## Estado do Supabase

- Projeto: `https://opcomlydvfrswgzmlzhc.supabase.co`
- `site/renda/js/config.js` já aponta para ele com a chave **publishable** (pública por design).
- A biblioteca `supabase-js` do site está fixada na 2.118.0.
- **Faltam 3 passos manuais no painel do Supabase** (a sessão da nuvem não alcança o Supabase):
  1. SQL Editor: colar `supabase/schema.sql`, trocar `seu-email@exemplo.com` na última linha
     pelo e-mail do usuário e clicar em Run.
  2. Authentication > Users > Add user: mesmo e-mail, com uma senha, marcando Auto Confirm User.
  3. Authentication > Sign In / Providers: desligar "Allow new users to sign up".
- Depois: abrir `crm.html` (via `npm start`, em http://localhost:8080/renda/crm.html), entrar,
  enviar um contato pelo formulário do `index.html` e confirmar que ele aparece no CRM.

## Segurança (importante)

- O usuário colou a chave `sb_secret_...` no chat. Ela **não** foi gravada em nenhum arquivo.
  Peça para ele **revogá-la e gerar outra** (Project Settings > API Keys). Nunca use essa chave no site.
- Nunca colocar chave secret/service_role em arquivo do repositório.

## Ambiente do usuário

- Usa o Claude Desktop em um notebook Windows (computador "Eduardo").
- A sessão anterior era na nuvem e não conseguia usar as pastas dele (Remote Control listava
  `System32`, `Nova pasta` e uma pasta sem nome como "não disponíveis"). Recomendar remover `System32`
  da lista de Remote Control.
- Esta sessão local deve rodar no notebook, onde há acesso a pastas e ao Chrome.

## Próximos passos sugeridos

1. Fazer ou guiar os 3 passos do Supabase (se o Chrome estiver disponível, pode fazê-los com aprovação do usuário).
2. Testar o fluxo real: formulário > banco > CRM, login, mudança de etapa, tarefas.
3. Abrir pull request para `main` (somente se o usuário pedir) para o GitHub Pages publicar em `/renda/`.
4. Opcional: Edge Function com `@supabase/server` para anti-spam (captcha, limite por IP) e aviso de novo contato.
5. Revisar as faixas de valor por hora em `site/renda/js/data.js` (são estimativas minhas, não oficiais).

## Como rodar localmente

```bash
git clone https://github.com/FerHub764/FerHub.git
cd FerHub
git checkout claude/youthful-planck-g07jyh
npm install
npm test
npm start
```

Abra http://localhost:8080/renda/ (site) e http://localhost:8080/renda/crm.html (CRM).
