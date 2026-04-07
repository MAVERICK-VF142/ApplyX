-- ─────────────────────────────────────────────────────────────────────────────
-- ApplyX v2 — Full Supabase Schema
-- Run this in the Supabase SQL Editor on a fresh project
-- ─────────────────────────────────────────────────────────────────────────────

-- Profiles (one row per auth user, created automatically on first login)
create table if not exists profiles (
  id            uuid references auth.users on delete cascade primary key,
  name          text,
  portfolio_url text,
  gmail_email   text,
  gmail_app_password text,          -- AES-256 encrypted by the server
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);


-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Resumes (one per user, upserted on upload)
create table if not exists resumes (
  user_id     uuid references auth.users on delete cascade primary key,
  resume_text text        not null,
  file_name   text,
  file_content text,                -- base64-encoded PDF for attachment
  updated_at  timestamptz default now()
);

alter table resumes enable row level security;

create policy "Users can read own resume"
  on resumes for select using (auth.uid() = user_id);

create policy "Users can insert own resume"
  on resumes for insert with check (auth.uid() = user_id);

create policy "Users can update own resume"
  on resumes for update using (auth.uid() = user_id);


-- Sent emails log
create table if not exists sent_emails (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade not null,
  recipient   text not null,
  subject     text,
  body        text,
  status      text default 'sent',
  created_at  timestamptz default now()
);

alter table sent_emails enable row level security;

create policy "Users can read own sent emails"
  on sent_emails for select using (auth.uid() = user_id);

create policy "Users can insert own sent emails"
  on sent_emails for insert with check (auth.uid() = user_id);
