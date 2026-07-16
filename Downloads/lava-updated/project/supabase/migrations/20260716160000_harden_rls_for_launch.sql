/*
  # Harden RLS before launch

  ## Why
  The original policies grant the public `anon` role full read / write / DELETE on every
  table via `USING (true)`. Because the anon key ships inside the frontend bundle, anyone
  can call the database directly and read, overwrite, or DELETE every candidate's data.

  ## What this migration does (safe, no app-flow depends on anon DELETE)
  - Removes anonymous DELETE on candidates, assessments, and module_scores.
  - Leaves INSERT / UPDATE / SELECT for the candidate-facing flow, which currently needs
    them because the app has no login yet.

  ## What this migration CANNOT fix on its own
  Without authentication, RLS cannot tell "a candidate reading their own row" apart from
  "an attacker reading everyone's rows." Fully protecting candidate PII (and the /admin
  dashboard) requires Supabase Auth. See LAUNCH_CHECKLIST.md for the recommended path.

  Apply in the Supabase dashboard: SQL Editor → paste → Run.
*/

-- Candidates: no anonymous deletes.
DROP POLICY IF EXISTS "anon_delete_candidates" ON candidates;

-- Assessments: no anonymous deletes.
DROP POLICY IF EXISTS "anon_delete_assessments" ON assessments;

-- Module scores: no anonymous deletes.
DROP POLICY IF EXISTS "anon_delete_module_scores" ON module_scores;

-- (If a leaderboard delete policy exists, remove anonymous delete there too.)
DROP POLICY IF EXISTS "anon_delete_leaderboard" ON leaderboard;
