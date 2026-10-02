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
    const { descriptionLines, recordingLines } = formatOperation(operation);
    rows.push(
      new TableRow({
        children: [
          createTextCell([String(operation.opNumber)]),
          createTextCell(descriptionLines),
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
  const descriptionLines = operation.description ? [operation.description] : [];
  const endDescriptionLines = [];
  const recordingLines = [];
  const seenRecordingTemplates = new Set();

  for (const parameter of operation.parameters) {
    const mapping = mappingBySourceName.get(normalizeParameterName(parameter.name));
    const missingValue = isMissingValue(parameter.value);
    const includeWhenMissing = mapping?.includeWhenValueMissing === "YES";
    if (missingValue && !includeWhenMissing) continue;

    if (!mapping) {
      descriptionLines.push(`${parameter.name}: ${parameter.value}`);
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

      const target = mapping.description.position === "END"
        ? endDescriptionLines
        : descriptionLines;
      target.push(...splitLines(descriptionText));
    }

    if (mapping.recording.visibility === "YES") {
      let recordingText = mapping.recording.template;
      if (amountIsAll) {
        recordingText = "Actual amount transferred:\n____________________ kg";
      }
      recordingText = applyValue(recordingText, parameter.value);

      if (!seenRecordingTemplates.has(recordingText)) {
        if (recordingLines.length) recordingLines.push("");
        recordingLines.push(...splitLines(recordingText));
        seenRecordingTemplates.add(recordingText);
      }
    }
  }

  descriptionLines.push(...endDescriptionLines);
  return { descriptionLines, recordingLines };
}

function applyValue(template, value) {
  return template.replaceAll("{value}", value);
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
