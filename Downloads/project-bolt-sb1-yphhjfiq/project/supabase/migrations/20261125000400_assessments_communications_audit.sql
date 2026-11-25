-- =====================================================================
-- LAVA LMS — 0400 Assessments, certificates, communications, audit
-- quizzes, questions, quiz_options, quiz_attempts, quiz_responses,
-- certificates, announcements, notifications, audit_logs
-- =====================================================================

-- ---------------------------------------------------------------------
-- quizzes
-- ---------------------------------------------------------------------
create table public.quizzes (
  id                  uuid primary key default gen_random_uuid(),
  course_id           uuid not null references public.courses (id) on delete cascade,
  lesson_id           uuid references public.lessons (id) on delete set null,
  title               text not null check (char_length(title) between 1 and 200),
  description         text,
  passing_score       numeric(5,2) not null default 80 check (passing_score between 0 and 100),
  max_attempts        integer check (max_attempts is null or max_attempts > 0),
  time_limit_minutes  integer check (time_limit_minutes is null or time_limit_minutes > 0),
  is_published        boolean not null default false,
  created_by          uuid references public.profiles (id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index quizzes_course_idx on public.quizzes (course_id);
create index quizzes_lesson_idx on public.quizzes (lesson_id);
create index quizzes_created_by_idx on public.quizzes (created_by);

create trigger quizzes_set_updated_at
  before update on public.quizzes
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- questions
-- ---------------------------------------------------------------------
create table public.questions (
  id             uuid primary key default gen_random_uuid(),
  quiz_id        uuid not null references public.quizzes (id) on delete cascade,
  prompt         text not null check (char_length(prompt) between 1 and 4000),
  question_type  text not null default 'single_choice'
                 check (question_type in ('single_choice', 'multiple_choice', 'true_false')),
  points         numeric(6,2) not null default 1 check (points > 0),
  explanation    text,   -- shown only after grading (see RLS / column grants)
  position       integer not null check (position >= 0),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (quiz_id, position) deferrable initially deferred
);

create trigger questions_set_updated_at
  before update on public.questions
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- quiz_options — is_correct is the answer key. It is NOT readable by
-- students: column-level SELECT privileges exclude it (see 0600).
-- ---------------------------------------------------------------------
create table public.quiz_options (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references public.questions (id) on delete cascade,
  label        text not null check (char_length(label) between 1 and 1000),
  is_correct   boolean not null default false,
  position     integer not null check (position >= 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (question_id, position) deferrable initially deferred
);

create trigger quiz_options_set_updated_at
  before update on public.quiz_options
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- quiz_attempts — grades. Written only by server-side scoring functions.
-- ---------------------------------------------------------------------
create table public.quiz_attempts (
  id              uuid primary key default gen_random_uuid(),
  quiz_id         uuid not null references public.quizzes (id) on delete restrict,
  enrollment_id   uuid not null references public.enrollments (id) on delete cascade,
  student_id      uuid not null references public.profiles (id) on delete cascade,
  course_id       uuid not null references public.courses (id) on delete restrict,
  attempt_number  integer not null check (attempt_number > 0),
  status          text not null default 'in_progress'
                  check (status in ('in_progress', 'graded')),
  score           numeric(8,2),
  max_score       numeric(8,2),
  percentage      numeric(5,2) check (percentage is null or percentage between 0 and 100),
  passed          boolean,
  started_at      timestamptz not null default now(),
  submitted_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (quiz_id, student_id, attempt_number)
);

create index quiz_attempts_student_course_idx on public.quiz_attempts (student_id, course_id);
create index quiz_attempts_enrollment_idx on public.quiz_attempts (enrollment_id);
-- At most one in-progress attempt per student per quiz.
create unique index quiz_attempts_one_open_idx
  on public.quiz_attempts (quiz_id, student_id) where status = 'in_progress';

create trigger quiz_attempts_set_updated_at
  before update on public.quiz_attempts
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- quiz_responses
-- ---------------------------------------------------------------------
create table public.quiz_responses (
  id                   uuid primary key default gen_random_uuid(),
  attempt_id           uuid not null references public.quiz_attempts (id) on delete cascade,
  question_id          uuid not null references public.questions (id) on delete restrict,
  selected_option_ids  uuid[] not null default '{}',
  is_correct           boolean not null default false,
  points_awarded       numeric(6,2) not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create index quiz_responses_question_idx on public.quiz_responses (question_id);

create trigger quiz_responses_set_updated_at
  before update on public.quiz_responses
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- certificates
-- ---------------------------------------------------------------------
create table public.certificates (
  id                  uuid primary key default gen_random_uuid(),
  certificate_number  text not null unique,
  student_id          uuid not null references public.profiles (id) on delete cascade,
  course_id           uuid not null references public.courses (id) on delete restrict,
  enrollment_id       uuid references public.enrollments (id) on delete set null,
  course_version      integer,
  issued_at           timestamptz not null default now(),
  issued_by           uuid references public.profiles (id) on delete set null,
  expires_at          timestamptz,
  revoked_at          timestamptz,
  revoked_by          uuid references public.profiles (id) on delete set null,
  revoke_reason       text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check (revoked_by is null or revoked_at is not null)
);

-- One active (non-revoked) certificate per student per course.
create unique index certificates_active_unique
  on public.certificates (student_id, course_id) where revoked_at is null;
create index certificates_course_idx on public.certificates (course_id);
create index certificates_enrollment_idx on public.certificates (enrollment_id);
create index certificates_issued_by_idx on public.certificates (issued_by);

create trigger certificates_set_updated_at
  before update on public.certificates
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- announcements — audience-scoped broadcast messages.
-- ---------------------------------------------------------------------
create table public.announcements (
  id            uuid primary key default gen_random_uuid(),
  title         text not null check (char_length(title) between 1 and 200),
  body          text not null,
  audience      text not null default 'all'
                check (audience in ('all', 'team', 'course', 'role')),
  team_id       uuid references public.teams (id) on delete cascade,
  course_id     uuid references public.courses (id) on delete cascade,
  role_key      text references public.roles (key) on delete cascade,
  published_at  timestamptz,
  expires_at    timestamptz,
  created_by    uuid not null references public.profiles (id) on delete restrict,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (
    (audience = 'all'    and team_id is null and course_id is null and role_key is null) or
    (audience = 'team'   and team_id is not null and course_id is null and role_key is null) or
    (audience = 'course' and course_id is not null and team_id is null and role_key is null) or
    (audience = 'role'   and role_key is not null and team_id is null and course_id is null)
  ),
  check (expires_at is null or published_at is null or expires_at > published_at)
);

create index announcements_published_idx on public.announcements (published_at);
create index announcements_team_idx on public.announcements (team_id);
create index announcements_course_idx on public.announcements (course_id);
create index announcements_role_idx on public.announcements (role_key);
create index announcements_created_by_idx on public.announcements (created_by);

create trigger announcements_set_updated_at
  before update on public.announcements
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- notifications — private per-user messages.
-- ---------------------------------------------------------------------
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  type        text not null check (char_length(type) between 1 and 60),
  title       text not null check (char_length(title) between 1 and 200),
  body        text,
  link        text,
  read_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index notifications_user_unread_idx on public.notifications (user_id, created_at desc)
  where read_at is null;
create index notifications_user_idx on public.notifications (user_id, created_at desc);

create trigger notifications_set_updated_at
  before update on public.notifications
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- audit_logs — append-only. Written by SECURITY DEFINER triggers and
-- trusted backend code; never updated or deleted by any app role.
-- actor_id intentionally has no FK so history survives user deletion.
-- ---------------------------------------------------------------------
create table public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid,
  actor_role   text,                -- database role / JWT role at time of action
  action       text not null,       -- e.g. course.published, user_roles.insert
  entity_type  text not null,       -- table name or logical entity
  entity_id    uuid,
  old_data     jsonb,
  new_data     jsonb,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);
create index audit_logs_actor_idx on public.audit_logs (actor_id, created_at desc);
create index audit_logs_action_idx on public.audit_logs (action, created_at desc);
create index audit_logs_created_idx on public.audit_logs (created_at desc);
