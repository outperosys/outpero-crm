-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('ACTIVE', 'DRAFT', 'ARCHIVED');

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "short_description" TEXT NOT NULL,
    "full_description" TEXT,
    "starting_price" DOUBLE PRECISION,
    "default_price" DOUBLE PRECISION,
    "pricing_notes" TEXT,
    "timeline" TEXT,
    "deliverables" TEXT,
    "implementation_steps" TEXT,
    "ideal_client" TEXT,
    "problems_solved" TEXT,
    "common_objections" TEXT,
    "ai_context" TEXT,
    "proposal_instructions" TEXT,
    "follow_up_instructions" TEXT,
    "proposal_defaults" TEXT,
    "invoice_defaults" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "services_name_key" ON "services"("name");

-- CreateIndex
CREATE INDEX "services_status_idx" ON "services"("status");

-- CreateIndex
CREATE INDEX "services_category_idx" ON "services"("category");
