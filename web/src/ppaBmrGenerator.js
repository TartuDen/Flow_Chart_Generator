import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import parameterMappingConfig from "../../ppaParameterMappings.json" with { type: "json" };

const REQUIRED_HEADERS = {
  synthesisStage: "Synthesis stage",
  description: "Description",
  reagentName: "Reagent name",
  parameter: "parameter",
  value: "value",
};

const mappingBySourceName = new Map();
for (const mapping of parameterMappingConfig.parameters) {
  for (const sourceName of mapping.sourceNames) {
    mappingBySourceName.set(normalizeParameterName(sourceName), mapping);
  }
}

export async function generatePpaBmrDocxBlob(worksheet) {
  const operations = parsePpaOperations(worksheet);
  if (!operations.length) {
    throw new Error("No PPA operations were found in the selected worksheet.");
  }

  const rows = [
    new TableRow({
      children: [
        createHeaderCell("Op.", 8),
        createHeaderCell("Description", 47),
        createHeaderCell("Time", 12),
        createHeaderCell("Recording", 33),
      ],
    }),
  ];

  for (const operation of operations) {
    const { descriptionBlocks, recordingLines } = formatOperation(operation);
    rows.push(
      new TableRow({
        children: [
          createTextCell([String(operation.opNumber)]),
          createDescriptionCell(descriptionBlocks),
          createTextCell(["__:__"]),
          createTextCell(recordingLines),
        ],
      })
    );
  }

  const document = new Document({
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

  return Packer.toBlob(document);
}

export function parsePpaOperations(worksheet) {
  if (!worksheet || !worksheet["!ref"]) {
    throw new Error("Selected worksheet is empty.");
  }

  const range = decodeRange(worksheet["!ref"]);
  const getCellValue = (rowIndex, columnIndex) => {
    if (columnIndex < 0) return "";
    const cell = worksheet[encodeCell(rowIndex, columnIndex)];
    if (!cell || cell.v === undefined || cell.v === null) return "";
    return String(cell.v).trim();
  };

  let headerRowIndex = -1;
  for (let row = range.startRow; row <= range.endRow; row++) {
    for (let column = range.startColumn; column <= range.endColumn; column++) {
      if (getCellValue(row, column) === REQUIRED_HEADERS.synthesisStage) {
        headerRowIndex = row;
        break;
      }
    }
    if (headerRowIndex >= 0) break;
  }

  if (headerRowIndex < 0) {
    throw new Error(`Header '${REQUIRED_HEADERS.synthesisStage}' was not found.`);
  }

  const headers = [];
  for (let column = range.startColumn; column <= range.endColumn; column++) {
    headers.push(getCellValue(headerRowIndex, column));
  }

  const columns = {};
  for (const [key, header] of Object.entries(REQUIRED_HEADERS)) {
    columns[key] = headers.indexOf(header);
  }

  const missingHeaders = Object.entries(columns)
    .filter(([, index]) => index < 0)
    .map(([key]) => REQUIRED_HEADERS[key]);
  if (missingHeaders.length) {
    throw new Error(`Required PPA column(s) not found: ${missingHeaders.join(", ")}.`);
  }

  const operations = [];
  let currentOperation = null;

  for (let row = headerRowIndex + 1; row <= range.endRow; row++) {
    const synthesisStage = getCellValue(row, columns.synthesisStage);
    if (synthesisStage) {
      if (currentOperation) operations.push(currentOperation);
      currentOperation = {
        opNumber: operations.length + 1,
        description: getCellValue(row, columns.description),
        reagentName: getCellValue(row, columns.reagentName),
        parameters: [],
      };
    }

    if (!currentOperation) continue;

    const parameterName = getCellValue(row, columns.parameter);
    if (parameterName) {
      currentOperation.parameters.push({
        name: parameterName,
        value: getCellValue(row, columns.value),
      });
    }
  }

  if (currentOperation) operations.push(currentOperation);
  return operations.filter(
    (operation) => operation.description || operation.parameters.length
  );
}

function formatOperation(operation) {
  const descriptionBlocks = operation.description
    ? [{ type: "HEADING", text: operation.description }]
    : [];
  const endDescriptionBlocks = [];
  const recordingLines = [];
  const seenRecordingTemplates = new Set();

  for (const parameter of operation.parameters) {
    const mapping = mappingBySourceName.get(normalizeParameterName(parameter.name));
    const missingValue = isMissingValue(parameter.value);
    const includeWhenMissing = mapping?.includeWhenValueMissing === "YES";
    if (missingValue && !includeWhenMissing) continue;

    if (!mapping) {
      descriptionBlocks.push({
        type: "PARAMETER",
        text: `${parameter.name}: ${parameter.value}`,
      });
      continue;
    }

    const isAmount = mapping.specialHandling === "AMOUNT";
    const amountIsAll = isAmount && parameter.value.trim().toLowerCase() === "all";

    if (mapping.description.visibility === "YES") {
      let descriptionText;
      if (amountIsAll) {
        descriptionText = "Specified transfer: all";
      } else {
        descriptionText = applyValue(mapping.description.template, parameter.value);
      }

      const block = {
        type: mapping.description.position === "END" ? "END" : "PARAMETER",
        text: descriptionText,
        boldLabel: isAmount,
      };
      const target = block.type === "END"
        ? endDescriptionBlocks
        : descriptionBlocks;
      target.push(block);
    }

    if (mapping.recording.visibility === "YES") {
      let recordingText = mapping.recording.template;
      if (amountIsAll) {
        recordingText = "Actual amount transferred:\n____________________ kg";
      }
      recordingText = applyValue(recordingText, parameter.value);
      recordingText = normalizeRecordingPlaceholders(recordingText);

      if (!seenRecordingTemplates.has(recordingText)) {
        if (recordingLines.length) recordingLines.push("");
        recordingLines.push(...splitLines(recordingText));
        seenRecordingTemplates.add(recordingText);
      }
    }
  }

  descriptionBlocks.push(...endDescriptionBlocks);
  return { descriptionBlocks, recordingLines };
}

function applyValue(template, value) {
  return template.replaceAll("{value}", value);
}

function normalizeRecordingPlaceholders(value) {
  return value.replace(/_+/g, "............");
}

function splitLines(value) {
  return String(value).replace(/\r\n/g, "\n").split("\n");
}

function isMissingValue(value) {
  const normalized = String(value ?? "").trim();
  return !normalized || normalized.toUpperCase() === "NA";
}

function normalizeParameterName(value) {
  return String(value).trim().toLowerCase();
}

function createHeaderCell(text, widthPercent) {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
  });
}

