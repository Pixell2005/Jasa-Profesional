-- ============================================================
-- MIGRATION: Add comprehensive audit and tracking fields
-- ============================================================
-- File: 000003_add_audit_fields.up.sql
-- Purpose: Add audit trail, soft delete, dan tracking fields

-- Add audit fields ke table users (jika belum ada)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add audit fields ke table vendors
ALTER TABLE vendors
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add audit fields ke table bookings (jika belum ada created_at trigger)
-- Sudah ada dari migration sebelumnya

-- Tabel baru: reviews - untuk rating dan review dari customer ke vendor
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(booking_id) -- satu review per booking
);

-- Tabel baru: audit_logs - untuk tracking setiap action penting
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- "login", "logout", "booking_created", dll
    target_type VARCHAR(50), -- "user", "vendor", "booking", dll
    target_id UUID,
    details JSONB, -- detail action dalam format JSON
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    status VARCHAR(20) DEFAULT 'success', -- "success" atau "failed"
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel baru: payments - untuk tracking pembayaran
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    payment_method VARCHAR(50), -- "credit_card", "bank_transfer", "e_wallet"
    status VARCHAR(20) DEFAULT 'pending', -- "pending", "paid", "failed", "refunded"
    transaction_id VARCHAR(100),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index untuk query yang sering dipakai
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_id ON reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Create trigger untuk auto-update updated_at di vendors
CREATE OR REPLACE FUNCTION set_vendors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vendors_set_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION set_vendors_updated_at();

-- Create trigger untuk auto-update updated_at di payments
CREATE OR REPLACE FUNCTION set_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_set_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION set_payments_updated_at();
