-- ============================================
-- MIGRATION: Add metadata columns to users
-- ============================================

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ DEFAULT now(),
    ADD COLUMN IF NOT EXISTS last_login_at   TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_logout_at  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS login_count     INT         NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_ip         VARCHAR(45);

-- Auto-update updated_at setiap kali row di-UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
