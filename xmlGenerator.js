//xmlGenerator.js

/**
 * generateFlowChartXML(operations):
 *   - Builds an mxGraph XML string for a 3‑column flow chart (INPUT, PROCESS, OUTPUT)
 *   - For each operation, one or more blocks (mxCells) are created.
 *
 *   The label for each block is built in HTML (with tags like <b>, <div>, etc.),
 *   but then the entire string is “final‐escaped” so that all `<` and `>` are converted
 *   to `&lt;` and `&gt;`, which is the format Draw.io uses.
 *
 *   Additionally, if a parameter key equals "Amount" (case insensitive) and its value is not "NA",
 *   that parameter/value pair is removed from the PROCESS block and added to the INPUT block.
 *   Numeric values are rounded to two decimals.
 */
export function generateFlowChartXML(operations) {
  // Array to accumulate <mxCell> elements.
  const cells = [];

  // The basic mxGraph model root:
  cells.push('<mxCell id="0"/>');
  cells.push('<mxCell id="1" parent="0"/>');

  // --- Helper Functions ---

  // Escapes user-supplied text so that no raw < or > appear.
  function escapeUser(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Build the HTML content for a PROCESS block.
  // This function omits the "Amount" parameter (which is handled separately in the INPUT block)
  // and rounds numeric values to two decimals.
  function buildProcessHtml(equipment, description, parameterValue) {
    const eq = equipment ? escapeUser(equipment) : 'null';
    const desc = description ? escapeUser(description) : '';
    let html = `<b>${eq}</b><div>${desc}<br>`;
    if (parameterValue) {
      for (const [key, val] of Object.entries(parameterValue)) {
        // Skip "Amount" parameters (they will be handled in the INPUT block)
        if (key.trim().toLowerCase() === "amount") continue;
        // If the value equals "NA" (ignoring case), skip it.
        if (typeof val === 'string' && val.trim().toUpperCase() === "NA") continue;
        let displayVal = val;
        const numericVal = parseFloat(val);
        if (!isNaN(numericVal)) {
          displayVal = numericVal.toFixed(2);
        }
        html += `<div>&nbsp; &nbsp; &nbsp; ${escapeUser(key)}: ${escapeUser(displayVal)},</div>`;
      }
    }
    html += '</div><div><br></div>';
    return html;
  }

  // This function performs the final escaping for an attribute value.
  // It converts all &, <, >, and " into their XML entities.
  function finalEscape(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Creates an mxCell element representing a block (vertex).
  function createBlockCell(id, x, y, width, height, label) {
    // We assume label already contains HTML markup.
    // We now escape it for use as an XML attribute.
    const escapedLabel = finalEscape(label);
    return `<mxCell id="${id}" value="${escapedLabel}" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
      <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/>
    </mxCell>`;
  }

  // Creates an mxCell element representing an edge (arrow) between two vertices.
  function createEdgeCell(id, source, target, extras = '') {
    const style = 'edgeStyle=none;curved=1;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;fontSize=12;startSize=8;endSize=8;';
    return `<mxCell id="${id}" style="${style}" edge="1" source="${source}" target="${target}" parent="1">
      <mxGeometry relative="1" as="geometry">${extras}</mxGeometry>
    </mxCell>`;
  }

  // --- Layout Settings ---
  let currentId = 2; // IDs "0" and "1" are used.
  let lastProcessBlockId = null; // To later link vertically from one PROCESS block to the next.

  const rowHeight = 180;
  const X_INPUT = 40, X_PROCESS = 220, X_OUTPUT = 480; // Adjusted: OUTPUT block placed further right.
  const BLOCK_WIDTH = 120, BLOCK_HEIGHT = 60;
  const PROCESS_WIDTH = 190, PROCESS_HEIGHT = 130;

  // --- Process each operation ---
  operations.forEach((op, index) => {
    const { activityType, reagentName, description, equipment, parameterValue } = op;
    const rowY = 40 + index * rowHeight;

    let inputBlockId = null;
    let processBlockId = null;
    let outputBlockId = null;

    // For the INPUT block, we use the reagent name.
    let safeReagent = reagentName ? escapeUser(reagentName) : '';
    let amountText = '';
    // If this operation has parameters and an "Amount" parameter exists, extract it.
    if (parameterValue) {
      for (const key in parameterValue) {
        if (key.trim().toLowerCase() === "amount") {
          let val = parameterValue[key];
          // Skip if the value is "NA" (ignoring case).
          if (typeof val === 'string' && val.trim().toUpperCase() !== "NA") {
            const numericVal = parseFloat(val);
            if (!isNaN(numericVal)) {
              val = numericVal.toFixed(2);
            }
            amountText = `<div>${escapeUser(key)}: ${escapeUser(val)} Kg</div>`; // ADJUST THIS IF NEEDED
          }
          // Remove "Amount" from the parameters so it does not appear in the process block.
          delete parameterValue[key];
          break;
        }
      }
    }
    const inputLabel = safeReagent + amountText;

    if (activityType === 'input->process') {
      // Create INPUT block.
      currentId++;
      inputBlockId = String(currentId);
      cells.push(createBlockCell(
        inputBlockId,
        X_INPUT, rowY,
        BLOCK_WIDTH, BLOCK_HEIGHT,
        inputLabel
      ));

      // Create PROCESS block.
      currentId++;
      processBlockId = String(currentId);
      const processHtml = buildProcessHtml(equipment, description, parameterValue);
      cells.push(createBlockCell(
        processBlockId,
        X_PROCESS, rowY - 30, // slight upward shift for better alignment
        PROCESS_WIDTH, PROCESS_HEIGHT,
        processHtml
      ));

      // Create horizontal arrow from INPUT to PROCESS.
      currentId++;
      cells.push(createEdgeCell(String(currentId), inputBlockId, processBlockId));

    } else if (activityType === 'input->process->output') {
      // Create INPUT block.
      currentId++;
      inputBlockId = String(currentId);
      cells.push(createBlockCell(
        inputBlockId,
        X_INPUT, rowY,
        BLOCK_WIDTH, BLOCK_HEIGHT,
        inputLabel
      ));

      // Create PROCESS block.
      currentId++;
      processBlockId = String(currentId);
      const processHtml = buildProcessHtml(equipment, description, parameterValue);
      cells.push(createBlockCell(
        processBlockId,
        X_PROCESS, rowY - 30,
        PROCESS_WIDTH, PROCESS_HEIGHT,
        processHtml
      ));

      // Create OUTPUT block (placeholder text).
      currentId++;
      outputBlockId = String(currentId);
      cells.push(createBlockCell(
        outputBlockId,
        X_OUTPUT, rowY,
        BLOCK_WIDTH, BLOCK_HEIGHT,
        'to be added manually'
      ));

      // Create horizontal arrows: INPUT → PROCESS and PROCESS → OUTPUT.
      currentId++;
      cells.push(createEdgeCell(String(currentId), inputBlockId, processBlockId));
      currentId++;
      cells.push(createEdgeCell(String(currentId), processBlockId, outputBlockId));

    } else if (activityType === 'process->output') {
      // Create PROCESS block.
      currentId++;
      processBlockId = String(currentId);
      const processHtml = buildProcessHtml(equipment, description, parameterValue);
      cells.push(createBlockCell(
        processBlockId,
        X_PROCESS, rowY - 30,
        PROCESS_WIDTH, PROCESS_HEIGHT,
        processHtml
      ));

      // Create OUTPUT block.
      currentId++;
      outputBlockId = String(currentId);
      cells.push(createBlockCell(
        outputBlockId,
        X_OUTPUT, rowY,
        BLOCK_WIDTH, BLOCK_HEIGHT,
        'to be added manually'
      ));

      // Create horizontal arrow: PROCESS → OUTPUT.
      currentId++;
      cells.push(createEdgeCell(String(currentId), processBlockId, outputBlockId));

    } else {
      // For any other activityType, assume a single PROCESS block.
      currentId++;
      processBlockId = String(currentId);
      const processHtml = buildProcessHtml(equipment, description, parameterValue);
      cells.push(createBlockCell(
        processBlockId,
        X_PROCESS, rowY - 30,
        PROCESS_WIDTH, PROCESS_HEIGHT,
        processHtml
      ));
    }

    // --- Draw vertical arrow linking the PROCESS block from the previous operation to the current one.
    if (lastProcessBlockId && processBlockId) {
      currentId++;
      cells.push(createEdgeCell(String(currentId), lastProcessBlockId, processBlockId));
    }

    if (processBlockId) {
      lastProcessBlockId = processBlockId;
    }
  });

  // Wrap all the cells in the mxGraphModel structure.
  const xml = `<mxGraphModel>
      <root>
        ${cells.join('\n')}
      </root>
    </mxGraphModel>`;
  return xml;
}
