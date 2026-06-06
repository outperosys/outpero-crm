-- CreateEnum
CREATE TYPE "TranscriptSource" AS ENUM ('MANUAL', 'GOOGLE_MEET', 'ZOOM');

-- CreateTable
CREATE TABLE "meeting_transcripts" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "raw_text" TEXT,
    "insights" JSONB NOT NULL,
    "source" "TranscriptSource" NOT NULL DEFAULT 'MANUAL',
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_transcripts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "meeting_transcripts" ADD CONSTRAINT "meeting_transcripts_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
