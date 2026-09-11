// ============================================================
// Passbook — Google Apps Script backend
// Deploy: Extensions > Apps Script > paste this in > Deploy >
// New deployment > Web app > Execute as: Me > Who has access: Anyone
// Copy the /exec URL it gives you into js/app.js CONFIG.SCRIPT_URL.
//
// IMPORTANT: every time you edit this file, you must create a
// NEW VERSION of the deployment (Deploy > Manage deployments >
// pencil icon > Version: New version > Deploy) or your changes
// will not go live. Making a brand new deployment instead gives
// you a different URL and will break the app.
// ============================================================

const SHEET_NAME = "Transactions";
const HEADERS = ["ID", "Timestamp", "Description", "Amount", "Category", "Type"];

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
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    const action = (e.parameter && e.parameter.action) || "list";
    const sheet = getSheet_();

    if (action === "ping") {
      return jsonOut_({ ok: true, sheet: sheet.getName(), rows: Math.max(sheet.getLastRow() - 1, 0) });
    }

    if (action === "list") {
      return jsonOut_({ ok: true, entries: readEntries_(sheet) });
    }

    return jsonOut_({ ok: false, error: "Unknown action: " + action });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = getSheet_();

    if (payload.action === "add") {
      const entry = addEntry_(sheet, payload.entry);
      return jsonOut_({ ok: true, entry });
    }

    if (payload.action === "delete") {
      deleteEntry_(sheet, payload.id);
      return jsonOut_({ ok: true });
    }

    return jsonOut_({ ok: false, error: "Unknown action: " + payload.action });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

function readEntries_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  return values
    .filter(row => row[0] !== "")
    .map(row => ({
      id: row[0],
      timestamp: row[1] instanceof Date ? row[1].toISOString() : row[1],
      description: row[2],
      amount: row[3],
      category: row[4],
      type: row[5],
    }));
}

function addEntry_(sheet, entry) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const timestamp = new Date().toISOString();
  sheet.appendRow([id, timestamp, entry.description, Number(entry.amount), entry.category, entry.type]);
  return { id, timestamp, description: entry.description, amount: Number(entry.amount), category: entry.category, type: entry.type };
}

function deleteEntry_(sheet, id) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);
      return;
    }
  }
}
