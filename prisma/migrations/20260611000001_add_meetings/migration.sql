-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('DISCOVERY_CALL', 'DEMO', 'ONBOARDING', 'CHECK_IN', 'INTERNAL', 'OTHER');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- AlterTable
ALTER TABLE "meeting_transcripts" ADD COLUMN     "meeting_id" TEXT;

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "MeetingType" NOT NULL DEFAULT 'DISCOVERY_CALL',
    "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER,
    "meeting_link" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "assigned_to" TEXT,
    "created_by" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meetings_scheduled_at_idx" ON "meetings"("scheduled_at");

-- CreateIndex
CREATE INDEX "meetings_status_idx" ON "meetings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_transcripts_meeting_id_key" ON "meeting_transcripts"("meeting_id");

-- AddForeignKey
ALTER TABLE "meeting_transcripts" ADD CONSTRAINT "meeting_transcripts_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

