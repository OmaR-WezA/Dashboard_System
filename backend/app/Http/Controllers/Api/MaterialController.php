<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class MaterialController extends Controller
{
    /**
     * Search materials by seat number
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'seat_number' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $seatNumber = $request->input('seat_number');
        
        $materials = Material::where('seat_number', $seatNumber)
            ->orderBy('subject_name')
            ->orderBy('material_name')
            ->get();

        return response()->json([
            'success' => true,
            'exists' => $materials->count() > 0,
            'total_count' => $materials->count(),
            'materials' => $materials,
        ]);
    }

    /**
     * Get all materials with pagination and filters
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search');
        $subjectFilter = $request->input('subject');
        $stageFilter = $request->input('stage');
        $receivedFilter = $request->input('received'); // null, true, false

        // Use cache for filters if no search/filters applied
        $cacheKey = 'materials_' . md5(json_encode($request->all()));
        if (!$search && !$subjectFilter && !$stageFilter && !$receivedFilter) {
            return Cache::remember($cacheKey, 300, function () use ($perPage) {
                return $this->getMaterials($perPage);
            });
        }

        $query = Material::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('seat_number', 'like', "%{$search}%")
                  ->orWhere('subject_name', 'like', "%{$search}%")
                  ->orWhere('material_name', 'like', "%{$search}%")
                  ->orWhere('hall', 'like', "%{$search}%");
            });
        }

        if ($subjectFilter) {
            $query->where('subject_name', $subjectFilter);
        }

        if ($stageFilter !== null && $stageFilter !== '') {
            if ($stageFilter === '__null__' || $stageFilter === 'null' || $stageFilter === '') {
                $query->whereNull('stage');
            } else {
                $query->where('stage', $stageFilter);
            }
        }

        if ($receivedFilter !== null) {
            $query->where('received', filter_var($receivedFilter, FILTER_VALIDATE_BOOLEAN));
        }

        // Optimize query - only select needed columns
        $materials = $query->select('id', 'seat_number', 'subject_name', 'material_name', 'hall', 'seat', 'stage', 'received', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $materials,
        ]);
    }

    private function getMaterials($perPage)
    {
        $materials = Material::select('id', 'seat_number', 'subject_name', 'material_name', 'hall', 'seat', 'stage', 'received', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $materials,
        ]);
    }

    /**
     * Get unique subjects and stages for filters
     */
    public function getFilters()
    {
        $subjects = Material::distinct()
            ->whereNotNull('subject_name')
            ->where('subject_name', '!=', '')
            ->orderBy('subject_name')
            ->pluck('subject_name');

        $stages = Material::distinct()
            ->whereNotNull('stage')
            ->where('stage', '!=', '')
            ->orderBy('stage')
            ->pluck('stage');

        return response()->json([
            'success' => true,
            'data' => [
                'subjects' => $subjects,
                'stages' => $stages,
            ],
        ]);
    }

    /**
     * Get statistics
     */
    public function getStatistics(Request $request)
    {
        $query = Material::query();

        // Date filtering
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $total = $query->count();
        $received = (clone $query)->where('received', true)->count();
        $notReceived = (clone $query)->where('received', false)->orWhereNull('received')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'received' => $received,
                'not_received' => $notReceived,
                'received_percentage' => $total > 0 ? round(($received / $total) * 100, 2) : 0,
                'not_received_percentage' => $total > 0 ? round(($notReceived / $total) * 100, 2) : 0,
            ],
        ]);
    }

    /**
     * Export materials to Excel
     */
    public function exportToExcel(Request $request)
    {
        $query = Material::query();

        // Apply filters if provided
        if ($request->has('subject')) {
            $query->where('subject_name', $request->input('subject'));
        }

        if ($request->has('stage')) {
            if ($request->input('stage') === '__null__') {
                $query->whereNull('stage');
            } else {
                $query->where('stage', $request->input('stage'));
            }
        }

        if ($request->has('received')) {
            $received = filter_var($request->input('received'), FILTER_VALIDATE_BOOLEAN);
            $query->where('received', $received);
        }

        // Date filtering
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $materials = $query->orderBy('created_at', 'desc')->get();

        // Create Excel file
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers
        $sheet->setCellValue('A1', 'ID');
        $sheet->setCellValue('B1', 'كود الطالب');
        $sheet->setCellValue('C1', 'المادة');
        $sheet->setCellValue('D1', 'اسم المادة');
        $sheet->setCellValue('E1', 'القاعة');
        $sheet->setCellValue('F1', 'المكان');
        $sheet->setCellValue('G1', 'المرحلة');
        $sheet->setCellValue('H1', 'حالة الاستلام');
        $sheet->setCellValue('I1', 'تاريخ الإنشاء');

        // Style headers
        $headerStyle = [
            'font' => ['bold' => true],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E0E0E0']
            ]
        ];
        $sheet->getStyle('A1:I1')->applyFromArray($headerStyle);

        // Add data
        $row = 2;
        foreach ($materials as $material) {
            $sheet->setCellValue('A' . $row, $material->id);
            $sheet->setCellValue('B' . $row, $material->seat_number);
            $sheet->setCellValue('C' . $row, $material->subject_name);
            $sheet->setCellValue('D' . $row, $material->material_name);
            $sheet->setCellValue('E' . $row, $material->hall);
            $sheet->setCellValue('F' . $row, $material->seat);
            $sheet->setCellValue('G' . $row, $material->stage ?? '');
            $sheet->setCellValue('H' . $row, $material->received ? 'تم الاستلام' : 'لم يتم الاستلام');
            $sheet->setCellValue('I' . $row, $material->created_at->format('Y-m-d H:i:s'));
            $row++;
        }

        // Auto-size columns
        foreach (range('A', 'I') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $filename = 'materials_export_' . date('Y-m-d_His') . '.xlsx';

        // Create writer and save to temporary file
        $writer = new Xlsx($spreadsheet);
        $tempFile = tempnam(sys_get_temp_dir(), 'excel_export_');
        $writer->save($tempFile);

        return response()->download($tempFile, $filename)->deleteFileAfterSend(true);
    }

    /**
     * Export statistics to Excel
     */
    public function exportStatistics()
    {
        $total = Material::count();
        $received = Material::where('received', true)->count();
        $notReceived = Material::where('received', false)->orWhereNull('received')->count();

        $csv = "الإحصائية,العدد,النسبة المئوية\n";
        $csv .= sprintf("إجمالي المذكرات,%d,100%%\n", $total);
        $csv .= sprintf("تم الاستلام,%d,%.2f%%\n", $received, $total > 0 ? ($received / $total) * 100 : 0);
        $csv .= sprintf("لم يتم الاستلام,%d,%.2f%%\n", $notReceived, $total > 0 ? ($notReceived / $total) * 100 : 0);

        $filename = 'statistics_export_' . date('Y-m-d_His') . '.csv';

        return response($csv)
            ->header('Content-Type', 'text/csv; charset=UTF-8')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
            ->header('Content-Transfer-Encoding', 'binary');
    }

    /**
     * Store a new material
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'seat_number' => 'required|string|max:50',
            'subject_name' => 'required|string|max:255',
            'material_name' => 'required|string|max:255',
            'hall' => 'required|string|max:100',
            'seat' => 'required|string|max:50',
            'stage' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $material = Material::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Material created successfully',
            'data' => $material,
        ], 201);
    }

    /**
     * Update a material
     */
    public function update(Request $request, $id)
    {
        $material = Material::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'seat_number' => 'required|string|max:50',
            'subject_name' => 'required|string|max:255',
            'material_name' => 'required|string|max:255',
            'hall' => 'required|string|max:100',
            'seat' => 'required|string|max:50',
            'stage' => 'nullable|string|max:100',
            'received' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $material->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Material updated successfully',
            'data' => $material,
        ]);
    }

    /**
     * Mark material as received
     */
    public function markReceived(Request $request, $id)
    {
        $material = Material::findOrFail($id);
        $material->received = true;
        $material->received_at = now();
        $material->received_by = $request->user()->id;
        $material->save();

        return response()->json([
            'success' => true,
            'message' => 'Material marked as received',
            'data' => $material,
        ]);
    }

    /**
     * Cancel received status
     */
    public function cancelReceived(Request $request, $id)
    {
        $material = Material::findOrFail($id);
        $material->received = false;
        $material->received_at = null;
        $material->received_by = null;
        $material->save();

        return response()->json([
            'success' => true,
            'message' => 'Received status cancelled',
            'data' => $material,
        ]);
    }

    /**
     * Delete a material
     */
    public function destroy($id)
    {
        $material = Material::findOrFail($id);
        $material->delete();

        return response()->json([
            'success' => true,
            'message' => 'Material deleted successfully',
        ]);
    }

    /**
     * Delete all materials (with password protection)
     */
    public function deleteAll(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Password is required',
            ], 422);
        }

        if ($request->input('password') !== '123') {
            return response()->json([
                'success' => false,
                'message' => 'Invalid password',
            ], 401);
        }

        $count = Material::count();
        Material::truncate();

        return response()->json([
            'success' => true,
            'message' => "All materials deleted successfully",
            'data' => [
                'deleted_count' => $count,
            ],
        ]);
    }

    /**
     * Get a single material
     */
    public function show($id)
    {
        $material = Material::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $material,
        ]);
    }

    /**
     * Bulk update materials
     */
    public function bulkUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'required|integer|exists:materials,id',
            'field' => 'required|string|in:seat_number,subject_name,material_name,hall,seat,stage',
            'value' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $ids = $request->input('ids');
        $field = $request->input('field');
        $value = $request->input('value');

        $updated = Material::whereIn('id', $ids)->update([
            $field => $value
        ]);

        return response()->json([
            'success' => true,
            'message' => "Updated {$updated} materials successfully",
            'data' => [
                'updated_count' => $updated,
            ],
        ]);
    }
}
