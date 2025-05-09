/****************************************************
 * bmrGenerator.js
 ****************************************************/
import fs from "fs";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  TextRun,
} from "docx";
import { processInstructions } from "./operations.js";
import { DOCX_TAB, BMR_OPTIONS, ACTUAL_DATA } from "./settings.js";

/**
 * MAIN PUBLIC FUNCTION: generateBmrDocx(operations, outputFilePath)
 * ---------------------------------------------------------------
 * Generates a 4-column DOCX table from the given operations array.
 */
export async function generateBmrDocx(operations, outputFilePath) {
  const rows = [];

  // 4-column header row
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph("OP. NUMBER")],
          width: { size: 10, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph("Description")],
          width: { size: 40, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph("Times")],
          width: { size: 20, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph("Actual Data")],
          width: { size: 30, type: WidthType.PERCENTAGE },
        }),
      ],
    })
  );

  // Build table rows for each operation
  for (const op of operations) {
    const templateText = getTemplate(op);

    // 1) Placeholder substitution + line removal + line numbering
    const { text: finalDescription, placeholdersUsed } =
      applyLineByLineSubstitution(templateText, op);

    // 2) Optionally bold the first word of the description.
    let descriptionWithFirstWordBold =
      boldFirstWordOfFullDescription(finalDescription);

    // APPEND COMMENT INFO AT THE VERY END OF DESCRIPTION, IF PRESENT.
    if (op.comments) {
      descriptionWithFirstWordBold += `\nCOMMENT INFO: ${op.comments}`;
    }

    // 3) Build the Actual Data column from placeholders used
    const actualDataText = buildActualData(placeholdersUsed);

    // 4) The "Times" column
    const timesText = "Start:\n__:__\nEnd:\n__:__";

    rows.push(
      new TableRow({
        children: [
          // Column 1: OP. NUMBER
          new TableCell({
            children: [new Paragraph(String(op.opNumber))],
          }),
          // Column 2: Description (with appended comment if any)
          new TableCell({
            children: createFormattedParagraphs(descriptionWithFirstWordBold),
          }),
          // Column 3: Times
          new TableCell({
            children: createParagraphs(timesText),
          }),
          // Column 4: Actual Data
          new TableCell({
            children: createParagraphs(actualDataText),
          }),
        ],
      })
    );
  }

  // Build the DOCX document
  const doc = new Document({
    sections: [
      {
        children: [
          new Table({
            rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      },
    ],
  });

  // Write to file
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputFilePath, buffer);
  console.log(`BMR DOCX file saved to ${outputFilePath}`);
}

/**
 * Gets a multi-line template from processInstructions if available;
 * otherwise use op.description from Excel data.
 */
function getTemplate(op) {
  if (op.activityName && processInstructions[op.activityName]) {
    return processInstructions[op.activityName].description;
  }
  return op.description || "";
}

/**
 * MAIN LOGIC: applyLineByLineSubstitution
 * ---------------------------------------
 * 1) For each line in 'template':
 *    - Substitute placeholders (like [Stirring]) with bold text if BMR_OPTIONS.boldPlaceholders = true,
 *      but skip bold if placeholder is "[project/TP code]".
 *    - If any placeholder is missing or "NA", remove that entire line.
 * 2) After that pass, re-number lines that begin with "1.", "2.", etc.
 *    The step numbers are NOT bold.
 */
function applyLineByLineSubstitution(template, op) {
  const rawLines = template.split("\n");
  const finalLines = [];
  const placeholdersUsed = new Set();

  // Pass (A): placeholders => <b>value</b>, remove line if missing
  for (const line of rawLines) {
    const replacedLine = substitutePlaceholdersAndRemoveMissing(
      line,
      op,
      placeholdersUsed
    );
    if (replacedLine !== null) {
      finalLines.push(replacedLine);
    }
  }

  // Pass (B): line numbering (no bold for step numbers)
  let numberingCounter = 1;
  const reNumbered = finalLines.map((l) => {
    // Remove <b> tags from a copy for detection
    const plain = l.replace(/<[^>]+>/g, "");
    const match = plain.trimStart().match(/^(\d+)\.\s+(.*)$/);
    if (match) {
      // Replace "digit-dot-space" with a normal (non-bold) prefix
      const newPrefix = `${numberingCounter++}.`;
      const digitDotRegex = new RegExp(`^(\\s*)${match[1]}\\.(\\s+)`);
      return l.replace(digitDotRegex, `$1${newPrefix}$2`);
    }
    return l;
  });

  return {
    text: reNumbered.join("\n"),
    placeholdersUsed: Array.from(placeholdersUsed),
  };
}

/**
 * Substitute placeholders in a single line.
 * - If any placeholder is missing or 'NA', return null => skip line entirely.
 * - Otherwise, wrap placeholder value in <b>...</b> if BMR_OPTIONS.boldPlaceholders = true
 *   (except for [project/TP code]).
 */
function substitutePlaceholdersAndRemoveMissing(line, op, placeholdersUsed) {
  // Gather all placeholders like [Time], [Stirring]
  const placeholders = [...line.matchAll(/\[([^\]]+)\]/g)];

  let newLine = line;
  for (const phMatch of placeholders) {
    const fullMatch = phMatch[0]; // e.g. "[Stirring]"
    const phContent = phMatch[1]; // e.g. "Stirring"

    // Determine replacement text
    let replacement;
    if (phContent.trim().toLowerCase() === "project/tp code") {
      // EXCLUDE from bold => just use DOCX_TAB
      replacement = DOCX_TAB;
    } else if (phContent.trim().toLowerCase() === "name" && op.reagentName) {
      replacement = op.reagentName;
      if (BMR_OPTIONS.boldPlaceholders) {
        replacement = `<b>${replacement}</b>`;
      }
    } else {
      // Generic parameter placeholders
      const paramVal = findParamValue(op, phContent);
      if (!paramVal) {
        // missing or "NA" => remove the line
        return null;
      }
      const warn = getCriticalityWarning(op, phContent);
      replacement = paramVal + warn;

      // wrap in <b> if enabled
      if (BMR_OPTIONS.boldPlaceholders) {
        replacement = `<b>${replacement}</b>`;
      }
    }

    // Replace *all* occurrences of [placeholder] in this line
    const regex = new RegExp(escapeForRegExp(fullMatch), "g");
    newLine = newLine.replace(regex, replacement);

    // Track usage for the "Actual Data" column
    placeholdersUsed.add(fullMatch);
  }

  return newLine;
}

