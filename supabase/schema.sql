-- Renda em Casa: banco do CRM no Supabase.
-- Cole tudo no SQL Editor do seu projeto e clique em Run. Pode rodar de novo sem problema.

-- 1) Quem pode usar o CRM (troque pelo(s) e-mail(s) da equipe no final do arquivo)
create table if not exists public.crm_membros (
  email text primary key
);

create or replace function public.eh_membro()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.crm_membros m
    where lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- 2) Caixa de entrada do formulário público: visitantes só podem INSERIR
create table if not exists public.inscricoes (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  nome text not null check (char_length(nome) between 1 and 120),
  email text check (email is null or char_length(email) <= 160),
  telefone text check (telefone is null or char_length(telefone) <= 20),
  interesse text check (interesse is null or char_length(interesse) <= 40),
  horas_semana int check (horas_semana is null or horas_semana between 0 and 80),
  origem text check (origem in ('site', 'teste')),
  recomendacoes jsonb not null default '[]'::jsonb check (jsonb_array_length(recomendacoes) <= 12),
  consentimento boolean not null check (consentimento = true)
);

-- 3) Dados do CRM (cada contato/tarefa é um documento JSON)
create table if not exists public.crm_leads (
  id text primary key,
  dados jsonb not null,
  atualizado_em timestamptz not null default now()
);

create table if not exists public.crm_tarefas (
  id text primary key,
  dados jsonb not null,
  atualizado_em timestamptz not null default now()
);

-- 4) Segurança por linha
alter table public.crm_membros enable row level security;
alter table public.inscricoes enable row level security;
alter table public.crm_leads enable row level security;
alter table public.crm_tarefas enable row level security;

drop policy if exists "visitante envia inscricao" on public.inscricoes;
create policy "visitante envia inscricao" on public.inscricoes
  for insert to anon, authenticated with check (true);

drop policy if exists "membro le inscricoes" on public.inscricoes;
create policy "membro le inscricoes" on public.inscricoes
  for select to authenticated using (public.eh_membro());

drop policy if exists "membro apaga inscricoes" on public.inscricoes;
create policy "membro apaga inscricoes" on public.inscricoes
  for delete to authenticated using (public.eh_membro());

drop policy if exists "membro gerencia leads" on public.crm_leads;
create policy "membro gerencia leads" on public.crm_leads
  for all to authenticated using (public.eh_membro()) with check (public.eh_membro());

drop policy if exists "membro gerencia tarefas" on public.crm_tarefas;
create policy "membro gerencia tarefas" on public.crm_tarefas
  for all to authenticated using (public.eh_membro()) with check (public.eh_membro());

drop policy if exists "membro ve membros" on public.crm_membros;
create policy "membro ve membros" on public.crm_membros
  for select to authenticated using (public.eh_membro());

-- 5) Tempo real: o CRM atualiza sozinho quando alguém da equipe mexe
do $$
begin
  begin alter publication supabase_realtime add table public.crm_leads; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.crm_tarefas; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.inscricoes; exception when duplicate_object then null; end;
end $$;

-- 6) TROQUE pelo e-mail que você vai usar para entrar no CRM (repita a linha para cada pessoa)
insert into public.crm_membros (email) values ('seu-email@exemplo.com') on conflict do nothing;
