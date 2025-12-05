-- LearnLynk Tech Test - Task 1: Schema
-- Fill in the definitions for leads, applications, tasks as per README.

create extension if not exists "pgcrypto";

-- Leads table
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  owner_id uuid not null,
  email text,
  phone text,
  full_name text,
  stage text not null default 'new',
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TODO: add useful indexes for leads:
-- - by tenant_id, owner_id, stage, created_at
create index idx_leads_tenant_id on public.leads(tenant_id);
create index idx_leads_owner_id on public.leads(owner_id);
create index idx_leads_stage on public.leads(stage);
create index idx_leads_created_at on public.leads(created_at);
-- composite index for common query pattern: filtering by tenant and stage
create index idx_leads_tenant_stage on public.leads(tenant_id, stage);


-- Applications table
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  lead_id uuid not null references public.leads(id) on delete cascade,
  program_id uuid,
  intake_id uuid,
  stage text not null default 'inquiry',
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TODO: add useful indexes for applications:
-- - by tenant_id, lead_id, stage
create index idx_applications_tenant_id on public.applications(tenant_id);
create index idx_applications_lead_id on public.applications(lead_id);
create index idx_applications_stage on public.applications(stage);
-- helpful for dashboard queries showing apps by tenant and stage
create index idx_applications_tenant_stage on public.applications(tenant_id, stage);


-- Tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  application_id uuid not null references public.applications(id) on delete cascade,
  title text,
  type text not null,
  status text not null default 'open',
  due_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TODO:
-- - add check constraint for type in ('call','email','review')
alter table public.tasks 
  add constraint check_task_type 
  check (type in ('call', 'email', 'review'));

-- - add constraint that due_at >= created_at
alter table public.tasks
  add constraint check_due_at_after_created
  check (due_at >= created_at);

-- - add indexes for tasks due today by tenant_id, due_at, status
create index idx_tasks_tenant_id on public.tasks(tenant_id);
create index idx_tasks_due_at on public.tasks(due_at);
create index idx_tasks_status on public.tasks(status);
-- composite index for the "today's tasks" query we'll use often
create index idx_tasks_tenant_due_status on public.tasks(tenant_id, due_at, status);


-- Helper function to auto-update updated_at timestamp
create or replace function public.update_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply triggers to auto-update timestamps on all tables
create trigger set_leads_timestamp
  before update on public.leads
  for each row
  execute function public.update_timestamp();

create trigger set_applications_timestamp
  before update on public.applications
  for each row
  execute function public.update_timestamp();

create trigger set_tasks_timestamp
  before update on public.tasks
  for each row
  execute function public.update_timestamp();