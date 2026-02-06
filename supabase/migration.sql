-- Prizm Lounge Production Hub - Supabase Database Migration
-- Run this SQL in Supabase SQL Editor to create all tables.

-- =============================================
-- 1. CLIP MARKERS (already may exist)
-- =============================================
CREATE TABLE IF NOT EXISTS clip_markers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clip_markers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous access" ON clip_markers;
CREATE POLICY "Allow anonymous access" ON clip_markers
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_clip_markers_timestamp ON clip_markers(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_clip_markers_player_id ON clip_markers(player_id);
CREATE INDEX IF NOT EXISTS idx_clip_markers_station_id ON clip_markers(station_id);
CREATE INDEX IF NOT EXISTS idx_clip_markers_category ON clip_markers(category);

-- =============================================
-- 2. NOTES / ISSUE LOGGER
-- =============================================
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  station_id VARCHAR(50),
  player_id VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_by VARCHAR(100)
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous access" ON notes;
CREATE POLICY "Allow anonymous access" ON notes
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notes_status ON notes(status);
CREATE INDEX IF NOT EXISTS idx_notes_priority ON notes(priority);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

-- =============================================
-- 3. DELIVERABLES TRACKER
-- =============================================
CREATE TABLE IF NOT EXISTS deliverables (
  id TEXT PRIMARY KEY,
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
  priority VARCHAR(20) DEFAULT 'medium'
);

ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous access" ON deliverables;
CREATE POLICY "Allow anonymous access" ON deliverables
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_deliverables_status ON deliverables(status);
CREATE INDEX IF NOT EXISTS idx_deliverables_due_day ON deliverables(due_day);

-- =============================================
-- 4. SCHEDULE SLOTS
-- =============================================
CREATE TABLE IF NOT EXISTS schedule_slots (
  id TEXT PRIMARY KEY,
  player_id VARCHAR(100) NOT NULL,
  date VARCHAR(10) NOT NULL,
  start_time VARCHAR(5) NOT NULL,
  end_time VARCHAR(5) NOT NULL,
  station VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled',
  pr_call_info JSONB,
  notes TEXT
);

ALTER TABLE schedule_slots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous access" ON schedule_slots;
CREATE POLICY "Allow anonymous access" ON schedule_slots
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_schedule_slots_date ON schedule_slots(date);
CREATE INDEX IF NOT EXISTS idx_schedule_slots_player_id ON schedule_slots(player_id);
CREATE INDEX IF NOT EXISTS idx_schedule_slots_station ON schedule_slots(station);

-- =============================================
-- 5. PLAYER STATION COMPLETIONS
-- =============================================
CREATE TABLE IF NOT EXISTS player_station_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id VARCHAR(100) NOT NULL,
  station_id VARCHAR(50) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  completed_at TIMESTAMPTZ,
  completed_by VARCHAR(100),
  notes TEXT,
  UNIQUE(player_id, station_id)
);

ALTER TABLE player_station_completions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous access" ON player_station_completions;
CREATE POLICY "Allow anonymous access" ON player_station_completions
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_completions_player_id ON player_station_completions(player_id);
CREATE INDEX IF NOT EXISTS idx_completions_station_id ON player_station_completions(station_id);

-- =============================================
-- ENABLE REALTIME FOR ALL TABLES
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE clip_markers;
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE deliverables;
ALTER PUBLICATION supabase_realtime ADD TABLE schedule_slots;
ALTER PUBLICATION supabase_realtime ADD TABLE player_station_completions;
