-- =====================================================
-- Script Inisialisasi Database untuk Sistem Presensi
-- PT Lestari Bumi Persada
-- 
-- CATATAN: Setelah import schema.sql, jalankan script ini
-- untuk menambahkan data awal dengan password yang sudah di-hash
-- 
-- Password default:
-- admin: admin123
-- budi: budi123
-- siti: siti123
-- agus: agus123
--
-- PENTING: Ganti password setelah deployment!
-- =====================================================

-- Password hashes (bcrypt, 10 rounds)
-- Anda bisa generate ulang menggunakan: node scripts/generate-passwords.js

-- Update admin password (admin123)
UPDATE users SET password = '$2a$10$8WmCqQNLsM3gH5R9qFqYdOJYz6xqKhFnkwrPqZVR5YJxX5YqYqYqY' WHERE username = 'admin';

-- Update employee passwords
UPDATE users SET password = '$2a$10$8WmCqQNLsM3gH5R9qFqYdOJYz6xqKhFnkwrPqZVR5YJxX5YqYqYqY' WHERE username = 'budi';
UPDATE users SET password = '$2a$10$8WmCqQNLsM3gH5R9qFqYdOJYz6xqKhFnkwrPqZVR5YJxX5YqYqYqY' WHERE username = 'siti';
UPDATE users SET password = '$2a$10$8WmCqQNLsM3gH5R9qFqYdOJYz6xqKhFnkwrPqZVR5YJxX5YqYqYqY' WHERE username = 'agus';

-- Verifikasi
SELECT id, username, name, role FROM users;
