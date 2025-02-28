// settings.js

// Excel file settings
export const EXCEL_FILE_PATH = "//TBDCenter/08-Arendus/01 RD-PR Projects/03 Atipamezole/01 RnD/04 SCHEMES, LITERATURE, PROCEDURES/SD-PGI Atipamezol 2.1  20250228 draft.xlsm";
export const EXCEL_TAB = "TP.4 ATI";

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
  cy: 'CY'
};

// BMR (DOCX) settings
export const DOCX_TAB = EXCEL_TAB; // Re-use the Excel tab value for consistency

// Layout settings for XML Generator
export const ROW_HEIGHT = 180;
export const X_INPUT = 40;
export const X_PROCESS = 220;
export const X_OUTPUT = 480;
export const BLOCK_WIDTH = 120;
export const BLOCK_HEIGHT = 60;
export const PROCESS_WIDTH = 190;
export const PROCESS_HEIGHT = 130;

// Edge style for XML arrows
export const EDGE_STYLE = 'edgeStyle=none;curved=1;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;fontSize=12;startSize=8;endSize=8;';

// BMR options: specify whether to wrap substituted placeholders in bold and force the first word to bold
export const BMR_OPTIONS = {
  boldPlaceholders: true,
  boldFirstWord: true,
};

// Unit mapping for the "Actual Data" column in BMR
export const UNIT_MAP = {
  "stirring": "rpm",
  "argon flow": "L/min",
  "pH": "",
  "temp. of rm": "°C",
  "set temp": "°C",
  "target temp": "°C",
  "time": "",
};