/**
 * Builds "Actual Data" by checking which placeholders from ACTUAL_DATA
 * were actually used & retained in the final text.
 */
function buildActualData(placeholdersUsed) {
  const lines = [];
  for (const placeholder of placeholdersUsed) {
    if (ACTUAL_DATA[placeholder]) {
      lines.push(ACTUAL_DATA[placeholder]);
    }
  }
  return lines.join("\n");
}

/**
 * Optionally bold the very first word of the entire multi-line description.
 */
function boldFirstWordOfFullDescription(multiLineText) {
  if (!multiLineText) return multiLineText;

  // Find the first non-whitespace word
  const regex = /^(\s*)(\S+)/;
  const match = multiLineText.match(regex);
  if (!match) {
    return multiLineText;
  }
  const leadingSpaces = match[1];
  const firstWord = match[2];

  return (
    leadingSpaces +
    `<b>${firstWord}</b>` +
    multiLineText.substring(leadingSpaces.length + firstWord.length)
  );
}

/**
 * Gets criticality warnings if a parameter is flagged as CP, PC, or CY
 */
function getCriticalityWarning(op, placeholder) {
  if (!op.parameterCriticalities) return "";
  const normPlaceholder = placeholder.toLowerCase().replace(/\./g, "").trim();
  for (const key in op.parameterCriticalities) {
    const normKey = key.toLowerCase().replace(/\./g, "").trim();
    if (normKey === normPlaceholder) {
      const flags = op.parameterCriticalities[key];
      if (flags && flags.length > 0) {
        return ` WARNING, PARAMETER IS ${flags.join(", ")}`;
      }
    }
  }
  return "";
}

/**
 * Looks up the parameter value for e.g. "Stirring" from op.parameterValue.
 * Returns null if absent or "NA".
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
 * Utility: escape any special regex characters in `str`.
 */
function escapeForRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Converts text with <b> tags into docx TextRuns, line by line.
 */
function createFormattedParagraphs(text) {
  return text.split("\n").map(parseFormattedLine);
}

/**
 * Splits a single line containing <b>...</b> into an array of TextRuns,
 * preserving bold formatting.
 */
function parseFormattedLine(line) {
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
 * Splits text by newlines, returning an array of plain Paragraphs.
 */
function createParagraphs(text) {
  return text.split("\n").map((line) => new Paragraph(line));
}
