<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DetailMenuController extends Controller
{
    public function store(Request $request, $id_menu)
    {
        $data = $request->validate([
            'id_bahan'     => 'required|exists:bahan_makanan,id_bahan',
            'jumlah_bahan' => 'required|numeric',
        ]);

        $existing = DB::table('detail_menu')
            ->where('id_menu', $id_menu)
            ->where('id_bahan', $data['id_bahan'])
            ->first();

        if ($existing) {
            DB::table('detail_menu')
                ->where('id_menu', $id_menu)
                ->where('id_bahan', $data['id_bahan'])
                ->update(['jumlah_bahan' => $data['jumlah_bahan']]);

            $detail = DB::table('detail_menu')
                ->where('id_menu', $id_menu)
                ->where('id_bahan', $data['id_bahan'])
                ->first();

            return response()->json($detail, 200);
        }

        DB::table('detail_menu')->insert([
            'id_menu'      => $id_menu,
            'id_bahan'     => $data['id_bahan'],
            'jumlah_bahan' => $data['jumlah_bahan'],
        ]);

        $detail = DB::table('detail_menu')
            ->where('id_menu', $id_menu)
            ->where('id_bahan', $data['id_bahan'])
            ->first();

        return response()->json($detail, 201);
    }
}
