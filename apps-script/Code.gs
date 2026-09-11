/**
 * Passbook — Finance Tracker backend
 * Uses a Google Sheet as the database.
 *
 * SETUP
 * 1. Create a Google Sheet. Rename the first tab "Transactions".
 * 2. In row 1, add headers exactly:
 *    ID | Date | Description | Category | Type | Amount
 * 3. Extensions > Apps Script, delete any starter code, paste this file.
 * 4. Deploy > New deployment > select type "Web app".
 *      - Description: passbook-api
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Copy the resulting /exec URL into SCRIPT_URL in js/app.js.
 * 6. Whenever you edit this script, re-deploy (Manage deployments > Edit > New version).
 */

const SHEET_NAME = "Transactions";
const HEADERS = ["ID", "Date", "Description", "Category", "Type", "Amount"];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = (e.parameter.action || "list").toLowerCase();
  if (action === "list") {
    return jsonOut_({ entries: listEntries_() });
  }
  return jsonOut_({ error: "Unknown action" });
}

function doPost(e) {
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut_({ ok: false, error: "Invalid JSON body" });
  }

  const action = (payload.action || "").toLowerCase();

  if (action === "add") {
    addEntry_(payload.entry);
    return jsonOut_({ ok: true });
  }

  if (action === "delete") {
    deleteEntry_(payload.id);
    return jsonOut_({ ok: true });
  }

  return jsonOut_({ ok: false, error: "Unknown action" });
}

function listEntries_() {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const rows = values.slice(1); // skip header
  return rows
    .filter(r => r[0] !== "" && r[0] !== undefined)
    .map(r => ({
      id: String(r[0]),
      date: new Date(r[1]).toISOString(),
      description: String(r[2]),
      category: String(r[3]),
      type: String(r[4]),
      amount: Number(r[5])
    }));
}

function addEntry_(entry) {
  const sheet = getSheet_();
  sheet.appendRow([
    entry.id,
    entry.date,
    entry.description,
    entry.category,
    entry.type,
    entry.amount
  ]);
}

function deleteEntry_(id) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      sheet.deleteRow(i + 1); // +1 because sheet rows are 1-indexed
      break;
    }
  }
}
