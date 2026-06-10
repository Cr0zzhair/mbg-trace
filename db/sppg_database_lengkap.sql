-- =====================================================
-- Database Schema + Data Dummy
-- Sistem Traceability Program Makan Bergizi Gratis (MBG)
-- Engine: MySQL / MariaDB | Charset: utf8mb4
-- =====================================================

-- ====== BAGIAN 1: SETUP DATABASE ======
CREATE DATABASE IF NOT EXISTS sppg_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE sppg_db;

-- =====================================================
-- BAGIAN 2: PEMBUATAN TABEL (SCHEMA)
-- Urutan: tabel induk dulu, baru tabel anak (yang punya FK)
-- =====================================================

-- 1. Tabel Supplier
CREATE TABLE supplier (
    id_supplier   INT AUTO_INCREMENT PRIMARY KEY,
    nama_supplier VARCHAR(100) NOT NULL,
    alamat        TEXT,
    no_telp       VARCHAR(20)
) ENGINE=InnoDB;

-- 2. Tabel Bahan_Makanan
CREATE TABLE bahan_makanan (
    id_bahan           INT AUTO_INCREMENT PRIMARY KEY,
    nama_bahan         VARCHAR(100) NOT NULL,
    tanggal_kadaluarsa DATE,
    id_supplier        INT NOT NULL,

    FOREIGN KEY (id_supplier)
        REFERENCES supplier(id_supplier)
) ENGINE=InnoDB;

-- 3. Tabel Menu
CREATE TABLE menu (
    id_menu          INT AUTO_INCREMENT PRIMARY KEY,
    nama_menu        VARCHAR(100) NOT NULL,
    tanggal_produksi DATETIME
) ENGINE=InnoDB;

-- 4. Tabel Detail_Menu (junction M:N menu <-> bahan_makanan)
CREATE TABLE detail_menu (
    id_menu      INT,
    id_bahan     INT,
    jumlah_bahan INT,

    PRIMARY KEY (id_menu, id_bahan),

    FOREIGN KEY (id_menu)
        REFERENCES menu(id_menu),

    FOREIGN KEY (id_bahan)
        REFERENCES bahan_makanan(id_bahan)
) ENGINE=InnoDB;

-- 5. Tabel Sekolah
CREATE TABLE sekolah (
    id_sekolah   INT AUTO_INCREMENT PRIMARY KEY,
    nama_sekolah VARCHAR(100) NOT NULL,
    alamat       TEXT
) ENGINE=InnoDB;

-- 6. Tabel SPPG
CREATE TABLE sppg (
    id_sppg            INT AUTO_INCREMENT PRIMARY KEY,
    tanggal_distribusi DATETIME,
    jumlah_porsi       INT,
    alamat_sppg        TEXT,

    id_menu            INT,
    id_sekolah         INT,

    FOREIGN KEY (id_menu)
        REFERENCES menu(id_menu),

    FOREIGN KEY (id_sekolah)
        REFERENCES sekolah(id_sekolah)
) ENGINE=InnoDB;

-- =====================================================
-- BAGIAN 3: DATA DUMMY (INSERT)
-- Urutan insert mengikuti urutan tabel di atas:
-- induk diisi dulu agar FK di tabel anak tidak gagal.
-- =====================================================

-- Data Supplier
INSERT INTO supplier (id_supplier, nama_supplier, alamat, no_telp) VALUES
(1, 'PT Beras Nusantara', 'Surabaya', '081111111111'),
(2, 'PT Ayam Sehat', 'Sidoarjo', '082222222222'),
(3, 'PT Sayur Makmur', 'Gresik', '083333333333'),
(4, 'PT Telur Jaya', 'Mojokerto', '084444444444'),
(5, 'PT Bumbu Nasional', 'Lamongan', '085555555555');

-- Data Bahan_Makanan
INSERT INTO bahan_makanan (id_bahan, nama_bahan, tanggal_kadaluarsa, id_supplier) VALUES
(1, 'Beras Premium', '2026-12-31', 1),
(2, 'Daging Ayam', '2026-08-31', 2),
(3, 'Wortel', '2026-07-15', 3),
(4, 'Telur Ayam', '2026-08-10', 4),
(5, 'Garam', '2028-01-01', 5),
(6, 'Bayam', '2026-07-20', 3),
(7, 'Bawang Putih', '2027-01-01', 5),
(8, 'Minyak Goreng', '2027-12-31', 5);

-- Data Menu
INSERT INTO menu (id_menu, nama_menu, tanggal_produksi) VALUES
(1, 'Nasi Ayam Goreng', '2026-06-01 05:00:00'),
(2, 'Nasi Telur Balado', '2026-06-02 05:00:00'),
(3, 'Nasi Sayur Sehat', '2026-06-03 05:00:00');

-- Data Detail_Menu
INSERT INTO detail_menu (id_menu, id_bahan, jumlah_bahan) VALUES
(1, 1, 100),
(1, 2, 50),
(1, 8, 10),

(2, 1, 100),
(2, 4, 40),
(2, 5, 5),

(3, 1, 100),
(3, 3, 30),
(3, 6, 30),
(3, 5, 5);

-- Data Sekolah
INSERT INTO sekolah (id_sekolah, nama_sekolah, alamat) VALUES
(1, 'SDN Ketintang 1', 'Surabaya'),
(2, 'SDN Ketintang 2', 'Surabaya'),
(3, 'SDN Wonokromo 1', 'Surabaya'),
(4, 'SMPN 1 Surabaya', 'Surabaya'),
(5, 'SMPN 2 Surabaya', 'Surabaya');

-- Data SPPG
INSERT INTO sppg (id_sppg, tanggal_distribusi, jumlah_porsi, alamat_sppg, id_menu, id_sekolah) VALUES
(1, '2026-06-01 07:00:00', 500, 'Dapur MBG Surabaya Barat',   1, 1),
(2, '2026-06-02 07:00:00', 450, 'Dapur MBG Surabaya Barat',   2, 2),
(3, '2026-06-03 07:00:00', 600, 'Dapur MBG Surabaya Timur',   3, 3),
(4, '2026-06-04 07:00:00', 550, 'Dapur MBG Surabaya Timur',   1, 4),
(5, '2026-06-05 07:00:00', 700, 'Dapur MBG Surabaya Selatan', 2, 5);
