/*
# Create customers table

1. New Tables
- `customers` stores insured/prospect records created through the New Customer workflow.
- `id` is the unique customer identifier.
- `name`, `address`, `city`, `state`, `zip`, `phone`, `email` store the customer's contact record.
- `customer_type` distinguishes Customer / Prospect / Suspect records.
- `primary_executive` and `primary_representative` store the assigned agency personnel that flow to policies and certificates.
- `created_at` stores when the record was created.

2. Security
- Row level security is enabled.
- This is a single-tenant prototype without a sign-in screen, so anon and authenticated roles can use the shared register.

3. Notes
- The table mirrors the visible Customer Setup workflow and does not store confidential underwriting data.
*/

CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  zip text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  customer_type text NOT NULL DEFAULT 'Customer',
  primary_executive text NOT NULL DEFAULT '',
  primary_representative text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shared_select_customers" ON public.customers;
CREATE POLICY "shared_select_customers" ON public.customers FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "shared_insert_customers" ON public.customers;
CREATE POLICY "shared_insert_customers" ON public.customers FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "shared_update_customers" ON public.customers;
CREATE POLICY "shared_update_customers" ON public.customers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "shared_delete_customers" ON public.customers;
CREATE POLICY "shared_delete_customers" ON public.customers FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS customers_name_idx ON public.customers (name);