function createTextCell(lines) {
  const paragraphs = lines.length
    ? lines.map((line) => new Paragraph(String(line)))
    : [new Paragraph("")];
  return new TableCell({ children: paragraphs });
}

function createDescriptionCell(blocks) {
  const paragraphs = [];
  let parameterNumber = 1;

  for (const block of blocks) {
    if (block.type === "HEADING") {
      paragraphs.push(
        createRichParagraph(block.text, {
          bold: true,
          spacingAfter: 240,
        })
      );
      continue;
    }

    if (block.type === "PARAMETER") {
      paragraphs.push(
        createRichParagraph(block.text, {
          prefix: `${parameterNumber++}. `,
        })
      );
      continue;
    }

    paragraphs.push(
      createRichParagraph(block.text, {
        boldLabel: block.boldLabel,
        spacingBefore: 240,
      })
    );
  }

  return new TableCell({
    children: paragraphs.length ? paragraphs : [new Paragraph("")],
  });
}

function createRichParagraph(
  text,
  { prefix = "", bold = false, boldLabel = false, spacingBefore, spacingAfter } = {}
) {
  const lines = splitLines(text);
  const children = [];

  lines.forEach((line, index) => {
    const linePrefix = index === 0 ? prefix : "";
    const content = `${linePrefix}${line}`;
    const breakCount = index === 0 ? undefined : 1;

    if (boldLabel && index === 0) {
      const colonIndex = content.indexOf(":");
      if (colonIndex >= 0) {
        children.push(
          new TextRun({
            text: content.slice(0, colonIndex + 1),
            bold: true,
            break: breakCount,
          }),
          new TextRun({ text: content.slice(colonIndex + 1) })
        );
        return;
      }
    }

    children.push(
      new TextRun({
        text: content,
        bold,
        break: breakCount,
      })
    );
  });

  return new Paragraph({
    children,
    spacing: {
      before: spacingBefore,
      after: spacingAfter,
    },
  });
}

// These small helpers keep this generator independent from the existing XLSX
// parser while using the same A1 worksheet coordinate format.
function decodeRange(reference) {
  const [start, end] = reference.split(":");
  const startCell = decodeCell(start);
  const endCell = decodeCell(end || start);
  return {
    startRow: startCell.row,
    startColumn: startCell.column,
    endRow: endCell.row,
    endColumn: endCell.column,
  };
}

function decodeCell(reference) {
  const match = reference.match(/^([A-Z]+)(\d+)$/i);
  if (!match) throw new Error(`Invalid worksheet cell reference: ${reference}`);
  let column = 0;
  for (const character of match[1].toUpperCase()) {
    column = column * 26 + character.charCodeAt(0) - 64;
  }
  return { row: Number(match[2]) - 1, column: column - 1 };
}

function encodeCell(row, column) {
  let columnName = "";
  let current = column + 1;
  while (current > 0) {
    const remainder = (current - 1) % 26;
    columnName = String.fromCharCode(65 + remainder) + columnName;
    current = Math.floor((current - 1) / 26);
  }
  return `${columnName}${row + 1}`;
}
