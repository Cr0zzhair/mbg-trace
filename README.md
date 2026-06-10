# MBG Traceability System

> **Makanan Bergizi Gratis** — Sistem Traceability Rantai Pasok Makanan & Investigasi Keracunan  
> Stack: **Laravel 11** · **MySQL** · **MongoDB**

---

## 📋 Deskripsi

Sistem web untuk melacak rantai pasok makanan program Makan Bergizi Gratis (MBG) Indonesia — dari supplier bahan makanan hingga distribusi ke sekolah. Sistem ini juga menangani pelaporan dan investigasi keracunan makanan dengan **reverse traceability**.

### Arsitektur Database

| Database | Digunakan Untuk |
|----------|----------------|
| **MySQL** (`sppg_db`) | Data relasional: Supplier, Bahan Makanan, Menu, Sekolah, SPPG (distribusi) |
| **MongoDB** (`mbg_nosql`) | Laporan Keracunan — dokumen fleksibel dengan investigasi, foto, audit trail |

---

## 👥 Pembagian Tugas

| Anggota | Tugas | Status |
|---------|-------|--------|
| **Sakti** | Setup project Laravel, Koneksi MySQL, Koneksi MongoDB | ✅ Selesai |
| **Izzar** | Model Supplier, Model Bahan_Makanan, Model Menu | ⬜ |
| **Dapa** | Model Detail_Menu, Model Sekolah, Model SPPG, Model Laporan_Keracunan | ⬜ |
| **Nasar** | Endpoint Supplier, Bahan_Makanan, Menu, Sekolah, SPPG, Laporan_Keracunan, Traceability | ⬜ |

---

## 🔧 Prerequisites

Pastikan sudah terinstall:

- **PHP** ≥ 8.2 dengan extensions:
  - `pdo_mysql`
  - `mongodb` (PHP extension, bukan hanya Composer package)
  - `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`
- **Composer** ≥ 2.x
- **MySQL** ≥ 8.0 (atau MariaDB ≥ 10.6)
- **MongoDB** ≥ 6.0

### Install PHP MongoDB Extension

```bash
# Windows (via PECL / download DLL)
# Download dari https://pecl.php.net/package/mongodb
# Tambahkan ke php.ini:
extension=mongodb

# Linux/macOS
pecl install mongodb
echo "extension=mongodb.so" >> $(php --ini | grep "php.ini" | head -1 | awk '{print $NF}')/php.ini
```

Verifikasi:
```bash
php -m | grep mongodb
```

---

## 🚀 Setup & Instalasi

### 1. Clone & Install Dependencies

```bash
git clone <repo-url> mbg-trace
cd mbg-trace
composer install
```

### 2. Konfigurasi Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` sesuai konfigurasi lokal:

```dotenv
# ─── MySQL ──────────────────────────────────────────
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sppg_db
DB_USERNAME=root
DB_PASSWORD=

# ─── MongoDB ────────────────────────────────────────
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DATABASE=mbg_nosql
```

### 3. Setup Database MySQL

```bash
# Buat database MySQL terlebih dahulu
mysql -u root -e "CREATE DATABASE IF NOT EXISTS sppg_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Jalankan migration
php artisan migrate
```

> **Note:** MongoDB collection (`laporan_keracunan`) dibuat otomatis saat pertama kali insert. Tidak perlu create collection manual.

### 4. Jalankan Server

```bash
php artisan serve
# Server berjalan di http://localhost:8000
```

---

## 🗄️ Database Schema

### MySQL Tables (6 tabel)

Migration sudah tersedia di `database/migrations/`:

| Tabel | Deskripsi | FK |
|-------|-----------|-----|
| `supplier` | Penyedia bahan makanan | — |
| `bahan_makanan` | Ingredient/bahan | → supplier |
| `menu` | Daftar menu makanan | — |
| `sekolah` | Sekolah penerima | — |
| `detail_menu` | Junction menu ↔ bahan (M:N) | → menu, → bahan_makanan |
| `sppg` | Catatan distribusi | → menu, → sekolah |

### MongoDB Collection

| Collection | Deskripsi |
|------------|-----------|
| `laporan_keracunan` | Laporan keracunan makanan — `id_sppg` (int) mereferensikan MySQL |

---

## 📂 Struktur Proyek

```
mbg-trace/
├── app/
│   ├── Http/Controllers/
│   │   └── Controller.php              ← Base controller
│   ├── Models/                          ← IZZAR & DAPA: tambahkan model di sini
│   ├── Providers/
│   │   └── AppServiceProvider.php
│   └── Services/                        ← NASAR: TraceabilityService di sini
├── bootstrap/
│   ├── app.php                          ← App bootstrap (routing sudah dikonfigurasi)
│   └── providers.php
├── config/
│   ├── app.php                          ← Timezone: Asia/Jakarta
│   └── database.php                     ← ✅ MySQL + MongoDB connections
├── database/
│   ├── migrations/                      ← ✅ 6 migration files (sudah siap)
│   └── seeders/
│       └── DatabaseSeeder.php           ← Tambahkan seeder sesuai kebutuhan
├── public/
│   └── index.php
├── routes/
│   ├── api.php                          ← NASAR: tambahkan API routes di sini
│   ├── web.php
│   └── console.php
├── storage/                             ← Auto-generated runtime files
├── .env.example                         ← ✅ Template environment
├── .gitignore
├── composer.json                        ← ✅ Laravel 11 + mongodb/laravel-mongodb
├── sppg_database_lengkap.sql            ← Raw SQL alternatif (backup)
├── MBG_Traceability.postman_collection.json ← Postman collection untuk testing
└── README.md
```

