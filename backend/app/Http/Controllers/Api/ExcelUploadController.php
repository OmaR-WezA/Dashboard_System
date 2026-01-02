<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ExcelUploadController extends Controller
{
    /**
     * Expected columns in Excel file
     */
    private const REQUIRED_COLUMNS = [
        'SeatNumber',
        'SubjectName',
        'MaterialName',
        'Hall',
        'Seat',
    ];

    private const OPTIONAL_COLUMNS = [
        'Stage',
    ];

    /**
     * Upload and process Excel file
     */
    public function upload(Request $request)
    {
        // Validate file upload - more lenient
        $validator = Validator::make($request->all(), [
            'file' => 'required|mimes:xlsx,xls,csv|max:10240', // 10MB max, allow CSV too
            'stage' => 'nullable|string|max:100',
            'replace_mode' => 'nullable', // Accept any value, we'll convert it manually
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'File validation error',
                'errors' => $validator->errors(),
                'received' => [
                    'file' => $request->hasFile('file') ? $request->file('file')->getClientOriginalName() : 'not provided',
                    'file_type' => $request->hasFile('file') ? $request->file('file')->getMimeType() : 'not provided',
                    'stage' => $request->input('stage'),
                    'replace_mode' => $request->input('replace_mode'),
                ],
            ], 422);
        }

        $file = $request->file('file');
        $stage = $request->input('stage');
        
        // Handle replace_mode - accept string '1'/'0', boolean true/false, or null
        $replaceModeInput = $request->input('replace_mode', false);
        $replaceMode = false;
        if ($replaceModeInput === true || $replaceModeInput === '1' || $replaceModeInput === 'true' || $replaceModeInput === 1) {
            $replaceMode = true;
        }

        try {
            // Handle CSV files
            $fileExtension = strtolower($file->getClientOriginalExtension());
            $filePath = $file->getRealPath();
            
            // If CSV, convert to temporary Excel format first
            if ($fileExtension === 'csv') {
                // Read CSV and create spreadsheet
                $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
                $reader = new \PhpOffice\PhpSpreadsheet\Reader\Csv();
                $reader->setInputEncoding('UTF-8');
                $reader->setDelimiter(',');
                $reader->setEnclosure('"');
                $reader->setSheetIndex(0);
                $spreadsheet = $reader->load($filePath);
            } else {
                // Load Excel file
                $spreadsheet = IOFactory::load($filePath);
            }
            
            $worksheet = $spreadsheet->getActiveSheet();
            
            // Get all rows
            $rows = $worksheet->toArray();

            // Check if file has data
            if (empty($rows) || count($rows) < 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'Excel file is empty or has no data rows. Please ensure the file has a header row and at least one data row.',
                ], 422);
            }

            // Get header row (first row) - normalize it
            $headers = [];
            foreach ($rows[0] as $header) {
                $headers[] = trim((string) $header);
            }
            
            // Validate headers exist
            if (empty($headers) || count($headers) < 5) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Excel format: Header row is missing or incomplete.',
                    'details' => [
                        'found_columns' => $headers,
                        'required_columns' => self::REQUIRED_COLUMNS,
                    ],
                ], 422);
            }

            // Validate headers - check for required columns
            $validationResult = $this->validateHeaders($headers);
            if (!$validationResult['valid']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Excel format: Missing required columns',
                    'errors' => $validationResult['errors'],
                    'found_columns' => $headers,
                    'required_columns' => self::REQUIRED_COLUMNS,
                    'hint' => 'Please use the template file or ensure your Excel has these exact column names in the first row: ' . implode(', ', self::REQUIRED_COLUMNS),
                ], 422);
            }

            // Map column indices
            $columnMap = $this->mapColumns($headers);
            
            // Verify all required columns are mapped
            foreach (self::REQUIRED_COLUMNS as $required) {
                if (!isset($columnMap[$required])) {
                    return response()->json([
                        'success' => false,
                        'message' => "Column mapping error: Could not find column '{$required}'",
                        'found_columns' => $headers,
                    ], 422);
                }
            }

            // Process data rows
            $processed = 0;
            $skipped = 0;
            $errors = [];

            DB::beginTransaction();

            try {
                // If replace mode, delete existing records for this stage
                if ($replaceMode && $stage) {
                    Material::where('stage', $stage)->delete();
                } elseif ($replaceMode && !$stage) {
                    Material::whereNull('stage')->delete();
                }

                // Process each row (skip header row at index 0)
                for ($i = 1; $i < count($rows); $i++) {
                    $row = $rows[$i];
                    
                    // Skip completely empty rows
                    if (empty(array_filter($row, function($value) {
                        return $value !== null && $value !== '';
                    }))) {
                        continue;
                    }

                    // Extract data using column map
                    $seatNumber = $this->getCellValue($row, $columnMap['SeatNumber']);
                    $subjectName = $this->getCellValue($row, $columnMap['SubjectName']);
                    $materialName = $this->getCellValue($row, $columnMap['MaterialName']);
                    $hall = $this->getCellValue($row, $columnMap['Hall']);
                    $seat = $this->getCellValue($row, $columnMap['Seat']);
                    $rowStage = isset($columnMap['Stage']) 
                        ? $this->getCellValue($row, $columnMap['Stage']) 
                        : null;

                    // Use provided stage if row doesn't have one
                    $finalStage = !empty($rowStage) ? $rowStage : $stage;

                    // Validate required fields - trim and check
                    $seatNumber = trim((string) $seatNumber);
                    $subjectName = trim((string) $subjectName);
                    $materialName = trim((string) $materialName);
                    $hall = trim((string) $hall);
                    $seat = trim((string) $seat);

                    // Check if any required field is empty
                    if (empty($seatNumber) || empty($subjectName) || 
                        empty($materialName) || empty($hall) || empty($seat)) {
                        $skipped++;
                        $missingFields = [];
                        if (empty($seatNumber)) $missingFields[] = 'SeatNumber';
                        if (empty($subjectName)) $missingFields[] = 'SubjectName';
                        if (empty($materialName)) $missingFields[] = 'MaterialName';
                        if (empty($hall)) $missingFields[] = 'Hall';
                        if (empty($seat)) $missingFields[] = 'Seat';
                        
                        $errors[] = "Row " . ($i + 1) . ": Missing " . implode(', ', $missingFields);
                        continue;
                    }

                    // Create material record
                    Material::create([
                        'seat_number' => $seatNumber,
                        'subject_name' => $subjectName,
                        'material_name' => $materialName,
                        'hall' => $hall,
                        'seat' => $seat,
                        'stage' => $finalStage ? trim((string) $finalStage) : null,
                    ]);

                    $processed++;
                }

                DB::commit();

                $response = [
                    'success' => true,
                    'message' => 'Excel file processed successfully',
                    'data' => [
                        'processed' => $processed,
                        'skipped' => $skipped,
                    ],
                ];

                // Only include errors if there are any
                if (!empty($errors)) {
                    $response['data']['errors'] = array_slice($errors, 0, 20); // Limit to first 20 errors
                    if (count($errors) > 20) {
                        $response['data']['total_errors'] = count($errors);
                        $response['data']['message'] = 'Some rows were skipped. Showing first 20 errors.';
                    }
                }

                return response()->json($response, 200);

            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Error processing Excel file',
                    'error' => $e->getMessage(),
                    'trace' => config('app.debug') ? $e->getTraceAsString() : null,
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error reading Excel file',
                'error' => $e->getMessage(),
                'hint' => 'Please ensure the file is a valid Excel file (.xlsx or .xls format)',
            ], 500);
        }
    }

    /**
     * Validate Excel headers
     */
    private function validateHeaders(array $headers): array
    {
        $errors = [];
        $foundColumns = [];

        // Normalize all headers
        foreach ($headers as $header) {
            $normalized = trim((string) $header);
            if (!empty($normalized)) {
                $foundColumns[] = $normalized;
            }
        }

        // Check for required columns (case-sensitive exact match)
        foreach (self::REQUIRED_COLUMNS as $required) {
            if (!in_array($required, $foundColumns)) {
                $errors[] = "Missing required column: '{$required}'";
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * Map column names to indices
     */
    private function mapColumns(array $headers): array
    {
        $map = [];
        foreach ($headers as $index => $header) {
            $normalized = trim((string) $header);
            if (in_array($normalized, self::REQUIRED_COLUMNS) || 
                in_array($normalized, self::OPTIONAL_COLUMNS)) {
                $map[$normalized] = $index;
            }
        }
        return $map;
    }

    /**
     * Get cell value safely
     */
    private function getCellValue(array $row, ?int $index): ?string
    {
        if ($index === null || !isset($row[$index])) {
            return null;
        }
        
        $value = $row[$index];
        
        // Handle different value types
        if ($value === null) {
            return null;
        }
        
        // Convert to string and trim
        $stringValue = trim((string) $value);
        
        return $stringValue === '' ? null : $stringValue;
    }
}
