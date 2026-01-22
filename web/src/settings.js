export const EXCEL_COLUMNS = {
  synthesisStage: "Synthesis stage",
  activityName: "Activity name",
  activityType: "Activity type",
  description: "Description",
  reagentName: "Reagent name",
  parameter: "parameter",
  value: "value",
  expectedVolume: "Expected Volume",
  equipment1: "Equipment code 1",
  equipment2: "Equipment code 2",
  cp: "CP",
  pc: "PC",
  cy: "CY",
  comments: "Comments",
};

export const X_PROCESS = 220;
export const BLOCK_WIDTH = 120;
export const PROCESS_WIDTH = 190;
export const LINE_HEIGHT = 20;
export const BLOCK_VERTICAL_PADDING = 5;
export const MIN_PROCESS_HEIGHT = 80;
export const VERTICAL_SPACING = 30;
export const HORIZONTAL_GAP = 40;
export const BLOCK_HEIGHT = 60;

export const EDGE_STYLE =
  "edgeStyle=none;curved=1;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;fontSize=12;startSize=8;endSize=8;";

export const BMR_OPTIONS = { boldPlaceholders: true };

export const ACTUAL_DATA = {
  "[name]": "Warehouse code: ............\n\n(e.g.  XXXX-XX)\n\n\t......... kg\n\n",
  "[Stirring]": "Stirring: ........ rpm;\n",
  "[Inert gas flow rate]": "Gas flow: ........ L/min;\n",
  "[Set temp]": "Temperature set : ........ \u00b0C;\n",
  "[Target Temp]": "Temperature of reaction mixture: ........ \u00b0C;\n",
  "[Expected Result]": "Result: ..............;\n",
  "[Pressure set range]": "Pressure set: ........ Torr;\n",
  "[Pressure set]": "Pressure set: ........ Torr;\n",
  "[Exp. time]": "Separation time: ........ min;\n",
  "[Perist. Pump set]": "Peristaltic pump: ........ %;\n",
};

export const PARAMS_TO_OMIT = [
  "Amount",
  "Loaded material temp.",
  "air, moisture, light sensitivity of the material",
  "Mixing on filter",
  "layer thickness",
];
