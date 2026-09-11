# Passbook — Finance Tracker (Google Sheets backend)

A lightweight income/expense tracker that uses a **Google Sheet** as its database,
via a Google Apps Script Web App acting as a tiny REST API.

## Files
```
index.html            The app UI
css/style.css          Styling + animations
js/app.js              Frontend logic (fetches/writes to your Apps Script URL)
apps-script/Code.gs    Paste this into Google Apps Script (server side)
```

## 1. Create the Google Sheet
1. Go to https://sheets.new
2. Rename the first tab to `Transactions`.
3. Row 1 headers (optional — the script creates them automatically too):
   `ID | Date | Description | Category | Type | Amount`

## 2. Add the Apps Script
1. In the sheet: **Extensions > Apps Script**.
2. Delete the placeholder code, paste the contents of `apps-script/Code.gs`.
3. Click **Deploy > New deployment**.
4. Type: **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, authorize the permissions Google asks for.
6. Copy the **Web app URL** (ends in `/exec`).

## 3. Connect the frontend
Open `js/app.js` and paste your URL into:
```js
const SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
```

## 4. Run it
Just open `index.html` in a browser (or serve the folder with any static server /
GitHub Pages / Netlify). Every add/delete writes straight to your Google Sheet.

## Updating the script later
Whenever you change `Code.gs`, go to **Deploy > Manage deployments > Edit (pencil) >
New version > Deploy** — editing the script alone does not update the live `/exec` URL.

## Notes
- Requests are sent as `text/plain` on purpose, to avoid a CORS preflight that
  Apps Script Web Apps don't handle well.
- This is fine for personal/small-scale use. For a shared team sheet, consider
  adding basic auth (a shared secret checked in `doPost`).
