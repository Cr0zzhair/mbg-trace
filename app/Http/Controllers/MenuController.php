<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MenuController extends Controller
{
    public function index()
    {
        return response()->json(DB::table('menu')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_menu'        => 'required|string|max:100',
            'tanggal_produksi' => 'nullable|date',
        ]);

        $id = DB::table('menu')->insertGetId($data, 'id_menu');

        return response()->json(
            DB::table('menu')->where('id_menu', $id)->first(),
            201
        );
    }

    public function show($id)
    {
        $menu = DB::table('menu')->where('id_menu', $id)->first();
        if (!$menu) {
            return response()->json(['message' => 'Menu tidak ditemukan'], 404);
        }

        $menu->bahan_makanan = DB::table('detail_menu')
            ->join('bahan_makanan', 'detail_menu.id_bahan', '=', 'bahan_makanan.id_bahan')
            ->where('detail_menu.id_menu', $id)
            ->select('bahan_makanan.*', 'detail_menu.jumlah_bahan')
            ->get();

        return response()->json($menu);
    }

    public function update(Request $request, $id)
    {
        $menu = DB::table('menu')->where('id_menu', $id)->first();
        if (!$menu) {
            return response()->json(['message' => 'Menu tidak ditemukan'], 404);
        }

        $data = $request->validate([
            'nama_menu'        => 'sometimes|required|string|max:100',
            'tanggal_produksi' => 'nullable|date',
        ]);

        DB::table('menu')->where('id_menu', $id)->update($data);

        return response()->json(
            DB::table('menu')->where('id_menu', $id)->first()
        );
    }

    public function destroy($id)
    {
        $deleted = DB::table('menu')->where('id_menu', $id)->delete();
        if (!$deleted) {
            return response()->json(['message' => 'Menu tidak ditemukan'], 404);
        }

        return response()->json(['message' => 'Menu dihapus']);
    }
}
