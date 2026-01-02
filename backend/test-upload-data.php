<?php

/**
 * Create test Excel file with user's data format
 */

require __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// Headers
$headers = ['SeatNumber', 'SubjectName', 'MaterialName', 'Hall', 'Seat', 'Stage'];
$col = 'A';
foreach ($headers as $header) {
    $sheet->setCellValue($col . '1', $header);
    $col++;
}

// User's data
$data = [
    ['2521178', 'انجليزي', 'Book', 'A', '2521178', 'Stage 1'],
    ['2520081', 'انجليزي', 'Book', 'A', '2520081', 'Stage 1'],
    ['2520740', 'IT ', 'Book', 'A', '2520740', 'Stage 1'],
    ['2560219', 'انجليزي', 'Book', 'A', '2560219', 'Stage 1'],
    ['2520367', 'ماث', 'Book', 'A', '2520367', 'Stage 1'],
    ['2520239', 'انجليزي', 'Book', 'A', '2520239', 'Stage 1'],
    ['2520149', 'فيزيا عملي', 'Book', 'A', '2520149', ''],
    ['2421573', 'استماره تدريب', 'Book', 'A', '2421573', ''],
    ['2521150', 'فيزيا عملي', 'Book', 'A', '2521150', ''],
    ['2420945', 'استماره تدريب', 'Book', 'A', '2420945', ''],
    ['2521021', 'ماث', 'Book', 'A', '2521021', ''],
    ['231008', 'liquid ', 'Book', 'A', '231008', ''],
    ['2520124', 'ماث', 'Book', 'A', '2520124', ''],
    ['2422022', 'استماره تدريب', 'Book', 'A', '2422022', ''],
    ['2520494', 'ماث', 'Book', 'A', '2520494', ''],
];

$row = 2;
foreach ($data as $rowData) {
    $col = 'A';
    foreach ($rowData as $value) {
        $sheet->setCellValue($col . $row, $value);
        $col++;
    }
    $row++;
}

$writer = new Xlsx($spreadsheet);
$writer->save('excel_sheets/test_data.xlsx');

echo "Test file created: excel_sheets/test_data.xlsx\n";
echo "This file matches your data format exactly.\n";
echo "You can use this to test the upload.\n";

