<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel Bahan Makanan — bahan/ingredient yang disuplai oleh supplier.
     */
    public function up(): void
    {
        Schema::create('bahan_makanan', function (Blueprint $table) {
            $table->id('id_bahan');
            $table->string('nama_bahan', 100);
            $table->date('tanggal_kadaluarsa')->nullable();
            $table->unsignedBigInteger('id_supplier');
            $table->timestamps();

            $table->foreign('id_supplier')
                  ->references('id_supplier')
                  ->on('supplier')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bahan_makanan');
    }
};
