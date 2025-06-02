// settings.js
import exp from "constants";
import path from "path";
import { fileURLToPath } from "url";

/* ─── helpers ────────────────────────────────────────────────── */
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

function normalizePath(p = "") {
  return p
    .replace(/^["']+|["']+$/g, "")   // drop any surrounding quotes
    .replace(/\\/g, "/");            // \ → /
}

function requireEnv(varName) {
  const raw = process.env[varName];
  if (!raw || !raw.trim()) {
    throw new Error(
      `Environment variable ${varName} is required but not set.\n` +
      `Run the script via run.bat (you’ll be prompted for it) ` +
      `or set ${varName} before starting "node excelParser.js".`
    );
  }
  return raw.trim();
}

/* ─── Excel path & sheet (mandatory) ─────────────────────────── */
export const EXCEL_FILE_PATH = normalizePath(requireEnv("EXCEL_FILE_PATH"));
export const EXCEL_TAB       = requireEnv("EXCEL_TAB");

/* ─── Excel column mapping (needed by excelParser.js) ────────── */
export const EXCEL_COLUMNS = {
  synthesisStage: "Synthesis stage",
  activityName:   "Activity name",
  activityType:   "Activity type",
  description:    "Description",
  reagentName:    "Reagent name",
  parameter:      "parameter",
  value:          "value",
  expectedVolume: "Expected Volume",
  equipment1:     "Equipment code 1",
  equipment2:     "Equipment code 2",
  cp:             "CP",
  pc:             "PC",
  cy:             "CY",
  comments:       "Comments",
};

/* ─── Other constants (unchanged) ────────────────────────────── */
export const DOCX_TAB            = EXCEL_TAB;
export const GENERATED_FILES_DIR = path.resolve(__dirname, "./GENERATED_FILES");

export const X_PROCESS            = 220;
export const BLOCK_WIDTH          = 120;
export const PROCESS_WIDTH        = 190;
export const LINE_HEIGHT          = 20;
export const BLOCK_VERTICAL_PADDING = 5;
export const MIN_PROCESS_HEIGHT   = 80;
export const VERTICAL_SPACING     = 30;
export const HORIZONTAL_GAP       = 40;
export const BLOCK_HEIGHT         = 60;

export const EDGE_STYLE =
  "edgeStyle=none;curved=1;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;fontSize=12;startSize=8;endSize=8;";

export const BMR_OPTIONS = { boldPlaceholders: true };

export const ACTUAL_DATA = {
  "[name]":                 "Warehouse code: ............\n\n(e.g.  XXXX-XX)\n\n	......... kg\n\n",
  "[Stirring]":             "Stirring: ........ rpm;\n",
  "[Inert gas flow rate]":  "Gas flow: ........ L/min;\n",
  "[Set temp]":             "Temperature set : ........ °C;\n",
  "[Target Temp]":          "Temperature of reaction mixture: ........ °C;\n",
  "[Expected Result]":      "Result: ..............;\n",
  "[Pressure set range]":   "Pressure set: ........ Torr;\n",
  "[Pressure set]":         "Pressure set: ........ Torr;\n",
  "[Exp. time]":            "Separation time: ........ min;\n",
  "[Perist. Pump set]":     "Peristaltic pump: ........ %;\n",
};

export const PARAMS_TO_OMIT = [
  "Amount",
  "Loaded material temp.",
  "air, moisture, light sensitivity of the material",
  "Mixing on filter",
  "layer thickness",
];
