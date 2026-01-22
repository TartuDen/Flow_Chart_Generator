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

const DEBUG_PARSE = process.env.DEBUG_PARSE === "1";

/**
 * Reads an Excel file and parses the operations.
 * Each operation is defined by a non-empty cell in the "Synthesis stage" column.
 */
function parseExcelOperations(filePath, sheetName) {
  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    console.error(`ERROR: sheet '${sheetName}' not found in workbook.`);
    return [];
  }

  const range = xlsx.utils.decode_range(worksheet["!ref"]);

  const getCellValue = (rowIndex, colIndex) => {
    if (colIndex < 0) return "";
    const cell = worksheet[xlsx.utils.encode_cell({ r: rowIndex, c: colIndex })];
    if (!cell || cell.v === undefined || cell.v === null) return "";
    return String(cell.v).trim();
  };

  // Find the header row using the synthesis stage column from settings.
  let headerRowIndex = -1;
  for (let r = range.s.r; r <= range.e.r; r++) {
    let found = false;
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellVal = getCellValue(r, c);
      if (cellVal === EXCEL_COLUMNS.synthesisStage) {
        found = true;
        break;
      }
    }
    if (found) {
      headerRowIndex = r;
      break;
    }
  }
  if (headerRowIndex === -1) {
    console.error(`ERROR: '${EXCEL_COLUMNS.synthesisStage}' header not found!`);
    return [];
  }

  const headers = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    headers.push(getCellValue(headerRowIndex, c));
  }

  const colIndexByKey = {};
  for (const [key, header] of Object.entries(EXCEL_COLUMNS)) {
    const idx = headers.indexOf(header);
    colIndexByKey[key] = idx;
    if (idx === -1) {
      console.warn(`WARN: column '${header}' not found.`);
    }
  }
  const watchCols = Array.from(
    new Set(Object.values(colIndexByKey).filter((idx) => idx >= 0)),
  );

  const operations = [];
  let currentOp = null;
  let opNumber = 1;

  const appendComment = (op, comment) => {
    const trimmed = (comment || "").trim();
    if (!trimmed) return;
    if (!op.comments) {
      op.comments = trimmed;
    } else {
      op.comments += `; ${trimmed}`;
    }
  };
  const isMissingParamValue = (value) => {
    if (value === null || value === undefined) return true;
    const trimmed = String(value).trim();
    return !trimmed || trimmed.toUpperCase() === "NA";
  };

  // Process each row below the header.
  for (let r = headerRowIndex + 1; r <= range.e.r; r++) {
    if (!watchCols.some((c) => getCellValue(r, c))) continue;

    const synthesisStageCell = getCellValue(r, colIndexByKey.synthesisStage);

    if (synthesisStageCell) {
      // A new operation starts.
      if (currentOp) operations.push(currentOp);

      currentOp = {
        opNumber: opNumber++,
        activityName: getCellValue(r, colIndexByKey.activityName) || null,
        activityType: getCellValue(r, colIndexByKey.activityType) || null,
        description: getCellValue(r, colIndexByKey.description) || null,
        reagentName: getCellValue(r, colIndexByKey.reagentName) || null,
        parameterValue: {},
        parameterCriticalities: {},
        expectedVolume: getCellValue(r, colIndexByKey.expectedVolume) || null,
        equipment:
          getCellValue(r, colIndexByKey.equipment1) ||
          getCellValue(r, colIndexByKey.equipment2) ||
          null,
        comments: null,
      };
      appendComment(currentOp, getCellValue(r, colIndexByKey.comments));

      // Fill in parameter and value.
      const paramKey = getCellValue(r, colIndexByKey.parameter);
      const paramVal = getCellValue(r, colIndexByKey.value);
      if (paramKey && !isMissingParamValue(paramVal)) {
        currentOp.parameterValue[paramKey] = paramVal;
        addCriticalityFlags(currentOp, paramKey, r);
      }
    } else {
      // Continuation row for the current operation.
      if (!currentOp) continue;

      appendComment(currentOp, getCellValue(r, colIndexByKey.comments));

      const paramKey = getCellValue(r, colIndexByKey.parameter);
      const paramVal = getCellValue(r, colIndexByKey.value);
      if (paramKey && !isMissingParamValue(paramVal)) {
        currentOp.parameterValue[paramKey] = paramVal;
        addCriticalityFlags(currentOp, paramKey, r);
      }
    }
  }
  if (currentOp) operations.push(currentOp);

  /**
   * Checks CP, PC, CY columns in a row and sets criticality flags.
   */
  function addCriticalityFlags(op, paramKey, rowIndex) {
    const flags = [];
    const colCP = colIndexByKey.cp;
    const colPC = colIndexByKey.pc;
    const colCY = colIndexByKey.cy;
    if (colCP >= 0 && getCellValue(rowIndex, colCP).match(/x/i)) flags.push("CP");
    if (colPC >= 0 && getCellValue(rowIndex, colPC).match(/x/i)) flags.push("PC");
    if (colCY >= 0 && getCellValue(rowIndex, colCY).match(/x/i)) flags.push("CY");
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
  if (DEBUG_PARSE) {
    console.log("Parsed Operations:\n", JSON.stringify(operations, null, 2));
  } else {
    console.log(`Parsed ${operations.length} operations.`);
  }
  const operationsJsonPath = path.join(
    GENERATED_FILES_DIR,
    `${EXCEL_TAB}_operations.json`,
  );
  fs.writeFileSync(
    operationsJsonPath,
    JSON.stringify(operations, null, 2),
    "utf-8",
  );
  console.log(`Operations JSON saved to ${operationsJsonPath}`);

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
