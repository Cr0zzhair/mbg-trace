<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel SPPG — catatan distribusi makanan ke sekolah.
     * Includes alamat_sppg (lokasi dapur) as per the original SQL schema.
     */
    public function up(): void
    {
        Schema::create('sppg', function (Blueprint $table) {
            $table->id('id_sppg');
            $table->dateTime('tanggal_distribusi')->nullable();
            $table->integer('jumlah_porsi');
            $table->text('alamat_sppg')->nullable();
            $table->unsignedBigInteger('id_menu');
            $table->unsignedBigInteger('id_sekolah');
            $table->timestamps();

            $table->foreign('id_menu')
                  ->references('id_menu')
                  ->on('menu')
                  ->onDelete('cascade');

            $table->foreign('id_sekolah')
                  ->references('id_sekolah')
                  ->on('sekolah')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sppg');
    }
};
