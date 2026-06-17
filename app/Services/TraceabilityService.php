<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class TraceabilityService
{
    public function traceFromReport($id_laporan)
    {
        $laporan = DB::connection('mongodb')
            ->table('laporan_keracunan')
            ->where('_id', $id_laporan)
            ->first();

        if (!$laporan) {
            throw new \Exception('Laporan keracunan tidak ditemukan');
        }

        $id_sppg = $laporan->id_sppg;

        $sppg = DB::table('sppg')->where('id_sppg', $id_sppg)->first();
        if (!$sppg) {
            throw new \Exception('Data SPPG tidak ditemukan');
        }

        $sppg->sekolah = DB::table('sekolah')
            ->where('id_sekolah', $sppg->id_sekolah)->first();

        $menu = DB::table('menu')->where('id_menu', $sppg->id_menu)->first();

        if ($menu) {
            $bahanList = DB::table('detail_menu')
                ->join('bahan_makanan', 'detail_menu.id_bahan', '=', 'bahan_makanan.id_bahan')
                ->where('detail_menu.id_menu', $menu->id_menu)
                ->select('bahan_makanan.*', 'detail_menu.jumlah_bahan')
                ->get();

            $supplierIds = $bahanList->pluck('id_supplier')->unique();
            $suppliers = DB::table('supplier')
                ->whereIn('id_supplier', $supplierIds)
                ->get()
                ->keyBy('id_supplier');

            foreach ($bahanList as $bahan) {
                $bahan->supplier = $suppliers->get($bahan->id_supplier);
            }

            $menu->bahan_makanan = $bahanList;
        }

        $sppg->menu = $menu;

        return [
            'laporan' => $laporan,
            'trace'   => $sppg,
        ];
    }

    public function traceFromSupplier($id_supplier)
    {
        $supplier = DB::table('supplier')->where('id_supplier', $id_supplier)->first();
        if (!$supplier) {
            throw new \Exception('Supplier tidak ditemukan');
        }

        $supplier->bahan_makanan = DB::table('bahan_makanan')
            ->where('id_supplier', $id_supplier)->get();

        $sppgIds = DB::table('sppg')
            ->join('detail_menu', 'sppg.id_menu', '=', 'detail_menu.id_menu')
            ->join('bahan_makanan', 'detail_menu.id_bahan', '=', 'bahan_makanan.id_bahan')
            ->where('bahan_makanan.id_supplier', $id_supplier)
            ->distinct()
            ->pluck('sppg.id_sppg')
            ->toArray();

        $laporan = DB::connection('mongodb')
            ->table('laporan_keracunan')
            ->whereIn('id_sppg', $sppgIds)
            ->get();

        return [
            'supplier'           => $supplier,
            'terdampak_sppg_ids' => $sppgIds,
            'laporan_keracunan'  => $laporan,
        ];
    }
}
