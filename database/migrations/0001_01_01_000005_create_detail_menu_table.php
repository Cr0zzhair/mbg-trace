<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabel Detail Menu — junction table M:N antara menu dan bahan_makanan.
     * Composite primary key: (id_menu, id_bahan).
     */
    public function up(): void
    {
        Schema::create('detail_menu', function (Blueprint $table) {
            $table->unsignedBigInteger('id_menu');
            $table->unsignedBigInteger('id_bahan');
            $table->integer('jumlah_bahan');
            $table->timestamps();

            $table->primary(['id_menu', 'id_bahan']);

            $table->foreign('id_menu')
                  ->references('id_menu')
                  ->on('menu')
                  ->onDelete('cascade');

            $table->foreign('id_bahan')
                  ->references('id_bahan')
                  ->on('bahan_makanan')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detail_menu');
    }
};
