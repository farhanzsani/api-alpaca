-- ================================================================
--  Alpaca API — Enable Row Level Security (RLS)
--  Jalankan script ini di Supabase SQL Editor
--  Project Settings → SQL Editor → New Query → paste → Run
-- ================================================================

-- Aktifkan RLS pada semua tabel
ALTER TABLE "users"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventories"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "waste_resources"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "business_locations" ENABLE ROW LEVEL SECURITY;

-- ================================================================
--  Blokir semua akses publik (anon / authenticated via Supabase client)
--  Semua akses dilakukan HANYA melalui backend Nuxt 3 + Prisma
--  yang menggunakan postgres user (bypass RLS secara default)
-- ================================================================

-- Hapus policy lama jika ada (aman untuk dijalankan ulang)
DROP POLICY IF EXISTS "block_public_users"              ON "users";
DROP POLICY IF EXISTS "block_public_products"           ON "products";
DROP POLICY IF EXISTS "block_public_transactions"       ON "transactions";
DROP POLICY IF EXISTS "block_public_inventories"        ON "inventories";
DROP POLICY IF EXISTS "block_public_waste_resources"    ON "waste_resources";
DROP POLICY IF EXISTS "block_public_business_locations" ON "business_locations";

-- Tidak ada policy yang dibuat = semua akses via anon/authenticated key DITOLAK
-- Backend Nuxt (postgres superuser) tetap bisa akses karena superuser bypass RLS
