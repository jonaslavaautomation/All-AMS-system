/*
# Make email column nullable on candidates table

## Overview
The login page no longer collects an email address — candidates register with only
their first name, last name, and target position. This migration makes the `email`
column on the `candidates` table nullable so new candidates can be inserted without
an email value.

## Changes
1. Modified tables:
   - `candidates`: `email` column changed from `NOT NULL` to nullable (existing rows
     with email values are preserved; new rows may have `NULL` email).

## Security
- No RLS policy changes. Existing policies remain unchanged.

## Notes
1. Existing candidate rows with email values are NOT affected — only the constraint
   is relaxed.
2. The email index remains in place; queries on email still work for legacy rows.
*/

ALTER TABLE candidates ALTER COLUMN email DROP NOT NULL;
