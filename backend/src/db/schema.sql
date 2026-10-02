-- LaunchFlow Database Schema
-- Run this in Supabase SQL Editor to initialize the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects table — stores apps being deployed
create table if not exists projects (
  id uuid default uuid_generate_v4() primary key,
  name varchar(100) not null,
  repo_url text not null,
  environment varchar(20) default 'production' check (environment in ('production', 'staging', 'development')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Deployments table — stores each deployment run
create table if not exists deployments (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade,
  status varchar(20) default 'queued' check (status in ('queued', 'running', 'success', 'failed')),
  logs text,
  triggered_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Auto-update updated_at on row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

create trigger deployments_updated_at
  before update on deployments
  for each row execute function update_updated_at();

-- Indexes for performance
create index if not exists idx_deployments_project_id on deployments(project_id);
create index if not exists idx_deployments_status on deployments(status);
create index if not exists idx_deployments_created_at on deployments(created_at desc);
