<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sppg extends Model
{
    protected $table = 'sppg';

    protected $primaryKey = 'id_sppg';

    protected $fillable = [
        'tanggal_distribusi',
        'jumlah_porsi',
        'id_menu',
        'id_sekolah'
    ];

    public function menu()
    {
        return $this->belongsTo(Menu::class, 'id_menu');
    }

    public function sekolah()
    {
        return $this->belongsTo(Sekolah::class, 'id_sekolah');
    }

    public function laporanKeracunan()
    {
        return $this->hasMany(LaporanKeracunan::class, 'id_sppg');
    }
}