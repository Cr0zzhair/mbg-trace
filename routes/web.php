<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'application' => 'MBG Traceability System',
        'description' => 'Sistem Traceability Program Makan Bergizi Gratis',
        'version'     => '1.0.0',
        'api_docs'    => url('/api'),
    ]);
});
