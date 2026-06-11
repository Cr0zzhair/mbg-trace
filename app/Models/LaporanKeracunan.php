<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model as MongoModel;

class LaporanKeracunan extends MongoModel 
{
    protected $connection = 'mongodb';        
    protected $collection = 'laporan_keracunan';
    
    protected $primaryKey = 'id_laporan'; 

    protected $fillable = [
        'id_laporan',
        'tanggal_laporan', 
        'jumlah_korban', 
        'deskripsi',
        'id_sekolah'
    ];
    
    protected $casts = [
        'tanggal_laporan' => 'date',
        'jumlah_korban' => 'integer',
        'id_sekolah' => 'integer',
    ];
}