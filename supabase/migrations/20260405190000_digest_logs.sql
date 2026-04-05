create table if not exists public.digest_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  sent_at timestamptz not null default timezone('utc'::text, now()),
  status text not null,
  error_message text,
  counts jsonb not null default '{}'::jsonb,
  constraint digest_logs_status_check check (status in ('sent', 'error'))
);

create index if not exists digest_logs_user_id_sent_at_idx
  on public.digest_logs (user_id, sent_at desc);
