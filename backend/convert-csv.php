<?php

/**
 * CSV Converter Script
 * Converts your CSV format to the system's required format
 * 
 * Usage: php convert-csv.php input.csv output.xlsx
 */

require __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

if ($argc < 2) {
    echo "Usage: php convert-csv.php input.csv [output.xlsx] [default_hall] [default_material]\n";
    echo "Example: php convert-csv.php Book.csv output.xlsx A Book\n";
    exit(1);
}

$inputFile = $argv[1];
$outputFile = $argv[2] ?? 'converted_output.xlsx';
$defaultHall = $argv[3] ?? 'A';
$defaultMaterial = $argv[4] ?? 'Book';

if (!file_exists($inputFile)) {
    echo "Error: Input file '$inputFile' not found.\n";
    exit(1);
}

echo "Reading CSV file: $inputFile\n";

// Read CSV
$handle = fopen($inputFile, 'r');
if (!$handle) {
    echo "Error: Cannot open file.\n";
    exit(1);
}

// Read header
$header = fgetcsv($handle);
if (!$header) {
    echo "Error: Cannot read CSV header.\n";
    exit(1);
}

// Map columns
$idIndex = array_search('ID', $header);
$subIndex = array_search('Sub', $header);
$stateIndex = array_search('State', $header);

if ($idIndex === false || $subIndex === false) {
    echo "Error: Required columns (ID, Sub) not found in CSV.\n";
    echo "Found columns: " . implode(', ', $header) . "\n";
    exit(1);
}

// Create spreadsheet
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// Set headers
$sheet->setCellValue('A1', 'SeatNumber');
$sheet->setCellValue('B1', 'SubjectName');
$sheet->setCellValue('C1', 'MaterialName');
$sheet->setCellValue('D1', 'Hall');
$sheet->setCellValue('E1', 'Seat');
$sheet->setCellValue('F1', 'Stage');

$row = 2;
$count = 0;

// Process data rows
while (($data = fgetcsv($handle)) !== false) {
    // Skip empty rows
    if (empty(array_filter($data))) {
        continue;
    }

    $seatNumber = isset($data[$idIndex]) ? trim($data[$idIndex]) : '';
    $subjectName = isset($data[$subIndex]) ? trim($data[$subIndex]) : '';
    $stage = ($stateIndex !== false && isset($data[$stateIndex])) ? trim($data[$stateIndex]) : '';

    // Skip if seat number is empty
    if (empty($seatNumber)) {
        continue;
    }

    // Set values
    $sheet->setCellValue("A$row", $seatNumber);
    $sheet->setCellValue("B$row", $subjectName);
    $sheet->setCellValue("C$row", $defaultMaterial);
    $sheet->setCellValue("D$row", $defaultHall);
    $sheet->setCellValue("E$row", $seatNumber); // Use seat number as seat location
    $sheet->setCellValue("F$row", $stage);

    $row++;
    $count++;
}

fclose($handle);

// Write Excel file
$writer = new Xlsx($spreadsheet);
$writer->save($outputFile);

echo "Conversion complete!\n";
echo "Processed: $count rows\n";
echo "Output file: $outputFile\n";
echo "\n";
echo "You can now upload '$outputFile' through the admin dashboard.\n";
echo "Note: MaterialName='$defaultMaterial', Hall='$defaultHall', Seat=SeatNumber\n";
echo "You can edit these values in Excel before uploading if needed.\n";

