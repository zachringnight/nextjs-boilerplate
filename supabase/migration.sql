-- Prizm / ASW Production Hub - Supabase Database Migration
-- This migration is designed to be re-runnable.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- 0. EVENTS + MEMBERSHIP (multi-event isolation)
-- =============================================

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  starts_on DATE,
  ends_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO events (id, slug, name, description, starts_on, ends_on)
VALUES (
  'asw-2026',
  'asw-2026',
  'Panini NBA All-Star Weekend 2026',
  'Internal production pilot event',
  DATE '2026-02-13',
  DATE '2026-02-14'
)
ON CONFLICT (id) DO UPDATE
SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  starts_on = EXCLUDED.starts_on,
  ends_on = EXCLUDED.ends_on,
  updated_at = NOW();

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM ('admin', 'editor', 'viewer');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS event_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_members_user_id ON event_members(user_id);
CREATE INDEX IF NOT EXISTS idx_event_members_event_id ON event_members(event_id);

-- =============================================
-- 1. CLIP MARKERS
-- =============================================

CREATE TABLE IF NOT EXISTS clip_markers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(200),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  timecode VARCHAR(20),
  timecode_in VARCHAR(20),
  timecode_out VARCHAR(20),
  player_id VARCHAR(100),
  station_id VARCHAR(50),
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  media_type VARCHAR(20) DEFAULT 'video',
  camera VARCHAR(50),
  crew_member VARCHAR(100),
  status VARCHAR(20) DEFAULT 'marked',
  priority VARCHAR(20) DEFAULT 'normal',
  flagged BOOLEAN DEFAULT FALSE,
  created_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clip_markers ADD COLUMN IF NOT EXISTS event_id TEXT;
ALTER TABLE clip_markers ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id);
UPDATE clip_markers SET event_id = 'asw-2026' WHERE event_id IS NULL;
ALTER TABLE clip_markers ALTER COLUMN event_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'clip_markers_event_id_fkey'
  ) THEN
    ALTER TABLE clip_markers
      ADD CONSTRAINT clip_markers_event_id_fkey
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_clip_markers_event_id ON clip_markers(event_id);
CREATE INDEX IF NOT EXISTS idx_clip_markers_timestamp ON clip_markers(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_clip_markers_player_id ON clip_markers(player_id);
CREATE INDEX IF NOT EXISTS idx_clip_markers_station_id ON clip_markers(station_id);
CREATE INDEX IF NOT EXISTS idx_clip_markers_category ON clip_markers(category);

-- =============================================
-- 2. NOTES / ISSUE LOGGER
-- =============================================

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  station_id VARCHAR(50),
  player_id VARCHAR(100),
  created_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_by VARCHAR(100)
);

ALTER TABLE notes ADD COLUMN IF NOT EXISTS event_id TEXT;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id);
UPDATE notes SET event_id = 'asw-2026' WHERE event_id IS NULL;
ALTER TABLE notes ALTER COLUMN event_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'notes_event_id_fkey'
  ) THEN
    ALTER TABLE notes
      ADD CONSTRAINT notes_event_id_fkey
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_notes_event_id ON notes(event_id);
CREATE INDEX IF NOT EXISTS idx_notes_status ON notes(status);
CREATE INDEX IF NOT EXISTS idx_notes_priority ON notes(priority);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

-- =============================================
-- 3. DELIVERABLES TRACKER
-- =============================================

