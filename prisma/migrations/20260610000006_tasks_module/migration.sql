-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'WAITING', 'DONE');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TaskRelatedType" AS ENUM ('LEAD', 'INVOICE', 'RECEIPT', 'SERVICE', 'GENERAL');

-- CreateEnum
CREATE TYPE "TaskSource" AS ENUM ('MANUAL', 'AI_SUGGESTED', 'RECURRING');

-- AlterTable: add new columns
ALTER TABLE "tasks"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
  ADD COLUMN "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
  ADD COLUMN "created_by" TEXT,
  ADD COLUMN "related_type" "TaskRelatedType" NOT NULL DEFAULT 'GENERAL',
  ADD COLUMN "invoice_id" TEXT,
  ADD COLUMN "receipt_id" TEXT,
  ADD COLUMN "service_id" TEXT,
  ADD COLUMN "source" "TaskSource" NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN "metadata" JSONB;

-- Backfill: existing rows are all lead-linked checklist items
UPDATE "tasks" SET "related_type" = 'LEAD';
UPDATE "tasks" SET "status" = 'DONE' WHERE "completed" = true;

-- AlterTable: lead_id becomes optional (general/invoice/receipt/service tasks have no lead)
ALTER TABLE "tasks" ALTER COLUMN "lead_id" DROP NOT NULL;

-- AlterTable: drop legacy completed flag (replaced by status = 'DONE')
ALTER TABLE "tasks" DROP COLUMN "completed";

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_priority_idx" ON "tasks"("priority");

-- CreateIndex
CREATE INDEX "tasks_assigned_to_idx" ON "tasks"("assigned_to");

-- CreateIndex
CREATE INDEX "tasks_due_date_idx" ON "tasks"("due_date");

-- CreateIndex
CREATE INDEX "tasks_related_type_idx" ON "tasks"("related_type");

-- CreateTable
CREATE TABLE "task_comments" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
