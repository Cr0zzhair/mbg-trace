<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SupplierController extends Controller
{
    public function index()
    {
        return response()->json(DB::table('supplier')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_supplier' => 'required|string|max:100',
            'alamat'        => 'nullable|string',
            'no_telp'       => 'nullable|string|max:20',
        ]);

        $id = DB::table('supplier')->insertGetId($data, 'id_supplier');

        return response()->json(
            DB::table('supplier')->where('id_supplier', $id)->first(),
            201
        );
    }

    public function show($id)
    {
        $supplier = DB::table('supplier')->where('id_supplier', $id)->first();
        if (!$supplier) {
            return response()->json(['message' => 'Supplier tidak ditemukan'], 404);
        }

        $supplier->bahan_makanan = DB::table('bahan_makanan')
            ->where('id_supplier', $id)->get();

        return response()->json($supplier);
    }

    public function update(Request $request, $id)
    {
        $supplier = DB::table('supplier')->where('id_supplier', $id)->first();
        if (!$supplier) {
            return response()->json(['message' => 'Supplier tidak ditemukan'], 404);
        }

        $data = $request->validate([
            'nama_supplier' => 'sometimes|required|string|max:100',
            'alamat'        => 'nullable|string',
            'no_telp'       => 'nullable|string|max:20',
        ]);

        DB::table('supplier')->where('id_supplier', $id)->update($data);

        return response()->json(
            DB::table('supplier')->where('id_supplier', $id)->first()
        );
    }

    public function destroy($id)
    {
        $deleted = DB::table('supplier')->where('id_supplier', $id)->delete();
        if (!$deleted) {
            return response()->json(['message' => 'Supplier tidak ditemukan'], 404);
        }

        return response()->json(['message' => 'Supplier dihapus']);
    }
}
