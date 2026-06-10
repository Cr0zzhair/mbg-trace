# MBG Traceability System — Project Guide
> **Makanan Bergizi Gratis (MBG)** — Food Traceability & Poisoning Report System  
> Stack: **Laravel** · **MySQL** (relational data) · **MongoDB** (flexible/document data)

---

## 1. Project Overview

The **MBG Traceability System** is a web application built to support the Indonesian government's free nutritious meal program (*Program Makan Bergizi Gratis*). The system tracks the entire food supply chain — from ingredient suppliers to school distribution — and enables rapid investigation when food poisoning incidents occur.

### Core Problem Being Solved

| Problem | Description |
|---|---|
| **Transparency** | No integrated traceability system to record the food journey from supplier to recipient |
| **Distribution** | Lack of accountability makes investigation slow and responsibility unclear |
| **Food Poisoning** | Difficult to trace the root cause (menu, ingredient, or supplier) when incidents occur |

### Solution

A hybrid-database web system that:
1. Records the complete supply chain from supplier → ingredient → menu → distribution → school
2. Stores flexible poisoning reports with rich investigation data
3. Enables **reverse traceability**: `Poisoning Report → Distribution → Menu → Ingredient → Supplier`

---

## 2. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | **Laravel** (PHP) | Full-featured MVC, Eloquent ORM for MySQL, official MongoDB package support |
| Relational DB | **MySQL** | Structured data with clear relationships; used for traceability queries |
| Document DB | **MongoDB** | Flexible schema for variable poisoning investigation data |
| ORM (SQL) | Eloquent (built-in Laravel) | Handles MySQL models and relationships |
| ODM (NoSQL) | `mongodb/laravel-mongodb` package | MongoDB integration via Eloquent-compatible syntax |

---

## 3. Database Design

### 3.1 Why Two Databases?

**MySQL** stores everything that has a **fixed, relational structure** and is queried frequently for traceability joins:
- Supplier, Bahan_Makanan, Menu, Detail_Menu, Sekolah, SPPG (distribution)

**MongoDB** stores `Laporan_Keracunan` (poisoning reports) because:
- Every investigation case may have a **different structure** (photos, field notes, lab results, varying victim counts)
- Documents, images, and audit logs fit a schema-less model
- Future fields can be added per case without altering a fixed table schema

---

### 3.2 MySQL Entities & Attributes

#### `supplier`
| Column | Type | Key |
|---|---|---|
| id_supplier | INT AUTO_INCREMENT | PK |
| nama_supplier | VARCHAR(100) | |
| alamat | TEXT | |
| no_telp | VARCHAR(20) | |

#### `bahan_makanan`
| Column | Type | Key |
|---|---|---|
| id_bahan | INT AUTO_INCREMENT | PK |
| nama_bahan | VARCHAR(100) | |
| tanggal_kadaluarsa | DATE | |
| id_supplier | INT | FK → supplier |

#### `menu`
| Column | Type | Key |
|---|---|---|
| id_menu | INT AUTO_INCREMENT | PK |
| nama_menu | VARCHAR(100) | |
| tanggal_produksi | DATE | |

#### `detail_menu` *(junction table: menu ↔ bahan_makanan)*
| Column | Type | Key |
|---|---|---|
| id_menu | INT | PK, FK → menu |
| id_bahan | INT | PK, FK → bahan_makanan |
| jumlah_bahan | INT | |

#### `sekolah`
| Column | Type | Key |
|---|---|---|
| id_sekolah | INT AUTO_INCREMENT | PK |
| nama_sekolah | VARCHAR(100) | |
| alamat | TEXT | |

#### `sppg` *(distribution record)*
| Column | Type | Key |
|---|---|---|
| id_sppg | INT AUTO_INCREMENT | PK |
| tanggal_distribusi | DATE | |
| jumlah_porsi | INT | |
| id_menu | INT | FK → menu |
| id_sekolah | INT | FK → sekolah |

---

### 3.3 MongoDB Collection

#### `laporan_keracunan`
```json
{
  "_id": "ObjectId",
  "id_laporan": "string (or auto _id)",
  "tanggal_laporan": "ISODate",
  "jumlah_korban": "int",
  "deskripsi": "string",
  "id_sppg": "int (reference to MySQL sppg.id_sppg)",
  "detail_investigasi": {
    "petugas": "string",
    "hasil_pemeriksaan": "string",
    "catatan_lapangan": "string"
  },
  "dokumentasi": [
    {
      "tipe": "foto | catatan | hasil_lab",
      "url": "string",
      "keterangan": "string"
    }
  ],
  "riwayat_audit": [
    {
      "aksi": "string",
      "oleh": "string",
      "waktu": "ISODate"
    }
  ]
}
```

