//BMR Generator Module

import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun } from "docx";
import fs from "fs";
import { processInstructions } from "./operations.js";
import { DOCX_TAB } from "./settings.js";

const TAB = DOCX_TAB;

/**
 * Updated: Replaces placeholders with parameter values wrapped in bold markers.
 * Also, if any placeholder is missing or "NA", the entire line is omitted.
 * Finally, numbered lines are re‑numbered with bold numbering.
 */
function applyLineByLineSubstitution(template, op) {
  const lines = template.split("\n");
  const finalLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let removeLine = false;
    const placeholders = [...line.matchAll(/\[([^\]]+)\]/g)];
    let newLine = line;

    for (const phMatch of placeholders) {
      const fullMatch = phMatch[0]; // e.g. "[Addition rate]"
      const phContent = phMatch[1];

      // Special handling for project/TP code and reagent name
      if (phContent.trim().toLowerCase() === "project/tp code") {
        newLine = newLine.replace(fullMatch, `<b>${TAB}</b>`);
        continue;
      }
      if (phContent.trim().toLowerCase() === "name" && op.reagentName) {
        newLine = newLine.replace(fullMatch, `<b>${op.reagentName}</b>`);
        continue;
      }

      if (phContent.trim() === "XX-XX") {
        continue;
      } else {
        const paramVal = findParamValue(op, phContent);
        if (!paramVal) {
          removeLine = true;
          break;
        } else {
          const warn = getCriticalityWarning(op, phContent);
          newLine = newLine.replace(fullMatch, `<b>${paramVal + warn}</b>`);
        }
      }
    }

    if (!removeLine) {
      finalLines.push(newLine);
    }
  }

  let numberingCounter = 1;
  const reNumberedLines = finalLines.map((l) => {
    // Remove any HTML tags for pattern matching
    const plain = l.replace(/<[^>]+>/g, "");
    const match = plain.trimStart().match(/^(\d+)\.\s+(.*)$/);
    if (match) {
      return `<b>${numberingCounter++}.</b> ${match[2]}`;
    } else {
      return l;
    }
  });

  return reNumberedLines.join("\n");
}

/**
 * Retrieves a warning string if the parameter is flagged.
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
 * Finds the actual parameter value for a given placeholder.
 */
function findParamValue(op, placeholder) {
  if (!op.parameterValue) return null;
  const normPlaceholder = placeholder.toLowerCase().replace(/\./g, "").trim();
  for (const key in op.parameterValue) {
    const normKey = key.toLowerCase().replace(/\./g, "").trim();
    if (normKey === normPlaceholder) {
      const val = op.parameterValue[key].trim();
      if (val.toUpperCase() === "NA" || val === "") {
        return null;
      }
      return val;
    }
  }
  return null;
}

/**
 * Retrieves the template from processInstructions or falls back to op.description.
 */
function getTemplate(op) {
  if (op.activityName && processInstructions[op.activityName]) {
    return processInstructions[op.activityName].description;
  }
  return op.description || "";
}

/**
 * Builds the "Actual Data" text for the third column.
 */
function buildActualData(op) {
  const unitMap = {
    "stirring": "rpm",
    "argon flow": "L/min",
    "pH": "",
    "temp. of rm": "°C",
    "set temp": "°C",
    "target temp": "°C",
    "time": "",
  };

  const lines = [];
  if (!op.parameterValue) return "";

  for (const key in op.parameterValue) {
    const val = op.parameterValue[key].trim();
    if (val.toUpperCase() === "NA" || val === "") continue;
    const unit = unitMap[key.toLowerCase()] || "";
    lines.push(`Actual ${key}: .........${unit ? " " + unit : ""};\n`);
  }
  return lines.join("\n");
}

/**
 * Parses a line that may include <b> markers and returns a formatted Paragraph.
 * Also ensures the very first word of the line is bold.
 */
function parseFormattedLine(line) {
  // Ensure the first word is bold if not already
  if (!line.trim().startsWith("<b>")) {
    const firstSpaceIndex = line.indexOf(" ");
    if (firstSpaceIndex > 0) {
      const firstWord = line.substring(0, firstSpaceIndex);
      const rest = line.substring(firstSpaceIndex);
      line = `<b>${firstWord}</b>${rest}`;
    } else {
      line = `<b>${line}</b>`;
    }
  }

  // Split the line into parts based on <b> and </b> markers
  const parts = line.split(/(<\/?b>)/);
  let boldFlag = false;
  const runs = [];
  for (const part of parts) {
    if (part === "<b>") {
      boldFlag = true;
    } else if (part === "</b>") {
      boldFlag = false;
    } else if (part.length > 0) {
      runs.push(new TextRun({ text: part, bold: boldFlag }));
    }
  }
  return new Paragraph({ children: runs });
}

/**
 * Creates an array of formatted Paragraph objects from the given text.
 */
function createFormattedParagraphs(text) {
  const lines = text.split("\n");
  return lines.map((line) => parseFormattedLine(line));
}

/**
 * Original helper to create plain paragraphs (used for non‑description columns).
 */
function createParagraphs(text) {
  return text.split("\n").map((line) => new Paragraph(line));
}

/**
 * Generates and saves a DOCX file with a 3‑column table.
 */
export async function generateBmrDocx(operations, outputFilePath) {
  const rows = [];

  // Table Header
  rows.push(
    new TableRow({
      children: [
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
      ],
    })
  );

  // For each operation, process the template and substitute placeholders.
  operations.forEach((op) => {
    const template = getTemplate(op);
    const finalDescription = applyLineByLineSubstitution(template, op);
    const timesText = "Start:\n__:__\nEnd:\n__:__";
    const actualDataText = buildActualData(op);

    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: createFormattedParagraphs(finalDescription) }),
          new TableCell({ children: createParagraphs(timesText) }),
          new TableCell({ children: createParagraphs(actualDataText) }),
        ],
      })
    );
  });

  const table = new Table({
    rows,
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