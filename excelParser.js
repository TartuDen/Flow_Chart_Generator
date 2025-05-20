// excelParser.js
import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { generateFlowChartXML } from "./xmlGenerator.js";
import { generateAllDocs } from "./bmrGenerator.js";
import {
  EXCEL_FILE_PATH,
  EXCEL_TAB,
  EXCEL_COLUMNS,
  GENERATED_FILES_DIR,
} from "./settings.js";

/**
 * Reads an Excel file and parses the operations.
 * Each operation is defined by a non-empty cell in the "Synthesis stage" column.
 */
function parseExcelOperations(filePath, sheetName) {
  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets[sheetName];
  const sheetData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  // Find the header row using the synthesis stage column from settings.
  const headerRowIndex = sheetData.findIndex((row) =>
    row.includes(EXCEL_COLUMNS.synthesisStage),
  );
  if (headerRowIndex === -1) {
    console.error(`ERROR: '${EXCEL_COLUMNS.synthesisStage}' header not found!`);
    return [];
  }

  const headers = sheetData[headerRowIndex];

  // Get the column indexes using the mapping.
  const colSynthesisStage = headers.indexOf(EXCEL_COLUMNS.synthesisStage);
  const colActivityName = headers.indexOf(EXCEL_COLUMNS.activityName);
  const colActivityType = headers.indexOf(EXCEL_COLUMNS.activityType);
  const colDescription = headers.indexOf(EXCEL_COLUMNS.description);
  const colReagentName = headers.indexOf(EXCEL_COLUMNS.reagentName);
  const colParameter = headers.indexOf(EXCEL_COLUMNS.parameter);
  const colValue = headers.indexOf(EXCEL_COLUMNS.value);
  const colExpectedVolume = headers.indexOf(EXCEL_COLUMNS.expectedVolume);
  const colEquipment1 = headers.indexOf(EXCEL_COLUMNS.equipment1);
  const colEquipment2 = headers.indexOf(EXCEL_COLUMNS.equipment2);

  // Find indexes for CP, PC, CY columns.
  const colCP = headers.indexOf(EXCEL_COLUMNS.cp);
  const colPC = headers.indexOf(EXCEL_COLUMNS.pc);
  const colCY = headers.indexOf(EXCEL_COLUMNS.cy);

  // ADDED: find index for comments
  const colComments = headers.indexOf(EXCEL_COLUMNS.comments);

  const operations = [];
  let currentOp = null;
  let opNumber = 1;

  // Helper to read a cell value safely.
  const getCellValue = (row, colIndex) => {
    if (colIndex < 0 || row[colIndex] === undefined) return "";
    return String(row[colIndex]).trim();
  };

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
        parameterCriticalities: {},
        expectedVolume: getCellValue(row, colExpectedVolume) || null,
        equipment:
          getCellValue(row, colEquipment1) ||
          getCellValue(row, colEquipment2) ||
          null,
        comments: getCellValue(row, colComments) || null, // ADDED: store comments
      };

      // Fill in parameter and value.
      const paramKey = getCellValue(row, colParameter);
      const paramVal = getCellValue(row, colValue);
      if (paramKey) {
        currentOp.parameterValue[paramKey] = paramVal;
        addCriticalityFlags(currentOp, paramKey, row);
      }
    } else {
      // Continuation row for the current operation.
      if (!currentOp) continue;

      const paramKey = getCellValue(row, colParameter);
      const paramVal = getCellValue(row, colValue);
      if (paramKey) {
        currentOp.parameterValue[paramKey] = paramVal;
        addCriticalityFlags(currentOp, paramKey, row);
      }
    }
  }
  if (currentOp) operations.push(currentOp);

  /**
   * Checks CP, PC, CY columns in a row and sets criticality flags.
   */
  function addCriticalityFlags(op, paramKey, row) {
    const flags = [];
    if (colCP >= 0 && getCellValue(row, colCP).match(/x/i)) flags.push("CP");
    if (colPC >= 0 && getCellValue(row, colPC).match(/x/i)) flags.push("PC");
    if (colCY >= 0 && getCellValue(row, colCY).match(/x/i)) flags.push("CY");
    if (flags.length > 0) {
      op.parameterCriticalities[paramKey] = flags;
    }
  }

  return operations;
}

// --- MAIN EXECUTION ---
(async () => {
  // Ensure our output directory exists
  if (!fs.existsSync(GENERATED_FILES_DIR)) {
    fs.mkdirSync(GENERATED_FILES_DIR, { recursive: true });
  }

  // 1) Parse operations from Excel
  const operations = parseExcelOperations(EXCEL_FILE_PATH, EXCEL_TAB);
  console.log("Parsed Operations:\n", JSON.stringify(operations, null, 2));

  // 2) Generate the mxGraph XML.
  const xmlOutput = generateFlowChartXML(operations);
  const xmlFile = path.join(GENERATED_FILES_DIR, `${EXCEL_TAB}.xml`);
  fs.writeFileSync(xmlFile, xmlOutput, "utf-8");
  console.log(`XML diagram saved to ${xmlFile}`);

  // 3) Generate both DOCX files (BMR + operations list)
  const bmrFilename = `${EXCEL_TAB}_BMR.docx`;
  await generateAllDocs(operations, bmrFilename);
  console.log("✅ BMR and operations DOCX files generated.");
})();
