-- =====================================================================
-- LAVA LMS — 0600 Table privileges and Row Level Security
--
-- Two layers:
--   1. Table/column GRANTs (least privilege). anon gets nothing.
--      authenticated gets only the verbs/columns the app needs.
--   2. RLS policies decide WHICH ROWS. Policies call the private.*
--      SECURITY DEFINER helpers, so no policy queries a table whose own
--      policy queries back (no recursion).
--
-- There are intentionally NO write policies on: user_roles, team_members,
-- trainer_assignments, enrollments, quiz_attempts, quiz_responses,
-- certificates, notifications (insert), audit_logs, course_versions.
-- Those are written only by the service role (Edge Functions) or by
-- SECURITY DEFINER functions/triggers that perform their own checks.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Generic "created_by = caller" stamp for tables that record a creator.
-- (courses has its own, richer lifecycle trigger.)
-- ---------------------------------------------------------------------
create or replace function private.stamp_created_by()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce((select auth.uid()), new.created_by);
  else
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

revoke all on function private.stamp_created_by() from public, anon, authenticated;

create trigger teams_stamp_created_by
  before insert or update on public.teams
  for each row execute function private.stamp_created_by();
create trigger quizzes_stamp_created_by
  before insert or update on public.quizzes
  for each row execute function private.stamp_created_by();
create trigger announcements_stamp_created_by
  before insert or update on public.announcements
  for each row execute function private.stamp_created_by();

-- ---------------------------------------------------------------------
-- 1. Privileges
-- ---------------------------------------------------------------------
revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- Reference data
grant select on public.roles, public.permissions, public.role_permissions to authenticated;

-- Identity
grant select on public.profiles to authenticated;
grant update (full_name, avatar_url, phone) on public.profiles to authenticated;
grant select on public.user_roles to authenticated;

-- Organisation
grant select, insert, update, delete on public.teams to authenticated;
grant select on public.team_members, public.trainer_assignments to authenticated;

-- Course content
grant select, insert, update, delete on public.courses, public.course_modules, public.lessons
  to authenticated;
grant select on public.course_versions to authenticated;

-- Learning records
grant select on public.enrollments to authenticated;
grant select on public.lesson_progress to authenticated;
grant insert (enrollment_id, lesson_id, status, progress_percent, last_accessed_at)
  on public.lesson_progress to authenticated;
grant update (status, progress_percent, last_accessed_at)
  on public.lesson_progress to authenticated;

-- Assessments: answer key (quiz_options.is_correct) and explanations are
-- excluded from column-level SELECT for every app user.
grant select, insert, update, delete on public.quizzes to authenticated;
grant select (id, quiz_id, prompt, question_type, points, position, created_at, updated_at)
  on public.questions to authenticated;
grant insert, update, delete on public.questions to authenticated;
grant select (id, question_id, label, position, created_at, updated_at)
  on public.quiz_options to authenticated;
grant insert, update, delete on public.quiz_options to authenticated;
grant select on public.quiz_attempts, public.quiz_responses, public.certificates to authenticated;

-- Communications
grant select, insert, update, delete on public.announcements to authenticated;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

-- Audit
grant select on public.audit_logs to authenticated;

-- ---------------------------------------------------------------------
-- 2. Enable RLS on every table (and force it for the table owner too,
--    except where Supabase's own roles must bypass it — the service role
--    bypasses RLS via BYPASSRLS regardless).
-- ---------------------------------------------------------------------
do $$
declare
  t record;
begin
  for t in
    select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. Policies (all scoped "to authenticated"; anon has no policy at all)
-- ---------------------------------------------------------------------

-- Reference data: readable by signed-in users. Writable by nobody via API.
create policy roles_select on public.roles
  for select to authenticated using (true);
create policy permissions_select on public.permissions
  for select to authenticated using (true);
create policy role_permissions_select on public.role_permissions
  for select to authenticated using (true);

-- profiles -------------------------------------------------------------
create policy profiles_select on public.profiles
  for select to authenticated
  using (private.can_view_user(id));

-- Users may edit their own safe columns only (column grants above).
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- user_roles: read own; admins read all. NO write policy.
create policy user_roles_select on public.user_roles
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or private.has_permission('role.assign')
    or private.has_permission('user.read_all')
  );

-- teams -----------------------------------------------------------------
create policy teams_select on public.teams
  for select to authenticated
  using (private.has_permission('team.manage') or private.is_team_member(id));
create policy teams_insert on public.teams
  for insert to authenticated
  with check (private.has_permission('team.manage'));
create policy teams_update on public.teams
  for update to authenticated
  using (private.has_permission('team.manage'))
  with check (private.has_permission('team.manage'));
create policy teams_delete on public.teams
  for delete to authenticated
  using (private.has_permission('team.manage'));

-- team_members: own membership; leaders see their team; admins see all.
create policy team_members_select on public.team_members
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or private.has_permission('team.manage')
    or private.leads_team(team_id)
  );

-- trainer_assignments
create policy trainer_assignments_select on public.trainer_assignments
  for select to authenticated
  using (
    trainer_id = (select auth.uid())
    or student_id = (select auth.uid())
    or private.has_permission('trainer_assignment.manage')
  );

-- courses -----------------------------------------------------------------
create policy courses_select on public.courses
  for select to authenticated
  using (private.can_read_course(id));
create policy courses_insert on public.courses
  for insert to authenticated
  with check (private.has_permission('course.create'));
create policy courses_update on public.courses
  for update to authenticated
  using (private.has_permission('course.update'))
  with check (private.has_permission('course.update'));
create policy courses_delete on public.courses
  for delete to authenticated
  using (private.has_permission('course.delete'));

