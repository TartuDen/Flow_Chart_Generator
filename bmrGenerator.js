// bmrGenerator.js

import fs from "fs";
import path from "path";
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
import {
  DOCX_TAB,
  BMR_OPTIONS,
  ACTUAL_DATA,
  GENERATED_FILES_DIR,
} from "./settings.js";

/**
 * PUBLIC: generateAllDocs
 * -----------------------
 * 1) Generates the main BMR DOCX into GENERATED_FILES_DIR.
 * 2) Generates operations_<DD.MM.YYYY>.docx listing all processInstructions entries.
 */
export async function generateAllDocs(operations, bmrOutputFileName) {
  // Ensure output directory exists
  if (!fs.existsSync(GENERATED_FILES_DIR)) {
    fs.mkdirSync(GENERATED_FILES_DIR, { recursive: true });
  }

  // 1) BMR document
  const bmrPath = path.join(GENERATED_FILES_DIR, bmrOutputFileName);
  await generateBmrDocx(operations, bmrPath);

  // 2) Operations document
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const dateStr = `${dd}.${mm}.${yyyy}`;
  const operationsFilename = `operations_${dateStr}.docx`;
  const operationsPath = path.join(GENERATED_FILES_DIR, operationsFilename);

  // await generateOperationsDocx(operationsPath);
}

/**
 * INTERNAL: generateBmrDocx
 * -------------------------
 * Exactly as before, writes a 4-column table per operation.
 */
async function generateBmrDocx(operations, outputFilePath) {
  const rows = [];

  // Header row
  rows.push(
    new TableRow({
      children: [
        createCell("OP. NUMBER", 10),
        createCell("Description", 40),
        createCell("Times", 20),
        createCell("Actual Data", 30),
      ],
    })
  );

  // One row per operation
  for (const op of operations) {
    const templateText = getTemplate(op);
    const { text: finalDescription, placeholdersUsed } =
      applyLineByLineSubstitution(templateText, op);

    let desc = boldFirstWordOfFullDescription(finalDescription);
    if (op.comments) {
      desc += `\nCOMMENT INFO: ${op.comments}`;
    }

    const actualDataText = buildActualData(placeholdersUsed);
    const timesText = "Start:\n__:__\nEnd:\n__:__";

    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(String(op.opNumber))] }),
          new TableCell({ children: createFormattedParagraphs(desc) }),
          new TableCell({ children: createParagraphs(timesText) }),
          new TableCell({ children: createParagraphs(actualDataText) }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [{ children: [new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } })] }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputFilePath, buffer);
}

/**
 * INTERNAL: generateOperationsDocx
 * --------------------------------
 * Writes a 2-column table of every key & description in processInstructions.
 */
async function generateOperationsDocx(outputFilePath) {
  const rows = [];

  // Header row
  rows.push(
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("Operation Key")], width: { size: 30, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph("Description Template")], width: { size: 70, type: WidthType.PERCENTAGE } }),
      ],
    })
  );

  // One row per entry in processInstructions
  for (const [key, { description }] of Object.entries(processInstructions)) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(key)] }),
          new TableCell({ children: createParagraphs(description) }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [{ children: [new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } })] }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputFilePath, buffer);
}

/* ─── Shared Helpers ───────────────────────────────────────────────────────── */

// Fetch description template from processInstructions
function getTemplate(op) {
  if (op.activityName && processInstructions[op.activityName]) {
    return processInstructions[op.activityName].description;
  }
  return op.description || "";
}

