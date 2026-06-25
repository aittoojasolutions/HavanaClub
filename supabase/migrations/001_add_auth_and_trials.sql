-- Run this if you already have the base schema in place

-- 1. Link Supabase auth users to customers
alter table customers
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;

-- 2. Trial classes
create table if not exists trial_classes (
  id uuid primary key default gen_random_uuid(),
  style dance_style not null,
  date date not null,
  start_time time not null default '18:00',
  instructor text not null,
  location text not null default 'Main Studio',
  capacity int not null default 15,
  created_at timestamptz default now()
);

-- 3. Trial signups
create table if not exists trial_signups (
  id uuid primary key default gen_random_uuid(),
  trial_class_id uuid references trial_classes(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  status text not null default 'confirmed',
  created_at timestamptz default now(),
  unique(trial_class_id, email)
);

create index if not exists on trial_classes(date);
create index if not exists on trial_signups(trial_class_id);
create index if not exists on trial_signups(email);
