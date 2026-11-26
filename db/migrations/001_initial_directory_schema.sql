CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS directory_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_file text NOT NULL,
  source_sha256 text,
  record_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_batch_id uuid NOT NULL REFERENCES directory_import_batches(id),
  source_record_key text NOT NULL UNIQUE,
  business_name text NOT NULL,
  tagline text,
  description text,
  membership_tier text NOT NULL CHECK (membership_tier IN ('Bronze','Bronze PLUS')),
  billing_period text NOT NULL CHECK (billing_period IN ('monthly','annual','unknown')),
  billing_status text NOT NULL CHECK (billing_status IN ('source_method_present','needs_review')),
  publication_status text NOT NULL DEFAULT 'staged' CHECK (publication_status IN ('staged','approved','published','suspended')),
  category_labels text[] NOT NULL DEFAULT '{}',
  city text,
  state text,
  postal_code text,
  street_address text,
  show_street_address boolean NOT NULL DEFAULT true,
  hide_contact_name boolean NOT NULL DEFAULT false,
  business_email text,
  business_phone text,
  website_url text,
  logo_url text,
  gallery_urls text[] NOT NULL DEFAULT '{}',
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  google_review_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS membership_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL UNIQUE REFERENCES business_listings(id) ON DELETE CASCADE,
  tier text NOT NULL CHECK (tier IN ('Bronze','Bronze PLUS')),
  billing_period text NOT NULL CHECK (billing_period IN ('monthly','annual','unknown')),
  billing_status text NOT NULL CHECK (billing_status IN ('source_method_present','needs_review')),
  source_billing_method text,
  benefits jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS business_listings_publication_idx ON business_listings(publication_status);
CREATE INDEX IF NOT EXISTS business_listings_tier_idx ON business_listings(membership_tier);
CREATE INDEX IF NOT EXISTS business_listings_categories_idx ON business_listings USING gin(category_labels);

ALTER TABLE directory_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_entitlements ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON directory_import_batches, business_listings, membership_entitlements FROM PUBLIC;
