create table if not exists public.joybit_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

alter table public.joybit_favorites enable row level security;
revoke all on public.joybit_favorites from anon;
grant select, insert, delete on public.joybit_favorites to authenticated;

create policy "joybit_favorites_select_own" on public.joybit_favorites
  for select to authenticated using (auth.uid() = user_id);
create policy "joybit_favorites_insert_own" on public.joybit_favorites
  for insert to authenticated with check (auth.uid() = user_id);
create policy "joybit_favorites_delete_own" on public.joybit_favorites
  for delete to authenticated using (auth.uid() = user_id);
