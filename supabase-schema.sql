-- ============================================================
-- Supabase schema for FeedbackPronounciation app
-- Run this in the Supabase SQL Editor (dashboard.supabase.com)
-- ============================================================

-- teacher_accounts (was: Firestore "teacherAccounts/{uid}")
create table if not exists public.teacher_accounts (
  id          text primary key,           -- auth.uid
  name        text not null,
  email       text not null,
  role        text not null default 'teacher',
  created_at  timestamptz not null default now()
);

-- student_accounts (was: Firestore "studentAccounts/{uid}")
create table if not exists public.student_accounts (
  id          text primary key,           -- auth.uid
  name        text,
  email       text,
  role        text not null default 'student',
  player_name text,
  created_at  timestamptz not null default now()
);

-- player_names (was: Firestore "Playername/{uid}")
create table if not exists public.player_names (
  id          text primary key,           -- auth.uid
  player_name text not null,
  email       text,
  created_at  timestamptz not null default now()
);

-- game_rooms (was: Firestore "GenerateRoom/{autoId}")
create table if not exists public.game_rooms (
  id            uuid primary key default gen_random_uuid(),
  room_name     text not null,
  creator_name  text,
  room_code     text not null unique,
  quiz_id       text,
  created_by    text not null,             -- auth.uid of the teacher
  creator_email text,
  created_at    timestamptz not null default now()
);

-- pronunciation_words (was: Firestore "PronunciationRoom/{autoId}")
create table if not exists public.pronunciation_words (
  id          uuid primary key default gen_random_uuid(),
  word        text not null,
  difficulty  text not null default 'easy',  -- easy | medium | hard
  room_id     text,                           -- game_rooms.id (stored as text)
  room_code   text,                           -- denormalised for easy look-up
  room_name   text,
  created_by  text,                           -- auth.uid
  created_at  timestamptz not null default now()
);

-- student_progress (was: Firestore "StudentProgress/{customId}")
-- id uses custom strings like "{uid}_PERSONAL_PRACTICE" or "{uid}_{roomCode}"
create table if not exists public.student_progress (
  id                    text primary key,
  user_id               text,
  email                 text,
  player_name           text,
  room_code             text,
  room_name             text,
  teacher_id            text,
  difficulty            text,
  score                 numeric,
  scores                jsonb,               -- number[]
  scores_array          jsonb,               -- number[] (alias)
  reader_level          integer,
  macro_level           integer,
  student_level         integer,
  assessment_completed  boolean default false,
  assessment_results    jsonb,
  macro_level_progress  jsonb,
  macro_level_map       jsonb,
  first_attempt_scores  jsonb,
  current_content_type  text,
  current_index         integer,
  current_word_index    integer,
  current_macro_level   integer,
  total_words           integer,
  last_word             text,
  completed             boolean,
  show_macro_results    boolean,
  is_personal_practice  boolean,
  name                  text,
  item_best_scores      jsonb,
  reader_level_progress jsonb,
  joined_at             timestamptz,
  last_activity         timestamptz,
  updated_at            text
);

-- student_result_join (was: Firestore "StudentResultJoin/{id}")
-- Used for the leaderboard — id can be custom or auto-generated.
create table if not exists public.student_result_join (
  id          text primary key default gen_random_uuid()::text,
  name        text,
  player_name text,
  score       numeric,
  difficulty  text,
  room_code   text,
  user_id     text,
  created_at  timestamptz not null default now()
);

-- joined_rooms (was: Firestore "JoinedRooms/{uid}")
create table if not exists public.joined_rooms (
  id          text primary key,            -- auth.uid
  room_codes  jsonb not null default '[]'::jsonb,
  updated_at  text
);

-- ============================================================
-- Row Level Security
-- Enable RLS on every table so only authenticated users can
-- read/write their own data.
-- ============================================================

alter table public.teacher_accounts     enable row level security;
alter table public.student_accounts     enable row level security;
alter table public.player_names         enable row level security;
alter table public.game_rooms           enable row level security;
alter table public.pronunciation_words  enable row level security;
alter table public.student_progress     enable row level security;
alter table public.student_result_join  enable row level security;
alter table public.joined_rooms         enable row level security;

-- teacher_accounts: users read/write their own row
create policy "teacher_accounts: own row" on public.teacher_accounts
  for all using (auth.uid()::text = id);

-- student_accounts: users read/write their own row
create policy "student_accounts: own row" on public.student_accounts
  for all using (auth.uid()::text = id);

-- player_names: users read/write their own row
create policy "player_names: own row" on public.player_names
  for all using (auth.uid()::text = id);

-- game_rooms: teachers write their own rooms; any authenticated user can read
create policy "game_rooms: authenticated read" on public.game_rooms
  for select using (auth.role() = 'authenticated');

create policy "game_rooms: teacher write" on public.game_rooms
  for all using (auth.uid()::text = created_by);

-- pronunciation_words: teachers write; authenticated users read
create policy "pronunciation_words: authenticated read" on public.pronunciation_words
  for select using (auth.role() = 'authenticated');

create policy "pronunciation_words: teacher write" on public.pronunciation_words
  for all using (auth.uid()::text = created_by);

-- student_progress: users write their own; authenticated read all (teachers need this)
create policy "student_progress: authenticated read" on public.student_progress
  for select using (auth.role() = 'authenticated');

create policy "student_progress: own write" on public.student_progress
  for all using (auth.uid()::text = user_id);

-- student_result_join: authenticated read; students write their own
create policy "student_result_join: authenticated read" on public.student_result_join
  for select using (auth.role() = 'authenticated');

create policy "student_result_join: own write" on public.student_result_join
  for all using (auth.uid()::text = user_id);

-- joined_rooms: users read/write their own row
create policy "joined_rooms: own row" on public.joined_rooms
  for all using (auth.uid()::text = id);

-- ============================================================
-- Realtime
-- Enable realtime publication for tables that use onSnapshot
-- ============================================================
alter publication supabase_realtime add table public.game_rooms;
alter publication supabase_realtime add table public.student_progress;
alter publication supabase_realtime add table public.pronunciation_words;
alter publication supabase_realtime add table public.student_result_join;
