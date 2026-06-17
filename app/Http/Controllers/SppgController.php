<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SppgController extends Controller
{
    public function index()
    {
        $items = DB::table('sppg')->get();

        $menuIds = $items->pluck('id_menu')->unique();
        $sekolahIds = $items->pluck('id_sekolah')->unique();

        $menus = DB::table('menu')
            ->whereIn('id_menu', $menuIds)->get()->keyBy('id_menu');
        $sekolahs = DB::table('sekolah')
            ->whereIn('id_sekolah', $sekolahIds)->get()->keyBy('id_sekolah');

        foreach ($items as $item) {
            $item->menu = $menus->get($item->id_menu);
            $item->sekolah = $sekolahs->get($item->id_sekolah);
        }

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'tanggal_distribusi' => 'nullable|date',
            'jumlah_porsi'       => 'nullable|integer',
            'alamat_sppg'        => 'nullable|string',
            'id_menu'            => 'required|exists:menu,id_menu',
            'id_sekolah'         => 'required|exists:sekolah,id_sekolah',
        ]);

        $id = DB::table('sppg')->insertGetId($data, 'id_sppg');

        return response()->json(
            DB::table('sppg')->where('id_sppg', $id)->first(),
            201
        );
    }

    public function show($id)
    {
        $sppg = DB::table('sppg')->where('id_sppg', $id)->first();
        if (!$sppg) {
            return response()->json(['message' => 'Data SPPG tidak ditemukan'], 404);
        }

        $sppg->menu = DB::table('menu')
            ->where('id_menu', $sppg->id_menu)->first();
        $sppg->sekolah = DB::table('sekolah')
            ->where('id_sekolah', $sppg->id_sekolah)->first();

        return response()->json($sppg);
    }

    public function update(Request $request, $id)
    {
        $sppg = DB::table('sppg')->where('id_sppg', $id)->first();
        if (!$sppg) {
            return response()->json(['message' => 'Data SPPG tidak ditemukan'], 404);
        }

        $data = $request->validate([
            'tanggal_distribusi' => 'nullable|date',
            'jumlah_porsi'       => 'nullable|integer',
            'alamat_sppg'        => 'nullable|string',
            'id_menu'            => 'sometimes|required|exists:menu,id_menu',
            'id_sekolah'         => 'sometimes|required|exists:sekolah,id_sekolah',
        ]);

        DB::table('sppg')->where('id_sppg', $id)->update($data);

        return response()->json(
            DB::table('sppg')->where('id_sppg', $id)->first()
        );
    }

    public function destroy($id)
    {
        $deleted = DB::table('sppg')->where('id_sppg', $id)->delete();
        if (!$deleted) {
            return response()->json(['message' => 'Data SPPG tidak ditemukan'], 404);
        }

        return response()->json(['message' => 'Data SPPG dihapus']);
    }
}
