<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetailMenu extends Model
{
    protected $table = 'detail_menu';

    public $incrementing = false;

    protected $fillable = [
        'id_menu',
        'id_bahan',
        'jumlah_bahan'
    ];

    public function menu()
    {
        return $this->belongsTo(Menu::class, 'id_menu');
    }

    public function bahanMakanan()
    {
        return $this->belongsTo(BahanMakanan::class, 'id_bahan');
    }
}