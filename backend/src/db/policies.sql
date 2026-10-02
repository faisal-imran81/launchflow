-- LaunchFlow RLS Policies
-- Run this in Supabase SQL Editor after schema.sql

-- Projects policies
alter table projects enable row level security;

create policy "Service role has full access to projects"
  on projects
  for all
  using (true)
  with check (true);

-- Deployments policies
alter table deployments enable row level security;

create policy "Service role has full access to deployments"
  on deployments
  for all
  using (true)
  with check (true);
