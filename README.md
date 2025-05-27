# Excel to Draw.io Flow‑Chart Generator

This project is a **Node.js** utility that reads an Excel workbook, extracts the
process operations defined on a given sheet, and automatically builds an
mxGraph‑compatible XML file that can be imported into
**[Draw.io (diagrams.net)](https://www.diagrams.net/)** to visualise the flow as a
diagram.

---

## ✨ Features

* **Excel parsing** – operations are detected by a non‑empty
  **“Synthesis stage”** column so a single physical row in Excel can span
  multiple parameter lines.
* **Flow‑chart generation** – understands `input→process`,
  `input→process→output`, `process→output` and plain `process` activity types and
  wires the blocks accordingly.
* **Dynamic block sizing** – each *PROCESS* rectangle automatically expands to
  fit its description and parameter list; matching *INPUT* / *OUTPUT* blocks are
  vertically centred.
* **XML output** – produces a Draw.io‑ready file with all entity names correctly
  escaped.
* **BMR & operations **DOCX** reports** – optional generation of batch‑record and
  template documentation via the *docx* library.

---

## 🛠️ Prerequisites (Windows 11)

| Tool                             | Why you need it                     | Install link                                                                                           |
| -------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Node.js LTS (≥ 18.x)**         | Runs the scripts, installs packages | [https://nodejs.org/en](https://nodejs.org/en)                                                         |
| **Git for Windows** *(optional)* | Easiest way to clone the repo       | [https://gitforwindows.org](https://gitforwindows.org)                                                 |
| **Microsoft Excel**              | To view / edit the source workbook  | Part of Microsoft 365 or Office 2021                                                                   |
| Draw.io Desktop *(optional)*    | Offline editing of the diagram      | [https://github.com/jgraph/drawio-desktop/releases](https://github.com/jgraph/drawio-desktop/releases) |

> **TIP** If you do *not* have admin rights, grab the **.zip**/portable versions
> of Node.js and Draw.io and unzip them somewhere in your user folder; the
> script works fine with those.

---

## 📦 Installation

### 1  Get the code

```powershell
# With Git (recommended)
cd %USERPROFILE%\Projects
git clone https://github.com/YourOrg/flow-chart-generator.git
cd flow-chart-generator

# – or – download ZIP
#   ➜  Extract the archive, then:
cd path\to\flow-chart-generator
```

### 2  Install the Node dependencies

```powershell
npm install
```

This pulls in 📄 **xlsx** (Excel reader), 📄 **docx** (DOCX writer) and
any other libraries declared in `package.json`.

---

## 🔧 Configuration

All runtime settings live in **`settings.js`**.  The most important ones are:

| Constant              | Purpose                                 | Example                  |
| --------------------- | --------------------------------------- | ------------------------ |
| `EXCEL_FILE_PATH`     | Absolute path to the source workbook    | `"C:/Data/Project.xlsm"` |
| `EXCEL_TAB`           | Sheet name containing the process table | `"TP.3 ATI"`             |
| `GENERATED_FILES_DIR` | Where XML & DOCX files are saved        | `./GENERATED_FILES`      |

Open **`settings.js`** in your editor, tweak the paths, then save.

> **Network paths** – UNC shares work fine (`"\\Server\Share\File.xlsm"`) but
> you *must* escape back‑slashes inside strings or use regular `/` slashes.

---

## ▶️ First Run (two options)

### A  PowerShell / Command Prompt

```powershell
cd path\to\flow-chart-generator
node excelParser.js
```

You should see:

```
Parsed Operations:
  … JSON preview …
XML diagram saved to …/GENERATED_FILES/TP.3 ATI.xml
✅ BMR and operations DOCX files generated.
```

### B  Double‑click (Windows only)

1. Create a file named **`runParser.bat`** in the project root with:

   ```bat
   @echo off
   node excelParser.js
   pause
   ```
2. Double‑click the batch file.  A console window will open, run the script and
   wait for you to press a key before closing.

---

## 🖇️ Importing the XML into Draw.io

1. Launch **Draw.io** (web or desktop).
2. **File → Import from Device** and pick the generated `…xml` file.
3. The full flow‑chart appears, ready to style or embed.

---

## 🗺️ Project Structure

| File / folder      | Role                                                       |
| ------------------ | ---------------------------------------------------------- |
| `excelParser.js`   | Orchestrates: reads Excel → builds XML → (optionally) DOCX |
| `xmlGenerator.js`  | Converts operations → mxGraph XML (dynamic block sizing)   |
| `bmrGenerator.js`  | Creates BMR + operations **.docx** reports                 |
| `operations.js`    | Re‑usable step templates for the BMR                       |
| `settings.js`      | **All configurable constants live here**                   |
| `GENERATED_FILES/` | Output folder – safe to delete/regenerate                  |

---

## 🩺 Troubleshooting

| Symptom                                         | Fix                                                             |
| ----------------------------------------------- | --------------------------------------------------------------- |
| **`Error: Cannot find module …`**               | Run `npm install` again or delete `node_modules` and reinstall. |
| **`ENOENT: no such file or directory … .xlsm`** |                                                                 |

| **agram in Draw.io**                | Confirm the console shows parsed operations.  If zero, verify you have the correct *sheet* (`EXCEL_TAB`) and the header row really contains **“Synthesis stage”**. |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Blocked script / security prompt** | Right‑click the `.bat`, choose *Properties → Unblock*, or run from PowerShell `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`.                        |

---

## 📄 License

MIT — see `LICENSE` for details.

| Check `EXCEL_FILE_PATH` is correct and reachable. |
| ------------------------------------------------- |
| **Empty di**                                      |
