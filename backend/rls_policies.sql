-- LearnLynk Tech Test - Task 2: RLS Policies on leads

alter table public.leads enable row level security;

-- Example helper: assume JWT has tenant_id, user_id, role.
-- You can use: current_setting('request.jwt.claims', true)::jsonb

-- TODO: write a policy so:
-- - counselors see leads where they are owner_id OR in one of their teams
-- - admins can see all leads of their tenant

-- First, let's create some helper tables that the policy will reference
-- (in a real app these would already exist, but defining them here for clarity)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  role text not null,
  email text,
  created_at timestamptz default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists public.user_teams (
  user_id uuid not null references public.users(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, team_id)
);

-- Also add team_id to leads so we can track team assignments
alter table public.leads add column if not exists team_id uuid references public.teams(id);
create index if not exists idx_leads_team_id on public.leads(team_id);


-- Example skeleton for SELECT (replace with your own logic):

create policy "leads_select_policy"
on public.leads
for select
using (
  -- TODO: add real RLS logic here, refer to README instructions
  -- Extract claims from JWT
  (
    -- First check: user must be in the same tenant
    tenant_id = (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid
    and
    (
      -- Admins can see everything in their tenant
      (current_setting('request.jwt.claims', true)::jsonb->>'role') = 'admin'
      or
      -- Counselors can see leads they own
      owner_id = (current_setting('request.jwt.claims', true)::jsonb->>'user_id')::uuid
      or
      -- Counselors can see leads assigned to teams they're part of
      exists (
        select 1 
        from public.user_teams ut
        where ut.user_id = (current_setting('request.jwt.claims', true)::jsonb->>'user_id')::uuid
          and ut.team_id = leads.team_id
      )
    )
  )
);

-- TODO: add INSERT policy that:
-- - allows counselors/admins to insert leads for their tenant
-- - ensures tenant_id is correctly set/validated

create policy "leads_insert_policy"
on public.leads
for insert
with check (
  -- User must be counselor or admin
  (current_setting('request.jwt.claims', true)::jsonb->>'role') in ('admin', 'counselor')
  and
  -- The lead being inserted must belong to the user's tenant
  tenant_id = (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid
);

-- Additional policy for UPDATE - counselors can only update leads they own or manage
create policy "leads_update_policy"
on public.leads
for update
using (
  tenant_id = (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid
  and
  (
    -- Admins can update any lead in their tenant
    (current_setting('request.jwt.claims', true)::jsonb->>'role') = 'admin'
    or
    -- Counselors can update leads they own
    owner_id = (current_setting('request.jwt.claims', true)::jsonb->>'user_id')::uuid
    or
    -- Or leads from their teams
    exists (
      select 1 
      from public.user_teams ut
      where ut.user_id = (current_setting('request.jwt.claims', true)::jsonb->>'user_id')::uuid
        and ut.team_id = leads.team_id
    )
  )
);

-- DELETE policy - typically only admins should delete leads
create policy "leads_delete_policy"
on public.leads
for delete
using (
  tenant_id = (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid
  and
  (current_setting('request.jwt.claims', true)::jsonb->>'role') = 'admin'
);


-- Optional: Enable RLS on applications and tasks too for consistency
alter table public.applications enable row level security;
alter table public.tasks enable row level security;

-- Basic policy for applications - users can see apps for leads they can access
create policy "applications_select_policy"
on public.applications
for select
using (
  tenant_id = (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid
);

create policy "applications_insert_policy"
on public.applications
for insert
with check (
  tenant_id = (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid
  and (current_setting('request.jwt.claims', true)::jsonb->>'role') in ('admin', 'counselor')
);

-- Basic policy for tasks
create policy "tasks_select_policy"
on public.tasks
for select
using (
  tenant_id = (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid
);

create policy "tasks_insert_policy"
on public.tasks
for insert
with check (
  tenant_id = (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid
  and (current_setting('request.jwt.claims', true)::jsonb->>'role') in ('admin', 'counselor')
);

create policy "tasks_update_policy"
on public.tasks
for update
using (
  tenant_id = (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid
);