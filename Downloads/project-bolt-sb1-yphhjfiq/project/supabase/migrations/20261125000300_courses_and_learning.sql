-- =====================================================================
-- LAVA LMS — 0300 Courses and learning records
-- courses, course_versions, course_modules, lessons,
-- trainer_assignments, enrollments, lesson_progress
-- =====================================================================

-- ---------------------------------------------------------------------
-- courses — every course has an owner (created_by) and full lifecycle
-- stamps. Stamps are set by trigger and cannot be forged by clients.
-- ---------------------------------------------------------------------
create table public.courses (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title            text not null check (char_length(title) between 1 and 200),
  description      text,
  thumbnail_url    text,
  status           text not null default 'draft'
                   check (status in ('draft', 'published', 'archived')),
  current_version  integer not null default 0 check (current_version >= 0),
  created_by       uuid not null references public.profiles (id) on delete restrict,
  updated_by       uuid references public.profiles (id) on delete set null,
  published_at     timestamptz,
  published_by     uuid references public.profiles (id) on delete set null,
  archived_at      timestamptz,
  archived_by      uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create unique index courses_slug_key on public.courses (slug);
create index courses_status_idx on public.courses (status);
create index courses_created_by_idx on public.courses (created_by);
create index courses_updated_by_idx on public.courses (updated_by);
create index courses_published_by_idx on public.courses (published_by);
create index courses_archived_by_idx on public.courses (archived_by);

create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- course_versions — immutable snapshots, one per publish.
-- ---------------------------------------------------------------------
create table public.course_versions (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid not null references public.courses (id) on delete cascade,
  version_number  integer not null check (version_number > 0),
  snapshot        jsonb not null,
  change_summary  text,
  created_by      uuid references public.profiles (id) on delete set null,
  created_at      timestamptz not null default now(),
  unique (course_id, version_number)
);

create index course_versions_created_by_idx on public.course_versions (created_by);

-- ---------------------------------------------------------------------
-- course_modules
-- ---------------------------------------------------------------------
create table public.course_modules (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses (id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 200),
  description  text,
  position     integer not null check (position >= 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (course_id, position) deferrable initially deferred
);

create trigger course_modules_set_updated_at
  before update on public.course_modules
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- lessons
-- ---------------------------------------------------------------------
create table public.lessons (
  id                uuid primary key default gen_random_uuid(),
  module_id         uuid not null references public.course_modules (id) on delete cascade,
  title             text not null check (char_length(title) between 1 and 200),
  content_type      text not null default 'text'
                    check (content_type in ('text', 'video', 'document', 'quiz')),
  body              text,
  media_url         text,
  duration_minutes  integer check (duration_minutes is null or duration_minutes >= 0),
  position          integer not null check (position >= 0),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (module_id, position) deferrable initially deferred
);

create trigger lessons_set_updated_at
  before update on public.lessons
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- trainer_assignments — which trainer may see which student.
-- course_id NULL  => all of the student's training records
-- course_id set   => only records for that course
-- Written only by trusted backend code.
-- ---------------------------------------------------------------------
create table public.trainer_assignments (
  id           uuid primary key default gen_random_uuid(),
  trainer_id   uuid not null references public.profiles (id) on delete cascade,
  student_id   uuid not null references public.profiles (id) on delete cascade,
  course_id    uuid references public.courses (id) on delete cascade,
  assigned_by  uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (trainer_id <> student_id),
  unique nulls not distinct (trainer_id, student_id, course_id)
);

create index trainer_assignments_student_idx on public.trainer_assignments (student_id);
create index trainer_assignments_course_idx on public.trainer_assignments (course_id);
create index trainer_assignments_assigned_by_idx on public.trainer_assignments (assigned_by);

create trigger trainer_assignments_set_updated_at
  before update on public.trainer_assignments
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- enrollments — a student's assignment to a course.
-- Courses with enrollments cannot be deleted (archive instead), so
-- training history is never silently lost.
-- ---------------------------------------------------------------------
create table public.enrollments (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.courses (id) on delete restrict,
  student_id    uuid not null references public.profiles (id) on delete cascade,
  status        text not null default 'active'
                check (status in ('active', 'completed', 'withdrawn', 'expired')),
  enrolled_by   uuid references public.profiles (id) on delete set null,
  enrolled_at   timestamptz not null default now(),
  due_at        timestamptz,
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (course_id, student_id)
);

create index enrollments_student_idx on public.enrollments (student_id, status);
create index enrollments_enrolled_by_idx on public.enrollments (enrolled_by);

create trigger enrollments_set_updated_at
  before update on public.enrollments
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- lesson_progress — per-student lesson state.
-- student_id / course_id are derived from the enrollment by trigger and
-- are never taken from the client.
-- ---------------------------------------------------------------------
create table public.lesson_progress (
  id                uuid primary key default gen_random_uuid(),
  enrollment_id     uuid not null references public.enrollments (id) on delete cascade,
  lesson_id         uuid not null references public.lessons (id) on delete cascade,
  student_id        uuid not null references public.profiles (id) on delete cascade,
  course_id         uuid not null references public.courses (id) on delete cascade,
  status            text not null default 'in_progress'
                    check (status in ('not_started', 'in_progress', 'completed')),
  progress_percent  smallint not null default 0 check (progress_percent between 0 and 100),
  started_at        timestamptz not null default now(),
  completed_at      timestamptz,
  last_accessed_at  timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (enrollment_id, lesson_id)
);

create index lesson_progress_student_course_idx on public.lesson_progress (student_id, course_id);
create index lesson_progress_lesson_idx on public.lesson_progress (lesson_id);

create trigger lesson_progress_set_updated_at
  before update on public.lesson_progress
  for each row execute function private.set_updated_at();

-- Derive and validate lesson_progress ownership from the enrollment.
create or replace function private.lesson_progress_integrity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student uuid;
  v_course  uuid;
begin
  if tg_op = 'UPDATE' then
    if new.enrollment_id <> old.enrollment_id or new.lesson_id <> old.lesson_id then
      raise exception 'enrollment_id and lesson_id cannot be changed' using errcode = '42501';
    end if;
    new.started_at := old.started_at;
    new.created_at := old.created_at;
  end if;

  select e.student_id, e.course_id into v_student, v_course
    from public.enrollments e
   where e.id = new.enrollment_id;

  if not exists (
    select 1 from public.lessons l
      join public.course_modules m on m.id = l.module_id
     where l.id = new.lesson_id and m.course_id = v_course
  ) then
    raise exception 'Lesson does not belong to the enrolled course' using errcode = '23514';
  end if;

  new.student_id := v_student;
  new.course_id  := v_course;

  if new.status = 'completed' then
    new.progress_percent := 100;
    new.completed_at := coalesce(new.completed_at, now());
  else
    new.completed_at := null;
  end if;

  return new;
end;
$$;

revoke all on function private.lesson_progress_integrity() from public, anon, authenticated;

create trigger lesson_progress_integrity
  before insert or update on public.lesson_progress
  for each row execute function private.lesson_progress_integrity();
