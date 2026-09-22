/*
# Create COI certificates table

1. New Tables
- `coi_certificates` stores certificates of insurance created in the AMS360-style workflow.
- `id` is the unique certificate identifier.
- `certificate_number`, `insured_name`, `holder_name`, `policy_number`, `description`, `issued_date`, and `status` store certificate details shown in the certificate register.
- `created_at` stores when the record was created.

2. Security
- Row level security is enabled.
- This is a single-tenant prototype without a sign-in screen, so anon and authenticated roles can use the shared register.

3. Notes
- The table intentionally mirrors the visible certificate workflow and does not store confidential policy documents.
*/

CREATE TABLE IF NOT EXISTS public.coi_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number text NOT NULL,
  insured_name text NOT NULL,
  holder_name text NOT NULL,
  policy_number text NOT NULL,
  description text NOT NULL,
  issued_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'Issued',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coi_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shared_select_coi_certificates" ON public.coi_certificates;
CREATE POLICY "shared_select_coi_certificates" ON public.coi_certificates FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "shared_insert_coi_certificates" ON public.coi_certificates;
CREATE POLICY "shared_insert_coi_certificates" ON public.coi_certificates FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "shared_update_coi_certificates" ON public.coi_certificates;
CREATE POLICY "shared_update_coi_certificates" ON public.coi_certificates FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "shared_delete_coi_certificates" ON public.coi_certificates;
CREATE POLICY "shared_delete_coi_certificates" ON public.coi_certificates FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS coi_certificates_issued_date_idx ON public.coi_certificates (issued_date DESC);
