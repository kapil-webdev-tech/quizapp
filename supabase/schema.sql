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
  owner_id uuid,
  subject text not null,
  topic text not null,
  prompt text not null,
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  payload jsonb not null default '{"topic":"","questions":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.active_recall_sheets
add column if not exists owner_id uuid;

update public.active_recall_sheets
set owner_id = coalesce(owner_id, user_id)
where owner_id is null;

alter table public.active_recall_sheets
alter column owner_id set not null;

alter table public.active_recall_sheets
add column if not exists visibility text not null default 'private';

alter table public.active_recall_sheets
drop constraint if exists active_recall_sheets_visibility_check;

alter table public.active_recall_sheets
add constraint active_recall_sheets_visibility_check
check (visibility in ('private', 'public'));

alter table public.active_recall_sheets
alter column payload set default '{"topic":"","questions":[]}'::jsonb;

create index if not exists active_recall_sheets_owner_id_idx
on public.active_recall_sheets(owner_id);

create index if not exists active_recall_sheets_visibility_updated_idx
on public.active_recall_sheets(visibility, updated_at desc);

create table if not exists public.active_recall_cards (
  id uuid primary key default gen_random_uuid(),
  sheet_id uuid not null references public.active_recall_sheets(id) on delete cascade,
  question text not null,
  answer text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists active_recall_cards_sheet_order_idx
on public.active_recall_cards(sheet_id, order_index);

create table if not exists public.user_recall_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  card_id uuid not null references public.active_recall_cards(id) on delete cascade,
  recall_status text not null default 'forgot' check (recall_status in ('forgot', 'partial', 'mastered')),
  recalled_points integer not null default 0 check (recalled_points >= 0),
  total_points integer not null default 1 check (total_points > 0),
  review_count integer not null default 0 check (review_count >= 0),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, card_id),
  check (recalled_points <= total_points)
);

create index if not exists user_recall_progress_user_idx
on public.user_recall_progress(user_id, updated_at desc);

create index if not exists user_recall_progress_card_idx
on public.user_recall_progress(card_id);

insert into public.active_recall_cards (
  id,
  sheet_id,
  question,
  answer,
  order_index,
  created_at,
  updated_at
)
select
  coalesce((question_item->>'id')::uuid, gen_random_uuid()),
  sheet.id,
  question_item->>'question',
  question_item->>'answer',
  question_index - 1,
  sheet.created_at,
  sheet.updated_at
from public.active_recall_sheets sheet
cross join lateral jsonb_array_elements(coalesce(sheet.payload->'questions', '[]'::jsonb))
with ordinality as legacy_questions(question_item, question_index)
where not exists (
  select 1
  from public.active_recall_cards card
  where card.sheet_id = sheet.id
)
and question_item ? 'question'
and question_item ? 'answer'
and nullif(question_item->>'question', '') is not null
and nullif(question_item->>'answer', '') is not null;

alter table public.active_recall_sheets enable row level security;
alter table public.active_recall_cards enable row level security;
alter table public.user_recall_progress enable row level security;

drop policy if exists "Users can read own recall sheets" on public.active_recall_sheets;
create policy "Users can read own recall sheets"
on public.active_recall_sheets
for select
using (auth.uid() = owner_id or auth.uid() = user_id);

drop policy if exists "Users can read public recall sheets" on public.active_recall_sheets;
create policy "Users can read public recall sheets"
on public.active_recall_sheets
for select
using (visibility = 'public');

drop policy if exists "Admins can read all recall sheets" on public.active_recall_sheets;
create policy "Admins can read all recall sheets"
on public.active_recall_sheets
for select
using (public.is_admin());

drop policy if exists "Users can insert own recall sheets" on public.active_recall_sheets;
create policy "Users can insert own recall sheets"
on public.active_recall_sheets
for insert
with check (auth.uid() = owner_id and auth.uid() = user_id);

drop policy if exists "Admins can insert recall sheets" on public.active_recall_sheets;
create policy "Admins can insert recall sheets"
on public.active_recall_sheets
for insert
with check (public.is_admin());

drop policy if exists "Users can update own recall sheets" on public.active_recall_sheets;
create policy "Users can update own recall sheets"
on public.active_recall_sheets
for update
using (auth.uid() = owner_id or auth.uid() = user_id)
with check (auth.uid() = owner_id and auth.uid() = user_id);

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
using (auth.uid() = owner_id or auth.uid() = user_id);

