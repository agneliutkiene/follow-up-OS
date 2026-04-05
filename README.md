# NoSlip (MVP)

NoSlip is a lightweight follow-up tracker for solopreneurs so no lead, invoice, or client thread loses its next action.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Auth)
- Supabase Row Level Security (RLS)

## What this MVP includes

- Auth: `/login` with email + password (sign up + sign in)
- Inbox: `/inbox`
  - Buckets: Due Today, Overdue, Upcoming 7d, Closed
  - Row actions: Open, Mark done, Snooze 2d, Snooze 7d
- Contacts: `/contacts`
  - Create + edit contacts
- Settings: `/settings`
  - Daily digest enable/disable, local send time, timezone
  - Send test digest immediately
- Thread detail: `/threads/[id]`
  - Edit title/type/status/next follow-up/draft
  - Add touches (activity log)
  - Mark follow-up done with enforced rule:
    - set next follow-up date, or
    - close thread
  - `Generate draft` stub button (template-based, no AI)

## Core rules enforced

- Open threads must have `next_followup_at`.
  - Enforced in UI and DB constraint.
- Mark done must either:
  - set `next_followup_at`, or
  - set `status = closed`.
- Snooze shifts `next_followup_at` forward.
- `last_touched_at` updates when:
  - a touch is added (DB trigger),
  - follow-up status/date changes (DB trigger),
  - mark-done actions are executed.

## Database

Migration files:

- `supabase/migrations/20260405131500_init_follow_up_os.sql`
- `supabase/migrations/20260405174000_user_settings.sql`
- `supabase/migrations/20260405190000_digest_logs.sql`

Includes:

- Tables: `contacts`, `threads`, `touches`
- Additional tables: `user_settings`, `digest_logs`
- Required indexes:
  - `threads(user_id, next_followup_at)`
  - `threads(user_id, status)`
  - `threads(user_id, contact_id)`
- Digest delivery:
  - Protected cron endpoint: `/api/cron/digest`
  - Shared-secret header required: `x-cron-secret`
- RLS enabled on user-facing tables: `contacts`, `threads`, `touches`, `user_settings`
- Policies: user can only CRUD own rows (`user_id = auth.uid()`)
- `digest_logs` is server-written via service role key (no RLS in MVP)

## Setup

## 1) Create Supabase project

1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. In project settings, copy:
   - Project URL
   - `anon` key
   - `service_role` key (seed script only)

## 2) Apply migration

### Option A: SQL Editor (fastest)

1. Open Supabase project -> SQL Editor
2. Paste contents of:
   - `supabase/migrations/20260405131500_init_follow_up_os.sql`
   - `supabase/migrations/20260405174000_user_settings.sql`
   - `supabase/migrations/20260405190000_digest_logs.sql`
3. Run the SQL

### Option B: Supabase CLI

1. Install Supabase CLI
2. Link/init project as needed
3. Run migration with your normal Supabase CLI flow (`supabase db push`)

## 3) Configure Auth

In Supabase dashboard:

1. Go to Authentication -> Providers -> Email
2. Enable Email provider
3. Enable email+password sign-in
4. Optional: disable email confirmation for faster local MVP testing

## 4) Configure env vars

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Set values:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
DIGEST_FROM_EMAIL="NoSlip <noreply@yourdomain.com>"
PUBLIC_BASE_URL="http://localhost:3000"
DIGEST_CRON_SECRET=...
DEMO_USER_EMAIL=demo@followupos.local
DEMO_USER_PASSWORD=DemoPass123
```

Notes:

- `NEXT_PUBLIC_*` vars are used by the web app.
- `SUPABASE_SERVICE_ROLE_KEY` is used only in server contexts (`scripts/seed.ts`, digest cron route, and settings test-digest action).
- `RESEND_API_KEY` is server-only (never expose in client code).
- Do not expose service role key in client code.

## 5) Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 6) Seed demo data

This creates/updates a demo user, then inserts:

- 5 contacts
- 8 threads (overdue, due today, upcoming 7d, closed mix)
- 10 touches

Run:

```bash
npm run seed:demo
```

Then log in with:

- `DEMO_USER_EMAIL`
- `DEMO_USER_PASSWORD`

## 7) Test daily digest locally

From `/settings`, click **Send test digest** to send a digest immediately to the signed-in user email.

You can also trigger the cron route directly:

```bash
curl -H "x-cron-secret: $DIGEST_CRON_SECRET" \
  "http://localhost:3000/api/cron/digest?force=1"
```

- `force=1` sends to all users with `digest_enabled=true`.
- Without `force=1`, the route only sends users that are currently due based on `digest_time_local` and `timezone`.

## Useful scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run seed:demo
```

## Optional deploy (Vercel)

1. Push this repo to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

(Do not add `SUPABASE_SERVICE_ROLE_KEY` unless you specifically run seed/admin scripts in server contexts.)
