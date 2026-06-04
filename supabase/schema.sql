create extension if not exists pgcrypto;

create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_admins
    where user_id = auth.uid()
  );
$$;

drop policy if exists "Users can read own admin row" on public.app_admins;
create policy "Users can read own admin row"
on public.app_admins
for select
using (auth.uid() = user_id or public.is_admin());

do $$
declare
  admin_user_id uuid;
  admin_email text := 'admin@quizlab.local';
begin
  select id into admin_user_id
  from auth.users
  where email = admin_email
  limit 1;

  if admin_user_id is null then
    admin_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      admin_user_id,
      'authenticated',
      'authenticated',
      admin_email,
      crypt('admin1234', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      gen_random_uuid(),
      admin_user_id,
      jsonb_build_object(
        'sub', admin_user_id::text,
        'email', admin_email
      ),
      'email',
      admin_email,
      now(),
      now(),
      now()
    );
  end if;

  insert into public.app_admins (user_id)
  values (admin_user_id)
  on conflict (user_id) do nothing;
end $$;

create table if not exists public.quiz_attempts (
  id bigserial primary key,
  user_id uuid not null,
  quiz_slug text not null,
  completed_at timestamptz not null,
  score_percent integer not null,
  correct integer not null,
  total integer not null,
  category text not null,
  title text not null,
  answers_query text not null
);

alter table public.quiz_attempts enable row level security;

drop policy if exists "Users can read own attempts" on public.quiz_attempts;
create policy "Users can read own attempts"
on public.quiz_attempts
for select
using (auth.uid() = user_id);

drop policy if exists "Admins can read all attempts" on public.quiz_attempts;
create policy "Admins can read all attempts"
on public.quiz_attempts
for select
using (public.is_admin());

drop policy if exists "Users can insert own attempts" on public.quiz_attempts;
create policy "Users can insert own attempts"
on public.quiz_attempts
for insert
with check (auth.uid() = user_id);

drop policy if exists "Admins can insert attempts" on public.quiz_attempts;
create policy "Admins can insert attempts"
on public.quiz_attempts
for insert
with check (public.is_admin());

create table if not exists public.custom_quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  slug text not null,
  title text not null,
  category text not null,
  description text not null,
  is_public boolean not null default false,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, slug)
);

alter table public.custom_quizzes add column if not exists is_public boolean not null default false;

alter table public.custom_quizzes enable row level security;

drop policy if exists "Anyone can read public custom quizzes" on public.custom_quizzes;
create policy "Anyone can read public custom quizzes"
on public.custom_quizzes
for select
using (is_public = true);

drop policy if exists "Users can read own custom quizzes" on public.custom_quizzes;
create policy "Users can read own custom quizzes"
on public.custom_quizzes
for select
using (auth.uid() = user_id);

drop policy if exists "Admins can read all custom quizzes" on public.custom_quizzes;
create policy "Admins can read all custom quizzes"
on public.custom_quizzes
for select
using (public.is_admin());

drop policy if exists "Users can insert own custom quizzes" on public.custom_quizzes;
create policy "Users can insert own custom quizzes"
on public.custom_quizzes
for insert
with check (auth.uid() = user_id);

drop policy if exists "Admins can insert custom quizzes" on public.custom_quizzes;
create policy "Admins can insert custom quizzes"
on public.custom_quizzes
for insert
with check (public.is_admin());

drop policy if exists "Users can update own custom quizzes" on public.custom_quizzes;
create policy "Users can update own custom quizzes"
on public.custom_quizzes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Admins can update all custom quizzes" on public.custom_quizzes;
create policy "Admins can update all custom quizzes"
on public.custom_quizzes
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can delete own custom quizzes" on public.custom_quizzes;
create policy "Users can delete own custom quizzes"
on public.custom_quizzes
for delete
using (auth.uid() = user_id);

drop policy if exists "Admins can delete all custom quizzes" on public.custom_quizzes;
create policy "Admins can delete all custom quizzes"
on public.custom_quizzes
for delete
using (public.is_admin());

create table if not exists public.studio_drafts (
  user_id uuid primary key,
  draft jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.studio_drafts enable row level security;

drop policy if exists "Users can read own studio draft" on public.studio_drafts;
create policy "Users can read own studio draft"
on public.studio_drafts
for select
using (auth.uid() = user_id);

drop policy if exists "Admins can read all studio drafts" on public.studio_drafts;
create policy "Admins can read all studio drafts"
on public.studio_drafts
for select
using (public.is_admin());

drop policy if exists "Users can insert own studio draft" on public.studio_drafts;
create policy "Users can insert own studio draft"
on public.studio_drafts
for insert
with check (auth.uid() = user_id);

drop policy if exists "Admins can insert studio drafts" on public.studio_drafts;
create policy "Admins can insert studio drafts"
on public.studio_drafts
for insert
with check (public.is_admin());

drop policy if exists "Users can update own studio draft" on public.studio_drafts;
create policy "Users can update own studio draft"
on public.studio_drafts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Admins can update all studio drafts" on public.studio_drafts;
create policy "Admins can update all studio drafts"
on public.studio_drafts
for update
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.active_recall_sheets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  subject text not null,
  topic text not null,
  prompt text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.active_recall_sheets enable row level security;

drop policy if exists "Users can read own recall sheets" on public.active_recall_sheets;
create policy "Users can read own recall sheets"
on public.active_recall_sheets
for select
using (auth.uid() = user_id);

drop policy if exists "Admins can read all recall sheets" on public.active_recall_sheets;
create policy "Admins can read all recall sheets"
on public.active_recall_sheets
for select
using (public.is_admin());

drop policy if exists "Users can insert own recall sheets" on public.active_recall_sheets;
create policy "Users can insert own recall sheets"
on public.active_recall_sheets
for insert
with check (auth.uid() = user_id);

drop policy if exists "Admins can insert recall sheets" on public.active_recall_sheets;
create policy "Admins can insert recall sheets"
on public.active_recall_sheets
for insert
with check (public.is_admin());

drop policy if exists "Users can update own recall sheets" on public.active_recall_sheets;
create policy "Users can update own recall sheets"
on public.active_recall_sheets
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Admins can update all recall sheets" on public.active_recall_sheets;
create policy "Admins can update all recall sheets"
on public.active_recall_sheets
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can delete own recall sheets" on public.active_recall_sheets;
create policy "Users can delete own recall sheets"
on public.active_recall_sheets
for delete
using (auth.uid() = user_id);

drop policy if exists "Admins can delete all recall sheets" on public.active_recall_sheets;
create policy "Admins can delete all recall sheets"
on public.active_recall_sheets
for delete
using (public.is_admin());

drop policy if exists "Users can delete own studio draft" on public.studio_drafts;
create policy "Users can delete own studio draft"
on public.studio_drafts
for delete
using (auth.uid() = user_id);

drop policy if exists "Admins can delete all studio drafts" on public.studio_drafts;
create policy "Admins can delete all studio drafts"
on public.studio_drafts
for delete
using (public.is_admin());
