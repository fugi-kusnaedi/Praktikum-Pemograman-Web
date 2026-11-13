-- =============================================================================
-- Database Aplikasi CRUD Data Mahasiswa - Tugas Modul 7
-- Nama : Fugi Kusnaedi
-- NIM  : 2406088
--
-- Cara pakai (Laragon):
--   1. Jalankan Laragon, klik "Start All" (MySQL pada port 3306).
--   2. Buka Terminal Laragon, lalu jalankan:
--        mysql -u root < "C:\path\ke\Pertemuan 7\database\schema.sql"
--      Atau buka phpMyAdmin -> tab Import -> pilih file ini -> Go.
--   3. Jalankan aplikasi: npm start -> http://localhost:3000
-- =============================================================================

CREATE DATABASE IF NOT EXISTS praktikum_web
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE praktikum_web;

CREATE TABLE IF NOT EXISTS mahasiswa (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  nim VARCHAR(20) NOT NULL UNIQUE,
  jurusan VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data awal
INSERT INTO mahasiswa (nama, nim, jurusan) VALUES
  ('Fugi Kusnaedi', '2406088', 'Teknik Informatika')
ON DUPLICATE KEY UPDATE nama = VALUES(nama), jurusan = VALUES(jurusan);

SELECT id, nama, nim, jurusan, created_at FROM mahasiswa ORDER BY id DESC;
