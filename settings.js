// settings.js

import exp from "constants";

// Excel file settings
export const EXCEL_FILE_PATH = "//TBDCenter/08-Arendus/01 RD-PR Projects/03 Atipamezole/01 RnD/04 SCHEMES, LITERATURE, PROCEDURES/SD-PGI Atipamezol 2.2  20250305 draft.xlsm";
export const EXCEL_TAB = "TP.1 DETO";

// Excel columns mapping
export const EXCEL_COLUMNS = {
  synthesisStage: 'Synthesis stage',
  activityName: 'Activity name',
  activityType: 'Activity type',
  description: 'Description',
  reagentName: 'Reagent name',
  parameter: 'parameter',
  value: 'value',
  expectedVolume: 'Expected Volume',
  equipment1: 'Equipment code 1',
  equipment2: 'Equipment code 2',
  cp: 'CP',
  pc: 'PC',
  cy: 'CY',
  // ADDED COMMENTS COLUMN
  comments: 'Comments'
};

// BMR (DOCX) settings
export const DOCX_TAB = EXCEL_TAB; // Re-use the Excel tab value for consistency

// Layout settings for XML Generator
export const ROW_HEIGHT = 150;// to change row height
export const X_INPUT = 60;
export const X_PROCESS = 220;
export const X_OUTPUT = 450;
export const BLOCK_WIDTH = 120;
export const BLOCK_HEIGHT = 60;
export const PROCESS_WIDTH = 190;
export const PROCESS_HEIGHT = 120; // to change height of process block

// Edge style for XML arrows
export const EDGE_STYLE = 'edgeStyle=none;curved=1;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;fontSize=12;startSize=8;endSize=8;';

// BMR options: specify whether to wrap substituted placeholders in bold
export const BMR_OPTIONS = {
  boldPlaceholders: true
};

// Unit mapping (this was previously used, but is no longer required)
export const UNIT_MAP = {
  "stirring": "rpm",
  "argon flow": "L/min",
  "pH": "",
  "Target Temp": "°C",
  "set temp": "°C",
  "target temp": "°C",
  "time": ""
};

/**
 * This object defines the "actual data" lines corresponding to placeholders
 * that appear in the description. If the placeholder is actually used,
 * that line is appended to the "Actual Data" column in the BMR document.
 */
export const ACTUAL_DATA = {
  "[name]": "Warehouse code: ............\n\n(e.g.  XXXX-XX)\n\n1	......... kg\n2	......... kg\n3	......... kg\n4	......... kg\nTotal	......... kg\n",
  "[Stirring]": "Stirring set: ........ rpm;\n",
  "[Inert gas flow rate]": "gas flow set: ........ L/min;\n",
  "[Set temp]": "Temperature set : ........ oC;\n",
  "[Target Temp]": "Temperature: ........ oC;\n",
  "[Expected Result]": "Result: ..............;\n",
  "[Pressure set range]": "Pressure set: ........ Torr;\n",
  "[Pressure set]": "Pressure set: ........ Torr;\n",
  "[Exp. time]": "Separation time: ........ min;\n",
  "[Perist. Pump set]": "Peristaltic pump set: ........ %;\n"
};

export const PARAMS_TO_OMIT = [
  "Amount",
  "Loaded material temp.",
  "air, moisture, light sensitivity of the material",
  "Mixing on filter",
  "layer thickness"]
