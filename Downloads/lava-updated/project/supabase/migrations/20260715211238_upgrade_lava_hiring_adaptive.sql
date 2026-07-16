/*
# LAVA Platform Upgrade — Hiring Report & Adaptive Data

## Overview
Adds columns to store the enhanced hiring report data (role readiness, hiring
recommendation, recommended learning path) and adaptive session data (difficulty
history, personality used, emotion timeline) to the assessments table.

## Modified Tables

### assessments
- `role_readiness` (numeric, default 0) — 0-100 score for position-specific readiness
- `hiring_recommendation` (text, nullable) — HR-quality recommendation label
- `recommended_learning_path` (jsonb, default '[]') — array of learning modules
- `adaptive_data` (jsonb, default '{}') — adaptive session metadata (difficulty
  history, personality used, emotion timeline, follow-up count)

## Security
- No new tables. RLS already enabled on assessments.
- No policy changes needed — existing anon/authenticated policies cover the new columns.

## Notes
1. All new columns are nullable or have safe defaults so existing rows are unaffected.
2. Uses `DO $$ ... END $$` to conditionally add columns only if they don't exist (idempotent).
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'role_readiness') THEN
    ALTER TABLE assessments ADD COLUMN role_readiness numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'hiring_recommendation') THEN
    ALTER TABLE assessments ADD COLUMN hiring_recommendation text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'recommended_learning_path') THEN
    ALTER TABLE assessments ADD COLUMN recommended_learning_path jsonb DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'adaptive_data') THEN
    ALTER TABLE assessments ADD COLUMN adaptive_data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;
