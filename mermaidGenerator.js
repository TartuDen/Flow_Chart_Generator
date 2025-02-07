/**
 * Generates a Mermaid flowchart with each operation on a single horizontal line (row).
 *
 * - We use "flowchart TB" at the top level so subgraphs stack vertically from top to bottom.
 * - For each operation, we create a subgraph "opX" with "direction LR" so its nodes are horizontally laid out:
 *     [Input] --> [Process] --> [Output]
 * - Then we link the "Process" node of the previous subgraph to the "Process" node of the next subgraph vertically.
 *
 * This yields the 3 columns: Input | Process | Output horizontally for each operation.
 */

export function generateMermaidFlowchart(operations) {
    // We'll store lines of Mermaid code in an array
    const lines = [];
    // Start with code fence and the "flowchart TB" directive
    lines.push('```mermaid');
    lines.push('flowchart TB');
  
    // Keep track of the ID of the "process" node from the last operation to link vertically
    let lastProcessId = null;
  
    operations.forEach((op) => {
      const { opNumber, activityType, reagentName, equipment, description, parameterValue } = op;
  
      // Build a "process" label
      let processLabel = equipment ? equipment : '(no equipment)';
      if (description) {
        processLabel += '\\n' + escapeMermaid(description);
      }
  
      // Add parameter lines
      if (parameterValue) {
        for (const [k, v] of Object.entries(parameterValue)) {
          processLabel += `\\n${escapeMermaid(k)}: ${escapeMermaid(v)}`;
        }
      }
  
      // We'll create a subgraph for each operation
      // e.g. subgraph op1["Op#1: loading"]
      const subgraphName = `op${opNumber}`;
      const subgraphTitle = `Op #${opNumber}: ${escapeMermaid(op.activityName) || ''}`;
  
      lines.push(`subgraph ${subgraphName}["${subgraphTitle}"]`);
      lines.push('direction LR'); // ensures left→right inside this subgraph
  
      // We'll create up to 3 node IDs: input, process, output
      const inputId   = `op${opNumber}input`;
      const processId = `op${opNumber}proc`;
      const outputId  = `op${opNumber}out`;
  
      // 1) If we have "input->process->output"
      if (activityType === 'input->process->output') {
        // Input node
        lines.push(`${inputId}(["${escapeMermaid(reagentName)}"])`);
  
        // Process node
        lines.push(`${processId}(["${processLabel}"])`);
  
        // Output node
        lines.push(`${outputId}(["to be added manually"])`);
  
        // Link them: input --> process --> output
        lines.push(`${inputId} --> ${processId}`);
        lines.push(`${processId} --> ${outputId}`);
      }
      // 2) "input->process"
      else if (activityType === 'input->process') {
        lines.push(`${inputId}(["${escapeMermaid(reagentName)}"])`);
        lines.push(`${processId}(["${processLabel}"])`);
  
        lines.push(`${inputId} --> ${processId}`);
      }
      // 3) "process->output"
      else if (activityType === 'process->output') {
        lines.push(`${processId}(["${processLabel}"])`);
        lines.push(`${outputId}(["to be added manually"])`);
  
        lines.push(`${processId} --> ${outputId}`);
      }
      // 4) "process" only
      else {
        lines.push(`${processId}(["${processLabel}"])`);
      }
  
      lines.push('end'); // end of this subgraph
  
      // After closing subgraph, if there's a process node, link the last process node vertically to this one
      // We'll link them with a dotted arrow for clarity, or normal arrow—your choice
      if (lastProcessId && (activityType !== 'input->process->output' || processId)) {
        // We assume "processId" is always created, except for possible null cases
        // But in our code, every type except "process->output" has a process node
        // "process->output" also has a process node, so let's just link if we have it
        lines.push(`${lastProcessId} -.-> ${processId}`);
      }
  
      // Update lastProcessId (the ID of the process node if we have one)
      // For "input->process->output" or "input->process" or "process->output" or "process" all define processId
      lastProcessId = processId;
    });
  
    // Close the code fence
    lines.push('```');
  
    return lines.join('\n');
  }
  
  /**
   * Helper to escape special characters for Mermaid labels
   */
  function escapeMermaid(str) {
    if (!str) return '';
    return String(str)
      .replace(/"/g, '\\"')
      .replace(/`/g, '\\`')
      .replace(/\r?\n|\r/g, ' '); // remove newlines
  }
  