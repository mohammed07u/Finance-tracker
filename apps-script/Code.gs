/**
 * Passbook — Finance Tracker backend (full app state)
 * Uses a single Google Sheet as the database.
 *
 * Rather than mapping every field of accounts/transactions/goals/budgets to
 * rigid spreadsheet columns (which breaks the moment the app's data shape
 * changes), this stores one JSON blob per collection in a sheet called
 * "AppData". Each row is: Key | Value (JSON) | UpdatedAt.
 * Keys used: accounts, transactions, goalsList, budgets, theme
 *
 * SETUP
 * 1. Create a Google Sheet (any name).
 * 2. Extensions > Apps Script, delete the placeholder, paste this file.
 * 3. Deploy > New deployment > type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 4. Copy the /exec URL into SCRIPT_URL in src/FinanceTracker.jsx.
 * 5. Whenever you edit this script: Deploy > Manage deployments > Edit (pencil)
 *    > New version > Deploy. Editing alone does NOT update the live /exec URL.
 */

const SHEET_NAME = "AppData";
const KEYS = ["accounts", "transactions", "goalsList", "budgets", "theme"];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Key", "Value", "UpdatedAt"]);
  }
  return sheet;
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = (e.parameter.action || "all").toLowerCase();
  if (action === "all") {
    return jsonOut_(readAll_());
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

  if (action === "sync") {
    writeAll_(payload);
    return jsonOut_({ ok: true });
  }

  return jsonOut_({ ok: false, error: "Unknown action" });
}

function readAll_() {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const out = {};
  for (let i = 1; i < values.length; i++) {
    const key = values[i][0];
    const raw = values[i][1];
    if (!key) continue;
    try {
      out[key] = raw ? JSON.parse(raw) : null;
    } catch (err) {
      out[key] = null;
    }
  }
  return out;
}

function writeAll_(payload) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const rowByKey = {};
  for (let i = 1; i < values.length; i++) {
    if (values[i][0]) rowByKey[values[i][0]] = i + 1; // sheet rows are 1-indexed
  }

  const now = new Date().toISOString();
  KEYS.forEach((key) => {
    if (!(key in payload)) return;
    const json = JSON.stringify(payload[key]);
    if (rowByKey[key]) {
      sheet.getRange(rowByKey[key], 2, 1, 2).setValues([[json, now]]);
    } else {
      sheet.appendRow([key, json, now]);
    }
  });
}
