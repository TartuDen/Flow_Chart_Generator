// xmlGenerator.js
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

/* ──────────────────────────────────────────────────────────────── */
/*  Helper: escape text for XML/HTML                              */
function escapeUser(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/*  Helper: additional escape for attribute strings               */
function finalEscape(str) {
  if (!str) return "";
  return escapeUser(str).replace(/"/g, "&quot;");
}

/*  Build an <mxCell> vertex (block)                              */
function createBlockCell(id, x, y, width, height, label) {
  const escapedLabel = finalEscape(label);
  return `<mxCell id="${id}" value="${escapedLabel}" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
    <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/>
  </mxCell>`;
}

/*  Build an <mxCell> edge (arrow)                                */
function createEdgeCell(id, source, target, extras = "") {
  return `<mxCell id="${id}" style="${EDGE_STYLE}" edge="1" source="${source}" target="${target}" parent="1">
    <mxGeometry relative="1" as="geometry">${extras}</mxGeometry>
  </mxCell>`;
}

/*  Build HTML for a PROCESS block (same logic as original)       */
function buildProcessHtml(equipment, description, parameterValue) {
  const eq = equipment ? escapeUser(equipment) : "null";
  const desc = description ? escapeUser(description) : "";
  let html = `<b>${eq}</b><div>${desc}<br>`;

  function isPureNumber(str) {
    return /^[+-]?(\d+(\.\d+)?)$/.test(str.trim());
  }

  if (parameterValue) {
    for (const [key, val] of Object.entries(parameterValue)) {
      // omit parameters in the blacklist (case-insensitive)

      if (PARAMS_TO_OMIT_SET.has(normalizeKey(key))) continue;
      // skip NA
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

/*  Roughly estimate vertical lines to size the block             */
function estimateLines(html) {
  return (html.match(/<div/g) || []).length + 1; // +1 for the <b>…</b> line
}

/*  Build PROCESS block + height                                  */
function buildProcessBlock(equipment, description, parameterValue) {
  const html = buildProcessHtml(equipment, description, parameterValue);
  const lines = estimateLines(html);
  const height = Math.max(
    MIN_PROCESS_HEIGHT,
    lines * LINE_HEIGHT + BLOCK_VERTICAL_PADDING
  );
  return { html, height };
}

/* ──────────────────────────────────────────────────────────────── */
/*  PUBLIC: generateFlowChartXML                                   */
export function generateFlowChartXML(operations) {
  const cells = [];
  cells.push("<mxCell id=\"0\"/>");
  cells.push("<mxCell id=\"1\" parent=\"0\"/>");

  let currentId = 2;
  let lastProcessBlockId = null;
  let currentY = 40; // top margin for first row

  operations.forEach((op) => {
    const {
      activityType,
      reagentName,
      description,
      equipment,
      parameterValue,
    } = op;

    /* 1️⃣  Build PROCESS block HTML + dynamic height */
    const { html: processHtml, height: processHeight } = buildProcessBlock(
      equipment,
      description,
      parameterValue
    );

    /* 2️⃣  Calculate positions for this row */
    const processY = currentY;
    const inputY = processY + (processHeight - BLOCK_HEIGHT) / 2; // vertically centred
    const outputY = inputY;

    const X_INPUT = X_PROCESS - HORIZONTAL_GAP - BLOCK_WIDTH;
    const X_OUTPUT = X_PROCESS + PROCESS_WIDTH + HORIZONTAL_GAP;

    const inputLabel = reagentName ? escapeUser(reagentName) : "";

    /* IDs for this row */
    let inputBlockId = null;
    let processBlockId = null;
    let outputBlockId = null;

    const addEdge = (src, tgt) => {
      currentId += 1;
      cells.push(createEdgeCell(String(currentId), src, tgt));
    };

    /* 3️⃣  Draw blocks & edges depending on activityType */
    switch (activityType) {
      case "input->process": {
        // INPUT
        currentId += 1;
        inputBlockId = String(currentId);
        cells.push(
          createBlockCell(inputBlockId, X_INPUT, inputY, BLOCK_WIDTH, BLOCK_HEIGHT, inputLabel)
        );
        // PROCESS
        currentId += 1;
        processBlockId = String(currentId);
        cells.push(
          createBlockCell(processBlockId, X_PROCESS, processY, PROCESS_WIDTH, processHeight, processHtml)
        );
        addEdge(inputBlockId, processBlockId);
        break;
      }

      case "input->process->output": {
        // INPUT
        currentId += 1;
        inputBlockId = String(currentId);
        cells.push(
          createBlockCell(inputBlockId, X_INPUT, inputY, BLOCK_WIDTH, BLOCK_HEIGHT, inputLabel)
        );
        // PROCESS
        currentId += 1;
        processBlockId = String(currentId);
        cells.push(
          createBlockCell(processBlockId, X_PROCESS, processY, PROCESS_WIDTH, processHeight, processHtml)
        );
        // OUTPUT
        currentId += 1;
        outputBlockId = String(currentId);
        cells.push(
          createBlockCell(outputBlockId, X_OUTPUT, outputY, BLOCK_WIDTH, BLOCK_HEIGHT, "Waste")
        );
        addEdge(inputBlockId, processBlockId);
        addEdge(processBlockId, outputBlockId);
        break;
      }

      case "process->output": {
        // PROCESS
        currentId += 1;
        processBlockId = String(currentId);
        cells.push(
          createBlockCell(processBlockId, X_PROCESS, processY, PROCESS_WIDTH, processHeight, processHtml)
        );
        // OUTPUT
        currentId += 1;
        outputBlockId = String(currentId);
        cells.push(
          createBlockCell(outputBlockId, X_OUTPUT, outputY, BLOCK_WIDTH, BLOCK_HEIGHT, "Waste")
        );
        addEdge(processBlockId, outputBlockId);
        break;
      }

      default: // only PROCESS
        currentId += 1;
        processBlockId = String(currentId);
        cells.push(
          createBlockCell(processBlockId, X_PROCESS, processY, PROCESS_WIDTH, processHeight, processHtml)
        );
    }

    /* 4️⃣  Chain down edges between successive PROCESS blocks */
    if (lastProcessBlockId && processBlockId) {
      addEdge(lastProcessBlockId, processBlockId);
    }
    if (processBlockId) lastProcessBlockId = processBlockId;

    /* 5️⃣  Advance Y for next row */
    currentY += processHeight + VERTICAL_SPACING;
  });

  /* 6️⃣  Wrap up XML */
  return `<mxGraphModel><root>\n${cells.join("\n")}\n</root></mxGraphModel>`;
}