> **Cross-database reference:** `id_sppg` in MongoDB references the `sppg.id_sppg` in MySQL. Laravel handles this join manually in the service/repository layer — there is **no native foreign key** between the two databases.

---

### 3.4 Entity Relationships (MySQL)

```
supplier ──(1:N)──► bahan_makanan
menu     ──(1:N)──► detail_menu ◄──(N:1)── bahan_makanan
menu     ──(1:N)──► sppg ◄──(N:1)── sekolah
sppg     ──(1:N)──► [laporan_keracunan] (MongoDB)
```

---

## 4. Application Features (Fungsionalitas)

| # | Feature | DB Used |
|---|---|---|
| 1 | Manage supplier data | MySQL |
| 2 | Manage food ingredients (bahan makanan) | MySQL |
| 3 | Manage menus & link ingredients to menus | MySQL |
| 4 | Record distribution history (SPPG) | MySQL |
| 5 | File poisoning reports with investigation docs | MongoDB |
| 6 | **Traceability**: trace from report back to supplier | MySQL + MongoDB |

---

## 5. Traceability Flow

```
[1] Supplier  ──supplies──►  [2] Bahan_Makanan  ──used in──►  [3] Menu
                                                                      │
                                                               distributed via
                                                                      │
                                                                      ▼
                                                            [4] SPPG (Distribution)
                                                              to Sekolah
                                                                      │
                                                          if incident occurs
                                                                      │
                                                                      ▼
                                                    [5] Laporan_Keracunan (MongoDB)
```

**Reverse Traceability (Investigation Query):**
```
Laporan_Keracunan (MongoDB)
  → get id_sppg
  → SPPG (MySQL): find distribution record
  → Menu (MySQL): which menu was distributed?
  → Detail_Menu (MySQL): what ingredients were used?
  → Bahan_Makanan (MySQL): which ingredients? expired?
  → Supplier (MySQL): who supplied them?
```

---

## 6. Laravel Implementation Guide

### 6.1 Installation & Setup

```bash
# Create new Laravel project
composer create-project laravel/laravel mbg-traceability
cd mbg-traceability

# Install MongoDB package for Laravel
composer require mongodb/laravel-mongodb
```

### 6.2 Configure `.env`

```dotenv
# MySQL
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mbg_traceability
DB_USERNAME=root
DB_PASSWORD=

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DATABASE=mbg_nosql
```

### 6.3 Configure `config/database.php`

Add a MongoDB connection alongside the default MySQL one:

```php
'connections' => [

    'mysql' => [
        'driver'    => 'mysql',
        'host'      => env('DB_HOST', '127.0.0.1'),
        'port'      => env('DB_PORT', '3306'),
        'database'  => env('DB_DATABASE', 'mbg_traceability'),
        'username'  => env('DB_USERNAME', 'root'),
        'password'  => env('DB_PASSWORD', ''),
        'charset'   => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
        'prefix'    => '',
        'strict'    => true,
        'engine'    => null,
    ],

    'mongodb' => [
        'driver'   => 'mongodb',
        'dsn'      => env('MONGODB_URI', 'mongodb://127.0.0.1:27017'),
        'database' => env('MONGODB_DATABASE', 'mbg_nosql'),
    ],

],
```

### 6.4 MySQL Migrations

```bash
php artisan make:migration create_supplier_table
php artisan make:migration create_bahan_makanan_table
php artisan make:migration create_menu_table
php artisan make:migration create_detail_menu_table
php artisan make:migration create_sekolah_table
php artisan make:migration create_sppg_table
```

Example migration for `sppg`:

```php
Schema::create('sppg', function (Blueprint $table) {
    $table->id('id_sppg');
    $table->date('tanggal_distribusi');
    $table->integer('jumlah_porsi');
    $table->foreignId('id_menu')->constrained('menu', 'id_menu');
    $table->foreignId('id_sekolah')->constrained('sekolah', 'id_sekolah');
    $table->timestamps();
});
```

Run all migrations:
```bash
php artisan migrate
```

### 6.5 MySQL Eloquent Models

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

// app/Models/BahanMakanan.php
class BahanMakanan extends Model {
    protected $table = 'bahan_makanan';
    protected $primaryKey = 'id_bahan';
    protected $fillable = ['nama_bahan', 'tanggal_kadaluarsa', 'id_supplier'];

