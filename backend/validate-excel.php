<?php

/**
 * Excel Validator and Converter
 * Validates Excel file format and converts if needed
 * 
 * Usage: 
 *   php validate-excel.php input.xlsx [output.xlsx]
 *   php validate-excel.php input.csv [output.xlsx]
 */

require __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

if ($argc < 2) {
    echo "Usage: php validate-excel.php <input_file> [output_file]\n";
    echo "Examples:\n";
    echo "  php validate-excel.php Book.csv converted.xlsx\n";
    echo "  php validate-excel.php data.xlsx validated.xlsx\n";
    exit(1);
}

$inputFile = $argv[1];
$outputFile = $argv[2] ?? 'excel_sheets/converted/' . pathinfo($inputFile, PATHINFO_FILENAME) . '_converted.xlsx';

if (!file_exists($inputFile)) {
    echo "Error: File '$inputFile' not found.\n";
    exit(1);
}

echo "Validating file: $inputFile\n";

try {
    // Load file
    $spreadsheet = IOFactory::load($inputFile);
    $worksheet = $spreadsheet->getActiveSheet();
    $rows = $worksheet->toArray();

    if (empty($rows)) {
        echo "Error: File is empty.\n";
        exit(1);
    }

    // Get headers
    $headers = array_map('trim', array_map('strval', $rows[0]));
    
    echo "Found columns: " . implode(', ', $headers) . "\n\n";

    // Required columns
    $requiredColumns = ['SeatNumber', 'SubjectName', 'MaterialName', 'Hall', 'Seat'];
    $optionalColumns = ['Stage'];
    
    // Check if already in correct format
    $hasAllRequired = true;
    $missingColumns = [];
    
    foreach ($requiredColumns as $required) {
        if (!in_array($required, $headers)) {
            $hasAllRequired = false;
            $missingColumns[] = $required;
        }
    }

    if ($hasAllRequired) {
        echo "✅ File is already in correct format!\n";
        echo "All required columns present.\n";
        
        // Count data rows
        $dataRows = count($rows) - 1;
        echo "Data rows: $dataRows\n";
        
        // Check for empty required fields
        $errors = [];
        $warnings = [];
        
        for ($i = 1; $i < count($rows); $i++) {
            $row = $rows[$i];
            if (empty(array_filter($row))) {
                continue; // Skip empty rows
            }
            
            $seatNumber = trim($row[array_search('SeatNumber', $headers)] ?? '');
            $subjectName = trim($row[array_search('SubjectName', $headers)] ?? '');
            $materialName = trim($row[array_search('MaterialName', $headers)] ?? '');
            $hall = trim($row[array_search('Hall', $headers)] ?? '');
            $seat = trim($row[array_search('Seat', $headers)] ?? '');
            
            if (empty($seatNumber) || empty($subjectName) || empty($materialName) || empty($hall) || empty($seat)) {
                $errors[] = "Row " . ($i + 1) . ": Missing required fields";
            }
        }
        
        if (!empty($errors)) {
            echo "\n⚠️  Warnings:\n";
            foreach (array_slice($errors, 0, 10) as $error) {
                echo "  - $error\n";
            }
            if (count($errors) > 10) {
                echo "  ... and " . (count($errors) - 10) . " more\n";
            }
        } else {
            echo "\n✅ All rows have required fields!\n";
        }
        
        // Copy to output if different file
        if ($inputFile !== $outputFile) {
            $writer = new Xlsx($spreadsheet);
            $writer->save($outputFile);
            echo "\n✅ File copied to: $outputFile\n";
        }
        
        exit(0);
    }

    // Need to convert
    echo "⚠️  File needs conversion.\n";
    echo "Missing columns: " . implode(', ', $missingColumns) . "\n\n";
    
    // Check for common column name variations
    $columnMap = [];
    $variations = [
        'SeatNumber' => ['ID', 'Seat Number', 'SeatNumber', 'seat_number', 'Seat_Number'],
        'SubjectName' => ['Sub', 'Subject', 'Subject Name', 'SubjectName', 'subject_name'],
        'MaterialName' => ['Material', 'Material Name', 'MaterialName', 'material_name', 'Memo', 'Memo Name'],
        'Hall' => ['Hall', 'hall'],
        'Seat' => ['Seat', 'seat'],
        'Stage' => ['State', 'Stage', 'stage', 'Academic Stage'],
    ];
    
    foreach ($variations as $target => $possible) {
        foreach ($possible as $possibleName) {
            if (in_array($possibleName, $headers)) {
                $columnMap[$target] = array_search($possibleName, $headers);
                echo "Found '$possibleName' → mapping to '$target'\n";
                break;
            }
        }
    }
    
    // Check if we can convert
    $canConvert = isset($columnMap['SeatNumber']) && 
                  isset($columnMap['SubjectName']);
    
    if (!$canConvert) {
        echo "\n❌ Cannot auto-convert: Missing required source columns (ID/SeatNumber and Sub/SubjectName)\n";
        echo "Please use the template: excel_sheets/template.xlsx\n";
        exit(1);
    }
    
    echo "\n🔄 Converting file...\n";
    
    // Create new spreadsheet with correct format
    $newSpreadsheet = new Spreadsheet();
    $newSheet = $newSpreadsheet->getActiveSheet();
    
    // Set headers
    $newHeaders = ['SeatNumber', 'SubjectName', 'MaterialName', 'Hall', 'Seat', 'Stage'];
    $col = 'A';
    foreach ($newHeaders as $header) {
        $newSheet->setCellValue($col . '1', $header);
        $col++;
    }
    
    // Convert data
    $processed = 0;
    $skipped = 0;
    $rowNum = 2;
    
    for ($i = 1; $i < count($rows); $i++) {
        $row = $rows[$i];
        
        // Skip empty rows
        if (empty(array_filter($row))) {
            continue;
        }
        
        $seatNumber = isset($columnMap['SeatNumber']) ? trim($row[$columnMap['SeatNumber']] ?? '') : '';
        $subjectName = isset($columnMap['SubjectName']) ? trim($row[$columnMap['SubjectName']] ?? '') : '';
        $materialName = isset($columnMap['MaterialName']) ? trim($row[$columnMap['MaterialName']] ?? '') : 'Book';
        $hall = isset($columnMap['Hall']) ? trim($row[$columnMap['Hall']] ?? '') : 'A';
        $seat = isset($columnMap['Seat']) ? trim($row[$columnMap['Seat']] ?? '') : $seatNumber;
        $stage = isset($columnMap['Stage']) ? trim($row[$columnMap['Stage']] ?? '') : '';
        
        // Skip if required fields are empty
        if (empty($seatNumber) || empty($subjectName)) {
            $skipped++;
            continue;
        }
        
        // Set values
        $newSheet->setCellValue("A$rowNum", $seatNumber);
        $newSheet->setCellValue("B$rowNum", $subjectName);
        $newSheet->setCellValue("C$rowNum", $materialName);
        $newSheet->setCellValue("D$rowNum", $hall);
        $newSheet->setCellValue("E$rowNum", $seat);
        $newSheet->setCellValue("F$rowNum", $stage);
        
        $rowNum++;
        $processed++;
    }
    
    // Save converted file
    $writer = new Xlsx($newSpreadsheet);
    $writer->save($outputFile);
    
    echo "\n✅ Conversion complete!\n";
    echo "Processed: $processed rows\n";
    if ($skipped > 0) {
        echo "Skipped: $skipped rows (missing required fields)\n";
    }
    echo "Output: $outputFile\n";
    echo "\n";
    echo "Default values used:\n";
    echo "- MaterialName: 'Book' (if not found)\n";
    echo "- Hall: 'A' (if not found)\n";
    echo "- Seat: SeatNumber (if not found)\n";
    echo "\n";
    echo "You can edit these in Excel before uploading.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

