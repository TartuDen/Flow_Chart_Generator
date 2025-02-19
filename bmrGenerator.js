// bmrGenerator.js
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } from "docx";
import fs from "fs";
import { processInstructions } from "./operations.js";
import { DOCX_TAB } from "./settings.js";

// Global constant to replace [project/TP code]
const TAB = DOCX_TAB;

function createParagraphs(text) {
  return text.split("\n").map((line) => new Paragraph(line));
}

/**
 * Returns a warning string (e.g., " [WARNING: CP, CY]") if the parameter (placeholder) is flagged 
 * in op.parameterCriticalities.
 */
function getCriticalityWarning(op, placeholder) {
  if (!op.parameterCriticalities) return "";
  const normPlaceholder = placeholder.toLowerCase().replace(/\./g, "").trim();
  for (const key in op.parameterCriticalities) {
    const normKey = key.toLowerCase().replace(/\./g, "").trim();
    if (normKey === normPlaceholder) {
      const flags = op.parameterCriticalities[key];
      if (flags && flags.length > 0) {
        return ` [WARNING, PARAMETER IS ${flags.join(", ")}]`;
      }
    }
  }
  return "";
}

/**
 * Performs general substitution for placeholders (other than [XX-XX]):
 * - Replaces [name] with op.reagentName.
 * - Replaces [project/TP code] with TAB.
 * - For any other placeholder (e.g. [Target Temp]), it looks up the matching parameter.
 *   If found and not "NA", it appends any criticality warning for that parameter.
 */
function substituteTemplate(template, op) {
  let result = template;
  // Replace [name]
  if (op.reagentName) {
    result = result.replace(/\[name\]/g, op.reagentName);
  }
  // Replace [project/TP code]
  result = result.replace(/\[project\/TP code\]/g, TAB);
  // Replace other placeholders (except "[XX-XX]")
  result = result.replace(/\[([^\]]+)\]/g, (match, p1) => {
    if (p1.trim() === "XX-XX") return match; // leave for later substitution
    const normPlaceholder = p1.toLowerCase().replace(/\./g, "").trim();
    if (!op.parameterValue) return "";
    for (const key in op.parameterValue) {
      const normKey = key.toLowerCase().replace(/\./g, "").trim();
      if (normKey === normPlaceholder) {
        const val = op.parameterValue[key];
        if (val.trim().toUpperCase() === "NA") return "";
        const warn = getCriticalityWarning(op, p1);
        return val + warn;
      }
    }
    return "";
  });
  return result;
}

/**
 * Mapping for [XX-XX] placeholders.
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
];

/**
 * Processes the template line by line.
 * For each line with "[XX-XX]", if a mapping rule exists and the corresponding parameter is found,
 * it replaces the placeholder and appends any criticality warning for that parameter.
 * If the parameter is missing or "NA", the line is dropped.
 */
function applyLineByLineSubstitution(template, op) {
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
          if (rule.unit && line.includes(`[XX-XX]${rule.unit}`) && paramVal.toLowerCase().includes(rule.unit.toLowerCase())) {
            newLine = line.replace(`[XX-XX]${rule.unit}`, paramVal);
          } else {
            newLine = line.replace("[XX-XX]", paramVal);
          }
          const warn = getCriticalityWarning(op, rule.paramKey);
          newLine += warn;
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
 * Finds a parameter value for a given paramKey (case-insensitive).
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
 * Retrieves the template from processInstructions based on op.activityName.
 */
function getTemplate(op) {
  if (op.activityName && processInstructions[op.activityName]) {
    return processInstructions[op.activityName].description;
  }
  return op.description || "";
}

/**
 * Builds the "Actual Data" text for Column 3.
 * (Warnings are now handled inline in Column 1.)
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
 * Creates the DOCX file with a three‑column table.
 * Column 1 now contains the template-based description with inline warnings.
 */
export async function generateBmrDocx(operations, outputFilePath) {
  const rows = [];

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

  operations.forEach((op) => {
    const baseTemplate = getTemplate(op);
    const finalDescription = applyLineByLineSubstitution(baseTemplate, op);
    const timesText = "Start:\n__:__\nEnd:\n__:__";
    const actualDataText = buildActualData(op);

    const rowCells = [
      new TableCell({ children: createParagraphs(finalDescription) }),
      new TableCell({ children: createParagraphs(timesText) }),
      new TableCell({ children: createParagraphs(actualDataText) }),
    ];
    rows.push(new TableRow({ children: rowCells }));
  });

  const table = new Table({
    rows: rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
  const doc = new Document({ sections: [{ children: [table] }] });
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputFilePath, buffer);
  console.log(`BMR DOCX file saved to ${outputFilePath}`);
}
