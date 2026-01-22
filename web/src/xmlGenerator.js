import {
  X_PROCESS,
  BLOCK_WIDTH,
  BLOCK_HEIGHT,
  PROCESS_WIDTH,
  LINE_HEIGHT,
  BLOCK_VERTICAL_PADDING,
  MIN_PROCESS_HEIGHT,
  VERTICAL_SPACING,
  HORIZONTAL_GAP,
  EDGE_STYLE,
  PARAMS_TO_OMIT,
} from "./settings.js";

const normalizeKey = (value = "") => value.trim().toLowerCase();
const PARAMS_TO_OMIT_SET = new Set(PARAMS_TO_OMIT.map(normalizeKey));

function escapeUser(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function finalEscape(str) {
  if (!str) return "";
  return escapeUser(str).replace(/"/g, "&quot;");
}

function createBlockCell(id, x, y, width, height, label) {
  const escapedLabel = finalEscape(label);
  return `<mxCell id="${id}" value="${escapedLabel}" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
    <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/>
  </mxCell>`;
}

function createEdgeCell(id, source, target, extras = "") {
  return `<mxCell id="${id}" style="${EDGE_STYLE}" edge="1" source="${source}" target="${target}" parent="1">
    <mxGeometry relative="1" as="geometry">${extras}</mxGeometry>
  </mxCell>`;
}

function buildProcessHtml(equipment, description, parameterValue) {
  const eq = equipment ? escapeUser(equipment) : "null";
  const desc = description ? escapeUser(description) : "";
  let html = `<b>${eq}</b><div>${desc}<br>`;

  function isPureNumber(str) {
    return /^[+-]?(\d+(\.\d+)?)$/.test(str.trim());
  }

  if (parameterValue) {
    for (const [key, val] of Object.entries(parameterValue)) {
      if (PARAMS_TO_OMIT_SET.has(normalizeKey(key))) continue;
      if (typeof val === "string" && val.trim().toUpperCase() === "NA") continue;

      let displayVal = val;
      if (typeof val === "string" && isPureNumber(val)) {
        const num = parseFloat(val);
        displayVal = num.toFixed(2);
      }
      html += `<div>&nbsp;&nbsp;&nbsp; ${escapeUser(key)}: ${escapeUser(
        displayVal
      )},</div>`;
    }
  }
  html += "</div><div><br></div>";
  return html;
}

function estimateLines(html) {
  const text = html
    .replace(/<div>/g, "\n")
    .replace(/<br>/g, "\n")
    .replace(/<\/div>/g, "")
    .replace(/<[^>]+>/g, "");
  const lines = text
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0);
  const charsPerLine = Math.max(28, Math.floor(PROCESS_WIDTH / 4));
  let total = 0;
  for (const line of lines) {
    total += Math.max(1, Math.ceil(line.length / charsPerLine));
  }
  return Math.max(1, total);
}

function buildProcessBlock(equipment, description, parameterValue) {
  const html = buildProcessHtml(equipment, description, parameterValue);
  const lines = estimateLines(html);
  const height = Math.max(
    MIN_PROCESS_HEIGHT,
    lines * LINE_HEIGHT + BLOCK_VERTICAL_PADDING
  );
  return { html, height };
}

export function generateFlowChartXML(operations) {
  const cells = [];
  cells.push('<mxCell id="0"/>');
  cells.push('<mxCell id="1" parent="0"/>');

  let currentId = 2;
  let lastProcessBlockId = null;
  let currentY = 40;

  operations.forEach((op) => {
    const { activityType, reagentName, description, equipment, parameterValue } = op;

    const { html: processHtml, height: processHeight } = buildProcessBlock(
      equipment,
      description,
      parameterValue
    );

    const processY = currentY;
    const inputY = processY + (processHeight - BLOCK_HEIGHT) / 2;
    const outputY = inputY;

    const X_INPUT = X_PROCESS - HORIZONTAL_GAP - BLOCK_WIDTH;
    const X_OUTPUT = X_PROCESS + PROCESS_WIDTH + HORIZONTAL_GAP;

    const inputLabel = reagentName ? escapeUser(reagentName) : "";

    let inputBlockId = null;
    let processBlockId = null;
    let outputBlockId = null;

    const addEdge = (src, tgt) => {
      currentId += 1;
      cells.push(createEdgeCell(String(currentId), src, tgt));
    };

    switch (activityType) {
      case "input->process": {
        currentId += 1;
        inputBlockId = String(currentId);
        cells.push(
          createBlockCell(
            inputBlockId,
            X_INPUT,
            inputY,
            BLOCK_WIDTH,
            BLOCK_HEIGHT,
            inputLabel
          )
        );
        currentId += 1;
        processBlockId = String(currentId);
        cells.push(
          createBlockCell(
            processBlockId,
            X_PROCESS,
            processY,
            PROCESS_WIDTH,
            processHeight,
            processHtml
          )
        );
        addEdge(inputBlockId, processBlockId);
        break;
      }
      case "input->process->output": {
        currentId += 1;
        inputBlockId = String(currentId);
        cells.push(
          createBlockCell(
            inputBlockId,
            X_INPUT,
            inputY,
            BLOCK_WIDTH,
            BLOCK_HEIGHT,
            inputLabel
          )
        );
        currentId += 1;
        processBlockId = String(currentId);
        cells.push(
          createBlockCell(
            processBlockId,
            X_PROCESS,
            processY,
            PROCESS_WIDTH,
            processHeight,
            processHtml
          )
        );
        currentId += 1;
        outputBlockId = String(currentId);
        cells.push(
          createBlockCell(
            outputBlockId,
            X_OUTPUT,
            outputY,
            BLOCK_WIDTH,
            BLOCK_HEIGHT,
            "Waste"
          )
        );
        addEdge(inputBlockId, processBlockId);
        addEdge(processBlockId, outputBlockId);
        break;
      }
      case "process->output": {
        currentId += 1;
        processBlockId = String(currentId);
        cells.push(
          createBlockCell(
            processBlockId,
            X_PROCESS,
            processY,
            PROCESS_WIDTH,
            processHeight,
            processHtml
          )
        );
        currentId += 1;
        outputBlockId = String(currentId);
        cells.push(
          createBlockCell(
            outputBlockId,
            X_OUTPUT,
            outputY,
            BLOCK_WIDTH,
            BLOCK_HEIGHT,
            "Waste"
          )
        );
        addEdge(processBlockId, outputBlockId);
        break;
      }
      default: {
        currentId += 1;
        processBlockId = String(currentId);
        cells.push(
          createBlockCell(
            processBlockId,
            X_PROCESS,
            processY,
            PROCESS_WIDTH,
            processHeight,
            processHtml
          )
        );
      }
    }

    if (lastProcessBlockId && processBlockId) {
      addEdge(lastProcessBlockId, processBlockId);
    }
    if (processBlockId) lastProcessBlockId = processBlockId;

    currentY += processHeight + VERTICAL_SPACING;
  });

  return `<mxGraphModel><root>\n${cells.join("\n")}\n</root></mxGraphModel>`;
}
