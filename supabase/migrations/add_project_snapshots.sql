-- Migration: add project_snapshots table for one-click rollback
-- Run this in your Supabase dashboard → SQL Editor

CREATE TABLE project_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  files JSONB NOT NULL,  -- array of { path: string, content: string }
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_snapshots_project_created
  ON project_snapshots(project_id, created_at DESC);

-- RLS: users can only see snapshots for their own projects
ALTER TABLE project_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own project snapshots"
  ON project_snapshots FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own project snapshots"
  ON project_snapshots FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own project snapshots"
  ON project_snapshots FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );
