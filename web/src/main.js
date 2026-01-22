import "./style.css";
import * as XLSX from "xlsx";
import { EXCEL_COLUMNS } from "./settings.js";
import { generateFlowChartXML } from "./xmlGenerator.js";
import {
  generateBmrDocxBlob,
  generateOperationsDocxBlob,
} from "./bmrGenerator.js";

const fileInput = document.getElementById("excelFile");
const sheetSelect = document.getElementById("sheetSelect");
const includeXml = document.getElementById("includeXml");
const includeBmr = document.getElementById("includeBmr");
const includeJson = document.getElementById("includeJson");
const includeOpsDocx = document.getElementById("includeOpsDocx");
const generateBtn = document.getElementById("generateBtn");
const statusEl = document.getElementById("status");

let workbook = null;
let baseFileName = "flow-chart";

const setStatus = (message, kind = "info") => {
  statusEl.textContent = message;
  statusEl.dataset.kind = kind;
};

const sanitizeName = (value) =>
  value.replace(/[\\/:*?"<>|]+/g, "-").trim();

const formatDate = () => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const isMissingParamValue = (value) => {
  if (value === null || value === undefined) return true;
  const trimmed = String(value).trim();
  return !trimmed || trimmed.toUpperCase() === "NA";
};

const appendComment = (op, comment) => {
  const trimmed = (comment || "").trim();
  if (!trimmed) return;
  if (!op.comments) {
    op.comments = trimmed;
  } else {
    op.comments += `; ${trimmed}`;
  }
};

function parseExcelOperations(worksheet) {
  if (!worksheet || !worksheet["!ref"]) {
    throw new Error("Selected worksheet is empty.");
  }

  const range = XLSX.utils.decode_range(worksheet["!ref"]);
  const getCellValue = (rowIndex, colIndex) => {
    if (colIndex < 0) return "";
    const cell = worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })];
    if (!cell || cell.v === undefined || cell.v === null) return "";
    return String(cell.v).trim();
  };

  let headerRowIndex = -1;
  for (let r = range.s.r; r <= range.e.r; r++) {
    let found = false;
    for (let c = range.s.c; c <= range.e.c; c++) {
      if (getCellValue(r, c) === EXCEL_COLUMNS.synthesisStage) {
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
    throw new Error(`Header '${EXCEL_COLUMNS.synthesisStage}' was not found.`);
  }

  const headers = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    headers.push(getCellValue(headerRowIndex, c));
  }

  const colIndexByKey = {};
  const warnings = [];
  for (const [key, header] of Object.entries(EXCEL_COLUMNS)) {
    const idx = headers.indexOf(header);
    colIndexByKey[key] = idx;
    if (idx === -1) warnings.push(`Column '${header}' not found.`);
  }

  const watchCols = Array.from(
    new Set(Object.values(colIndexByKey).filter((idx) => idx >= 0))
  );

  const operations = [];
  let currentOp = null;
  let opNumber = 1;

  const addCriticalityFlags = (op, paramKey, rowIndex) => {
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
  };

  for (let r = headerRowIndex + 1; r <= range.e.r; r++) {
    if (!watchCols.some((c) => getCellValue(r, c))) continue;

    const synthesisStageCell = getCellValue(r, colIndexByKey.synthesisStage);

    if (synthesisStageCell) {
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

      const paramKey = getCellValue(r, colIndexByKey.parameter);
      const paramVal = getCellValue(r, colIndexByKey.value);
      if (paramKey && !isMissingParamValue(paramVal)) {
        currentOp.parameterValue[paramKey] = paramVal;
        addCriticalityFlags(currentOp, paramKey, r);
      }
    } else if (currentOp) {
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

  return { operations, warnings };
}

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    workbook = null;
    sheetSelect.innerHTML = `<option value="">Select a workbook first</option>`;
    sheetSelect.disabled = true;
    generateBtn.disabled = true;
    setStatus("");
    return;
  }

  try {
    const data = await file.arrayBuffer();
    workbook = XLSX.read(data, { type: "array" });
    sheetSelect.innerHTML = "";
    workbook.SheetNames.forEach((name, index) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = `${index + 1}: ${name}`;
      sheetSelect.appendChild(option);
    });
    sheetSelect.disabled = false;
    generateBtn.disabled = false;
    baseFileName = sanitizeName(file.name.replace(/\.[^/.]+$/, "")) || "flow-chart";
    setStatus(`Loaded "${file.name}". Choose a worksheet.`, "ok");
  } catch (error) {
    workbook = null;
    sheetSelect.disabled = true;
    generateBtn.disabled = true;
    setStatus(`Could not read file: ${error.message}`, "error");
  }
});

generateBtn.addEventListener("click", async () => {
  if (!workbook) {
    setStatus("Please select an Excel file first.", "error");
    return;
  }

  const sheetName = sheetSelect.value;
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    setStatus("Selected worksheet not found.", "error");
    return;
  }

  try {
    const { operations, warnings } = parseExcelOperations(worksheet);
    if (!operations.length) {
      setStatus("No operations were parsed from this worksheet.", "error");
      return;
    }

    if (warnings.length) {
      setStatus(`Warnings: ${warnings.join(" ")}`, "info");
    } else {
      setStatus(`Parsed ${operations.length} operations.`, "ok");
    }

    const safeSheetName = sanitizeName(sheetName) || baseFileName;
    if (!includeXml.checked && !includeBmr.checked && !includeJson.checked && !includeOpsDocx.checked) {
      setStatus("Select at least one output to generate.", "error");
      return;
    }

    if (includeXml.checked) {
      const xml = generateFlowChartXML(operations);
      downloadBlob(new Blob([xml], { type: "text/xml" }), `${safeSheetName}.xml`);
    }

    if (includeJson.checked) {
      const json = JSON.stringify(operations, null, 2);
      downloadBlob(
        new Blob([json], { type: "application/json" }),
        `${safeSheetName}_operations.json`
      );
    }

    if (includeBmr.checked) {
      const bmrBlob = await generateBmrDocxBlob(operations, sheetName);
      downloadBlob(bmrBlob, `${safeSheetName}_BMR.docx`);
    }

    if (includeOpsDocx.checked) {
      const opsBlob = await generateOperationsDocxBlob();
      downloadBlob(opsBlob, `operations_${formatDate()}.docx`);
    }
  } catch (error) {
    setStatus(`Generation failed: ${error.message}`, "error");
  }
});
