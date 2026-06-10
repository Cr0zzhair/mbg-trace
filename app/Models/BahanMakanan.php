<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BahanMakanan extends Model
{
    protected $table = 'bahan_makanan';

    protected $primaryKey = 'id_bahan';

    public $timestamps = false;

    protected $fillable = [
        'nama_bahan',
        'tanggal_kadaluarsa',
        'id_supplier'
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'id_supplier');
    }

    public function menu()
    {
        return $this->belongsToMany(
            Menu::class,
            'detail_menu',
            'id_bahan',
            'id_menu'
        )->withPivot('jumlah_bahan');
    }
}