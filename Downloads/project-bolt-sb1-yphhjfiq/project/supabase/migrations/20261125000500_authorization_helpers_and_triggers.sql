-- =====================================================================
-- LAVA LMS — 0500 Authorization helpers, lifecycle and audit triggers
--
-- All helpers:
--   * live in the non-exposed "private" schema,
--   * are SECURITY DEFINER so they can read role/assignment tables
--     WITHOUT re-entering RLS (this is what prevents recursive policies),
--   * use an empty search_path and fully-qualified names,
--   * derive the caller ONLY from auth.uid() — they never accept a
--     "who am I" argument from the client,
--   * are executable by "authenticated" only (never anon / public).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Identity / role / permission checks
-- ---------------------------------------------------------------------
create or replace function private.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
     where p.id = (select auth.uid()) and p.status = 'active'
  );
$$;

create or replace function private.has_role(p_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.user_roles ur
      join public.profiles p on p.id = ur.user_id
     where ur.user_id = (select auth.uid())
       and ur.role_key = p_role
       and p.status = 'active'
  );
$$;

create or replace function private.has_permission(p_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.user_roles ur
      join public.role_permissions rp on rp.role_key = ur.role_key
      join public.profiles p on p.id = ur.user_id
     where ur.user_id = (select auth.uid())
       and rp.permission_key = p_permission
       and p.status = 'active'
  );
$$;

-- ---------------------------------------------------------------------
-- Relationship checks
-- ---------------------------------------------------------------------

