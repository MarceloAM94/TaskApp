-- ============================================================
-- Migración inicial: App de Control de Tareas Universitarias
-- Fase 1 (MVP)
--
-- NOTA DE SEGURIDAD: RLS está habilitado con una política
-- permisiva de ACCESO TOTAL (single-user, sin autenticación).
-- Si esta app se despliega públicamente o se agrega
-- autenticación, estas políticas DEBEN restringirse por usuario.
-- ============================================================

-- Extensiones -------------------------------------------------
create extension if not exists "pgcrypto";

-- Tabla: courses ----------------------------------------------
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  semester text,
  color text not null default '#8b5cf6',
  created_at timestamptz not null default now()
);

-- Tabla: tasks ------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses (id) on delete set null,
  title text not null,
  description text,
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'done')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  due_date date,
  progress integer not null default 0 check (progress between 0 and 100),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists tasks_course_id_idx on public.tasks (course_id);
create index if not exists tasks_status_idx on public.tasks (status);

-- Tabla: subtasks (Fase 2) ------------------------------------
create table if not exists public.subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  description text not null,
  is_done boolean not null default false,
  position integer not null default 0
);

create index if not exists subtasks_task_id_idx on public.subtasks (task_id);

-- RLS ----------------------------------------------------------
alter table public.courses enable row level security;
alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;

-- Política PERMISIVA total (single-user sin auth)
-- ⚠️ Restringir si se agrega autenticación
create policy "allow all courses" on public.courses
  for all using (true) with check (true);

create policy "allow all tasks" on public.tasks
  for all using (true) with check (true);

create policy "allow all subtasks" on public.subtasks
  for all using (true) with check (true);
