// xmlGenerator.js
import { ROW_HEIGHT, X_INPUT, X_PROCESS, X_OUTPUT, BLOCK_WIDTH, BLOCK_HEIGHT, PROCESS_WIDTH, PROCESS_HEIGHT, EDGE_STYLE } from "./settings.js";

/**
 * generateFlowChartXML(operations):
 * Builds an mxGraph XML string for a 3‑column flow chart (INPUT, PROCESS, OUTPUT)
 */
export function generateFlowChartXML(operations) {
  const cells = [];
  // Basic mxGraph model root:
  cells.push('<mxCell id="0"/>');
  cells.push('<mxCell id="1" parent="0"/>');

  // Escapes user-supplied text.
  function escapeUser(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Build HTML content for a PROCESS block.
  function buildProcessHtml(equipment, description, parameterValue) {
    const eq = equipment ? escapeUser(equipment) : 'null';
    const desc = description ? escapeUser(description) : '';
    let html = `<b>${eq}</b><div>${desc}<br>`;

    function isPureNumber(str) {
      return /^[+-]?(\d+(\.\d+)?)$/.test(str.trim());
    }

    if (parameterValue) {
      for (const [key, val] of Object.entries(parameterValue)) {
        if (key.trim().toLowerCase() === "amount") continue;
        if (typeof val === 'string' && val.trim().toUpperCase() === "NA") continue;
        let displayVal = val;
        if (isPureNumber(val)) {
          const numericVal = parseFloat(val);
          displayVal = numericVal.toFixed(2);
        }
        html += `<div>&nbsp; &nbsp; &nbsp; ${escapeUser(key)}: ${escapeUser(displayVal)},</div>`;
      }
    }
    html += '</div><div><br></div>';
    return html;
  }

  // Final escaping for an attribute value.
  function finalEscape(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Creates an mxCell element representing a block.
  function createBlockCell(id, x, y, width, height, label) {
    const escapedLabel = finalEscape(label);
    return `<mxCell id="${id}" value="${escapedLabel}" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
      <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/>
    </mxCell>`;
  }

  // Creates an mxCell element representing an edge.
  function createEdgeCell(id, source, target, extras = '') {
    return `<mxCell id="${id}" style="${EDGE_STYLE}" edge="1" source="${source}" target="${target}" parent="1">
      <mxGeometry relative="1" as="geometry">${extras}</mxGeometry>
    </mxCell>`;
  }

  let currentId = 2;
  let lastProcessBlockId = null;

  operations.forEach((op, index) => {
    const { activityType, reagentName, description, equipment, parameterValue } = op;
    const rowY = 40 + index * ROW_HEIGHT;

    let inputBlockId = null;
    let processBlockId = null;
    let outputBlockId = null;

    let safeReagent = reagentName ? escapeUser(reagentName) : '';
    let amountText = '';
    if (parameterValue) {
      for (const key in parameterValue) {
        if (key.trim().toLowerCase() === "amount") {
          let val = parameterValue[key];
          if (typeof val === 'string' && val.trim().toUpperCase() !== "NA") {
            const numericVal = parseFloat(val);
            if (!isNaN(numericVal)) {
              val = numericVal.toFixed(2);
            }
            amountText = `<div>${escapeUser(key)}: ${escapeUser(val)} Kg</div>`;
          }
          delete parameterValue[key];
          break;
        }
      }
    }
    const inputLabel = safeReagent + amountText;

    if (activityType === 'input->process') {
      currentId++;
      inputBlockId = String(currentId);
      cells.push(createBlockCell(inputBlockId, X_INPUT, rowY, BLOCK_WIDTH, BLOCK_HEIGHT, inputLabel));
      currentId++;
      processBlockId = String(currentId);
      const processHtml = buildProcessHtml(equipment, description, parameterValue);
      cells.push(createBlockCell(processBlockId, X_PROCESS, rowY - 30, PROCESS_WIDTH, PROCESS_HEIGHT, processHtml));
      currentId++;
      cells.push(createEdgeCell(String(currentId), inputBlockId, processBlockId));
    } else if (activityType === 'input->process->output') {
      currentId++;
      inputBlockId = String(currentId);
      cells.push(createBlockCell(inputBlockId, X_INPUT, rowY, BLOCK_WIDTH, BLOCK_HEIGHT, inputLabel));
      currentId++;
      processBlockId = String(currentId);
      const processHtml = buildProcessHtml(equipment, description, parameterValue);
      cells.push(createBlockCell(processBlockId, X_PROCESS, rowY - 30, PROCESS_WIDTH, PROCESS_HEIGHT, processHtml));
      currentId++;
      outputBlockId = String(currentId);
      cells.push(createBlockCell(outputBlockId, X_OUTPUT, rowY, BLOCK_WIDTH, BLOCK_HEIGHT, 'Waste'));
      currentId++;
      cells.push(createEdgeCell(String(currentId), inputBlockId, processBlockId));
      currentId++;
      cells.push(createEdgeCell(String(currentId), processBlockId, outputBlockId));
    } else if (activityType === 'process->output') {
      currentId++;
      processBlockId = String(currentId);
      const processHtml = buildProcessHtml(equipment, description, parameterValue);
      cells.push(createBlockCell(processBlockId, X_PROCESS, rowY - 30, PROCESS_WIDTH, PROCESS_HEIGHT, processHtml));
      currentId++;
      outputBlockId = String(currentId);
      cells.push(createBlockCell(outputBlockId, X_OUTPUT, rowY, BLOCK_WIDTH, BLOCK_HEIGHT, 'Waste'));
      currentId++;
      cells.push(createEdgeCell(String(currentId), processBlockId, outputBlockId));
    } else {
      currentId++;
      processBlockId = String(currentId);
      const processHtml = buildProcessHtml(equipment, description, parameterValue);
      cells.push(createBlockCell(processBlockId, X_PROCESS, rowY - 30, PROCESS_WIDTH, PROCESS_HEIGHT, processHtml));
    }

    if (lastProcessBlockId && processBlockId) {
      currentId++;
      cells.push(createEdgeCell(String(currentId), lastProcessBlockId, processBlockId));
    }
    if (processBlockId) {
      lastProcessBlockId = processBlockId;
    }
  });

  const xml = `<mxGraphModel>
      <root>
        ${cells.join('\n')}
      </root>
    </mxGraphModel>`;
  return xml;
}