CREATE TABLE IF NOT EXISTS deliverables (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL DEFAULT 'video',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  player_id VARCHAR(100),
  due_day VARCHAR(20) NOT NULL,
  completed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  notes TEXT,
  assignee VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'medium',
  created_by_user_id UUID REFERENCES auth.users(id)
);

ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS event_id TEXT;
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id);
UPDATE deliverables SET event_id = 'asw-2026' WHERE event_id IS NULL;
ALTER TABLE deliverables ALTER COLUMN event_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'deliverables_event_id_fkey'
  ) THEN
    ALTER TABLE deliverables
      ADD CONSTRAINT deliverables_event_id_fkey
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_deliverables_event_id ON deliverables(event_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_status ON deliverables(status);
CREATE INDEX IF NOT EXISTS idx_deliverables_due_day ON deliverables(due_day);

-- =============================================
-- 4. SCHEDULE SLOTS
-- =============================================

CREATE TABLE IF NOT EXISTS schedule_slots (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  player_id VARCHAR(100) NOT NULL,
  date VARCHAR(10) NOT NULL,
  start_time VARCHAR(5) NOT NULL,
  end_time VARCHAR(5) NOT NULL,
  station VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled',
  pr_call_info JSONB,
  notes TEXT,
  created_by_user_id UUID REFERENCES auth.users(id)
);

ALTER TABLE schedule_slots ADD COLUMN IF NOT EXISTS event_id TEXT;
ALTER TABLE schedule_slots ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id);
UPDATE schedule_slots SET event_id = 'asw-2026' WHERE event_id IS NULL;
ALTER TABLE schedule_slots ALTER COLUMN event_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'schedule_slots_event_id_fkey'
  ) THEN
    ALTER TABLE schedule_slots
      ADD CONSTRAINT schedule_slots_event_id_fkey
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_schedule_slots_event_id ON schedule_slots(event_id);
CREATE INDEX IF NOT EXISTS idx_schedule_slots_date ON schedule_slots(date);
CREATE INDEX IF NOT EXISTS idx_schedule_slots_player_id ON schedule_slots(player_id);
CREATE INDEX IF NOT EXISTS idx_schedule_slots_station ON schedule_slots(station);

-- =============================================
-- 5. PLAYER STATION COMPLETIONS
-- =============================================

CREATE TABLE IF NOT EXISTS player_station_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  player_id VARCHAR(100) NOT NULL,
  station_id VARCHAR(50) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  completed_at TIMESTAMPTZ,
  completed_by VARCHAR(100),
  notes TEXT,
  created_by_user_id UUID REFERENCES auth.users(id),
  UNIQUE(event_id, player_id, station_id)
);

ALTER TABLE player_station_completions ADD COLUMN IF NOT EXISTS event_id TEXT;
ALTER TABLE player_station_completions ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id);
UPDATE player_station_completions SET event_id = 'asw-2026' WHERE event_id IS NULL;
ALTER TABLE player_station_completions ALTER COLUMN event_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'player_station_completions_event_id_fkey'
  ) THEN
    ALTER TABLE player_station_completions
      ADD CONSTRAINT player_station_completions_event_id_fkey
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'player_station_completions_player_id_station_id_key'
  ) THEN
    ALTER TABLE player_station_completions
      DROP CONSTRAINT player_station_completions_player_id_station_id_key;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'player_station_completions_event_player_station_key'
  ) THEN
    ALTER TABLE player_station_completions
      ADD CONSTRAINT player_station_completions_event_player_station_key
      UNIQUE(event_id, player_id, station_id);
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_completions_event_id ON player_station_completions(event_id);
CREATE INDEX IF NOT EXISTS idx_completions_player_id ON player_station_completions(player_id);
CREATE INDEX IF NOT EXISTS idx_completions_station_id ON player_station_completions(station_id);

-- =============================================
-- 6. PLAYERS TABLE (for admin CSV import)
-- =============================================

CREATE TABLE IF NOT EXISTS players (
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  pronunciation TEXT,
  team TEXT,
  team_abbr TEXT,
  position TEXT,
  day SMALLINT,
  scheduled_time TEXT,
  nationality TEXT,
  flag TEXT,
  jersey_number INTEGER,
  photo TEXT,
  embargoed BOOLEAN NOT NULL DEFAULT FALSE,
  translator_needed BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT[] NOT NULL DEFAULT '{}',
  talking_points TEXT[] NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (event_id, id)
);

CREATE INDEX IF NOT EXISTS idx_players_event_id ON players(event_id);
CREATE INDEX IF NOT EXISTS idx_players_team_abbr ON players(team_abbr);
CREATE INDEX IF NOT EXISTS idx_players_day ON players(day);

