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
import { BMR_OPTIONS, ACTUAL_DATA } from "./settings.js";

export async function generateBmrDocxBlob(operations, docxTab) {
  const rows = [];

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

  for (const op of operations) {
    const templateText = getTemplate(op);
    const { text: finalDescription, placeholdersUsed } =
      applyLineByLineSubstitution(templateText, op, docxTab);

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
    sections: [
      { children: [new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } })] },
    ],
  });

  return Packer.toBlob(doc);
}

export async function generateOperationsDocxBlob() {
  const rows = [];

  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph("Operation Key")],
          width: { size: 30, type: WidthType.PERCENTAGE },
        }),
        new TableCell({
          children: [new Paragraph("Description Template")],
          width: { size: 70, type: WidthType.PERCENTAGE },
        }),
      ],
    })
  );

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
    sections: [
      { children: [new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } })] },
    ],
  });

  return Packer.toBlob(doc);
}

function getTemplate(op) {
  if (op.activityName && processInstructions[op.activityName]) {
    return processInstructions[op.activityName].description;
  }
  return op.description || "";
}

function applyLineByLineSubstitution(template, op, docxTab) {
  const rawLines = template.split("\n");
  const finalLines = [];
  const placeholdersUsed = new Set();

  for (const line of rawLines) {
    const replaced = substitutePlaceholdersAndRemoveMissing(
      line,
      op,
      docxTab,
      placeholdersUsed
    );
    if (replaced !== null) finalLines.push(replaced);
  }

  let counter = 1;
  const reNumbered = finalLines.map((line) => {
    const plain = line.replace(/<[^>]+>/g, "");
    const match = plain.trimStart().match(/^(\d+)\.\s+(.*)$/);
    if (match) {
      const newPrefix = `${counter++}.`;
      const digitDotRegex = new RegExp(`^(\\s*)${match[1]}\\.(\\s+)`);
      return line.replace(digitDotRegex, `$1${newPrefix}$2`);
    }
    return line;
  });

  return { text: reNumbered.join("\n"), placeholdersUsed: Array.from(placeholdersUsed) };
}

function substitutePlaceholdersAndRemoveMissing(line, op, docxTab, placeholdersUsed) {
  let newLine = line;
  const placeholders = [...line.matchAll(/\[([^\]]+)\]/g)];

  for (const ph of placeholders) {
    const full = ph[0];
    const key = ph[1].trim();

    let replacement;
    if (key.toLowerCase() === "project/tp code") {
      replacement = docxTab;
    } else if (key.toLowerCase() === "name" && op.reagentName) {
      replacement = BMR_OPTIONS.boldPlaceholders ? `<b>${op.reagentName}</b>` : op.reagentName;
    } else {
      const val = findParamValue(op, key);
      if (!val) return null;
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
  for (const key in op.parameterValue) {
    if (key.toLowerCase().replace(/\./g, "").trim() === norm) {
      const value = op.parameterValue[key].trim();
      if (!value || value.toUpperCase() === "NA") return null;
      return value;
    }
  }
  return null;
}

function getCriticalityWarning(op, placeholder) {
  if (!op.parameterCriticalities) return "";
  const norm = placeholder.toLowerCase().replace(/\./g, "").trim();
  for (const key in op.parameterCriticalities) {
    if (key.toLowerCase().replace(/\./g, "").trim() === norm) {
      const flags = op.parameterCriticalities[key];
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
  const match = text.match(/^(\s*)(\S+)/);
  if (!match) return text;
  return `${match[1]}<b>${match[2]}</b>${text.slice(match[1].length + match[2].length)}`;
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
  return text.split("\n").map((line) => new Paragraph(line));
}

function createCell(content, widthPercent) {
  return new TableCell({
    children: [new Paragraph(content)],
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
  });
}
