@echo off
REM Call node with 2 arguments: the Excel file, the sheet name
REM Example: .\runParser.bat "C:\stuff\myFile.xlsm" "Sheet1"

if "%~1"=="" (
  echo Usage: runParser.bat excelFilePath tabName
  exit /b 1
)
if "%~2"=="" (
  echo Usage: runParser.bat excelFilePath tabName
  exit /b 1
)

node excelParser.js "%~1" "%~2"

pause
