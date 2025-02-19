// excelParser.js
import xlsx from 'xlsx';
import fs from 'fs';
import { generateFlowChartXML } from './xmlGenerator.js';
import { generateBmrDocx } from './bmrGenerator.js';
import { EXCEL_FILE_PATH, EXCEL_TAB } from './settings.js';

/**
 * Reads an Excel file and parses the operations.
 * Each operation is defined by a non-empty cell in the "Synthesis stage" column.
 */
function parseExcelOperations(filePath, sheetName) {
  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets[sheetName];
  const sheetData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  // Find the header row (the one that contains "Synthesis stage").
  const headerRowIndex = sheetData.findIndex((row) => row.includes('Synthesis stage'));
  if (headerRowIndex === -1) {
    console.error("ERROR: 'Synthesis stage' header not found!");
    return [];
  }

  const headers = sheetData[headerRowIndex];

  // Get the column indexes.
  const colSynthesisStage = headers.indexOf('Synthesis stage');
  const colActivityName   = headers.indexOf('Activity name');
  const colActivityType   = headers.indexOf('Activity type');
  const colDescription    = headers.indexOf('Description');
  const colReagentName    = headers.indexOf('Reagent name');
  const colParameter      = headers.indexOf('parameter');
  const colValue          = headers.indexOf('value');
  const colExpectedVolume = headers.indexOf('Expected Volume');
  const colEquipment1     = headers.indexOf('Equipment code 1');
  const colEquipment2     = headers.indexOf('Equipment code 2');

  // NEW: Find indexes for CP, PC, CY columns (these may or may not exist).
  const colCP = headers.indexOf('CP'); // “Critical Parameter”
  const colPC = headers.indexOf('PC'); // “Potentially Critical”
  const colCY = headers.indexOf('CY'); // “Critical to Yield”

  const operations = [];
  let currentOp = null;
  let opNumber = 1;

  // Helper to read a cell value safely.
  function getCellValue(row, colIndex) {
    if (colIndex < 0 || row[colIndex] === undefined) return '';
    return String(row[colIndex]).trim();
  }

  // Process each row below the header.
  for (let i = headerRowIndex + 1; i < sheetData.length; i++) {
    const row = sheetData[i];
    if (!row || row.length === 0) continue;

    const synthesisStageCell = getCellValue(row, colSynthesisStage);

    if (synthesisStageCell) {
      // A new operation starts.
      if (currentOp) operations.push(currentOp);
      currentOp = {
        opNumber: opNumber++,
        activityName: getCellValue(row, colActivityName) || null,
        activityType: getCellValue(row, colActivityType) || null,
        description: getCellValue(row, colDescription) || null,
        reagentName: getCellValue(row, colReagentName) || null,
        parameterValue: {},
        // NEW: store criticalities in a separate object keyed by parameter
        parameterCriticalities: {},
        expectedVolume: getCellValue(row, colExpectedVolume) || null,
        equipment:
          getCellValue(row, colEquipment1) ||
          getCellValue(row, colEquipment2) ||
          null
      };

      // Fill in parameter and value
      const paramKey = getCellValue(row, colParameter);
      const paramVal = getCellValue(row, colValue);
      if (paramKey) {
        currentOp.parameterValue[paramKey] = paramVal;
        // Also check if CP / PC / CY columns have an 'x'
        addCriticalityFlags(currentOp, paramKey, row);
      }
    } else {
      // Continuation row for the current operation.
      if (!currentOp) continue;

      const paramKey = getCellValue(row, colParameter);
      const paramVal = getCellValue(row, colValue);
      if (paramKey) {
        currentOp.parameterValue[paramKey] = paramVal;
        // also check CP/PC/CY
        addCriticalityFlags(currentOp, paramKey, row);
      }
    }
  }
  if (currentOp) operations.push(currentOp);

  /**
   * Helper function that checks CP, PC, CY columns in "row"
   * and, if present, sets a note in currentOp.parameterCriticalities[paramKey].
   */
  function addCriticalityFlags(op, paramKey, row) {
    // If your CP/PC/CY columns don't exist (== -1), skip them.
    let flags = [];

    if (colCP >= 0) {
      const cpVal = getCellValue(row, colCP);
      if (cpVal.match(/x/i)) flags.push("CP");
    }
    if (colPC >= 0) {
      const pcVal = getCellValue(row, colPC);
      if (pcVal.match(/x/i)) flags.push("PC");
    }
    if (colCY >= 0) {
      const cyVal = getCellValue(row, colCY);
      if (cyVal.match(/x/i)) flags.push("CY");
    }

    // If we found at least one flag, store it under op.parameterCriticalities[paramKey]
    if (flags.length > 0) {
      op.parameterCriticalities[paramKey] = flags; // e.g. [ "CP", "CY" ]
    }
  }

  return operations;
}

// --- MAIN EXECUTION ---

const operations = parseExcelOperations(EXCEL_FILE_PATH, EXCEL_TAB);
console.log('Parsed Operations:\n', JSON.stringify(operations, null, 2));

// 1. Generate the mxGraph XML.
const xmlOutput = generateFlowChartXML(operations);
const xmlFile = `${EXCEL_TAB}.xml`;
fs.writeFileSync(xmlFile, xmlOutput, 'utf-8');
console.log(`XML diagram saved to ${xmlFile}`);

// 2. Generate the BMR DOCX file.
const docxFile = `${EXCEL_TAB}_BMR.docx`;
generateBmrDocx(operations, docxFile);
