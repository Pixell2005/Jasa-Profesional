-- ============================================================
-- SAFE APPLY SCRIPT
-- Jalankan script ini jika migration 000002 dan 000003
-- belum pernah diapply ke database yang sudah berjalan.
-- 
-- Script ini AMAN dijalankan berkali-kali (semua pakai IF NOT EXISTS)
-- Tidak menghapus data yang sudah ada.
-- ============================================================

-- ============ DARI MIGRATION 000002 ========================
-- Tambah metadata columns ke users

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ DEFAULT now(),
    ADD COLUMN IF NOT EXISTS last_login_at   TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_logout_at  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS login_count     INT         NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_ip         VARCHAR(45);

-- Trigger auto-update updated_at untuk users
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Buat trigger hanya jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'users_set_updated_at'
    ) THEN
        CREATE TRIGGER users_set_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;


-- ============ DARI MIGRATION 000003 ========================
-- Tambah audit fields ke users dan vendors

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE vendors
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Tabel reviews (jika belum ada)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(booking_id)
);

-- Tabel audit_logs (jika belum ada)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    status VARCHAR(20) DEFAULT 'success',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel payments (jika belum ada)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    transaction_id VARCHAR(100),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index tambahan
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_id ON reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Trigger auto-update updated_at untuk vendors
CREATE OR REPLACE FUNCTION set_vendors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'vendors_set_updated_at'
    ) THEN
        CREATE TRIGGER vendors_set_updated_at
            BEFORE UPDATE ON vendors
            FOR EACH ROW EXECUTE FUNCTION set_vendors_updated_at();
    END IF;
END $$;

-- Trigger auto-update updated_at untuk payments
CREATE OR REPLACE FUNCTION set_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'payments_set_updated_at'
    ) THEN
        CREATE TRIGGER payments_set_updated_at
            BEFORE UPDATE ON payments
            FOR EACH ROW EXECUTE FUNCTION set_payments_updated_at();
    END IF;
END $$;

-- ============================================================
-- Selesai. Jalankan: psql -U <user> -d <dbname> -f db/safe_apply_migrations.sql
-- ============================================================