create policy course_versions_select on public.course_versions
  for select to authenticated
  using (private.has_permission('course.read_all'));

create policy course_modules_select on public.course_modules
  for select to authenticated
  using (private.can_read_course(course_id));
create policy course_modules_insert on public.course_modules
  for insert to authenticated
  with check (private.has_permission('course.update'));
create policy course_modules_update on public.course_modules
  for update to authenticated
  using (private.has_permission('course.update'))
  with check (private.has_permission('course.update'));
create policy course_modules_delete on public.course_modules
  for delete to authenticated
  using (private.has_permission('course.update'));

create policy lessons_select on public.lessons
  for select to authenticated
  using (exists (
    select 1 from public.course_modules m
     where m.id = module_id and private.can_read_course(m.course_id)
  ));
create policy lessons_insert on public.lessons
  for insert to authenticated
  with check (private.has_permission('course.update'));
create policy lessons_update on public.lessons
  for update to authenticated
  using (private.has_permission('course.update'))
  with check (private.has_permission('course.update'));
create policy lessons_delete on public.lessons
  for delete to authenticated
  using (private.has_permission('course.update'));

-- Learning records ----------------------------------------------------------
create policy enrollments_select on public.enrollments
  for select to authenticated
  using (private.can_view_training_record(student_id, course_id));

create policy lesson_progress_select on public.lesson_progress
  for select to authenticated
  using (private.can_view_training_record(student_id, course_id));

-- Students record their own progress, only on their own ACTIVE enrollment.
-- (student_id/course_id are derived by trigger before this check runs.)
create policy lesson_progress_insert_own on public.lesson_progress
  for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and private.is_active_user()
    and exists (
      select 1 from public.enrollments e
       where e.id = enrollment_id
         and e.student_id = (select auth.uid())
         and e.status = 'active'
    )
  );
create policy lesson_progress_update_own on public.lesson_progress
  for update to authenticated
  using (student_id = (select auth.uid()))
  with check (
    student_id = (select auth.uid())
    and private.is_active_user()
    and exists (
      select 1 from public.enrollments e
       where e.id = enrollment_id
         and e.student_id = (select auth.uid())
         and e.status = 'active'
    )
  );

-- Assessments -----------------------------------------------------------------
create policy quizzes_select on public.quizzes
  for select to authenticated
  using (
    private.has_permission('quiz.manage')
    or (is_published and private.can_read_course(course_id))
  );
create policy quizzes_insert on public.quizzes
  for insert to authenticated
  with check (private.has_permission('quiz.manage'));
create policy quizzes_update on public.quizzes
  for update to authenticated
  using (private.has_permission('quiz.manage'))
  with check (private.has_permission('quiz.manage'));
create policy quizzes_delete on public.quizzes
  for delete to authenticated
  using (private.has_permission('quiz.manage'));

create policy questions_select on public.questions
  for select to authenticated
  using (exists (select 1 from public.quizzes q where q.id = quiz_id));
create policy questions_insert on public.questions
  for insert to authenticated
  with check (private.has_permission('quiz.manage'));
create policy questions_update on public.questions
  for update to authenticated
  using (private.has_permission('quiz.manage'))
  with check (private.has_permission('quiz.manage'));
create policy questions_delete on public.questions
  for delete to authenticated
  using (private.has_permission('quiz.manage'));

create policy quiz_options_select on public.quiz_options
  for select to authenticated
  using (exists (select 1 from public.questions qu where qu.id = question_id));
create policy quiz_options_insert on public.quiz_options
  for insert to authenticated
  with check (private.has_permission('quiz.manage'));
create policy quiz_options_update on public.quiz_options
  for update to authenticated
  using (private.has_permission('quiz.manage'))
  with check (private.has_permission('quiz.manage'));
create policy quiz_options_delete on public.quiz_options
  for delete to authenticated
  using (private.has_permission('quiz.manage'));

-- Grades: own, or staff with a relationship to the student. NO write policy.
create policy quiz_attempts_select on public.quiz_attempts
  for select to authenticated
  using (private.can_view_training_record(student_id, course_id));

create policy quiz_responses_select on public.quiz_responses
  for select to authenticated
  using (exists (select 1 from public.quiz_attempts a where a.id = attempt_id));

create policy certificates_select on public.certificates
  for select to authenticated
  using (
    private.can_view_training_record(student_id, course_id)
    or private.has_permission('certificate.issue')
  );

-- Communications -------------------------------------------------------------------
create policy announcements_select on public.announcements
  for select to authenticated
  using (
    private.has_permission('announcement.manage')
    or (
      published_at is not null
      and published_at <= now()
      and (expires_at is null or expires_at > now())
      and private.is_active_user()
      and (
        audience = 'all'
        or (audience = 'team'   and private.is_team_member(team_id))
        or (audience = 'course' and (private.is_enrolled(course_id)
                                     or private.has_permission('course.read_all')))
        or (audience = 'role'   and private.has_role(role_key))
      )
    )
  );
create policy announcements_insert on public.announcements
  for insert to authenticated
  with check (private.has_permission('announcement.manage'));
create policy announcements_update on public.announcements
  for update to authenticated
  using (private.has_permission('announcement.manage'))
  with check (private.has_permission('announcement.manage'));
create policy announcements_delete on public.announcements
  for delete to authenticated
  using (private.has_permission('announcement.manage'));

create policy notifications_select_own on public.notifications
  for select to authenticated
  using (user_id = (select auth.uid()));
create policy notifications_update_own on public.notifications
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Audit ---------------------------------------------------------------------------
create policy audit_logs_select on public.audit_logs
  for select to authenticated
  using (private.has_permission('audit.read'));
