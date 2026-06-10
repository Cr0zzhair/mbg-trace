# 📋 TODO List & Panduan untuk Tim (Izzar, Dapa, Nasar)

Proyek Laravel, koneksi MySQL, koneksi MongoDB, dan database migrations sudah disiapkan. Berikut adalah rincian tugas untuk masing-masing anggota dan panduan cara mengerjakannya.

---

## 👨‍💻 Izzar (MySQL Models - Part 1)

**Tugas:** Membuat model Eloquent untuk tabel `supplier`, `bahan_makanan`, dan `menu`.

**Langkah-langkah:**
1. Jalankan perintah di terminal untuk membuat file model (jangan buat migration lagi, karena sudah ada):
   ```bash
   php artisan make:model Supplier
   php artisan make:model BahanMakanan
   php artisan make:model Menu
   ```
2. Buka file model yang baru terbuat di `app/Models/` dan tambahkan konfigurasi.

**Panduan Kode:**
Semua model MySQL harus `extend Illuminate\Database\Eloquent\Model`.

* **Supplier** (`app/Models/Supplier.php`)
  - Set `$table = 'supplier'`, `$primaryKey = 'id_supplier'`, dan `$fillable = ['nama_supplier', 'alamat', 'no_telp']`.
  - Buat relasi `hasMany` ke `BahanMakanan`.

* **BahanMakanan** (`app/Models/BahanMakanan.php`)
  - Set `$table = 'bahan_makanan'`, `$primaryKey = 'id_bahan'`, dan `$fillable = ['nama_bahan', 'tanggal_kadaluarsa', 'id_supplier']`.
  - Buat relasi `belongsTo` ke `Supplier` dan `hasMany` ke `DetailMenu`.

* **Menu** (`app/Models/Menu.php`)
  - Set `$table = 'menu'`, `$primaryKey = 'id_menu'`, dan `$fillable = ['nama_menu', 'tanggal_produksi']`.
  - Buat relasi `hasMany` ke `DetailMenu` dan `Sppg`.

---

## 👨‍💻 Dapa (MySQL Models Part 2 & MongoDB Model)

**Tugas:** Membuat model Eloquent untuk tabel `detail_menu`, `sekolah`, `sppg`, dan `laporan_keracunan` (MongoDB).

**Langkah-langkah:**
1. Jalankan perintah di terminal:
   ```bash
   php artisan make:model DetailMenu
   php artisan make:model Sekolah
   php artisan make:model Sppg
   php artisan make:model LaporanKeracunan
   ```
2. Modifikasi file di `app/Models/`.

**Panduan Kode (MySQL):**
* **DetailMenu** (`app/Models/DetailMenu.php`)
  - Set `$table = 'detail_menu'`, `$fillable = ['id_menu', 'id_bahan', 'jumlah_bahan']`.
  - Tambahkan `public $incrementing = false;` (karena primary key-nya gabungan `id_menu` & `id_bahan`).
  - Buat relasi `belongsTo` ke `Menu` dan `BahanMakanan`.

* **Sekolah** (`app/Models/Sekolah.php`)
  - Set `$table = 'sekolah'`, `$primaryKey = 'id_sekolah'`, `$fillable = ['nama_sekolah', 'alamat']`.

* **Sppg** (`app/Models/Sppg.php`)
  - Set `$table = 'sppg'`, `$primaryKey = 'id_sppg'`, `$fillable = ['tanggal_distribusi', 'jumlah_porsi', 'alamat_sppg', 'id_menu', 'id_sekolah']`.
  - Buat relasi `belongsTo` ke `Menu` dan `Sekolah`.

**Panduan Kode (MongoDB):**
* **LaporanKeracunan** (`app/Models/LaporanKeracunan.php`)
  - **Sangat Penting:** Ganti `use Illuminate\Database\Eloquent\Model;` menjadi `use MongoDB\Laravel\Eloquent\Model;`.
  - Set koneksi: `protected $connection = 'mongodb';` dan `protected $collection = 'laporan_keracunan';`.
  - Set `$fillable = ['tanggal_laporan', 'jumlah_korban', 'deskripsi', 'id_sppg', 'detail_investigasi', 'dokumentasi', 'riwayat_audit']`.
  - Di dalam `$casts`, pastikan `id_sppg` di-cast ke `'integer'`, karena ini yang akan dipakai join manual ke MySQL.

---

## 👨‍💻 Nasar (Controllers, Services & API Endpoints)

**Tugas:** Membuat semua API Endpoint CRUD dan logika Traceability (Cross-DB).

**Langkah-langkah:**
1. **Buat Controllers:**
   Gunakan terminal untuk men-generate controller CRUD:
   ```bash
   php artisan make:controller SupplierController --api
   php artisan make:controller BahanMakananController --api
   php artisan make:controller MenuController --api
   php artisan make:controller SekolahController --api
   php artisan make:controller SppgController --api
   php artisan make:controller LaporanKeracunanController --api
   php artisan make:controller TraceabilityController
   ```

2. **Isi Logika CRUD di Controller:**
   - Gunakan model yang dibuat Izzar dan Dapa untuk operasi CRUD (`index`, `store`, `show`, `update`, `destroy`).
   - Khusus `LaporanKeracunanController` pada fungsi `update`, pastikan `riwayat_audit` **ditambahkan (append)**, bukan ditimpa (overwrite).

3. **Buat Traceability Service:**
   - Buat file `app/Services/TraceabilityService.php` secara manual.
   - Buat fungsi `traceFromReport($id)`: Ambil LaporanKeracunan (MongoDB) -> dapatkan `id_sppg` (integer) -> cari SPPG di MySQL -> cari Menu -> cari Bahan Makanan -> cari Supplier.
   - Buat fungsi `traceFromSupplier($id)`: Cari semua SPPG yang menggunakan bahan dari supplier tersebut (MySQL) -> dapatkan kumpulan `id_sppg` -> cari LaporanKeracunan di MongoDB dengan `whereIn('id_sppg', [...])`.

4. **Daftarkan Routes API:**
   - Buka `routes/api.php` dan hapus komentar yang disediakan Sakti.
   - Aktifkan `Route::apiResource` untuk masing-masing entitas (contoh: `Route::apiResource('suppliers', SupplierController::class);`).
   - Tambahkan route custom untuk traceability (contoh: `Route::get('trace/report/{id}', [TraceabilityController::class, 'traceFromReport']);`).

---

**Tips Umum untuk Semua:**
- Setelah Izzar dan Dapa selesai membuat Model, kalian bisa menjalankan seeder: `php artisan make:seeder <NamaSeeder>` untuk mengisi data dummy (bisa mencontek dari `sppg_database_lengkap.sql` atau testing via Postman).
- Testing hasil akhir menggunakan file **Postman Collection** (`MBG_Traceability.postman_collection.json`) yang sudah disediakan Sakti di folder root proyek.
