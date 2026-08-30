-- BunkerWatch: AIS polling state table
-- Run this once in Supabase SQL Editor, after schema.sql.
--
-- The scheduled GitHub Actions poller runs as a fresh process every 15
-- minutes rather than staying connected — so "this pair has been close and
-- slow for the last 45 minutes" has to be tracked here in the database,
-- not in memory, or every run would forget what the last run saw.

create table ais_encounter_state (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  barge_mmsi bigint not null,
  barge_imo text not null,
  other_mmsi bigint not null,
  other_imo text,
  other_name text,
  first_seen timestamptz not null,
  last_seen timestamptz not null,
  last_latitude numeric not null,
  last_longitude numeric not null,
  created_at timestamptz not null default now(),
  constraint uq_encounter_pair unique (organization_id, barge_mmsi, other_mmsi)
);

create index idx_encounter_state_org on ais_encounter_state(organization_id);

alter table ais_encounter_state enable row level security;
create policy org_isolation_select on ais_encounter_state for select using (organization_id = current_org_id());
create policy org_isolation_write on ais_encounter_state for all using (organization_id = current_org_id()) with check (organization_id = current_org_id());
