import xlsx from 'xlsx';
import fs from 'fs';
import { generateFlowChartXML } from './xmlGenerator.js';
import { generateBmrDocx } from './bmrGenerator.js';

// Update these constants to match your Excel file and sheet.
const filePath = "excel_test.xlsm";
const tab = 'TP.2 ATI';

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
        expectedVolume: getCellValue(row, colExpectedVolume) || null,
        equipment:
          getCellValue(row, colEquipment1) ||
          getCellValue(row, colEquipment2) ||
          null
      };

      const paramKey = getCellValue(row, colParameter);
      const paramVal = getCellValue(row, colValue);
      if (paramKey) {
        currentOp.parameterValue[paramKey] = paramVal;
      }
    } else {
      // Continuation row for the current operation.
      if (!currentOp) continue;
      const paramKey = getCellValue(row, colParameter);
      const paramVal = getCellValue(row, colValue);
      if (paramKey) {
        currentOp.parameterValue[paramKey] = paramVal;
      }
    }
  }
  if (currentOp) operations.push(currentOp);
  return operations;
}

// --- MAIN EXECUTION ---

const operations = parseExcelOperations(filePath, tab);
console.log('Parsed Operations:\n', JSON.stringify(operations, null, 2));

// 1. Generate the mxGraph XML.
const xmlOutput = generateFlowChartXML(operations);
const xmlFile = `${tab}.xml`;
fs.writeFileSync(xmlFile, xmlOutput, 'utf-8');
console.log(`XML diagram saved to ${xmlFile}`);

// 2. Generate the BMR DOCX file.
const docxFile = `${tab}_BMR.docx`;
generateBmrDocx(operations, docxFile);
