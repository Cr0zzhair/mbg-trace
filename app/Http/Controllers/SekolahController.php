<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SekolahController extends Controller
{
    public function index()
    {
        return response()->json(DB::table('sekolah')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_sekolah' => 'required|string|max:100',
            'alamat'       => 'nullable|string',
        ]);

        $id = DB::table('sekolah')->insertGetId($data, 'id_sekolah');

        return response()->json(
            DB::table('sekolah')->where('id_sekolah', $id)->first(),
            201
        );
    }

    public function show($id)
    {
        $sekolah = DB::table('sekolah')->where('id_sekolah', $id)->first();
        if (!$sekolah) {
            return response()->json(['message' => 'Sekolah tidak ditemukan'], 404);
        }

        $sekolah->sppg = DB::table('sppg')
            ->where('id_sekolah', $id)->get();

        return response()->json($sekolah);
    }

    public function update(Request $request, $id)
    {
        $sekolah = DB::table('sekolah')->where('id_sekolah', $id)->first();
        if (!$sekolah) {
            return response()->json(['message' => 'Sekolah tidak ditemukan'], 404);
        }

        $data = $request->validate([
            'nama_sekolah' => 'sometimes|required|string|max:100',
            'alamat'       => 'nullable|string',
        ]);

        DB::table('sekolah')->where('id_sekolah', $id)->update($data);

        return response()->json(
            DB::table('sekolah')->where('id_sekolah', $id)->first()
        );
    }

    public function destroy($id)
    {
        $deleted = DB::table('sekolah')->where('id_sekolah', $id)->delete();
        if (!$deleted) {
            return response()->json(['message' => 'Sekolah tidak ditemukan'], 404);
        }

        return response()->json(['message' => 'Sekolah dihapus']);
    }
}
