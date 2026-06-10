<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $table = 'menu';

    protected $primaryKey = 'id_menu';

    public $timestamps = false;

    protected $fillable = [
        'nama_menu',
        'tanggal_produksi'
    ];

    public function bahanMakanan()
    {
        return $this->belongsToMany(
            BahanMakanan::class,
            'detail_menu',
            'id_menu',
            'id_bahan'
        )->withPivot('jumlah_bahan');
    }

    public function sppg()
    {
        return $this->hasMany(Sppg::class, 'id_menu');
    }
}