drop policy if exists "Admins can delete all recall sheets" on public.active_recall_sheets;
create policy "Admins can delete all recall sheets"
on public.active_recall_sheets
for delete
using (public.is_admin());

drop policy if exists "Users can read recall cards for accessible sheets" on public.active_recall_cards;
create policy "Users can read recall cards for accessible sheets"
on public.active_recall_cards
for select
using (
  exists (
    select 1
    from public.active_recall_sheets sheet
    where sheet.id = active_recall_cards.sheet_id
    and (
      sheet.visibility = 'public'
      or sheet.owner_id = auth.uid()
      or sheet.user_id = auth.uid()
    )
  )
);

drop policy if exists "Users can insert recall cards for own sheets" on public.active_recall_cards;
create policy "Users can insert recall cards for own sheets"
on public.active_recall_cards
for insert
with check (
  exists (
    select 1
    from public.active_recall_sheets sheet
    where sheet.id = active_recall_cards.sheet_id
    and (sheet.owner_id = auth.uid() or sheet.user_id = auth.uid())
  )
);

drop policy if exists "Users can update recall cards for own sheets" on public.active_recall_cards;
create policy "Users can update recall cards for own sheets"
on public.active_recall_cards
for update
using (
  exists (
    select 1
    from public.active_recall_sheets sheet
    where sheet.id = active_recall_cards.sheet_id
    and (sheet.owner_id = auth.uid() or sheet.user_id = auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.active_recall_sheets sheet
    where sheet.id = active_recall_cards.sheet_id
    and (sheet.owner_id = auth.uid() or sheet.user_id = auth.uid())
  )
);

drop policy if exists "Users can delete recall cards for own sheets" on public.active_recall_cards;
create policy "Users can delete recall cards for own sheets"
on public.active_recall_cards
for delete
using (
  exists (
    select 1
    from public.active_recall_sheets sheet
    where sheet.id = active_recall_cards.sheet_id
    and (sheet.owner_id = auth.uid() or sheet.user_id = auth.uid())
  )
);

drop policy if exists "Admins can manage all recall cards" on public.active_recall_cards;
create policy "Admins can manage all recall cards"
on public.active_recall_cards
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can read own recall progress" on public.user_recall_progress;
create policy "Users can read own recall progress"
on public.user_recall_progress
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own recall progress" on public.user_recall_progress;
create policy "Users can insert own recall progress"
on public.user_recall_progress
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own recall progress" on public.user_recall_progress;
create policy "Users can update own recall progress"
on public.user_recall_progress
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

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

-- =====================================================
-- SYLLABUS MANAGEMENT
-- =====================================================
create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),

  name_en text not null,
  name_hi text,

  slug text not null unique,

  description_en text,
  description_hi text,

  created_at timestamptz not null default now()
);

create unique index if not exists exams_name_en_unique
on public.exams (
  lower(trim(name_en))
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),

  name_en text not null,
  name_hi text,

  slug text not null unique,

  description_en text,
  description_hi text,

  created_at timestamptz not null default now()
);

create unique index if not exists subjects_name_en_unique
on public.subjects (
  lower(trim(name_en))
);
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),

  name_en text not null,
  name_hi text,

  slug text not null unique,

  description_en text,
  description_hi text,

  created_at timestamptz not null default now()
);

create unique index if not exists topics_name_en_unique
on public.topics (
  lower(trim(name_en))
);

create table if not exists public.exam_subjects (
  exam_id uuid not null
    references public.exams(id)
    on delete cascade,

  subject_id uuid not null
    references public.subjects(id)
    on delete cascade,

  primary key (
    exam_id,
    subject_id
  )
);

create table if not exists public.subject_topics (
  subject_id uuid not null
    references public.subjects(id)
    on delete cascade,

  topic_id uuid not null
    references public.topics(id)
    on delete cascade,

  primary key (
    subject_id,
    topic_id
  )
);

create table if not exists public.topic_relations (
  parent_topic_id uuid not null
    references public.topics(id)
    on delete cascade,

  child_topic_id uuid not null
    references public.topics(id)
    on delete cascade,

  relation_type text not null default 'contains',

  primary key (
    parent_topic_id,
    child_topic_id,
    relation_type
  ),

  check (
    parent_topic_id <> child_topic_id
  )
);