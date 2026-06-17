<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LaporanKeracunanController extends Controller
{
    private function collection()
    {
        return DB::connection('mongodb')->table('laporan_keracunan');
    }

    public function index()
    {
        $items = $this->collection()->get();

        $sppgIds = $items->pluck('id_sppg')->filter()->unique();
        $sekolahIds = $items->pluck('id_sekolah')->filter()->unique();

        $sppgs = DB::table('sppg')
            ->whereIn('id_sppg', $sppgIds)->get()->keyBy('id_sppg');
        $sekolahs = DB::table('sekolah')
            ->whereIn('id_sekolah', $sekolahIds)->get()->keyBy('id_sekolah');

        foreach ($items as $item) {
            $item->sppg = $sppgs->get($item->id_sppg);
            $item->sekolah = $sekolahs->get($item->id_sekolah);
        }

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id_laporan'         => 'nullable|string',
            'tanggal_laporan'    => 'required|date',
            'jumlah_korban'      => 'required|integer',
            'deskripsi'          => 'required|string',
            'id_sekolah'         => 'required|integer',
            'id_sppg'            => 'required|integer',
            'detail_investigasi' => 'nullable|string',
            'dokumentasi'        => 'nullable|string',
            'riwayat_audit'      => 'nullable|array',
        ]);

        $id = $this->collection()->insertGetId($data);
        $laporan = $this->collection()->where('_id', $id)->first();

        return response()->json($laporan, 201);
    }

    public function show($id)
    {
        $laporan = $this->collection()->where('_id', $id)->first();
        if (!$laporan) {
            return response()->json(['message' => 'Laporan tidak ditemukan'], 404);
        }

        if (isset($laporan->id_sppg)) {
            $laporan->sppg = DB::table('sppg')
                ->where('id_sppg', $laporan->id_sppg)->first();
        }
        if (isset($laporan->id_sekolah)) {
            $laporan->sekolah = DB::table('sekolah')
                ->where('id_sekolah', $laporan->id_sekolah)->first();
        }

        return response()->json($laporan);
    }

    public function update(Request $request, $id)
    {
        $laporan = $this->collection()->where('_id', $id)->first();
        if (!$laporan) {
            return response()->json(['message' => 'Laporan tidak ditemukan'], 404);
        }

        $data = $request->validate([
            'tanggal_laporan'    => 'sometimes|required|date',
            'jumlah_korban'      => 'sometimes|required|integer',
            'deskripsi'          => 'sometimes|required|string',
            'id_sekolah'         => 'sometimes|required|integer',
            'id_sppg'            => 'sometimes|required|integer',
            'detail_investigasi' => 'nullable|string',
            'dokumentasi'        => 'nullable|string',
            'riwayat_audit'      => 'nullable',
        ]);

        if ($request->has('riwayat_audit')) {
            $newAudit = $request->input('riwayat_audit');
            $existingAudit = $laporan->riwayat_audit ?? [];

            if (!is_array($existingAudit)) {
                $existingAudit = [$existingAudit];
            }

            if (is_array($newAudit) && !isset($newAudit[0])) {
                $existingAudit[] = $newAudit;
            } elseif (is_array($newAudit)) {
                $existingAudit = array_merge($existingAudit, $newAudit);
            } else {
                $existingAudit[] = $newAudit;
            }

            $data['riwayat_audit'] = $existingAudit;
        }

        $this->collection()->where('_id', $id)->update($data);
        $laporan = $this->collection()->where('_id', $id)->first();

        return response()->json($laporan);
    }

    public function destroy($id)
    {
        $deleted = $this->collection()->where('_id', $id)->delete();
        if (!$deleted) {
            return response()->json(['message' => 'Laporan tidak ditemukan'], 404);
        }

        return response()->json(['message' => 'Laporan Keracunan berhasil dihapus']);
    }
}
