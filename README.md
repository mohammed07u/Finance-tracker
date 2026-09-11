# Passbook — Finance Tracker (Google Sheets backend)

## Why it was stuck on "Connecting to sheet…"

Your previous deployed script URL returns a **404** right now — the endpoint
itself isn't reachable, which is why the UI spun forever (it was waiting on a
response that was never going to arrive). This version fixes that in two ways:

1. **A 12-second timeout + visible error banner with a Retry button**, so a
   dead endpoint shows a clear message instead of an infinite spinner.
2. **A `ping` action** you can hit directly in a browser tab to test the
   script in isolation, with no UI involved.

## Setup

1. Open your Google Sheet → **Extensions → Apps Script**.
2. Delete any existing code, paste in `apps-script/Code.gs`.
3. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click Deploy, authorize it, and copy the URL ending in `/exec`.
5. Paste that URL into `js/app.js` → `CONFIG.SCRIPT_URL`.
6. Sanity-check it works *before* touching the UI: paste
   `YOUR_URL/exec?action=ping` straight into a browser address bar. You
   should see `{"ok":true,"sheet":"Transactions","rows":0}`. If you get a
   404, a login page, or an HTML error page instead — the deployment is the
   problem, not the app.

## The #1 gotcha: editing code doesn't update your live URL

If you change `Code.gs` later, the `/exec` URL **does not automatically pick
up the change**. You must go to:

**Deploy → Manage deployments → pencil/edit icon → Version: "New version" → Deploy**

Creating a brand-new deployment instead gives you a *different* URL and will
silently break the app (it'll keep hitting the old, stale code).

## Files

- `index.html` — structure
- `css/style.css` — ledger-style theme, doughnut chart, row/entrance animations
- `js/app.js` — all logic: connection test, CRUD calls, chart drawing, optimistic UI
- `apps-script/Code.gs` — the backend that reads/writes your `Transactions` sheet tab

## Data model

Sheet tab `Transactions`, columns: `ID | Timestamp | Description | Amount | Category | Type`.
Created automatically on first `ping` or `list` call if missing.

## Notes

- "Anyone can access" on the Apps Script deployment means anyone with the
  URL can read/write your sheet. Fine for a personal project; don't reuse
  this pattern for anything with sensitive multi-user data.
- All requests use `text/plain` content-type on POST bodies (parsed as JSON
  server-side) specifically to avoid a CORS preflight, which Apps Script
  handles unreliably.