-- =============================================
-- 7. ROW-LEVEL SECURITY + POLICIES
-- =============================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clip_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_station_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_event_member(target_event_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.event_members em
    WHERE em.event_id = target_event_id
      AND em.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.has_event_role(target_event_id TEXT, allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.event_members em
    WHERE em.event_id = target_event_id
      AND em.user_id = auth.uid()
      AND em.role::text = ANY(allowed_roles)
  );
$$;

-- Remove legacy anonymous policies if present
DROP POLICY IF EXISTS "Allow anonymous access" ON clip_markers;
DROP POLICY IF EXISTS "Allow anonymous access" ON notes;
DROP POLICY IF EXISTS "Allow anonymous access" ON deliverables;
DROP POLICY IF EXISTS "Allow anonymous access" ON schedule_slots;
DROP POLICY IF EXISTS "Allow anonymous access" ON player_station_completions;

-- Events
DROP POLICY IF EXISTS events_select_member ON events;
DROP POLICY IF EXISTS events_select_authenticated ON events;
CREATE POLICY events_select_authenticated ON events
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Event members
DROP POLICY IF EXISTS event_members_select_self_or_admin ON event_members;
CREATE POLICY event_members_select_self_or_admin ON event_members
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR has_event_role(event_id, ARRAY['admin'])
  );

DROP POLICY IF EXISTS event_members_insert_admin ON event_members;
CREATE POLICY event_members_insert_admin ON event_members
  FOR INSERT
  WITH CHECK (has_event_role(event_id, ARRAY['admin']));

DROP POLICY IF EXISTS event_members_update_admin ON event_members;
CREATE POLICY event_members_update_admin ON event_members
  FOR UPDATE
  USING (has_event_role(event_id, ARRAY['admin']))
  WITH CHECK (has_event_role(event_id, ARRAY['admin']));

DROP POLICY IF EXISTS event_members_delete_admin ON event_members;
CREATE POLICY event_members_delete_admin ON event_members
  FOR DELETE
  USING (has_event_role(event_id, ARRAY['admin']));

-- Shared helper policy groups for operational tables
DROP POLICY IF EXISTS clip_markers_select_member ON clip_markers;
CREATE POLICY clip_markers_select_member ON clip_markers
  FOR SELECT
  USING (is_event_member(event_id));

DROP POLICY IF EXISTS clip_markers_insert_editor ON clip_markers;
CREATE POLICY clip_markers_insert_editor ON clip_markers
  FOR INSERT
  WITH CHECK (has_event_role(event_id, ARRAY['admin', 'editor']));

DROP POLICY IF EXISTS clip_markers_update_editor ON clip_markers;
CREATE POLICY clip_markers_update_editor ON clip_markers
  FOR UPDATE
  USING (has_event_role(event_id, ARRAY['admin', 'editor']))
  WITH CHECK (has_event_role(event_id, ARRAY['admin', 'editor']));

DROP POLICY IF EXISTS clip_markers_delete_editor ON clip_markers;
CREATE POLICY clip_markers_delete_editor ON clip_markers
  FOR DELETE
  USING (has_event_role(event_id, ARRAY['admin', 'editor']));

DROP POLICY IF EXISTS notes_select_member ON notes;
CREATE POLICY notes_select_member ON notes
  FOR SELECT
  USING (is_event_member(event_id));

DROP POLICY IF EXISTS notes_insert_editor ON notes;
CREATE POLICY notes_insert_editor ON notes
  FOR INSERT
  WITH CHECK (has_event_role(event_id, ARRAY['admin', 'editor']));

DROP POLICY IF EXISTS notes_update_editor ON notes;
CREATE POLICY notes_update_editor ON notes
  FOR UPDATE
  USING (has_event_role(event_id, ARRAY['admin', 'editor']))
  WITH CHECK (has_event_role(event_id, ARRAY['admin', 'editor']));

DROP POLICY IF EXISTS notes_delete_editor ON notes;
CREATE POLICY notes_delete_editor ON notes
  FOR DELETE
  USING (has_event_role(event_id, ARRAY['admin', 'editor']));

DROP POLICY IF EXISTS deliverables_select_member ON deliverables;
CREATE POLICY deliverables_select_member ON deliverables
  FOR SELECT
  USING (is_event_member(event_id));

