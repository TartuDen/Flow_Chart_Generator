// bmrGenerator.js
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } from "docx";
import fs from "fs";
import { processInstructions } from "./operations.js";
import { DOCX_TAB } from "./settings.js";

// Global constant to replace [project/TP code]
const TAB = DOCX_TAB;

// Helper: Splits a text block by newline into an array of Paragraphs.
function createParagraphs(text) {
  return text.split("\n").map((line) => new Paragraph(line));
}

/**
 * Custom substitution for placeholders other than [XX-XX]:
 * - Replaces [name] with op.reagentName.
 * - Replaces [project/TP code] with TAB.
 * - For any other placeholder like [Target Temp] (ignoring punctuation and case),
 *   look up the matching key in op.parameterValue.
 *   If the value is "NA" or missing, return an empty string.
 */
function substituteTemplate(template, op) {
  let result = template;
  // Replace [name]
  if (op.reagentName) {
    result = result.replace(/\[name\]/g, op.reagentName);
  }
  // Replace [project/TP code]
  result = result.replace(/\[project\/TP code\]/g, TAB);
  // Replace other placeholders (but leave "[XX-XX]" untouched)
  result = result.replace(/\[([^\]]+)\]/g, (match, p1) => {
    if (p1.trim() === "XX-XX") return match; // leave as is for later processing
    // Normalize placeholder text (remove dots, lowercase)
    const normPlaceholder = p1.toLowerCase().replace(/\./g, "").trim();
    if (!op.parameterValue) return "";
    for (const key in op.parameterValue) {
      const normKey = key.toLowerCase().replace(/\./g, "").trim();
      if (normKey === normPlaceholder) {
        const val = op.parameterValue[key];
        return val.trim().toUpperCase() === "NA" ? "" : val;
      }
    }
    return "";
  });
  return result;
}

/**
 * For lines containing "[XX-XX]" (typically appended by a unit in the template),
 * we use a mapping to know which parameter key should be substituted.
 * If the parameter exists and is not "NA", we perform the substitution.
 * For example, in the "loading-Solid" template, the line:
 *    "4. Set stirring rate in reactor 002-XX to [XX-XX]rpm."
 * will look for the parameter "Stirring". If its value already includes "rpm",
 * then we replace the entire substring "[XX-XX]rpm" with that value.
 */
const placeholderMap = [
  {
    lineRegex: /stirring rate.*\[XX-XX\]rpm/i,
    paramKey: "Stirring",
    unit: "rpm"
  },
  {
    lineRegex: /argon flow.*\[XX-XX\]\s*L\/min/i,
    paramKey: "Argon flow",
    unit: "L/min"
  },
  {
    lineRegex: /adjust pH.*\[XX-XX\]/i,
    paramKey: "pH",
    unit: ""
  }
  // (Add more mappings here if needed.)
];

/**
 * Processes the template line by line:
 * - First, it replaces placeholders (other than [XX-XX]) using substituteTemplate.
 * - Then, for each line that contains "[XX-XX]", it checks our mapping.
 *   If a mapping is found and the corresponding parameter exists (and is not "NA"),
 *   it replaces the placeholder.
 *   For the "unit" lines (like "[XX-XX]rpm"), if the parameter value already contains the unit,
 *   it replaces the entire "[XX-XX]rpm" substring.
 *   If the parameter is missing or "NA", that line is dropped.
 */
function applyLineByLineSubstitution(template, op) {
  // First, do the general substitution.
  let substituted = substituteTemplate(template, op);
  const lines = substituted.split("\n");
  const resultLines = [];

  for (const line of lines) {
    if (/\[XX-XX\]/i.test(line)) {
      const rule = placeholderMap.find((r) => r.lineRegex.test(line));
      if (rule) {
        const paramVal = findParamValue(op, rule.paramKey);
        if (paramVal) {
          let newLine;
          // For unit-appended lines, check if paramVal already contains the unit.
          if (rule.unit && line.includes(`[XX-XX]${rule.unit}`) && paramVal.toLowerCase().includes(rule.unit.toLowerCase())) {
            newLine = line.replace(`[XX-XX]${rule.unit}`, paramVal);
          } else {
            newLine = line.replace("[XX-XX]", paramVal);
          }
          resultLines.push(newLine);
        }
      } else {
        resultLines.push(line);
      }
    } else {
      resultLines.push(line);
    }
  }
  return resultLines.join("\n");
}

