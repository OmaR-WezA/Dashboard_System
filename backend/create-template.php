<?php

/**
 * Create Excel Template File
 * Generates a template Excel file with the correct format
 * 
 * Usage: php create-template.php [output_filename.xlsx]
 */

require __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Font;

$outputFile = $argv[1] ?? 'excel_sheets/template.xlsx';

// Ensure directory exists
$dir = dirname($outputFile);
if (!is_dir($dir) && $dir !== '.') {
    mkdir($dir, 0755, true);
}

echo "Creating Excel template...\n";

// Create new Spreadsheet
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
$sheet->setTitle('Data');

// Set headers - EXACT column names required
$headers = [
    'SeatNumber',
    'SubjectName',
    'MaterialName',
    'Hall',
    'Seat',
    'Stage'
];

$column = 'A';
foreach ($headers as $header) {
    $sheet->setCellValue($column . '1', $header);
    $column++;
}

// Style the header row
$headerRange = 'A1:F1';
$sheet->getStyle($headerRange)->applyFromArray([
    'font' => [
        'bold' => true,
        'color' => ['rgb' => 'FFFFFF'],
        'size' => 12,
    ],
    'fill' => [
        'fillType' => Fill::FILL_SOLID,
        'startColor' => ['rgb' => '4472C4'],
    ],
    'alignment' => [
        'horizontal' => Alignment::HORIZONTAL_CENTER,
        'vertical' => Alignment::VERTICAL_CENTER,
    ],
    'borders' => [
        'allBorders' => [
            'borderStyle' => Border::BORDER_THIN,
            'color' => ['rgb' => '000000'],
        ],
    ],
]);

// Add example data rows
$examples = [
    ['12345', 'Mathematics', 'Final Exam', 'A', '10', 'Stage 1'],
    ['12345', 'Mathematics', 'Midterm Exam', 'A', '10', 'Stage 1'],
    ['67890', 'Physics', 'Lab Report', 'B', '15', 'Stage 2'],
    ['11111', 'Chemistry', 'Assignment 1', 'C', '20', 'Stage 1'],
];

$row = 2;
foreach ($examples as $example) {
    $column = 'A';
    foreach ($example as $value) {
        $sheet->setCellValue($column . $row, $value);
        $column++;
    }
    $row++;
}

// Style example rows
$exampleRange = 'A2:F' . ($row - 1);
$sheet->getStyle($exampleRange)->applyFromArray([
    'borders' => [
        'allBorders' => [
            'borderStyle' => Border::BORDER_THIN,
            'color' => ['rgb' => 'CCCCCC'],
        ],
    ],
]);

// Set column widths
$sheet->getColumnDimension('A')->setWidth(15);
$sheet->getColumnDimension('B')->setWidth(20);
$sheet->getColumnDimension('C')->setWidth(20);
$sheet->getColumnDimension('D')->setWidth(10);
$sheet->getColumnDimension('E')->setWidth(10);
$sheet->getColumnDimension('F')->setWidth(15);

// Freeze header row
$sheet->freezePane('A2');

// Write file
$writer = new Xlsx($spreadsheet);
$writer->save($outputFile);

echo "✅ Template created successfully!\n";
echo "File: $outputFile\n";
echo "\n";
echo "Template includes:\n";
echo "  ✅ Correct column headers (case-sensitive)\n";
echo "  ✅ Example data rows (you can delete these)\n";
echo "  ✅ Formatted and ready to use\n";
echo "\n";
echo "Column names (must be exact):\n";
foreach ($headers as $i => $header) {
    echo "  " . ($i + 1) . ". $header" . ($i < 5 ? " (Required)" : " (Optional)") . "\n";
}
echo "\n";
echo "Next steps:\n";
echo "  1. Open the template in Excel\n";
echo "  2. Delete the example rows (rows 2-5)\n";
echo "  3. Add your data starting from row 2\n";
echo "  4. Save the file\n";
echo "  5. Upload through admin dashboard\n";
