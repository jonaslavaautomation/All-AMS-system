-- =====================================================================
-- LAVA LMS — 0100 Foundation: private schema, shared triggers,
-- data-driven roles and permissions.
--
-- Permissions are DATA, not schema. New capabilities are added with
-- INSERTs into public.permissions / public.role_permissions — no table
-- changes and no policy rewrites are required, because RLS policies call
-- private.has_permission('<key>').
-- =====================================================================

-- Private schema for security helpers. It is NOT exposed through the
-- Data API (only "public" and "graphql_public" are exposed by default).
create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
grant usage on schema private to authenticated;

-- Defense in depth: anonymous users get no table privileges at all on
-- anything created in public from now on. RLS is still enabled everywhere.
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke execute on functions from anon;
alter default privileges in schema public revoke execute on functions from public;

-- ---------------------------------------------------------------------
-- Shared trigger: keep updated_at current.
-- ---------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- roles: the catalogue of roles. Keys are stable identifiers.
-- ---------------------------------------------------------------------
create table public.roles (
  key          text primary key
               check (key ~ '^[A-Z][A-Z_]{1,62}$'),
  name         text not null,
  description  text,
  is_system    boolean not null default false,  -- system roles cannot be deleted
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger roles_set_updated_at
  before update on public.roles
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- permissions: the catalogue of capabilities, e.g. 'course.publish'.
-- ---------------------------------------------------------------------
create table public.permissions (
  key          text primary key
               check (key ~ '^[a-z][a-z_]*\.[a-z][a-z_]*$'),
  description  text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger permissions_set_updated_at
  before update on public.permissions
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- role_permissions: which role grants which permission.
-- ---------------------------------------------------------------------
create table public.role_permissions (
  role_key        text not null references public.roles (key) on delete cascade,
  permission_key  text not null references public.permissions (key) on delete cascade,
  created_at      timestamptz not null default now(),
  primary key (role_key, permission_key)
);

create index role_permissions_permission_key_idx
  on public.role_permissions (permission_key);

-- ---------------------------------------------------------------------
-- Reference data (required in every environment, so it lives in the
-- migration, not in seed.sql).
-- ---------------------------------------------------------------------
insert into public.roles (key, name, description, is_system) values
  ('SUPER_ADMIN', 'Super Admin',  'Full administrative access.', true),
  ('TRAINER',     'Trainer',      'Accesses assigned students and their permitted training records.', true),
  ('TEAM_LEADER', 'Team Leader',  'Accesses students assigned to their team(s).', true),
  ('STUDENT',     'Student',      'Accesses only their own profile, courses, progress, results and certificates.', true);

insert into public.permissions (key, description) values
  ('course.create',               'Create courses (draft).'),
  ('course.update',               'Edit course content, modules, lessons and versions.'),
  ('course.publish',              'Publish a course.'),
  ('course.archive',              'Archive a course.'),
  ('course.delete',               'Delete a course that has no enrollments.'),
  ('course.read_all',             'Read every course, including drafts and archived.'),
  ('course.read_published',       'Read the published course catalogue.'),
  ('quiz.manage',                 'Create and edit quizzes, questions, options and answer keys.'),
  ('enrollment.create',           'Enroll students in courses.'),
  ('enrollment.manage',           'View and manage all enrollments and training records.'),
  ('role.assign',                 'Grant and revoke user roles.'),
  ('user.invite',                 'Invite new users.'),
  ('user.read_all',               'Read every user profile.'),
  ('team.manage',                 'Create teams and manage team membership.'),
  ('trainer_assignment.manage',   'Assign trainers to students.'),
  ('certificate.issue',           'Issue certificates.'),
  ('certificate.revoke',          'Revoke certificates.'),
  ('announcement.manage',         'Create and edit announcements.'),
  ('audit.read',                  'Read the audit log.');

-- SUPER_ADMIN receives every permission.
insert into public.role_permissions (role_key, permission_key)
select 'SUPER_ADMIN', key from public.permissions;

-- Trainers and Team Leaders can browse the published catalogue.
-- Their access to STUDENT records is relationship-based (assignment /
-- team leadership), not permission-based — see private.can_view_* helpers.
insert into public.role_permissions (role_key, permission_key) values
  ('TRAINER',     'course.read_published'),
  ('TEAM_LEADER', 'course.read_published');

-- STUDENT has no global permissions: access comes only from ownership
-- (their own rows) and enrollment (their assigned courses).
