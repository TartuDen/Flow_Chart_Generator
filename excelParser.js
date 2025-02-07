import xlsx from 'xlsx'

// 1. Constants for file path and sheet/tab name:
const filePath = "//TBDCenter/08-Arendus/01 RD-PR Projects/03 Atipamezole/01 RnD/04 SCHEMES, LITERATURE, PROCEDURES/excel_test.xlsm";
const tab = "TP.1 ATI";

/**
 * Reads an Excel file and parses out operations under the "Synthesis stage" column.
 * All rows from one non-empty Synthesis Stage cell until the next non-empty Synthesis Stage cell
 * belong to the same operation.
 */
function parseExcelOperations(filePath, sheetName) {
  // Read the workbook from file
  const workbook = xlsx.readFile(filePath);
  
  // Select the specified sheet
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert the sheet to a 2D array (each element is [row][col])
  // Using header:1 => first row is NOT used as keys; it remains raw data.
  const sheetData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  // 2. Find the row index that contains the "Synthesis stage" header
  const headerRowIndex = sheetData.findIndex((row) =>
    row.includes("Synthesis stage")
  );
  
  if (headerRowIndex === -1) {
    console.error("No header row found containing 'Synthesis stage'");
    return [];
  }
  
  // Grab that header row, which lists column titles
  const headers = sheetData[headerRowIndex];

  // 3. Figure out which column index corresponds to each header of interest
  const colSynthesisStage = headers.indexOf("Synthesis stage");
  const colActivityName = headers.indexOf("Activity name");
  const colActivityType = headers.indexOf("Activity type");
  const colDescription = headers.indexOf("Description");
  const colReagentName = headers.indexOf("Reagent name");
  const colParameter = headers.indexOf("parameter");
  const colValue = headers.indexOf("value");
  const colExpectedVolume = headers.indexOf("Expected Volume");
  const colEquipment1 = headers.indexOf("Equipment code 1");
  const colEquipment2 = headers.indexOf("Equipment code 2");
  
  // We'll parse rows from the row below the header to the end
  let operations = [];
  let currentOp = null;
  let opNumber = 1;

  // Helper to safely read a cell
  function getCellValue(row, colIndex) {
    return (colIndex >= 0 && row[colIndex] !== undefined) ? String(row[colIndex]).trim() : "";
  }

  for (let i = headerRowIndex + 1; i < sheetData.length; i++) {
    const row = sheetData[i];
    if (!row || row.length === 0) {
      // Empty row, just skip
      continue;
    }

    // Read the Synthesis Stage cell
    const synthesisStageCell = getCellValue(row, colSynthesisStage);

    // 4. If we find a non-empty Synthesis Stage cell, it means a new operation starts
    if (synthesisStageCell) {
      // Push the previous operation into the list, if we had one
      if (currentOp !== null) {
        operations.push(currentOp);
      }

      // Create a new operation object
      currentOp = {
        opNumber: opNumber++,
        activityName: getCellValue(row, colActivityName) || null,
        activityType: getCellValue(row, colActivityType) || null,  // e.g. input->process
        description: getCellValue(row, colDescription) || null,
        reagentName: getCellValue(row, colReagentName) || null,    // or null if empty
        parameterValue: {},                                        // we'll fill below
        expectedVolume: getCellValue(row, colExpectedVolume) || null,
        // Combine Equipment 1 & Equipment 2 if you like, or choose the first non-empty
        equipment:
          getCellValue(row, colEquipment1) ||
          getCellValue(row, colEquipment2) ||
          null,
      };

      // If the row also has parameter + value, add it to parameterValue
      const paramKey = getCellValue(row, colParameter);
      const paramVal = getCellValue(row, colValue);
      if (paramKey) {
        currentOp.parameterValue[paramKey] = paramVal;
      }
    } else {
      // 5. If Synthesis Stage is empty, it is a continuation row of the same operation
      //    We just add any (parameter, value) to currentOp.parameterValue
      if (!currentOp) {
        // This means we found a row before any actual operation started,
        // you can decide to skip or throw an error, etc.
        continue;
      }
      const paramKey = getCellValue(row, colParameter);
      const paramVal = getCellValue(row, colValue);
      if (paramKey) {
        currentOp.parameterValue[paramKey] = paramVal;
      }
      // You could also check if there's a new Activity name on these continuation lines, etc. 
      // But from your description, it sounds like only parameter/value pairs appear here.
    }
  }

  // After the loop, push the last operation if it exists
  if (currentOp !== null) {
    operations.push(currentOp);
  }

  return operations;
}

// Run it and print the results
const operations = parseExcelOperations(filePath, tab);
console.log(JSON.stringify(operations, null, 2));