DROP POLICY IF EXISTS deliverables_insert_editor ON deliverables;
CREATE POLICY deliverables_insert_editor ON deliverables
  FOR INSERT
  WITH CHECK (has_event_role(event_id, ARRAY['admin', 'editor']));

DROP POLICY IF EXISTS deliverables_update_editor ON deliverables;
CREATE POLICY deliverables_update_editor ON deliverables
  FOR UPDATE
  USING (has_event_role(event_id, ARRAY['admin', 'editor']))
  WITH CHECK (has_event_role(event_id, ARRAY['admin', 'editor']));

DROP POLICY IF EXISTS deliverables_delete_editor ON deliverables;
CREATE POLICY deliverables_delete_editor ON deliverables
  FOR DELETE
  USING (has_event_role(event_id, ARRAY['admin', 'editor']));

DROP POLICY IF EXISTS schedule_slots_select_member ON schedule_slots;
CREATE POLICY schedule_slots_select_member ON schedule_slots
  FOR SELECT
  USING (is_event_member(event_id));

DROP POLICY IF EXISTS schedule_slots_insert_editor ON schedule_slots;
CREATE POLICY schedule_slots_insert_editor ON schedule_slots
  FOR INSERT
  WITH CHECK (has_event_role(event_id, ARRAY['admin', 'editor']));

DROP POLICY IF EXISTS schedule_slots_update_editor ON schedule_slots;
CREATE POLICY schedule_slots_update_editor ON schedule_slots
  FOR UPDATE
  USING (has_event_role(event_id, ARRAY['admin', 'editor']))
  WITH CHECK (has_event_role(event_id, ARRAY['admin', 'editor']));

DROP POLICY IF EXISTS schedule_slots_delete_editor ON schedule_slots;
CREATE POLICY schedule_slots_delete_editor ON schedule_slots
  FOR DELETE
  USING (has_event_role(event_id, ARRAY['admin', 'editor']));

DROP POLICY IF EXISTS completions_select_member ON player_station_completions;
CREATE POLICY completions_select_member ON player_station_completions
  FOR SELECT
  USING (is_event_member(event_id));

DROP POLICY IF EXISTS completions_insert_editor ON player_station_completions;
CREATE POLICY completions_insert_editor ON player_station_completions
  FOR INSERT
  WITH CHECK (has_event_role(event_id, ARRAY['admin', 'editor']));

DROP POLICY IF EXISTS completions_update_editor ON player_station_completions;
CREATE POLICY completions_update_editor ON player_station_completions
  FOR UPDATE
  USING (has_event_role(event_id, ARRAY['admin', 'editor']))
  WITH CHECK (has_event_role(event_id, ARRAY['admin', 'editor']));

DROP POLICY IF EXISTS completions_delete_editor ON player_station_completions;
CREATE POLICY completions_delete_editor ON player_station_completions
  FOR DELETE
  USING (has_event_role(event_id, ARRAY['admin', 'editor']));

DROP POLICY IF EXISTS players_select_member ON players;
CREATE POLICY players_select_member ON players
  FOR SELECT
  USING (is_event_member(event_id));

DROP POLICY IF EXISTS players_insert_editor ON players;
CREATE POLICY players_insert_editor ON players
  FOR INSERT
  WITH CHECK (has_event_role(event_id, ARRAY['admin', 'editor']));

DROP POLICY IF EXISTS players_update_editor ON players;
CREATE POLICY players_update_editor ON players
  FOR UPDATE
  USING (has_event_role(event_id, ARRAY['admin', 'editor']))
  WITH CHECK (has_event_role(event_id, ARRAY['admin', 'editor']));

DROP POLICY IF EXISTS players_delete_editor ON players;
CREATE POLICY players_delete_editor ON players
  FOR DELETE
  USING (has_event_role(event_id, ARRAY['admin', 'editor']));

-- =============================================
-- 8. ENABLE REALTIME FOR TABLES
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'clip_markers'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE clip_markers;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'notes'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE notes;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'deliverables'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE deliverables;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'schedule_slots'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE schedule_slots;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'player_station_completions'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE player_station_completions;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'players'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE players;
    END IF;
  END IF;
END
$$;
