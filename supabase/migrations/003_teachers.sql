-- Teacher profiles
create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  phone text,
  bio text,
  photo_url text,
  password_hash text not null,  -- scrypt: salt:hash (hex)
  is_active boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists on teachers(email);
create index if not exists on teachers(is_active);

-- Teacher session tokens (simple server-side store)
create table if not exists teacher_sessions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create index if not exists on teacher_sessions(token_hash);
create index if not exists on teacher_sessions(teacher_id);

-- Supabase Storage bucket for teacher photos (run this manually in Supabase dashboard
-- or via API if needed — Storage isn't SQL-configurable):
-- Bucket name: "teachers", public: true
