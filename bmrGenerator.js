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
 * Replaces [name], [project/TP code], etc.
 */
function substituteTemplate(template, op) {
  let result = template;
  if (op.reagentName) {
    result = result.replace(/\[name\]/g, op.reagentName);
  }
  result = result.replace(/\[project\/TP code\]/g, TAB);

  // Replace other placeholders (but keep [XX-XX] for a later pass).
  result = result.replace(/\[([^\]]+)\]/g, (match, p1) => {
    if (p1.trim() === "XX-XX") return match;
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
 * For lines with [XX-XX], we look up the parameter in placeholderMap, e.g. "Stirring" => "stirring rate [XX-XX]rpm".
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
            // If the paramVal already has the unit appended, replace the entire chunk.
            newLine = line.replace(`[XX-XX]${rule.unit}`, paramVal);
          } else {
            newLine = line.replace("[XX-XX]", paramVal);
          }
          resultLines.push(newLine);
        }
        // else skip line if paramVal is absent
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
 * Looks up paramKey in op.parameterValue, ignoring case.
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
 * If op.activityName is in processInstructions, use that template; else fallback to op.description.
 */
function getTemplate(op) {
  if (op.activityName && processInstructions[op.activityName]) {
    return processInstructions[op.activityName].description;
  }
  return op.description || "";
}

/**
 * In Column 3, for each parameter (except "Amount"), produce a line.
 * If the parameter is flagged as CP, PC, or CY, add a warning tag.
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
    if (key.toLowerCase() === "amount") continue; // skip amount
    const val = op.parameterValue[key].trim();
    if (val.toUpperCase() === "NA" || val === "") continue;

    // Check if there's a unit
    const unit = unitMap[key.toLowerCase()] || "";

    // Check if there's a criticality flag for this parameter
    let warnText = "";
    if (op.parameterCriticalities && op.parameterCriticalities[key]) {
      // e.g. ["CP", "CY"]
      const flags = op.parameterCriticalities[key];
      warnText = ` [WARNING: ${flags.join(", ")}]`;
    }

    const line = `Actual ${key}: __________${unit ? " " + unit : ""};${warnText}`;
    lines.push(line);
  }
  return lines.join("\n");
}

/**
 * Creates the DOCX table (3 columns).
 */
export async function generateBmrDocx(operations, outputFilePath) {
  const rows = [];

  // Header row
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

  // Each operation => one row
  operations.forEach((op) => {
    const baseTemplate = getTemplate(op);
    const finalDescription = applyLineByLineSubstitution(baseTemplate, op);
    const timesText = "Start:\n__:__\nEnd:\n__:__";
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

  // Build the table + doc
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
