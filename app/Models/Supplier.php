<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $table = 'supplier';

    protected $primaryKey = 'id_supplier';

    public $timestamps = false;

    protected $fillable = [
        'nama_supplier',
        'alamat',
        'no_telp'
    ];

    public function bahanMakanan()
    {
        return $this->hasMany(BahanMakanan::class, 'id_supplier');
    }
}