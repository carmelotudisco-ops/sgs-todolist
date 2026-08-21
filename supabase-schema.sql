-- ============================================================
-- SGS To Do List — schema del database
-- Da eseguire in Supabase: sezione "SQL Editor" → New query → Run
-- ============================================================

-- Tabella dei task
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  urgency text not null check (urgency in ('urgente', 'normale', 'non-urgente')),
  status text not null default 'attivo' check (status in ('attivo', 'archiviato')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Abilita la sicurezza a livello di riga (obbligatoria su Supabase)
alter table public.tasks enable row level security;

-- Chiunque abbia fatto login (un membro del team) può leggere tutti i task
create policy "team can read tasks"
  on public.tasks for select
  to authenticated
  using (true);

-- Chiunque abbia fatto login può creare nuovi task
create policy "team can insert tasks"
  on public.tasks for insert
  to authenticated
  with check (true);

-- Chiunque abbia fatto login può modificare i task (es. completarli/riattivarli)
create policy "team can update tasks"
  on public.tasks for update
  to authenticated
  using (true);

-- Chiunque abbia fatto login può eliminare i task
create policy "team can delete tasks"
  on public.tasks for delete
  to authenticated
  using (true);

-- Abilita gli aggiornamenti in tempo reale sulla tabella
-- (così quando una persona completa un task, gli altri lo vedono subito)
alter publication supabase_realtime add table public.tasks;
