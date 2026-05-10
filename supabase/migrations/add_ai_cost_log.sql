-- Migration: AI cost log table for real-time COGS tracking
-- Run in Supabase dashboard → SQL Editor

CREATE TABLE ai_cost_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  model TEXT NOT NULL,
  action TEXT NOT NULL,  -- 'mcq', 'generate', 'edit', 'classify'
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_usd NUMERIC(10,6) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_ai_cost_log_user ON ai_cost_log(user_id, created_at DESC);
CREATE INDEX idx_ai_cost_log_created ON ai_cost_log(created_at DESC);

-- RLS: only service role can insert; no user-level access needed
ALTER TABLE ai_cost_log ENABLE ROW LEVEL SECURITY;
