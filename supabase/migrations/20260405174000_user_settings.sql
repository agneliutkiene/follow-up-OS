create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  digest_enabled boolean not null default true,
  digest_time_local text not null default '08:00',
  timezone text not null default 'UTC',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint user_settings_digest_time_format check (
    digest_time_local ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
  ),
  constraint user_settings_timezone_not_empty check (char_length(trim(timezone)) > 0)
);

alter table public.user_settings enable row level security;

drop policy if exists user_settings_select_own on public.user_settings;
create policy user_settings_select_own on public.user_settings
  for select
  using (auth.uid() = user_id);

drop policy if exists user_settings_insert_own on public.user_settings;
create policy user_settings_insert_own on public.user_settings
  for insert
  with check (auth.uid() = user_id);

drop policy if exists user_settings_update_own on public.user_settings;
create policy user_settings_update_own on public.user_settings
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_user_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
before update on public.user_settings
for each row
execute function public.set_user_settings_updated_at();
