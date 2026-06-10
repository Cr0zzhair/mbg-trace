<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — MBG Traceability System
|--------------------------------------------------------------------------
|
| Semua route di-prefix otomatis dengan /api oleh Laravel.
| Contoh: Route::get('suppliers', ...) → GET /api/suppliers
|
| ── TUGAS NASAR ──────────────────────────────────────────────────────────
|
| Tambahkan route berikut:
|
| // Supplier
| Route::apiResource('suppliers', SupplierController::class);
|
| // Bahan Makanan
| Route::apiResource('bahan-makanan', BahanMakananController::class);
|
| // Menu
| Route::apiResource('menu', MenuController::class);
| Route::post('menu/{id}/bahan', [DetailMenuController::class, 'store']);
|
| // Sekolah
| Route::apiResource('sekolah', SekolahController::class);
|
| // SPPG (Distribusi)
| Route::apiResource('sppg', SppgController::class);
|
| // Laporan Keracunan (MongoDB)
| Route::apiResource('laporan-keracunan', LaporanKeracunanController::class);
|
| // Traceability (Cross-DB)
| Route::get('trace/report/{id}',   [TraceabilityController::class, 'traceFromReport']);
| Route::get('trace/supplier/{id}', [TraceabilityController::class, 'traceFromSupplier']);
|
*/
