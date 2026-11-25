-- =====================================================================
-- LAVA LMS — 0200 Identity and organisation
-- profiles, user_roles, teams, team_members
-- =====================================================================

-- ---------------------------------------------------------------------
-- profiles: one row per auth user. Holds personal information.
-- Role is deliberately NOT stored here (see user_roles), so a user
-- editing their own profile can never touch their role.
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text not null default '' check (char_length(full_name) <= 200),
  avatar_url  text check (avatar_url is null or char_length(avatar_url) <= 2048),
  phone       text check (phone is null or char_length(phone) <= 40),
  status      text not null default 'active'
              check (status in ('invited', 'active', 'suspended', 'archived')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index profiles_email_key on public.profiles (lower(email)) where email <> '';
create index profiles_status_idx on public.profiles (status);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

-- Create a profile automatically when an auth user is created.
-- NOTE: role is never read from user metadata — user metadata is
-- user-controlled and would be a privilege-escalation vector.
create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, status)
  values (
    new.id,
    coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 200),
    case when new.invited_at is not null and new.confirmed_at is null
         then 'invited' else 'active' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_auth_user();

-- Activate invited users once they confirm / accept the invitation.
create or replace function private.handle_auth_user_confirmed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.confirmed_at is null and new.confirmed_at is not null then
    update public.profiles
       set status = 'active'
     where id = new.id and status = 'invited';
  end if;
  return new;
end;
$$;

revoke all on function private.handle_auth_user_confirmed() from public, anon, authenticated;

create trigger on_auth_user_confirmed
  after update of confirmed_at on auth.users
  for each row execute function private.handle_auth_user_confirmed();

-- ---------------------------------------------------------------------
-- user_roles: role assignments. Written ONLY by trusted backend code
-- (service role in Edge Functions). No INSERT/UPDATE/DELETE policy is
-- granted to authenticated users.
-- ---------------------------------------------------------------------
create table public.user_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  role_key    text not null references public.roles (key) on delete restrict,
  granted_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, role_key)
);

create index user_roles_role_key_idx on public.user_roles (role_key);
create index user_roles_granted_by_idx on public.user_roles (granted_by);

create trigger user_roles_set_updated_at
  before update on public.user_roles
  for each row execute function private.set_updated_at();

-- Never allow the last SUPER_ADMIN to be removed (lock-out protection).
create or replace function private.protect_last_super_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role_key = 'SUPER_ADMIN'
     and (tg_op = 'DELETE' or new.role_key <> 'SUPER_ADMIN' or new.user_id <> old.user_id)
     and not exists (
       select 1 from public.user_roles ur
        where ur.role_key = 'SUPER_ADMIN' and ur.id <> old.id
     )
  then
    raise exception 'Cannot remove the last SUPER_ADMIN'
      using errcode = 'P0001';
  end if;
  return coalesce(new, old);
end;
$$;

revoke all on function private.protect_last_super_admin() from public, anon, authenticated;

create trigger user_roles_protect_last_super_admin
  before update or delete on public.user_roles
  for each row execute function private.protect_last_super_admin();

-- ---------------------------------------------------------------------
-- teams
-- ---------------------------------------------------------------------
create table public.teams (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 1 and 120),
  description  text,
  created_by   uuid references public.profiles (id) on delete set null,
  archived_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create unique index teams_name_key on public.teams (lower(name));
create index teams_created_by_idx on public.teams (created_by);

create trigger teams_set_updated_at
  before update on public.teams
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- team_members: a user belongs to a team either as LEADER or MEMBER.
-- ---------------------------------------------------------------------
create table public.team_members (
  id               uuid primary key default gen_random_uuid(),
  team_id          uuid not null references public.teams (id) on delete cascade,
  user_id          uuid not null references public.profiles (id) on delete cascade,
  membership_role  text not null default 'MEMBER'
                   check (membership_role in ('LEADER', 'MEMBER')),
  added_by         uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (team_id, user_id)
);

create index team_members_user_id_idx on public.team_members (user_id);
create index team_members_team_role_idx on public.team_members (team_id, membership_role);
create index team_members_added_by_idx on public.team_members (added_by);

create trigger team_members_set_updated_at
  before update on public.team_members
  for each row execute function private.set_updated_at();