-- Caller is a TRAINER assigned to this student (any scope).
create or replace function private.is_trainer_of(p_student uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_role('TRAINER') and exists (
    select 1 from public.trainer_assignments ta
     where ta.trainer_id = (select auth.uid())
       and ta.student_id = p_student
  );
$$;

-- Caller is a TRAINER whose assignment covers this student's course.
create or replace function private.trainer_covers(p_student uuid, p_course uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_role('TRAINER') and exists (
    select 1 from public.trainer_assignments ta
     where ta.trainer_id = (select auth.uid())
       and ta.student_id = p_student
       and (ta.course_id is null or ta.course_id = p_course)
  );
$$;

-- Caller is a TEAM_LEADER who leads an active team the student is a MEMBER of.
create or replace function private.is_team_leader_of(p_student uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_role('TEAM_LEADER') and exists (
    select 1
      from public.team_members leader
      join public.team_members member on member.team_id = leader.team_id
      join public.teams t on t.id = leader.team_id
     where leader.user_id = (select auth.uid())
       and leader.membership_role = 'LEADER'
       and member.user_id = p_student
       and member.membership_role = 'MEMBER'
       and t.archived_at is null
  );
$$;

-- Caller is a TEAM_LEADER who leads this team.
create or replace function private.leads_team(p_team uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_role('TEAM_LEADER') and exists (
    select 1 from public.team_members tm
     where tm.team_id = p_team
       and tm.user_id = (select auth.uid())
       and tm.membership_role = 'LEADER'
  );
$$;

-- Caller belongs to this team in any capacity.
create or replace function private.is_team_member(p_team uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.team_members tm
     where tm.team_id = p_team and tm.user_id = (select auth.uid())
  );
$$;

-- May the caller see this user's profile (personal information)?
create or replace function private.can_view_user(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_user = (select auth.uid())
      or private.has_permission('user.read_all')
      or private.is_trainer_of(p_user)
      or private.is_team_leader_of(p_user);
$$;

-- May the caller see this student's training records (enrollment,
-- progress, grades, certificates) for this course?
create or replace function private.can_view_training_record(p_student uuid, p_course uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_student = (select auth.uid())
      or private.has_permission('enrollment.manage')
      or private.trainer_covers(p_student, p_course)
      or private.is_team_leader_of(p_student);
$$;

-- Caller (an active user) holds an active/completed enrollment in the course.
create or replace function private.is_enrolled(p_course uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_active_user() and exists (
    select 1 from public.enrollments e
     where e.course_id = p_course
       and e.student_id = (select auth.uid())
       and e.status in ('active', 'completed')
  );
$$;

-- May the caller read this course's content?
create or replace function private.can_read_course(p_course uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_permission('course.read_all') or exists (
    select 1 from public.courses c
     where c.id = p_course
       and (
         (c.status = 'published' and private.has_permission('course.read_published'))
         or (c.status <> 'draft' and private.is_enrolled(c.id))
       )
  );
$$;

-- Lock down execution: authenticated only.
revoke all on all functions in schema private from public, anon;
grant execute on function
  private.is_active_user(),
  private.has_role(text),
  private.has_permission(text),
  private.is_trainer_of(uuid),
  private.trainer_covers(uuid, uuid),
  private.is_team_leader_of(uuid),
  private.leads_team(uuid),
  private.is_team_member(uuid),
  private.can_view_user(uuid),
  private.can_view_training_record(uuid, uuid),
  private.is_enrolled(uuid),
  private.can_read_course(uuid)
to authenticated;

-- ---------------------------------------------------------------------
-- Course lifecycle: ownership + publish/archive stamps.
-- Clients cannot forge created_by / published_by / archived_by.
-- When called with the service role (auth.uid() is null) the backend
-- must supply the actor columns explicitly.
-- ---------------------------------------------------------------------
create or replace function private.courses_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
begin
  if tg_op = 'INSERT' then
    if v_actor is not null then
      new.created_by := v_actor;
    end if;
    new.updated_by      := coalesce(v_actor, new.updated_by, new.created_by);
    new.published_at    := null;
    new.published_by    := null;
    new.archived_at     := null;
    new.archived_by     := null;
    new.current_version := 0;

    if new.status = 'archived' then
      raise exception 'A course cannot be created as archived' using errcode = '23514';
    elsif new.status = 'published' then
      if v_actor is not null and not private.has_permission('course.publish') then
        raise exception 'Missing permission: course.publish' using errcode = '42501';
      end if;
      new.published_at    := now();
      new.published_by    := coalesce(v_actor, new.created_by);
      new.current_version := 1;
    end if;
    return new;
  end if;

  -- UPDATE: ownership and creation time are immutable.
  new.created_by := old.created_by;
  new.created_at := old.created_at;
  new.updated_by := coalesce(v_actor, new.updated_by);

  if new.status is distinct from old.status then
    if new.status = 'published' then
      if v_actor is not null and not private.has_permission('course.publish') then
        raise exception 'Missing permission: course.publish' using errcode = '42501';
      end if;
      new.published_at    := now();
      new.published_by    := coalesce(v_actor, new.published_by);
      new.archived_at     := null;
      new.archived_by     := null;
      new.current_version := old.current_version + 1;
    elsif new.status = 'archived' then
      if v_actor is not null and not private.has_permission('course.archive') then
        raise exception 'Missing permission: course.archive' using errcode = '42501';
      end if;
      new.archived_at     := now();
      new.archived_by     := coalesce(v_actor, new.archived_by);
      new.published_at    := old.published_at;
      new.published_by    := old.published_by;
      new.current_version := old.current_version;
    else -- back to draft (unpublish)
      if v_actor is not null and not private.has_permission('course.publish') then
        raise exception 'Missing permission: course.publish' using errcode = '42501';
      end if;
      new.archived_at     := null;
      new.archived_by     := null;
      new.published_at    := old.published_at;
      new.published_by    := old.published_by;
      new.current_version := old.current_version;
    end if;
  else
    new.published_at    := old.published_at;
    new.published_by    := old.published_by;
    new.archived_at     := old.archived_at;
    new.archived_by     := old.archived_by;
    new.current_version := old.current_version;
  end if;

  return new;
end;
$$;

create trigger courses_lifecycle
  before insert or update on public.courses
  for each row execute function private.courses_lifecycle();

-- Build an immutable JSON snapshot of a course's full content.
create or replace function private.build_course_snapshot(p_course uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'course', to_jsonb(c) - 'updated_at',
    'modules', coalesce((
      select jsonb_agg(jsonb_build_object(
               'module', to_jsonb(m) - 'updated_at',
               'lessons', coalesce((
                 select jsonb_agg(to_jsonb(l) - 'updated_at' order by l.position)
                   from public.lessons l where l.module_id = m.id), '[]'::jsonb)
             ) order by m.position)
        from public.course_modules m where m.course_id = c.id), '[]'::jsonb),
    'quizzes', coalesce((
      select jsonb_agg(jsonb_build_object(
               'quiz', to_jsonb(q) - 'updated_at',
               'questions', coalesce((
                 select jsonb_agg(jsonb_build_object(
                          'question', to_jsonb(qu) - 'updated_at',
                          'options', coalesce((
                            select jsonb_agg(to_jsonb(o) - 'updated_at' order by o.position)
                              from public.quiz_options o where o.question_id = qu.id), '[]'::jsonb)
                        ) order by qu.position)
                   from public.questions qu where qu.quiz_id = q.id), '[]'::jsonb)
             ) order by q.created_at)
        from public.quizzes q where q.course_id = c.id), '[]'::jsonb)
  )
  from public.courses c
  where c.id = p_course;
$$;

-- On every publish, store a version snapshot.
create or replace function private.courses_snapshot_on_publish()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'published'
     and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    insert into public.course_versions (course_id, version_number, snapshot, change_summary, created_by)
    values (new.id, new.current_version, private.build_course_snapshot(new.id),
            'Published', new.published_by)
    on conflict (course_id, version_number) do nothing;
  end if;
  return null;
end;
$$;

create trigger courses_snapshot_on_publish
  after insert or update of status on public.courses
  for each row execute function private.courses_snapshot_on_publish();

-- ---------------------------------------------------------------------
-- Enrollment integrity: only published courses, only STUDENT users,
-- immutable student/course, completion stamp.
-- ---------------------------------------------------------------------
create or replace function private.enrollments_integrity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if not exists (select 1 from public.courses c
                    where c.id = new.course_id and c.status = 'published') then
      raise exception 'Students can only be enrolled in published courses' using errcode = '23514';
    end if;
    if not exists (select 1 from public.user_roles ur
                    where ur.user_id = new.student_id and ur.role_key = 'STUDENT') then
      raise exception 'Only users with the STUDENT role can be enrolled' using errcode = '23514';
    end if;
  else
    if new.student_id <> old.student_id or new.course_id <> old.course_id then
      raise exception 'student_id and course_id cannot be changed' using errcode = '42501';
    end if;
    new.enrolled_at := old.enrolled_at;
    new.created_at  := old.created_at;
  end if;

  if new.status = 'completed' then
    new.completed_at := coalesce(new.completed_at, now());
  else
    new.completed_at := null;
  end if;
  return new;
end;
$$;

create trigger enrollments_integrity
  before insert or update on public.enrollments
  for each row execute function private.enrollments_integrity();

-- ---------------------------------------------------------------------
-- Generic audit trigger.
-- Actor = JWT user when present; otherwise the actor column the trusted
-- backend wrote on the row (created_by / granted_by / added_by / ...).
-- ---------------------------------------------------------------------
create or replace function private.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old     jsonb := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end;
  v_new     jsonb := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end;
  v_row     jsonb;
  v_action  text;
  v_actor   uuid := (select auth.uid());
  v_source  text := 'jwt';
  v_claims  jsonb;
begin
  -- Ignore no-op updates.
  if tg_op = 'UPDATE' and (v_old - 'updated_at') = (v_new - 'updated_at') then
    return null;
  end if;

  v_row := coalesce(v_new, v_old);

  if v_actor is null then
    v_actor := case tg_op
      when 'INSERT' then coalesce(
        (v_row ->> 'created_by')::uuid, (v_row ->> 'granted_by')::uuid,
        (v_row ->> 'added_by')::uuid,   (v_row ->> 'assigned_by')::uuid,
        (v_row ->> 'enrolled_by')::uuid,(v_row ->> 'issued_by')::uuid)
      when 'UPDATE' then coalesce(
        (v_new ->> 'updated_by')::uuid, (v_new ->> 'revoked_by')::uuid)
      else null
    end;
    v_source := case when v_actor is null then 'system' else 'row' end;
  end if;

  begin
    v_claims := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  exception when others then
    v_claims := null;
  end;

  if tg_table_name = 'courses' then
    v_action := case
      when tg_op = 'INSERT' then 'course.created'
      when tg_op = 'DELETE' then 'course.deleted'
      when new.status is distinct from old.status then
        case new.status when 'published' then 'course.published'
                        when 'archived'  then 'course.archived'
                        else 'course.unpublished' end
      else 'course.updated'
    end;
  else
    v_action := tg_table_name || '.' || lower(tg_op);
  end if;

  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id,
                                 old_data, new_data, metadata)
  values (
    v_actor,
    coalesce(v_claims ->> 'role', current_user),
    v_action,
    tg_table_name,
    case when v_row ? 'id' then (v_row ->> 'id')::uuid end,
    v_old,
    v_new,
    jsonb_build_object('actor_source', v_source)
  );
  return null;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'user_roles', 'role_permissions', 'teams', 'team_members',
    'trainer_assignments', 'courses', 'course_modules', 'lessons',
    'enrollments', 'quizzes', 'questions', 'quiz_options', 'certificates',
    'announcements'
  ] loop
    execute format(
      'create trigger %I after insert or update or delete on public.%I
         for each row execute function private.audit_row_change()',
      t || '_audit', t);
  end loop;
end;
$$;

-- Trigger-only functions: nobody may call them directly.
revoke all on function
  private.set_updated_at(),
  private.courses_lifecycle(),
  private.build_course_snapshot(uuid),
  private.courses_snapshot_on_publish(),
  private.enrollments_integrity(),
  private.audit_row_change()
from public, anon, authenticated;