/**
 * Finds a parameter value in op.parameterValue for a given paramKey (case-insensitive).
 * Returns null if not found or if value is "NA".
 */
function findParamValue(op, paramKey) {
  if (!op.parameterValue) return null;
  for (const key in op.parameterValue) {
    if (key.trim().toLowerCase() === paramKey.trim().toLowerCase()) {
      const val = op.parameterValue[key].trim();
      if (val.toUpperCase() === "NA" || val === "") return null;
      return val;
    }
  }
  return null;
}

/**
 * Looks up the template from processInstructions using op.activityName.
 * If not found, falls back to op.description.
 */
function getTemplate(op) {
  if (op.activityName && processInstructions[op.activityName]) {
    return processInstructions[op.activityName].description;
  }
  return op.description || "";
}

/**
 * Builds the "Actual Data" text for Column 3.
 * For each parameter (except "Amount"), a new line is created.
 * A unit is appended based on a mapping (if available). If a parameter's value is "NA", it is skipped.
 */
function buildActualData(op) {
  const unitMap = {
    "stirring": "rpm",
    "stirring, critical for the process!!!": "rpm",
    "argon flow": "L/min",
    "pH": "",
    "temp. of rm": "°C",
    "set temp": "°C",
    "target temp": "°C",
    "time": ""
    // Add other mappings as needed.
  };

  const lines = [];
  if (!op.parameterValue) return "";
  for (const key in op.parameterValue) {
    if (key.toLowerCase() === "amount") continue;
    const val = op.parameterValue[key].trim();
    if (val.toUpperCase() === "NA" || val === "") continue;
    const unit = unitMap[key.toLowerCase()] || "";
    const line = `Actual ${key}: __________${unit ? " " + unit : ""};`;
    lines.push(line);
  }
  return lines.join("\n");
}

/**
 * Creates a DOCX file with a three‑column table:
 *   Column 1: Description (based on the template from operations.js—matched by op.activityName—
 *             with line‐by‐line substitution applied)
 *   Column 2: Times (formatted as 4 separate lines: "Start:", "__:__", "End:", "__:__")
 *   Column 3: Actual Data (one line per parameter, with units appended if available)
 */
export async function generateBmrDocx(operations, outputFilePath) {
  const rows = [];

  // Header row.
  const headerCells = [
    new TableCell({
      children: [new Paragraph("Description")],
      width: { size: 40, type: WidthType.PERCENTAGE },
    }),
    new TableCell({
      children: [new Paragraph("Times")],
      width: { size: 30, type: WidthType.PERCENTAGE },
    }),
    new TableCell({
      children: [new Paragraph("Actual Data")],
      width: { size: 30, type: WidthType.PERCENTAGE },
    }),
  ];
  rows.push(new TableRow({ children: headerCells }));

  // Process each operation.
  operations.forEach((op) => {
    const baseTemplate = getTemplate(op);
    // Apply our line-by-line substitution for [XX-XX] placeholders.
    const finalDescription = applyLineByLineSubstitution(baseTemplate, op);
    // Times column (formatted in 4 lines).
    const timesText = "Start:\n__:__\nEnd:\n__:__";
    // Actual Data column.
    const actualDataText = buildActualData(op);

    const rowCells = [
      new TableCell({
        children: createParagraphs(finalDescription),
      }),
      new TableCell({
        children: createParagraphs(timesText),
      }),
      new TableCell({
        children: createParagraphs(actualDataText),
      }),
    ];
    rows.push(new TableRow({ children: rowCells }));
  });

  // Build table and document.
  const table = new Table({
    rows: rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
  const doc = new Document({
    sections: [
      {
        children: [table],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputFilePath, buffer);
  console.log(`BMR DOCX file saved to ${outputFilePath}`);
}