---

## 📋 Panduan Per Anggota

### Izzar — Models (MySQL)

Buat file di `app/Models/`. Setiap model MySQL extend `Illuminate\Database\Eloquent\Model`:

```php
// app/Models/Supplier.php
class Supplier extends Model {
    protected $table = 'supplier';
    protected $primaryKey = 'id_supplier';
    protected $fillable = ['nama_supplier', 'alamat', 'no_telp'];

    public function bahanMakanan() {
        return $this->hasMany(BahanMakanan::class, 'id_supplier');
    }
}
```

**Model yang perlu dibuat:**
- `Supplier.php` — hasMany → BahanMakanan
- `BahanMakanan.php` — belongsTo → Supplier, hasMany → DetailMenu
- `Menu.php` — hasMany → DetailMenu, hasMany → Sppg

### Dapa — Models (MySQL + MongoDB)

**MySQL models** (sama seperti Izzar, extend `Model`):
- `DetailMenu.php` — composite PK (`id_menu`, `id_bahan`), set `$incrementing = false`
- `Sekolah.php` — hasMany → Sppg
- `Sppg.php` — belongsTo → Menu, belongsTo → Sekolah

**MongoDB model** (extend `MongoDB\Laravel\Eloquent\Model`):
```php
// app/Models/LaporanKeracunan.php
use MongoDB\Laravel\Eloquent\Model as MongoModel;

class LaporanKeracunan extends MongoModel {
    protected $connection = 'mongodb';         // WAJIB
    protected $collection = 'laporan_keracunan';
    protected $fillable = ['tanggal_laporan', 'jumlah_korban', 'deskripsi',
                           'id_sppg', 'detail_investigasi', 'dokumentasi', 'riwayat_audit'];
    protected $casts = [
        'id_sppg' => 'integer',                // Plain int, bukan ObjectId
        'detail_investigasi' => 'array',
        'dokumentasi' => 'array',
        'riwayat_audit' => 'array',
    ];
}
```

### Nasar — Controllers & Routes

1. Buat controller di `app/Http/Controllers/` untuk setiap entity (CRUD)
2. Buat `app/Services/TraceabilityService.php` untuk cross-DB query
3. Daftarkan semua route di `routes/api.php` (lihat komentar di file tersebut)

**Endpoint yang perlu dibuat:**

| Method | URI | Deskripsi |
|--------|-----|-----------|
| `GET/POST` | `/api/suppliers` | List & create supplier |
| `GET/PUT/DELETE` | `/api/suppliers/{id}` | Show, update, delete supplier |
| `GET/POST` | `/api/bahan-makanan` | List & create bahan makanan |
| `GET/PUT/DELETE` | `/api/bahan-makanan/{id}` | Show, update, delete bahan |
| `GET/POST` | `/api/menu` | List & create menu |
| `GET/PUT/DELETE` | `/api/menu/{id}` | Show, update, delete menu |
| `POST` | `/api/menu/{id}/bahan` | Tambah bahan ke menu |
| `GET/POST` | `/api/sekolah` | List & create sekolah |
| `GET/PUT/DELETE` | `/api/sekolah/{id}` | Show, update, delete sekolah |
| `GET/POST` | `/api/sppg` | List & create distribusi |
| `GET/PUT/DELETE` | `/api/sppg/{id}` | Show, update, delete distribusi |
| `GET/POST` | `/api/laporan-keracunan` | List & create laporan (MongoDB) |
| `GET/PUT/DELETE` | `/api/laporan-keracunan/{id}` | Show, update, delete laporan |
| `GET` | `/api/trace/report/{id}` | Trace: laporan → supplier |
| `GET` | `/api/trace/supplier/{id}` | Trace: supplier → laporan |

---

## 🔍 Alur Traceability

```
Forward:  Supplier → Bahan Makanan → Menu → SPPG → Sekolah
Reverse:  Laporan (MongoDB) → id_sppg → SPPG (MySQL) → Menu → Bahan → Supplier
```

Cross-DB join **tidak dilakukan di SQL** — resolusi manual di `TraceabilityService`.

---

## ⚠️ Aturan Penting

1. **MySQL models** extend `Illuminate\Database\Eloquent\Model`
2. **MongoDB model** extend `MongoDB\Laravel\Eloquent\Model` + set `$connection = 'mongodb'`
3. `id_sppg` di MongoDB = **integer biasa** (bukan ObjectId)
4. Data investigasi (foto, catatan, hasil lab) → **MongoDB saja**, bukan MySQL
5. `riwayat_audit` harus di-**append** (bukan overwrite) setiap update laporan

---

## 📮 Testing dengan Postman

Import file `MBG_Traceability.postman_collection.json` ke Postman untuk testing semua endpoint.

---

## 👥 Tim

**Kelompok 2 — IDE SBD**  
*Program Makan Bergizi Gratis — Traceability System*
