-- Enable row level security features
create extension if not exists "uuid-ossp";

create type user_role as enum ('admin', 'editor', 'viewer');
create type field_type as enum (
  'short_text',
  'long_text',
  'number',
  'boolean',
  'select',
  'multi_select',
  'scale',
  'date',
  'file'
);
create type behavior_type as enum ('boolean', 'scale', 'number');

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  program_start_date date,
  timezone text,
  role user_role not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendars (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  description text,
  start_date date not null,
  duration_days int not null default 90,
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_days (
  id uuid primary key default uuid_generate_v4(),
  calendar_id uuid not null references public.calendars(id) on delete cascade,
  day_number int not null,
  day_date date not null,
  assignment_title text not null,
  assignment_summary text,
  tracker_prompt text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (calendar_id, day_number)
);

create table if not exists public.calendar_field_templates (
  id uuid primary key default uuid_generate_v4(),
  calendar_day_id uuid not null references public.calendar_days(id) on delete cascade,
  field_key text not null,
  field_label text not null,
  field_type field_type not null,
  help_text text,
  is_required boolean not null default false,
  options jsonb,
  order_index int not null default 0,
  data_unit text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_behavior_templates (
  id uuid primary key default uuid_generate_v4(),
  calendar_id uuid not null references public.calendars(id) on delete cascade,
  metric_key text not null,
  metric_label text not null,
  metric_type behavior_type not null,
  unit_label text,
  min_value int,
  max_value int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (calendar_id, metric_key)
);

create table if not exists public.calendar_entries (
  id uuid primary key default uuid_generate_v4(),
  calendar_day_id uuid not null references public.calendar_days(id) on delete cascade,
  field_template_id uuid not null references public.calendar_field_templates(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (calendar_day_id, field_template_id, user_id)
);

create table if not exists public.behavior_logs (
  id uuid primary key default uuid_generate_v4(),
  calendar_day_id uuid not null references public.calendar_days(id) on delete cascade,
  behavior_template_id uuid not null references public.calendar_behavior_templates(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  boolean_value boolean,
  numeric_value numeric,
  note text,
  created_at timestamptz not null default now(),
  unique (calendar_day_id, behavior_template_id, user_id)
);

create table if not exists public.insight_snapshots (
  id uuid primary key default uuid_generate_v4(),
  calendar_id uuid not null references public.calendars(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.therapy_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_number int not null,
  session_date date,
  therapist text,
  session_summary text,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, session_number)
);

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(
    select 1
    from public.profiles p
    where p.id = uid
      and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.is_admin(uuid) to service_role;

alter table public.profiles enable row level security;
alter table public.calendar_entries enable row level security;
alter table public.behavior_logs enable row level security;
alter table public.calendars enable row level security;
alter table public.calendar_days enable row level security;
alter table public.calendar_field_templates enable row level security;
alter table public.calendar_behavior_templates enable row level security;
alter table public.insight_snapshots enable row level security;
alter table public.therapy_sessions enable row level security;

create policy "Profiles are viewable per user" on public.profiles
  for select using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "Profiles self-manage" on public.profiles
  for update using (auth.uid() = id);

create policy "Profiles insertable by admins" on public.profiles
  for insert with check (public.is_admin(auth.uid()));

create policy "Profiles manageable by admins" on public.profiles
  for update using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Entries editable by owners" on public.calendar_entries
  for all using (auth.uid() = user_id);

create policy "Behavior logs editable by owners" on public.behavior_logs
  for all using (auth.uid() = user_id);

create policy "Calendars readable by authenticated users" on public.calendars
  for select using (auth.uid() is not null or public.is_admin(auth.uid()));

create policy "Calendars manageable by admins" on public.calendars
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Calendar days readable by authenticated users" on public.calendar_days
  for select using (auth.uid() is not null or public.is_admin(auth.uid()));

create policy "Calendar days manageable by admins" on public.calendar_days
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Field templates readable by authenticated users" on public.calendar_field_templates
  for select using (auth.uid() is not null or public.is_admin(auth.uid()));

create policy "Field templates manageable by admins" on public.calendar_field_templates
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Behavior templates readable by authenticated users" on public.calendar_behavior_templates
  for select using (auth.uid() is not null or public.is_admin(auth.uid()));

create policy "Behavior templates manageable by admins" on public.calendar_behavior_templates
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "Insight snapshots readable by owners" on public.insight_snapshots
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Insight snapshots managed by owners" on public.insight_snapshots
  for all using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Therapy sessions readable by owner" on public.therapy_sessions
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Therapy sessions upsert by owner" on public.therapy_sessions
  for all using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));