    public function supplier() {
        return $this->belongsTo(Supplier::class, 'id_supplier');
    }

    public function detailMenu() {
        return $this->hasMany(DetailMenu::class, 'id_bahan');
    }
}

// app/Models/Sppg.php
class Sppg extends Model {
    protected $table = 'sppg';
    protected $primaryKey = 'id_sppg';
    protected $fillable = ['tanggal_distribusi', 'jumlah_porsi', 'id_menu', 'id_sekolah'];

    public function menu() {
        return $this->belongsTo(Menu::class, 'id_menu');
    }
    public function sekolah() {
        return $this->belongsTo(Sekolah::class, 'id_sekolah');
    }
}
```

### 6.6 MongoDB Model

```php
// app/Models/LaporanKeracunan.php
<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model as MongoModel;

class LaporanKeracunan extends MongoModel
{
    protected $connection = 'mongodb';
    protected $collection = 'laporan_keracunan';

    protected $fillable = [
        'tanggal_laporan',
        'jumlah_korban',
        'deskripsi',
        'id_sppg',            // Cross-DB reference to MySQL sppg.id_sppg
        'detail_investigasi',
        'dokumentasi',
        'riwayat_audit',
    ];

    protected $casts = [
        'tanggal_laporan'    => 'datetime',
        'detail_investigasi' => 'array',
        'dokumentasi'        => 'array',
        'riwayat_audit'      => 'array',
    ];
}
```

### 6.7 Traceability Service (Cross-DB Query)

This is the **core logic** — manually bridging MongoDB and MySQL:

```php
// app/Services/TraceabilityService.php
<?php

namespace App\Services;

use App\Models\LaporanKeracunan;
use App\Models\Sppg;

class TraceabilityService
{
    /**
     * Given a poisoning report ID (MongoDB), trace back to the supplier.
     */
    public function traceFromReport(string $id_laporan): array
    {
        // Step 1: Get the poisoning report from MongoDB
        $laporan = LaporanKeracunan::find($id_laporan);
        if (!$laporan) {
            return ['error' => 'Laporan not found'];
        }

        // Step 2: Get the SPPG (distribution) from MySQL using the cross-DB reference
        $sppg = Sppg::with(['menu.detailMenu.bahanMakanan.supplier', 'sekolah'])
                     ->find($laporan->id_sppg);
        if (!$sppg) {
            return ['error' => 'SPPG not found'];
        }

        // Step 3: Build the complete trace chain
        return [
            'laporan'     => $laporan,
            'distribusi'  => $sppg,
            'sekolah'     => $sppg->sekolah,
            'menu'        => $sppg->menu,
            'bahan'       => $sppg->menu->detailMenu->map(fn($d) => [
                'bahan'    => $d->bahanMakanan,
                'supplier' => $d->bahanMakanan->supplier,
                'jumlah'   => $d->jumlah_bahan,
            ]),
        ];
    }

    /**
     * Given a supplier ID, find all poisoning reports linked to their ingredients.
     */
    public function traceFromSupplier(int $id_supplier): array
    {
        // Get all sppg IDs that used ingredients from this supplier
        $sppgIds = Sppg::whereHas('menu.detailMenu.bahanMakanan', function ($q) use ($id_supplier) {
            $q->where('id_supplier', $id_supplier);
        })->pluck('id_sppg');

        // Cross to MongoDB: find all reports referencing those SPPG IDs
        $laporan = LaporanKeracunan::whereIn('id_sppg', $sppgIds->toArray())->get();

        return [
            'supplier_id' => $id_supplier,
            'affected_distributions' => $sppgIds,
            'poisoning_reports' => $laporan,
        ];
    }
}
```

### 6.8 Controllers

```php
// app/Http/Controllers/TraceabilityController.php
class TraceabilityController extends Controller
{
    public function __construct(private TraceabilityService $service) {}

    public function traceFromReport(string $id_laporan)
    {
        $result = $this->service->traceFromReport($id_laporan);
        return response()->json($result);
    }

    public function traceFromSupplier(int $id_supplier)
    {
        $result = $this->service->traceFromSupplier($id_supplier);
        return response()->json($result);
    }
}

