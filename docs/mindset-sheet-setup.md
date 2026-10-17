# Mindset assessment: Google Sheet setup

One row is appended to a Google Sheet every time a candidate finishes the
exam at `/assessment/mindset`. This is optional. Leave
`MINDSET_SHEET_WEBHOOK_URL` unset and everything else still works, you just
get the email and the PDF without the spreadsheet.

Setup takes about five minutes and needs no Google Cloud project, no service
account and no API keys. The sheet stays entirely in your own Drive.

## 1. Create the sheet

Make a new Google Sheet. Name it something like "Mindset assessment
results". Leave it empty, the script writes the header row itself the first
time a candidate submits.

## 2. Add the script

In that sheet: **Extensions > Apps Script**. Delete whatever is in the
editor and paste this:

```javascript
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // two candidates submitting at once must not interleave
  try {
    var body = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Write the header row once, on the first submission.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(body.columns);
      sheet.getRange(1, 1, 1, body.columns.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    sheet.appendRow(body.values);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) }),
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

Save it.

## 3. Deploy it

**Deploy > New deployment**, then:

- Click the gear next to "Select type" and choose **Web app**
- Execute as: **Me**
- Who has access: **Anyone**
- Click **Deploy**, then authorise it when Google asks

"Anyone" sounds alarming but is what makes an unauthenticated POST possible
at all. The deployment URL is the only thing that can write to the sheet, so
treat that URL as a secret. Nobody can read the sheet through it, the script
only ever appends.

Copy the **Web app URL**. It looks like
`https://script.google.com/macros/s/AKfy.../exec`.

## 4. Add it to Vercel

In the Vercel project: **Settings > Environment Variables**, add

```
MINDSET_SHEET_WEBHOOK_URL = <the web app URL>
```

for Production (and Preview if you want test submissions mirrored too), then
redeploy so the running functions pick it up.

## Columns

Written in this order. The script appends positionally, so if a column is
ever added in code it goes on the end, never in the middle.

Submitted at · Name · Email · Phone · College · Overall fit % · Time taken ·
How it ended · Questions skipped · Tab switches · Fullscreen exits · Total
proctoring events · Proctoring detail · one % column per trait and
situational category · the three written answers.

## Checking it works

Take the exam yourself and submit. The row should appear within a second or
two of the confirmation screen. If it does not:

- Vercel function logs will show `[mindset-sheet]` with the reason
- A `401` or `403` usually means the deployment is not set to "Anyone"
- Re-deploying the Apps Script creates a **new** URL unless you choose
  "Manage deployments" and edit the existing one. If you create a new
  deployment, update the Vercel variable too.

A failure here never affects the candidate. Their answers are already saved
in Postgres and both emails have already gone out by the time the sheet is
written.