// 1) Substitute placeholders line-by-line (remove missing); 2) re-number steps
function applyLineByLineSubstitution(template, op) {
  const rawLines = template.split("\n");
  const finalLines = [];
  const placeholdersUsed = new Set();

  // Pass A: placeholder substitutions / drop lines
  for (const line of rawLines) {
    const replaced = substitutePlaceholdersAndRemoveMissing(line, op, placeholdersUsed);
    if (replaced !== null) finalLines.push(replaced);
  }

  // Pass B: renumber
  let counter = 1;
  const reNumbered = finalLines.map((l) => {
    const plain = l.replace(/<[^>]+>/g, "");
    const match = plain.trimStart().match(/^(\d+)\.\s+(.*)$/);
    if (match) {
      const newPrefix = `${counter++}.`;
      const digitDotRegex = new RegExp(`^(\\s*)${match[1]}\\.(\\s+)`);
      return l.replace(digitDotRegex, `$1${newPrefix}$2`);
    }
    return l;
  });

  return { text: reNumbered.join("\n"), placeholdersUsed: Array.from(placeholdersUsed) };
}

function substitutePlaceholdersAndRemoveMissing(line, op, placeholdersUsed) {
  let newLine = line;
  const placeholders = [...line.matchAll(/\[([^\]]+)\]/g)];

  for (const ph of placeholders) {
    const full = ph[0];
    const key = ph[1].trim();

    let replacement;
    if (key.toLowerCase() === "project/tp code") {
      replacement = DOCX_TAB;
    } else if (key.toLowerCase() === "name" && op.reagentName) {
      replacement = BMR_OPTIONS.boldPlaceholders ? `<b>${op.reagentName}</b>` : op.reagentName;
    } else {
      const val = findParamValue(op, key);
      if (!val) return null; // drop line if missing or NA
      replacement = val + getCriticalityWarning(op, key);
      if (BMR_OPTIONS.boldPlaceholders) replacement = `<b>${replacement}</b>`;
    }

    newLine = newLine.replace(new RegExp(escapeForRegExp(full), "g"), replacement);
    placeholdersUsed.add(full);
  }

  return newLine;
}

function findParamValue(op, placeholder) {
  if (!op.parameterValue) return null;
  const norm = placeholder.toLowerCase().replace(/\./g, "").trim();
  for (const k in op.parameterValue) {
    if (k.toLowerCase().replace(/\./g, "").trim() === norm) {
      const v = op.parameterValue[k].trim();
      if (!v || v.toUpperCase() === "NA") return null;
      return v;
    }
  }
  return null;
}

function getCriticalityWarning(op, placeholder) {
  if (!op.parameterCriticalities) return "";
  const norm = placeholder.toLowerCase().replace(/\./g, "").trim();
  for (const k in op.parameterCriticalities) {
    if (k.toLowerCase().replace(/\./g, "").trim() === norm) {
      const flags = op.parameterCriticalities[k];
      if (flags && flags.length) return ` WARNING, PARAMETER IS ${flags.join(", ")}`;
    }
  }
  return "";
}

function escapeForRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function boldFirstWordOfFullDescription(text) {
  if (!text) return text;
  const m = text.match(/^(\s*)(\S+)/);
  if (!m) return text;
  return `${m[1]}<b>${m[2]}</b>${text.slice(m[1].length + m[2].length)}`;
}

function buildActualData(placeholdersUsed) {
  const lines = [];
  for (const ph of placeholdersUsed) {
    if (ACTUAL_DATA[ph]) lines.push(ACTUAL_DATA[ph]);
  }
  return lines.join("\n");
}

function createFormattedParagraphs(text) {
  return text.split("\n").map(parseFormattedLine);
}

function parseFormattedLine(line) {
  const parts = line.split(/(<\/?b>)/);
  let bold = false;
  const runs = [];
  for (const part of parts) {
    if (part === "<b>") bold = true;
    else if (part === "</b>") bold = false;
    else if (part) runs.push(new TextRun({ text: part, bold }));
  }
  return new Paragraph({ children: runs });
}

function createParagraphs(text) {
  return text.split("\n").map((l) => new Paragraph(l));
}

function createCell(content, widthPercent) {
  return new TableCell({
    children: [new Paragraph(content)],
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
  });
}

// Export core functions
// export { generateBmrDocx, generateOperationsDocx };
export { generateBmrDocx};