// app/Http/Controllers/LaporanKeracunanController.php
class LaporanKeracunanController extends Controller
{
    public function store(Request $request)
    {
        $laporan = LaporanKeracunan::create([
            'tanggal_laporan'    => now(),
            'jumlah_korban'      => $request->jumlah_korban,
            'deskripsi'          => $request->deskripsi,
            'id_sppg'            => $request->id_sppg,
            'detail_investigasi' => $request->detail_investigasi ?? [],
            'dokumentasi'        => $request->dokumentasi ?? [],
            'riwayat_audit'      => [[
                'aksi'  => 'Laporan dibuat',
                'oleh'  => auth()->user()->name ?? 'system',
                'waktu' => now(),
            ]],
        ]);

        return response()->json($laporan, 201);
    }
}
```

### 6.9 Routes

```php
// routes/api.php

// Supplier (MySQL)
Route::apiResource('suppliers', SupplierController::class);

// Bahan Makanan (MySQL)
Route::apiResource('bahan-makanan', BahanMakananController::class);

// Menu & Detail Menu (MySQL)
Route::apiResource('menu', MenuController::class);
Route::post('menu/{id}/bahan', [DetailMenuController::class, 'store']);

// Sekolah (MySQL)
Route::apiResource('sekolah', SekolahController::class);

// SPPG / Distribusi (MySQL)
Route::apiResource('sppg', SppgController::class);

// Laporan Keracunan (MongoDB)
Route::apiResource('laporan-keracunan', LaporanKeracunanController::class);

// Traceability (Cross-DB)
Route::get('trace/from-report/{id_laporan}', [TraceabilityController::class, 'traceFromReport']);
Route::get('trace/from-supplier/{id_supplier}', [TraceabilityController::class, 'traceFromSupplier']);
```

---

## 7. Project Folder Structure

```
mbg-traceability/
├── app/
│   ├── Models/
│   │   ├── Supplier.php          ← MySQL
│   │   ├── BahanMakanan.php      ← MySQL
│   │   ├── Menu.php              ← MySQL
│   │   ├── DetailMenu.php        ← MySQL
│   │   ├── Sekolah.php           ← MySQL
│   │   ├── Sppg.php              ← MySQL
│   │   └── LaporanKeracunan.php  ← MongoDB
│   ├── Http/Controllers/
│   │   ├── SupplierController.php
│   │   ├── BahanMakananController.php
│   │   ├── MenuController.php
│   │   ├── DetailMenuController.php
│   │   ├── SekolahController.php
│   │   ├── SppgController.php
│   │   ├── LaporanKeracunanController.php
│   │   └── TraceabilityController.php
│   └── Services/
│       └── TraceabilityService.php   ← Core cross-DB bridge logic
├── database/
│   └── migrations/
│       ├── create_supplier_table.php
│       ├── create_bahan_makanan_table.php
│       ├── create_menu_table.php
│       ├── create_detail_menu_table.php
│       ├── create_sekolah_table.php
│       └── create_sppg_table.php
├── routes/
│   └── api.php
├── config/
│   └── database.php              ← Both MySQL and MongoDB connections
└── .env                          ← DB_CONNECTION, MONGODB_URI, etc.
```

---

## 8. Key Implementation Rules

1. **MySQL models** extend `Illuminate\Database\Eloquent\Model` (default).
2. **MongoDB model** extends `MongoDB\Laravel\Eloquent\Model` and sets `$connection = 'mongodb'`.
3. **Cross-DB joins do NOT happen in SQL** — they are resolved manually in `TraceabilityService` by fetching from one DB and using the result to query the other.
4. `id_sppg` in MongoDB is stored as a plain integer (not an ObjectId) so it matches MySQL's `sppg.id_sppg`.
5. All poisoning investigation data (photos, notes, lab results) should go into the `dokumentasi` array in MongoDB — never in MySQL.
6. The `riwayat_audit` array in MongoDB should be appended (not overwritten) whenever a report is modified.

---

## 9. Setup Checklist

- [ ] Install PHP 8.1+, Composer, MySQL, MongoDB
- [ ] Run `composer create-project laravel/laravel mbg-traceability`
- [ ] Run `composer require mongodb/laravel-mongodb`
- [ ] Configure `.env` with both `DB_*` (MySQL) and `MONGODB_*` variables
- [ ] Add MongoDB connection block to `config/database.php`
- [ ] Create and run all MySQL migrations
- [ ] Create all Eloquent models (MySQL + MongoDB)
- [ ] Implement `TraceabilityService` with cross-DB query logic
- [ ] Register all routes in `routes/api.php`
- [ ] Test traceability endpoint: `GET /api/trace/from-report/{id}`

---

*Project by Kelompok 2 — IDE SBD*  
*Program Makan Bergizi Gratis — Traceability System*
