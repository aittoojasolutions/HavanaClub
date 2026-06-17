-- Havana Club Dance Studio — Database Schema
-- Run this in your Supabase SQL editor

create type dance_style as enum ('salsa', 'bachata');
create type day_of_week as enum ('monday','tuesday','wednesday','thursday','friday','saturday','sunday');
create type booking_role as enum ('leader','follower','general');
create type booking_type as enum ('drop_in','pack','subscription');
create type booking_status as enum ('confirmed','cancelled');
create type instance_status as enum ('scheduled','cancelled');
create type subscription_tier as enum ('1','2','3');

-- Class templates (recurring or one-off)
create table classes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  style dance_style not null,
  instructor text not null,
  day_of_week day_of_week not null,
  start_time time not null,
  duration_minutes int not null default 90,
  is_recurring boolean not null default true,
  is_pairwork boolean not null default false,
  leader_capacity int,
  follower_capacity int,
  general_capacity int,
  location text not null default 'Main Studio',
  created_at timestamptz default now()
);

-- Individual class occurrences
create table class_instances (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade,
  date date not null,
  status instance_status not null default 'scheduled',
  leader_spots_taken int not null default 0,
  follower_spots_taken int not null default 0,
  general_spots_taken int not null default 0,
  created_at timestamptz default now(),
  unique(class_id, date)
);

-- Customers
create table customers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  stripe_customer_id text unique,
  pack_credits_remaining int not null default 0,
  subscription_tier int check (subscription_tier in (1,2,3)),
  subscription_stripe_id text,
  created_at timestamptz default now()
);

-- Bookings
create table bookings (
  id uuid primary key default gen_random_uuid(),
  customer_email text not null,
  customer_name text not null,
  class_instance_id uuid references class_instances(id) on delete cascade,
  role booking_role not null default 'general',
  booking_type booking_type not null,
  stripe_payment_intent_id text,
  stripe_session_id text,
  status booking_status not null default 'confirmed',
  created_at timestamptz default now()
);

-- Indexes
create index on class_instances(date);
create index on class_instances(class_id);
create index on bookings(customer_email);
create index on bookings(class_instance_id);

-- Seed data: 5 example classes
insert into classes (title, style, instructor, day_of_week, start_time, is_recurring, is_pairwork, leader_capacity, follower_capacity, general_capacity, location) values
  ('Salsa Beginners', 'salsa', 'Carlos M.', 'monday', '19:00', true, true, 10, 10, null, 'Main Studio'),
  ('Bachata Intermediate', 'bachata', 'Sofia R.', 'wednesday', '20:30', true, true, 8, 8, null, 'Main Studio'),
  ('Salsa Open Level', 'salsa', 'Carlos M.', 'friday', '19:00', true, false, null, null, 20, 'Main Studio'),
  ('Bachata Beginners', 'bachata', 'Sofia R.', 'saturday', '11:00', true, true, 10, 10, null, 'Studio B'),
  ('Salsa Technique', 'salsa', 'Marco L.', 'thursday', '20:00', true, false, null, null, 15, 'Main Studio');
