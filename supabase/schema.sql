create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  kind text not null default 'generate' check (kind in ('generate','extract')),
  title text not null default 'Untitled template',
  status text not null default 'draft' check (status in ('draft','ready','generating','done','failed')),
  template_html text,
  page_setup jsonb not null default '{}',
  placeholders text[] not null default '{}',
  column_mapping jsonb not null default '{}',
  output_format text not null default 'docx' check (output_format in ('docx','pdf')),
  row_count integer,
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tasks_user_updated on public.tasks (user_id, updated_at desc);

alter table public.tasks enable row level security;

create policy "Users can view own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks for delete using (auth.uid() = user_id);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at before update on public.tasks
  for each row execute function public.handle_updated_at();
