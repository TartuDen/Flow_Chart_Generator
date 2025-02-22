import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun } from "docx";
import fs from "fs";
import { processInstructions } from "./operations.js";
import { DOCX_TAB } from "./settings.js";

const TAB = DOCX_TAB;

/**
 * Applies line‑by‑line substitution on the template.
 * Each placeholder [some text] is replaced by its value (wrapped in bold markers).
 * If any placeholder in a line has no valid value, the entire line is omitted.
 * Also re‑numbers lines starting with numbering.
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
      const fullMatch = phMatch[0];    // e.g., "[Addition rate]"
      const phContent = phMatch[1];      // e.g., "Addition rate"

      if (phContent.trim().toLowerCase() === "project/tp code") {
        newLine = newLine.replace(fullMatch, TAB);
        continue;
      }
      if (phContent.trim().toLowerCase() === "name" && op.reagentName) {
        newLine = newLine.replace(fullMatch, op.reagentName);
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
          // Wrap the inserted parameter (and any warning) in bold markers.
          newLine = newLine.replace(fullMatch, `<<b>>${paramVal + warn}<</b>>`);
        }
      }
    }
    if (!removeLine) {
      finalLines.push(newLine);
    }
  }

  // Re‑number lines that start with numbering (e.g., "1. ...", "2. ...")
  let numberingCounter = 1;
  const reNumberedLines = finalLines.map((l) => {
    const trimmed = l.trimStart();
    const match = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (match) {
      const lineBody = match[2];
      return `${numberingCounter++}. ${lineBody}`;
    } else {
      return l;
    }
  });

  return reNumberedLines.join("\n");
}

/**
 * Retrieves any criticality warning for a given placeholder.
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
 * Looks up the value for a parameter (ignoring case and punctuation).
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
 * Retrieves the template from processInstructions (or op.description if not found).
 * Also ensures that the first word is wrapped in bold markers.
 */
function getTemplate(op) {
  let template = "";
  if (op.activityName && processInstructions[op.activityName]) {
    template = processInstructions[op.activityName].description;
  } else {
    template = op.description || "";
  }
  // Bold the first word if not already bold.
  if (!template.trim().startsWith("<<b>>")) {
    template = template.replace(/^(\s*)(\S+)/, `$1<<b>>$2<</b>>`);
  }
  return template;
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
 * Parses text containing custom bold markers (<<b>> and <</b>>)
 * and returns an array of TextRun objects with appropriate formatting.
 */
function parseTextWithBoldMarkers(text) {
  const runs = [];
  let remaining = text;
  while (remaining.length > 0) {
    const indexStart = remaining.indexOf("<<b>>");
    if (indexStart === -1) {
      runs.push(new TextRun(remaining));
      break;
    }
    if (indexStart > 0) {
      runs.push(new TextRun(remaining.substring(0, indexStart)));
    }
    remaining = remaining.substring(indexStart + 5); // Skip <<b>>
    const indexEnd = remaining.indexOf("<</b>>");
    if (indexEnd === -1) {
      runs.push(new TextRun({ text: remaining, bold: true }));
      break;
    }
    const boldText = remaining.substring(0, indexEnd);
    runs.push(new TextRun({ text: boldText, bold: true }));
    remaining = remaining.substring(indexEnd + 6); // Skip <</b>>
  }
  return runs;
}

/**
 * Creates an array of Paragraph objects from the given text.
 * Each line is parsed for bold markers and converted to rich text.
 */
function createParagraphs(text) {
  const lines = text.split("\n");
  const paragraphs = lines.map((line) => {
    const runs = parseTextWithBoldMarkers(line);
    return new Paragraph({ children: runs });
  });
  return paragraphs;
}

/**
 * Creates and saves a DOCX file with a 3‑column table (Description, Times, Actual Data).
 */
export async function generateBmrDocx(operations, outputFilePath) {
  const rows = [];

  // Table header
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

  // Process each operation.
  operations.forEach((op) => {
    // 1) Get the base template and ensure first word is bold.
    const template = getTemplate(op);
    // 2) Apply line‑by‑line substitution with parameter bolding.
    const finalDescription = applyLineByLineSubstitution(template, op);
    // 3) Fixed text for the "Times" column.
    const timesText = "Start:\n__:__\nEnd:\n__:__";
    // 4) Build "Actual Data" text.
    const actualDataText = buildActualData(op);

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
