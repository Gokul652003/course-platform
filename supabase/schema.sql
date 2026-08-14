-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query).

-- One row per signed-in user, auto-populated on first login.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Per-user lesson completion. lesson_key mirrors the client's "moduleId:lessonIndex" format.
create table if not exists public.progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id text not null,
  lesson_key text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, course_id, lesson_key)
);

alter table public.progress enable row level security;

create policy "Users can view their own progress"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress"
  on public.progress for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own progress"
  on public.progress for delete
  using (auth.uid() = user_id);
