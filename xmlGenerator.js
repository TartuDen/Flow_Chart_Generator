/**
 * Generate an mxGraph XML string from an array of operations.
 * Each operation can have activityTypes:
 *   - "input->process"
 *   - "input->process->output"
 *   - "process->output"
 *   - "process"
 *
 * Columns: INPUT, PROCESS, OUTPUT
 *
 * For "input->process", we draw 2 blocks horizontally plus an arrow between them.
 * For "input->process->output", 3 blocks horizontally plus arrows between them.
 * For "process->output", 2 blocks horizontally plus an arrow.
 * For "process", just 1 block in the PROCESS column.
 * We also connect the "PROCESS" block of this operation to the "PROCESS" block of the next operation vertically.
 */

export function generateFlowChartXML(operations) {
    // Keep a list of <mxCell> elements as strings
    const cells = [];
  
    // We always start with two default cells: "0" and "1"
    // which represent the root of the diagram in mxGraph.
    cells.push(`<mxCell id="0"/>`);
    cells.push(`<mxCell id="1" parent="0"/>`);
  
    // A helper function to escape XML special chars, remove quote marks, etc.
    function cleanText(str) {
      if (!str) return "";
      return String(str)
        // remove literal double-quotes
        .replace(/"/g, "")
        // replace ampersand, <, and > so that XML remains valid
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }
  
    // A helper to build the HTML content for the PROCESS block
    //   <b>equipment</b>
    //   description
    //   each param: value
    function buildProcessHtml(equipment, description, parameterValue) {
      const eq = equipment ? cleanText(equipment) : "null";
      let html = `<b>${eq}</b><div>${cleanText(description)}<br>`;
      if (parameterValue) {
        Object.entries(parameterValue).forEach(([key, val]) => {
          html += `<div>&nbsp; &nbsp; &nbsp; ${cleanText(key)}: ${cleanText(val)},</div>`;
        });
      }
      html += `</div><div><br></div>`; // extra spacing at the bottom
      return html;
    }
  
    // A helper function to create <mxCell> for a block (i.e., a rectangle).
    // We'll pass in:
    //   - id
    //   - x,y coordinates
    //   - width,height
    //   - label (HTML content)
    function createBlockCell(id, x, y, width, height, label) {
      return `<mxCell id="${id}" value="${label}" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
        <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/>
      </mxCell>`;
    }
  
    // A helper function to create an edge between two blocks
    function createEdgeCell(id, source, target, extras = "") {
      // Some default styling from your examples:
      const style = `edgeStyle=none;curved=1;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;fontSize=12;startSize=8;endSize=8;`;
      return `<mxCell id="${id}" style="${style}" edge="1" source="${source}" target="${target}" parent="1">
        <mxGeometry relative="1" as="geometry">${extras}</mxGeometry>
      </mxCell>`;
    }
  
    let currentId = 2; // We already used "0" and "1"
    let lastProcessBlockId = null; // We'll store the ID of the PROCESS block from the previous operation to connect a vertical arrow
  
    // Layout settings
    const rowHeight = 180; // vertical spacing between operations
    // x-positions for each column
    const X_INPUT = 40, X_PROCESS = 220, X_OUTPUT = 400;
    const BLOCK_WIDTH = 120, BLOCK_HEIGHT = 60;
    const PROCESS_WIDTH = 190, PROCESS_HEIGHT = 130; // bigger to fit text
  
    operations.forEach((op, index) => {
      const {
        activityType,
        reagentName,
        description,
        equipment,
        parameterValue
      } = op;
  
      // We'll place each operation in a new "row"
      const rowY = 40 + index * rowHeight;
  
      let inputBlockId = null;
      let processBlockId = null;
      let outputBlockId = null;
  
      const cleanedReagent = cleanText(reagentName);
      const cleanedDescription = cleanText(description);
  
      // =========== 1) Build blocks depending on activityType =============
      if (activityType === "input->process") {
        // (1) Input block (reagentName)
        currentId++;
        inputBlockId = String(currentId);
        cells.push(
          createBlockCell(
            inputBlockId,
            X_INPUT,
            rowY,
            BLOCK_WIDTH,
            BLOCK_HEIGHT,
            cleanedReagent
          )
        );
  
        // (2) Process block
        currentId++;
        processBlockId = String(currentId);
        const processHtml = buildProcessHtml(equipment, description, parameterValue);
        cells.push(
          createBlockCell(
            processBlockId,
            X_PROCESS,
            rowY - 30, // shift up a bit
            PROCESS_WIDTH,
            PROCESS_HEIGHT,
            processHtml
          )
        );
  
        // Horizontal arrow from input block to process block
        currentId++;
        const arrowId = String(currentId);
        cells.push(createEdgeCell(arrowId, inputBlockId, processBlockId));
  
      } else if (activityType === "input->process->output") {
        // (1) Input block
        currentId++;
        inputBlockId = String(currentId);
        cells.push(
          createBlockCell(
            inputBlockId,
            X_INPUT,
            rowY,
            BLOCK_WIDTH,
            BLOCK_HEIGHT,
            cleanedReagent
          )
        );
  
        // (2) Process block
        currentId++;
        processBlockId = String(currentId);
        const processHtml = buildProcessHtml(equipment, description, parameterValue);
        cells.push(
          createBlockCell(
            processBlockId,
            X_PROCESS,
            rowY - 30,
            PROCESS_WIDTH,
            PROCESS_HEIGHT,
            processHtml
          )
        );
  
        // (3) Output block
        currentId++;
        outputBlockId = String(currentId);
        cells.push(
          createBlockCell(
            outputBlockId,
            X_OUTPUT,
            rowY,
            BLOCK_WIDTH,
            BLOCK_HEIGHT,
            "to be added manually"
          )
        );
  
        // Arrows: input → process, process → output
        currentId++;
        cells.push(createEdgeCell(String(currentId), inputBlockId, processBlockId));
        currentId++;
        cells.push(createEdgeCell(String(currentId), processBlockId, outputBlockId));
  
      } else if (activityType === "process->output") {
        // (1) Process block
        currentId++;
        processBlockId = String(currentId);
        const processHtml = buildProcessHtml(equipment, description, parameterValue);
        cells.push(
          createBlockCell(
            processBlockId,
            X_PROCESS,
            rowY - 30,
            PROCESS_WIDTH,
            PROCESS_HEIGHT,
            processHtml
          )
        );
  
        // (2) Output block
        currentId++;
        outputBlockId = String(currentId);
        cells.push(
          createBlockCell(
            outputBlockId,
            X_OUTPUT,
            rowY,
            BLOCK_WIDTH,
            BLOCK_HEIGHT,
            "to be added manually"
          )
        );
  
        // Arrow: process → output
        currentId++;
        cells.push(createEdgeCell(String(currentId), processBlockId, outputBlockId));
  
      } else {
        // Otherwise, assume "process" only
        currentId++;
        processBlockId = String(currentId);
        const processHtml = buildProcessHtml(equipment, description, parameterValue);
        cells.push(
          createBlockCell(
            processBlockId,
            X_PROCESS,
            rowY - 30,
            PROCESS_WIDTH,
            PROCESS_HEIGHT,
            processHtml
          )
        );
      }
  
      // =========== 2) Vertical arrow from last operation's process to this one =============
      if (lastProcessBlockId && processBlockId) {
        currentId++;
        const verticalEdgeId = String(currentId);
        cells.push(createEdgeCell(verticalEdgeId, lastProcessBlockId, processBlockId));
      }
  
      // Update lastProcessBlockId for next iteration
      if (processBlockId) {
        lastProcessBlockId = processBlockId;
      }
    });
  
    // Finally, wrap everything in <mxGraphModel> ... </mxGraphModel>
    const xml = `<mxGraphModel>
    <root>
      ${cells.join("\n")}
    </root>
  </mxGraphModel>`;
  
    return xml;
  }
  