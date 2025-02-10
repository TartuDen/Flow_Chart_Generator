# Excel to Draw.io Flow Chart Generator

This project is a Node.js utility that reads an Excel file, extracts process operations from a specified sheet, and generates an mxGraph XML file that can be imported into [Draw.io (diagrams.net)](https://www.diagrams.net/) to create a flow chart.

## Features

- **Excel Parsing:** Extracts operations based on a "Synthesis stage" header.
- **Flow Chart Generation:** Supports multiple activity types (e.g., `input->process`, `input->process->output`, etc.) by generating appropriate blocks and connecting arrows.
- **XML Output:** Produces an mxGraph XML diagram with properly escaped attribute values so that it can be imported directly into Draw.io.
- **Custom Output File Name:** The XML file is saved with a name based on the specified tab name.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 12 or later is recommended)
- npm (Node package manager, usually installed with Node.js)

## Installation

1. **Clone or Download** the repository to your local machine.
2. Open a terminal (or command prompt) in the project directory.
3. Run the following command to install the required modules:

```bash
   npm install
```
This installs the xlsx module (and uses Node’s built-in fs module).

## Configuration
Before running the script, update the following constants in excelParser.js:

### filePath
The full path to your Excel file. For example:

```bash
const filePath = 'your file path';
```

### tab
The name of the sheet (tab) within the Excel file from which to extract the data. For example:

```bash
const tab = 'tab name';
```
## Usage
### Running from the Command Line
1. Open a terminal or command prompt in the project directory.

2. Run the following command:

```bash
node excelParser.js
```
The script will:

* Parse the Excel file using the provided filePath and tab.
* Output the parsed operations as JSON in the console.
* Generate an mxGraph XML diagram and save it to a file named <tab>.xml (for example, TP.1 project.xml).
  
## Using a Batch File on Windows
If you prefer a clickable solution for Windows users, you can create a batch file (e.g., runParser.bat) with the following contents:

```bat
@echo off
REM Run the Node.js script
node excelParser.js
pause
```
Double-click the batch file to run the script.
Note: This approach still requires Node.js and the necessary modules to be installed on the system.

## Importing the Generated XML into Draw.io
1. Open Draw.io (diagrams.net) in your browser or use the Draw.io desktop app.
2. In Draw.io, go to File → Import From → Device (or File → Open).
3. Select the generated XML file (named after your tab constant, e.g., TP.1 ATI.xml).
4. The flow chart diagram will be imported and displayed.

## Code Overview
1. excelParser.js
Contains the code to:

  * Parse the Excel file and extract operations.
  * Generate the mxGraph XML using the generateFlowChartXML function from xmlGenerator.js.
  * Save the XML to a file (named after the tab name).
2. xmlGenerator.js
Contains the generateFlowChartXML function that:

  * Builds the mxGraph XML diagram using the operations data.
  * Escapes HTML content so that < and > characters are replaced with XML entities.
  * Sets up the layout (positions and sizes) for the blocks and arrows.

## Troubleshooting
1. Missing Modules:
If you get errors about missing modules, ensure you have run npm install.

2. Incorrect File Path or Tab Name:
Verify that the constants filePath and tab in excelParser.js are set to the correct values for your Excel file and sheet.

3. Empty Diagram in Draw.io:
If the XML file appears empty when imported into Draw.io, check the console output to confirm that operations were parsed correctly. Also, ensure that you are importing the correct XML file.

## License
This project is open source and available under the MIT License.
