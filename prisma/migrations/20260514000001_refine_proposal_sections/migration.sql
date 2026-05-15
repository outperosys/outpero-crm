-- CreateEnum
CREATE TYPE "VisualStyle" AS ENUM ('CLEAN', 'MODERN', 'HIGHLIGHT', 'MINIMAL', 'HERO', 'TWO_COLUMN');

-- CreateEnum
CREATE TYPE "LayoutType" AS ENUM ('FULL_WIDTH', 'CENTERED', 'TWO_COLUMN', 'CARD');

-- Rename content_template → template_text (preserves existing data)
ALTER TABLE "proposal_template_sections" RENAME COLUMN "content_template" TO "template_text";

-- Add new columns to proposal_template_sections
ALTER TABLE "proposal_template_sections"
  ADD COLUMN "ai_instructions" TEXT,
  ADD COLUMN "is_ai_refinement" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "visual_style" "VisualStyle" NOT NULL DEFAULT 'CLEAN',
  ADD COLUMN "layout_type" "LayoutType" NOT NULL DEFAULT 'FULL_WIDTH';

-- Add new columns to proposal_sections
ALTER TABLE "proposal_sections"
  ADD COLUMN "visual_style" "VisualStyle" NOT NULL DEFAULT 'CLEAN',
  ADD COLUMN "layout_type" "LayoutType" NOT NULL DEFAULT 'FULL_WIDTH';
