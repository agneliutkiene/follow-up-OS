create extension if not exists "pgcrypto";

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  email text,
  x_handle text,
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint contacts_name_not_empty check (char_length(trim(name)) > 0),
  constraint contacts_id_user_unique unique (id, user_id)
);

create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  contact_id uuid not null,
  title text not null,
  type text not null default 'other',
  status text not null default 'open',
  next_followup_at timestamptz,
  next_message_draft text,
  last_touched_at timestamptz not null default timezone('utc'::text, now()),
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint threads_title_not_empty check (char_length(trim(title)) > 0),
  constraint threads_type_check check (type in ('lead', 'invoice', 'meeting', 'other')),
  constraint threads_status_check check (status in ('open', 'closed')),
  constraint threads_open_requires_followup check (
    status = 'closed' or next_followup_at is not null
  ),
  constraint threads_contact_user_fk foreign key (contact_id, user_id)
    references public.contacts (id, user_id) on delete cascade,
  constraint threads_id_user_unique unique (id, user_id)
);

create table if not exists public.touches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  thread_id uuid not null,
  body text not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint touches_body_not_empty check (char_length(trim(body)) > 0),
  constraint touches_thread_user_fk foreign key (thread_id, user_id)
    references public.threads (id, user_id) on delete cascade
);

create index if not exists threads_user_id_next_followup_at_idx
  on public.threads (user_id, next_followup_at);

create index if not exists threads_user_id_status_idx
  on public.threads (user_id, status);

create index if not exists threads_user_id_contact_id_idx
  on public.threads (user_id, contact_id);

create index if not exists touches_user_id_thread_id_idx
  on public.touches (user_id, thread_id);

alter table public.contacts enable row level security;
alter table public.threads enable row level security;
alter table public.touches enable row level security;

drop policy if exists contacts_own_rows on public.contacts;
create policy contacts_own_rows on public.contacts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists threads_own_rows on public.threads;
create policy threads_own_rows on public.threads
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists touches_own_rows on public.touches;
create policy touches_own_rows on public.touches
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_thread_last_touched_on_followup_change()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status
    or new.next_followup_at is distinct from old.next_followup_at then
    new.last_touched_at = timezone('utc'::text, now());
  end if;

  return new;
end;
$$;

drop trigger if exists threads_set_last_touched_on_followup on public.threads;
create trigger threads_set_last_touched_on_followup
before update on public.threads
for each row
execute function public.set_thread_last_touched_on_followup_change();

create or replace function public.set_thread_last_touched_from_touch()
returns trigger
language plpgsql
as $$
begin
  update public.threads
    set last_touched_at = timezone('utc'::text, now())
  where id = new.thread_id
    and user_id = new.user_id;

  return new;
end;
$$;

drop trigger if exists touches_set_thread_last_touched on public.touches;
create trigger touches_set_thread_last_touched
after insert on public.touches
for each row
execute function public.set_thread_last_touched_from_touch();
