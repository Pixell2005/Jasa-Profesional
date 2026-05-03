-- ============================================================
-- MIGRATION DOWN: Remove audit fields
-- ============================================================
-- File: 000003_add_audit_fields.down.sql
-- Rollback untuk menghapus audit fields dan tables

-- Drop triggers
DROP TRIGGER IF EXISTS vendors_set_updated_at ON vendors;
DROP TRIGGER IF EXISTS payments_set_updated_at ON payments;

-- Drop functions
DROP FUNCTION IF EXISTS set_vendors_updated_at();
DROP FUNCTION IF EXISTS set_payments_updated_at();

-- Drop tables
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS reviews;

-- Drop columns dari existing tables
ALTER TABLE vendors
    DROP COLUMN IF EXISTS deleted_at,
    DROP COLUMN IF EXISTS updated_at;

ALTER TABLE users
    DROP COLUMN IF EXISTS deleted_at;
