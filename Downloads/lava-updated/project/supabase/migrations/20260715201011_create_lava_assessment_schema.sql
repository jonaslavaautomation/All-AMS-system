/*
# LAVA Communication Skills Simulator - Core Schema

## Overview
Creates the database schema for the LAVA Communication Skills Simulator, an AI-powered
English communication assessment platform for aspiring Virtual Assistants. Candidates
register with their name, email, and target position, then complete a seven-module
assessment. The platform stores candidate profiles, assessment sessions, per-module
scores, and leaderboard entries.

## Tables

### 1. candidates
- `id` (uuid, PK)
- `first_name` (text) - candidate's first name
- `last_name` (text) - candidate's last name
- `email` (text) - candidate's email, used to look up existing records
- `position` (text) - the VA position the candidate is applying for
- `created_at` (timestamptz) - registration timestamp

### 2. assessments
- `id` (uuid, PK)
- `candidate_id` (uuid, FK -> candidates.id) - the candidate who took this assessment
- `status` (text) - 'in_progress' | 'completed' | 'abandoned'
- `current_module` (int) - 1-7, the module the candidate is currently on
- `overall_score` (numeric) - 0-100 final overall score
- `communication_score` (numeric) - 0-100
- `listening_score` (numeric) - 0-100
- `pronunciation_score` (numeric) - 0-100
- `grammar_score` (numeric) - 0-100
- `vocabulary_score` (numeric) - 0-100
- `customer_service_score` (numeric) - 0-100
- `cold_calling_score` (numeric) - 0-100
- `insurance_comm_score` (numeric) - 0-100
- `english_level` (text) - Beginner | Elementary | Intermediate | Upper Intermediate | Advanced | Professional
- `recommendation` (text) - AI-generated recommendation text
- `started_at` (timestamptz) - when the assessment began
- `completed_at` (timestamptz) - when the assessment was finished
- `created_at` (timestamptz)

### 3. module_scores
- `id` (uuid, PK)
- `assessment_id` (uuid, FK -> assessments.id) - parent assessment
- `module_number` (int) - 1-7
- `module_name` (text) - human-readable module name
- `score` (numeric) - 0-100 for this module
- `details` (jsonb) - detailed scoring breakdown (per-category scores, strengths, weaknesses, etc.)
- `created_at` (timestamptz)

### 4. leaderboard
- `id` (uuid, PK)
- `candidate_id` (uuid, FK -> candidates.id)
- `assessment_id` (uuid, FK -> assessments.id)
- `candidate_name` (text) - denormalized for fast display
- `position` (text) - denormalized
- `overall_score` (numeric)
- `english_level` (text)
- `completed_at` (timestamptz)

### 5. badges
- `id` (uuid, PK)
- `candidate_id` (uuid, FK -> candidates.id)
- `badge_type` (text) - e.g. 'first_assessment', 'high_score', 'perfect_module', 'streak'
- `badge_name` (text) - display name
- `description` (text)
- `awarded_at` (timestamptz)

## Security
- RLS enabled on all tables.
- This is a no-auth app (candidates register without a password). Policies use
  `TO anon, authenticated` so the anon-key frontend can read and write all data.
  The data is intentionally shared (leaderboard, admin dashboard) and there is no
  per-user ownership concept — every candidate record is accessible to the platform.
- An admin access code is checked in the frontend only (stored as env var), not at the
  database level, since there is no auth system.

## Notes
1. All tables use `gen_random_uuid()` for primary keys.
2. Timestamps default to `now()`.
3. Foreign keys have `ON DELETE CASCADE` so deleting a candidate cleans up related data.
4. Indexes added on frequently-queried columns (email, candidate_id, assessment_id).
*/

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  position text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at DESC);

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_candidates" ON candidates;
CREATE POLICY "anon_select_candidates" ON candidates FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_candidates" ON candidates;
CREATE POLICY "anon_insert_candidates" ON candidates FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_candidates" ON candidates;
CREATE POLICY "anon_update_candidates" ON candidates FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress',
  current_module int NOT NULL DEFAULT 1,
  overall_score numeric DEFAULT 0,
  communication_score numeric DEFAULT 0,
  listening_score numeric DEFAULT 0,
  pronunciation_score numeric DEFAULT 0,
  grammar_score numeric DEFAULT 0,
  vocabulary_score numeric DEFAULT 0,
  customer_service_score numeric DEFAULT 0,
  cold_calling_score numeric DEFAULT 0,
  insurance_comm_score numeric DEFAULT 0,
  english_level text,
  recommendation text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessments_candidate_id ON assessments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_completed_at ON assessments(completed_at DESC);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_assessments" ON assessments;
CREATE POLICY "anon_select_assessments" ON assessments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_assessments" ON assessments;
CREATE POLICY "anon_insert_assessments" ON assessments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_assessments" ON assessments;
CREATE POLICY "anon_update_assessments" ON assessments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_assessments" ON assessments;
CREATE POLICY "anon_delete_assessments" ON assessments FOR DELETE
  TO anon, authenticated USING (true);

-- Module scores table
CREATE TABLE IF NOT EXISTS module_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  module_number int NOT NULL,
  module_name text NOT NULL,
  score numeric DEFAULT 0,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_module_scores_assessment_id ON module_scores(assessment_id);

ALTER TABLE module_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_module_scores" ON module_scores;
CREATE POLICY "anon_select_module_scores" ON module_scores FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_module_scores" ON module_scores;
CREATE POLICY "anon_insert_module_scores" ON module_scores FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_module_scores" ON module_scores;
CREATE POLICY "anon_update_module_scores" ON module_scores FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_module_scores" ON module_scores;
CREATE POLICY "anon_delete_module_scores" ON module_scores FOR DELETE
  TO anon, authenticated USING (true);

-- Leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  candidate_name text NOT NULL,
  position text NOT NULL,
  overall_score numeric NOT NULL DEFAULT 0,
  english_level text,
  completed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_overall_score ON leaderboard(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_completed_at ON leaderboard(completed_at DESC);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_leaderboard" ON leaderboard;
CREATE POLICY "anon_select_leaderboard" ON leaderboard FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_leaderboard" ON leaderboard;
CREATE POLICY "anon_insert_leaderboard" ON leaderboard FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_leaderboard" ON leaderboard;
CREATE POLICY "anon_update_leaderboard" ON leaderboard FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_leaderboard" ON leaderboard;
CREATE POLICY "anon_delete_leaderboard" ON leaderboard FOR DELETE
  TO anon, authenticated USING (true);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  description text,
  awarded_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_badges_candidate_id ON badges(candidate_id);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_badges" ON badges;
CREATE POLICY "anon_select_badges" ON badges FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_badges" ON badges;
CREATE POLICY "anon_insert_badges" ON badges FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_badges" ON badges;
CREATE POLICY "anon_update_badges" ON badges FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_badges" ON badges;
CREATE POLICY "anon_delete_badges" ON badges FOR DELETE
  TO anon, authenticated USING (true);
