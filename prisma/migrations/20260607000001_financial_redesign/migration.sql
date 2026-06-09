-- ─── Step 1: Rename InvoiceType enum values (RENAME VALUE works in-transaction) ─
ALTER TYPE "InvoiceType" RENAME VALUE 'ONE_TIME_PROJECT' TO 'FULL_PAYMENT';
ALTER TYPE "InvoiceType" RENAME VALUE 'MONTHLY_RETAINER' TO 'ADVANCE_PAYMENT';
ALTER TYPE "InvoiceType" RENAME VALUE 'SETUP_FEE' TO 'MILESTONE_PAYMENT';
ALTER TYPE "InvoiceType" RENAME VALUE 'CUSTOM' TO 'FINAL_PAYMENT';

-- ─── Step 2: Add missing columns to invoices ─────────────────────────────────
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "bank_details" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "terms" TEXT;

-- ─── Step 3: Create agency_settings table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS "agency_settings" (
    "id" TEXT NOT NULL DEFAULT '1',
    "name" TEXT,
    "address" TEXT,
    "bank_details" TEXT,
    "terms" TEXT,
    "tone_of_voice" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "agency_settings_pkey" PRIMARY KEY ("id")
);

-- ─── Step 4: Create receipts table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "receipts" (
    "id" TEXT NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "receipt_date" TIMESTAMP(3) NOT NULL,
    "invoice_id" TEXT,
    "lead_id" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "company_name" TEXT,
    "amount_received" DOUBLE PRECISION NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "payment_method" TEXT,
    "transaction_reference" TEXT,
    "utr_number" TEXT,
    "notes" TEXT,
    "terms" TEXT,
    "services" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- ─── Step 5: Indexes and foreign keys for receipts ───────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS "receipts_receipt_number_key" ON "receipts"("receipt_number");

ALTER TABLE "receipts"
    ADD CONSTRAINT "receipts_invoice_id_fkey"
    FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "receipts"
    ADD CONSTRAINT "receipts_lead_id_fkey"
    FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
