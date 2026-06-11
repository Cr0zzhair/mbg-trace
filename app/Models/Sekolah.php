<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sekolah extends Model
{
    protected $table = 'sekolah';

    protected $primaryKey = 'id_sekolah';

    protected $fillable = [
        'nama_sekolah',
        'alamat'
    ];

 
    public function sppg()
    {
        return $this->hasMany(Sppg::class, 'id_sekolah');
    }

    public function laporanKeracunan()
    {
        return $this->hasMany(LaporanKeracunan::class, 'id_sekolah');
    }
}