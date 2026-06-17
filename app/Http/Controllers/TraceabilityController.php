<?php
namespace App\Http\Controllers;

use App\Services\TraceabilityService;
use Illuminate\Http\Request;

class TraceabilityController extends Controller
{
    protected $traceabilityService;

    public function __construct(TraceabilityService $traceabilityService)
    {
        $this->traceabilityService = $traceabilityService;
    }

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
    }
}
