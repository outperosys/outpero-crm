-- Expand AgencySettings with structured fields
ALTER TABLE "agency_settings"
  ADD COLUMN IF NOT EXISTS "business_name" TEXT,
  ADD COLUMN IF NOT EXISTS "website" TEXT,
  ADD COLUMN IF NOT EXISTS "email" TEXT,
  ADD COLUMN IF NOT EXISTS "phone" TEXT,
  ADD COLUMN IF NOT EXISTS "gst_number" TEXT,
  ADD COLUMN IF NOT EXISTS "tagline" TEXT,
  ADD COLUMN IF NOT EXISTS "logo_url" TEXT,
  ADD COLUMN IF NOT EXISTS "primary_color" TEXT,
  ADD COLUMN IF NOT EXISTS "secondary_color" TEXT,
  ADD COLUMN IF NOT EXISTS "accent_color" TEXT,
  ADD COLUMN IF NOT EXISTS "brand_description" TEXT,
  ADD COLUMN IF NOT EXISTS "bank_name" TEXT,
  ADD COLUMN IF NOT EXISTS "account_holder" TEXT,
  ADD COLUMN IF NOT EXISTS "account_number" TEXT,
  ADD COLUMN IF NOT EXISTS "ifsc_code" TEXT,
  ADD COLUMN IF NOT EXISTS "upi_id" TEXT,
  ADD COLUMN IF NOT EXISTS "payment_instructions" TEXT,
  ADD COLUMN IF NOT EXISTS "default_tone" TEXT,
  ADD COLUMN IF NOT EXISTS "default_proposal_style" TEXT,
  ADD COLUMN IF NOT EXISTS "default_follow_up_style" TEXT,
  ADD COLUMN IF NOT EXISTS "ai_brand_voice" TEXT,
  ADD COLUMN IF NOT EXISTS "default_service_id" TEXT,
  ADD COLUMN IF NOT EXISTS "featured_service_ids" JSONB,
  ADD COLUMN IF NOT EXISTS "service_ordering" TEXT,
  ADD COLUMN IF NOT EXISTS "pipeline_stage_labels" JSONB,
  ADD COLUMN IF NOT EXISTS "default_won_stage" TEXT DEFAULT 'WON',
  ADD COLUMN IF NOT EXISTS "default_lost_stage" TEXT DEFAULT 'LOST';

-- Create team_members table
CREATE TABLE IF NOT EXISTS "team_members" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "team_members_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "team_members_email_key" UNIQUE ("email")
);
