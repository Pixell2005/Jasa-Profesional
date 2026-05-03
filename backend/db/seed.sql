-- ============================================
-- SEED DATA - UPGRADED
-- ============================================
--
-- SEBELUM JALANKAN SEED INI:
-- 1. Jalankan migration 000002_add_user_metadata.up.sql terlebih dahulu
-- 2. Generate hash: go run ./cmd/hash-gen/main.go
-- 3. Ganti setiap <HASH_xxx> di bawah dengan output dari hash-gen
--
-- KENAPA HASH HARUS BERBEDA?
-- Seed lama pakai password yang sama untuk semua user.
-- Artinya semua hash identik → attacker cukup crack 1 hash,
-- semua akun (customer, vendor, admin) langsung bobol sekaligus.
-- Dengan password unik per user, tiap hash harus di-crack sendiri.
-- ============================================


-- ============================================
-- CUSTOMERS
-- ============================================

INSERT INTO users (email, password, name, role, is_active, created_at, updated_at, last_login_at, last_logout_at, login_count, last_ip)
VALUES (
    'customer1@test.com',
    '<HASH_customer1>',        -- go run ./cmd/hash-gen → password: Cust_Adi_2024!
    'Adi Suryanto', 'customer', true,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '22 hours',
    14,
    '118.99.45.12'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, password, name, role, is_active, created_at, updated_at, last_login_at, last_logout_at, login_count, last_ip)
VALUES (
    'customer2@test.com',
    '<HASH_customer2>',        -- password: Cust_Budi_2024!
    'Budi Santoso', 'customer', true,
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '4 days',
    7,
    '36.81.210.34'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, password, name, role, is_active, created_at, updated_at, last_login_at, last_logout_at, login_count, last_ip)
VALUES (
    'customer3@test.com',
    '<HASH_customer3>',        -- password: Cust_Citra_2024!
    'Citra Dewi', 'customer', true,
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours',
    NULL,                      -- sedang login, belum logout
    22,
    '114.10.88.57'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, password, name, role, is_active, created_at, updated_at, last_login_at, last_logout_at, login_count, last_ip)
VALUES (
    'customer4@test.com',
    '<HASH_customer4>',        -- password: Cust_Deni_2024!
    'Deni Hermawan', 'customer', true,
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '9 days',
    3,
    '180.252.130.90'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, password, name, role, is_active, created_at, updated_at, last_login_at, last_logout_at, login_count, last_ip)
VALUES (
    'customer5@test.com',
    '<HASH_customer5>',        -- password: Cust_Eka_2024!
    'Eka Putri', 'customer', true,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days',
    NULL,                      -- belum pernah login sejak daftar
    NULL,
    0,
    NULL
) ON CONFLICT (email) DO NOTHING;


-- ============================================
-- VENDORS
-- ============================================

INSERT INTO users (email, password, name, role, is_active, created_at, updated_at, last_login_at, last_logout_at, login_count, last_ip)
VALUES (
    'vendor1@test.com',
    '<HASH_vendor1>',          -- password: Vend_Ahmad_2024!
    'Ahmad Ali', 'vendor', true,
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour',
    NULL,                      -- sedang aktif
    45,
    '103.31.84.22'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, password, name, role, is_active, created_at, updated_at, last_login_at, last_logout_at, login_count, last_ip)
VALUES (
    'vendor2@test.com',
    '<HASH_vendor2>',          -- password: Vend_Baskoro_2024!
    'Baskoro Jaya', 'vendor', true,
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '4 hours',
    30,
    '202.67.155.44'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, password, name, role, is_active, created_at, updated_at, last_login_at, last_logout_at, login_count, last_ip)
VALUES (
    'vendor3@test.com',
    '<HASH_vendor3>',          -- password: Vend_Citra_2024!
    'Citra Jasa', 'vendor', true,
    NOW() - INTERVAL '40 days',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day',
    18,
    '36.82.200.11'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, password, name, role, is_active, created_at, updated_at, last_login_at, last_logout_at, login_count, last_ip)
VALUES (
    'vendor4@test.com',
    '<HASH_vendor4>',          -- password: Vend_Dian_2024!
    'Dian Sartika', 'vendor', true,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '12 hours',
    NOW() - INTERVAL '12 hours',
    NOW() - INTERVAL '10 hours',
    25,
    '114.122.66.78'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, password, name, role, is_active, created_at, updated_at, last_login_at, last_logout_at, login_count, last_ip)
VALUES (
    'vendor5@test.com',
    '<HASH_vendor5>',          -- password: Vend_Eka_2024!
    'Eka Service', 'vendor', true,
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '2 days',
    9,
    '180.246.99.100'
) ON CONFLICT (email) DO NOTHING;


-- ============================================
-- ADMIN
-- ============================================

INSERT INTO users (email, password, name, role, is_active, created_at, updated_at, last_login_at, last_logout_at, login_count, last_ip)
VALUES (
    'admin@test.com',
    '<HASH_admin>',            -- password: Adm!n_Sys_2024#
    'Admin System', 'admin', true,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '30 minutes',
    NULL,                      -- sedang login
    210,
    '127.0.0.1'
) ON CONFLICT (email) DO NOTHING;


-- ============================================
-- VENDOR PROFILES (tidak berubah dari seed lama)
-- ============================================

INSERT INTO vendors (user_id, name, role, category, price, eta_hours, is_available, bio, phone)
SELECT id, name, 'Plumber', 'plumbing', 150000, 2, true, 'Ahli pipa profesional', '08123456789'
FROM users WHERE email = 'vendor1@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO vendors (user_id, name, role, category, price, eta_hours, is_available, bio, phone)
SELECT id, name, 'Electrician', 'electric', 200000, 3, true, 'Teknisi listrik berpengalaman', '08234567890'
FROM users WHERE email = 'vendor2@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO vendors (user_id, name, role, category, price, eta_hours, is_available, bio, phone)
SELECT id, name, 'Carpenter', 'design', 180000, 4, true, 'Pengrajin furnitur custom', '08345678901'
FROM users WHERE email = 'vendor3@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO vendors (user_id, name, role, category, price, eta_hours, is_available, bio, phone)
SELECT id, name, 'AC Technician', 'electric', 120000, 1, true, 'Teknisi AC profesional', '08456789012'
FROM users WHERE email = 'vendor4@test.com'
ON CONFLICT DO NOTHING;

INSERT INTO vendors (user_id, name, role, category, price, eta_hours, is_available, bio, phone)
SELECT id, name, 'Cleaner', 'cleaning', 80000, 1, true, 'Layanan pembersihan berkualitas', '08567890123'
FROM users WHERE email = 'vendor5@test.com'
ON CONFLICT DO NOTHING;