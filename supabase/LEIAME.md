# Ligar o CRM a um banco online (Supabase)

Sem isso, o CRM guarda os contatos só no navegador de quem usa. Com o Supabase (plano gratuito),
o formulário do site manda os contatos para um banco e toda a equipe vê o mesmo CRM, com login
e atualização em tempo real.

## Passo a passo (uns 5 minutos)

1. Acesse https://supabase.com, entre com o GitHub e clique em **New project**.
   Escolha um nome, uma senha de banco (guarde-a) e a região **South America (São Paulo)**.
2. Abra **SQL Editor**, clique em **New query**, cole o conteúdo de `supabase/schema.sql`.
   Na última linha, troque `seu-email@exemplo.com` pelo seu e-mail. Clique em **Run**.
3. Vá em **Authentication → Users → Add user → Create new user**. Use o mesmo e-mail e uma
   senha, e marque **Auto Confirm User**.
4. Vá em **Authentication → Sign In / Providers** e **desligue “Allow new users to sign up”**.
   Só você cria contas para a equipe.
5. Vá em **Project Settings → API** (ou **Data API**) e copie:
   - **Project URL** (ex.: `https://abcd1234.supabase.co`)
   - **anon public key** (começa com `eyJ...` ou `sb_publishable_...`)
6. Cole os dois em `site/renda/js/config.js`.

Pronto: abra `crm.html`, entre com seu e-mail e senha.

## Segurança

- A chave **anon/publishable** foi feita para ficar no site. Quem protege os dados são as regras
  do `schema.sql`: visitantes só conseguem **enviar** inscrições; ler, editar e apagar exige login
  **e** estar na tabela `crm_membros`.
- **Nunca** coloque a chave `service_role`/`secret` no site nem a envie para ninguém.
- Para adicionar alguém da equipe: crie o usuário (passo 3) e rode no SQL Editor
  `insert into crm_membros (email) values ('pessoa@exemplo.com');`

## Como funciona

- O formulário grava na tabela `inscricoes` (só inserção).
- Ao abrir o CRM, as inscrições novas viram contatos (sem duplicar e-mail ou WhatsApp) e saem da caixa de entrada.
- Contatos e tarefas ficam em `crm_leads` e `crm_tarefas`; mudanças de um membro aparecem para os outros em segundos.
