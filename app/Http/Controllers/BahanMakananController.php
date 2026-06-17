<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BahanMakananController extends Controller
{
    public function index()
    {
        $items = DB::table('bahan_makanan')->get();

        $supplierIds = $items->pluck('id_supplier')->unique();
        $suppliers = DB::table('supplier')
            ->whereIn('id_supplier', $supplierIds)
            ->get()
            ->keyBy('id_supplier');

        foreach ($items as $item) {
            $item->supplier = $suppliers->get($item->id_supplier);
        }

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_bahan'         => 'required|string|max:100',
            'tanggal_kadaluarsa' => 'nullable|date',
            'id_supplier'        => 'required|exists:supplier,id_supplier',
        ]);

        $id = DB::table('bahan_makanan')->insertGetId($data, 'id_bahan');

        return response()->json(
            DB::table('bahan_makanan')->where('id_bahan', $id)->first(),
            201
        );
    }

    public function show($id)
    {
        $bahan = DB::table('bahan_makanan')->where('id_bahan', $id)->first();
        if (!$bahan) {
            return response()->json(['message' => 'Bahan makanan tidak ditemukan'], 404);
        }

        $bahan->supplier = DB::table('supplier')
            ->where('id_supplier', $bahan->id_supplier)->first();

        return response()->json($bahan);
    }

    public function update(Request $request, $id)
    {
        $bahan = DB::table('bahan_makanan')->where('id_bahan', $id)->first();
        if (!$bahan) {
            return response()->json(['message' => 'Bahan makanan tidak ditemukan'], 404);
        }

        $data = $request->validate([
            'nama_bahan'         => 'sometimes|required|string|max:100',
            'tanggal_kadaluarsa' => 'nullable|date',
            'id_supplier'        => 'sometimes|required|exists:supplier,id_supplier',
        ]);

        DB::table('bahan_makanan')->where('id_bahan', $id)->update($data);

        return response()->json(
            DB::table('bahan_makanan')->where('id_bahan', $id)->first()
        );
    }

    public function destroy($id)
    {
        $deleted = DB::table('bahan_makanan')->where('id_bahan', $id)->delete();
        if (!$deleted) {
            return response()->json(['message' => 'Bahan makanan tidak ditemukan'], 404);
        }

        return response()->json(['message' => 'Bahan makanan dihapus']);
    }
}
