<?php
namespace App\Http\Controllers;

use App\Services\TraceabilityService;
<<<<<<< HEAD
use Illuminate\Http\Request;
=======
>>>>>>> 582451ee78bfcab60351cb372de26161c9213bed

class TraceabilityController extends Controller
{
    protected $traceabilityService;

    public function __construct(TraceabilityService $traceabilityService)
    {
        $this->traceabilityService = $traceabilityService;
    }

<<<<<<< HEAD
    // GET /api/trace/report/{id}
    public function traceFromReport($id)
    {
        try {
            $hasil = $this->traceabilityService->traceFromReport($id);
            return response()->json($hasil);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }

    // GET /api/trace/supplier/{id}
    public function traceFromSupplier($id)
    {
        try {
            $hasil = $this->traceabilityService->traceFromSupplier($id);
            return response()->json($hasil);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
=======
    public function traceFromReport($id)
    {
        $result = $this->traceabilityService->traceFromReport($id);
        return response()->json($result);
    }

    public function traceFromSupplier($id)
    {
        $result = $this->traceabilityService->traceFromSupplier($id);
        return response()->json($result);
>>>>>>> 582451ee78bfcab60351cb372de26161c9213bed
    }
}
