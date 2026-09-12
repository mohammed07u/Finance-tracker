# Passbook — Finance Tracker (real app, Google Sheets backend)

## What changed from your original file
`src/FinanceTracker.jsx` is your component with one change: the data layer.

- `localStorage` is kept as an **instant local cache** and offline fallback.
- On top of it, the whole app state (accounts, transactions, goals, budgets,
  theme) now also syncs to a **Google Sheet** through a Google Apps Script
  Web App, debounced ~800ms after each change.
- A small sync indicator (cloud icon) sits in the top bar: spinning while
  connecting/saving, solid green when synced, amber when only local, red when
  the sheet can't be reached.

Because your app's records (accounts, transactions, goals, budgets) each have
different shapes, the sheet stores **one JSON blob per collection** in a tab
called `AppData` (Key | Value | UpdatedAt), rather than one rigid column
layout per entity. It's still a real Google Sheet as your database — you can
open the `AppData` tab and see/edit the raw JSON per collection — just not
one-row-per-transaction. Say the word if you'd rather have an actual
one-row-per-transaction ledger tab instead (doable, just a different backend).

## 1. Your Apps Script deployment currently 404s
I tested the URL you sent and it returned a 404, meaning the deployment
itself isn't reachable. Fix:
1. Open the Apps Script project bound to your sheet.
2. Paste in `apps-script/Code.gs` (replacing whatever's there).
3. **Deploy > Manage deployments > Edit (pencil) > New version > Deploy.**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Copy the fresh `/exec` URL it gives you — it can change on redeploy.
5. Paste it into `SCRIPT_URL` near the top of `src/FinanceTracker.jsx`.

## 2. Where this file lives in your project
Drop `src/FinanceTracker.jsx` into wherever your existing repo imports it
from (it's a default export, so `import FinanceTracker from "./FinanceTracker"`
keeps working as before). Nothing about routing/build config changes.

## 3. Re-deploying the Apps Script after edits
Editing `Code.gs` alone does not update your live `/exec` URL — you must
create a **New version** under Manage deployments each time.
