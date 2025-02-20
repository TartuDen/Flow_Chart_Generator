import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } from "docx";
import fs from "fs";
import { processInstructions } from "./operations.js";
import { DOCX_TAB } from "./settings.js";

// This is the project/TP code
const TAB = DOCX_TAB;

/**
 * Utility: build an array of Paragraph objects for each line of text.
 */
function createParagraphs(text) {
  return text.split("\n").map((line) => new Paragraph(line));
}

/**
 * Checks if this parameter is flagged in op.parameterCriticalities (e.g., CP, PC, or CY).
 */
function getCriticalityWarning(op, placeholder) {
  if (!op.parameterCriticalities) return "";
  // We normalize placeholder by removing dots and trimming
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
 * Helper to find a parameter value for a given placeholder name,
 * ignoring case and punctuation. Returns null if not found or if it's "NA".
 */
function findParamValue(op, placeholder) {
  if (!op.parameterValue) return null;

  // e.g. "Addition rate" => "additionrate"
  const normPlaceholder = placeholder.toLowerCase().replace(/\./g, "").trim();

  for (const key in op.parameterValue) {
    const normKey = key.toLowerCase().replace(/\./g, "").trim();
    if (normKey === normPlaceholder) {
      const val = op.parameterValue[key].trim();
      // If it's "NA" or empty, treat as if not present
      if (val.toUpperCase() === "NA" || val === "") {
        return null;
      }
      return val;
    }
  }
  return null;
}

/**
 * Main function to apply placeholders from `processInstructions[op.activityName].description`
 * with actual data from `op.parameterValue`.
 *
 * RULES:
 * - If a line contains one or more placeholders, and *any* of those placeholders is missing or "NA",
 *   the entire line is omitted.
 * - Otherwise, placeholders are replaced with the actual parameter. If a parameter is flagged CP/PC/CY,
 *   a warning is appended in brackets.
 * - After lines are processed, lines that start with numbering like "1. ...", "2. ..." are automatically
 *   re-numbered in ascending order (1., 2., 3., …).
 */
function applyLineByLineSubstitution(template, op) {
  // Split the template text into lines
  const lines = template.split("\n");
  const finalLines = [];

  // We'll parse line-by-line
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let removeLine = false; // If true => we skip this line entirely

    // Find *all* placeholders: [some text]
    // Use matchAll so we can iterate
    const placeholders = [...line.matchAll(/\[([^\]]+)\]/g)];

    // We will build up the new line as we do replacements
    let newLine = line;

    for (const phMatch of placeholders) {
      const fullMatch = phMatch[0];    // e.g. "[Addition rate]"
      const phContent = phMatch[1];    // e.g. "Addition rate"

      // Special check for "[project/TP code]" or "[name]" first:
      if (phContent.trim().toLowerCase() === "project/tp code") {
        // Replace with TAB
        newLine = newLine.replace(fullMatch, TAB);
        continue;
      }
      if (phContent.trim().toLowerCase() === "name" && op.reagentName) {
        newLine = newLine.replace(fullMatch, op.reagentName);
        continue;
      }

      // Otherwise, we interpret it as a parameter placeholder,
      // except if it's exactly "[XX-XX]" which your old code handles separately.
      if (phContent.trim() === "XX-XX") {
        // If you want special logic for "[XX-XX]", do that here,
        // OR decide that if there's no param value, remove line.
        // For simplicity, let's remove the line if "XX-XX" can't be substituted meaningfully
        // (But you can adapt to your old logic if needed.)
        // E.g. we might map "[XX-XX]" => param "Stirring" if the line says "stirring rate [XX-XX]".
        // Up to you how you want to handle it:
        // For now, let's just skip removing the line unless you decide there's no param for it.
        // ...
        continue;
      } else {
        // Generic case: look up the parameter
        const paramVal = findParamValue(op, phContent);
        if (!paramVal) {
          // Means we don't have a valid value => remove the line
          removeLine = true;
          break; // No need to check more placeholders on this line
        } else {
          // We do have a real value => do the substitution
          const warn = getCriticalityWarning(op, phContent);
          newLine = newLine.replace(fullMatch, paramVal + warn);
        }
      }
    } // end for placeholders

    if (!removeLine) {
      // If we haven't flagged line for removal, push it in final lines
      finalLines.push(newLine);
    }
  }

  // Now we do a pass to re‑number lines if they start with e.g. "1. ", "2. "
  let numberingCounter = 1;
  const reNumberedLines = finalLines.map((l) => {
    // Trim left to check if there's a leading number
    // e.g. "9. Note addition rate..."
    const trimmed = l.trimStart();
    // If the line starts with \d+. (like "9.") we want to remove that
    // and re-insert the correct numbering
    const match = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (match) {
      // We found a leading number
      const lineBody = match[2]; // Everything after "9. "
      return `${numberingCounter++}. ${lineBody}`;
    } else {
      return l; // no change
    }
  });

  // Join them back to a single string
  return reNumberedLines.join("\n");
}

/**
 * Retrieves the template from `processInstructions` based on op.activityName, 
 * or fallback to the `description` in the Excel object if not found.
 */
function getTemplate(op) {
  if (op.activityName && processInstructions[op.activityName]) {
    return processInstructions[op.activityName].description;
  }
  // Fallback if no matching activityName in processInstructions
  return op.description || "";
}

/**
 * Builds the "Actual Data" text for Column 3 (Times or values to be recorded by the operator).
 * (Optional logic: if you prefer your existing approach, keep it or adapt as needed.)
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
    "time": "",
    // etc. Add whatever keys you like
  };

  const lines = [];
  if (!op.parameterValue) return "";

  for (const key in op.parameterValue) {
    const val = op.parameterValue[key].trim();
    if (val.toUpperCase() === "NA" || val === "") continue;
    const unit = unitMap[key.toLowerCase()] || "";
    lines.push(`Actual ${key}: __________${unit ? " " + unit : ""};`);
  }
  return lines.join("\n");
}

/**
 * Creates and saves a DOCX file with a 3-column table (Description, Times, Actual Data).
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

  // For each operation, build one table row
  operations.forEach((op) => {
    // 1) Get the base template from operations.js or fallback to op.description
    const template = getTemplate(op);

    // 2) Apply line-by-line substitution:
    const finalDescription = applyLineByLineSubstitution(template, op);

    // 3) Example fixed text for the "Times" column
    const timesText = "Start:\n__:__\nEnd:\n__:__";

    // 4) Build "Actual Data" text
    const actualDataText = buildActualData(op);

    // Add the row
    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: createParagraphs(finalDescription) }),
          new TableCell({ children: createParagraphs(timesText) }),
          new TableCell({ children: createParagraphs(actualDataText) }),
        ],
      })
    );
  });

  // Build the table and the doc
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

  // Write to file
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputFilePath, buffer);
  console.log(`BMR DOCX file saved to ${outputFilePath}`);
}
