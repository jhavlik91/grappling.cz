/**
 * Google Apps Script – grappling.cz semináře
 *
 * SETUP:
 * 1. Vytvoř nový Google Sheet, pojmenuj list "Seminare"
 * 2. Do první řady přidej tyto hlavičky (přesně takhle):
 *    name | instructor | date | time | location | logoUrl | url | registrationFee | description | submitterEmail | approved | submittedAt
 * 3. Ve sloupci "approved" nastav formát buňky na Checkbox (Insert → Checkbox)
 * 4. Zkopíruj tento script do Apps Script (script.google.com), přilinkuj ke Sheetu
 * 5. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Zkopíruj URL deploymentu do Vercel env jako NEXT_PUBLIC_APPS_SCRIPT_URL
 */

const SHEET_ID   = "DOPLŇ_ID_SHEETU";   // z URL Sheetu: /d/TOTO/edit
const SHEET_NAME = "Seminare";
const ADMIN_EMAIL = "hav.honza@gmail.com";

// Pořadí sloupců musí odpovídat hlavičkám v Sheetu
const COLS = {
  name: 0, instructor: 1, date: 2, time: 3, location: 4,
  logoUrl: 5, url: 6, registrationFee: 7, description: 8,
  submitterEmail: 9, approved: 10, submittedAt: 11,
};

function doGet(e) {
  const action = (e.parameter && e.parameter.action) || "list";

  if (action === "submit") {
    return handleSubmit(e.parameter);
  }

  return listApproved();
}

// ─── Zápis nového semináře ────────────────────────────────────────────────────

function handleSubmit(p) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

  sheet.appendRow([
    p.name            || "",
    p.instructor      || "",
    p.date            || "",
    p.time            || "",
    p.location        || "",
    p.logoUrl         || "",
    p.url             || "",
    p.registrationFee || "",
    p.description     || "",
    p.submitterEmail  || "",
    false,                        // approved – admin zaškrtne ručně
    new Date().toISOString(),
  ]);

  MailApp.sendEmail({
    to: ADMIN_EMAIL,
    subject: `[grappling.cz] Nový seminář ke schválení: ${p.name}`,
    body: [
      "Nový seminář čeká na schválení:",
      "",
      `Název:      ${p.name}`,
      `Lektor:     ${p.instructor}`,
      `Datum:      ${p.date}${p.time ? " " + p.time : ""}`,
      `Místo:      ${p.location}`,
      `Poplatek:   ${p.registrationFee || "—"}`,
      `Registrace: ${p.url || "—"}`,
      `Popis:      ${p.description || "—"}`,
      `Email:      ${p.submitterEmail || "—"}`,
      "",
      "Schválit v Google Sheetu (zaškrtni approved = TRUE).",
    ].join("\n"),
  });

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Výpis schválených seminářů ───────────────────────────────────────────────

function listApproved() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const rows  = sheet.getDataRange().getValues();

  if (rows.length < 2) {
    return ContentService
      .createTextOutput("[]")
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers  = rows[0];
  const seminars = rows.slice(1)
    .filter(row => row[COLS.approved] === true)
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        const val = row[i];
        // Vynech prázdné hodnoty a interní sloupce
        if (h && val !== "" && val !== false && h !== "approved" && h !== "submittedAt" && h !== "submitterEmail") {
          obj[h] = String(val);
        }
      });
      return obj;
    });

  return ContentService
    .createTextOutput(JSON.stringify(seminars))
    .setMimeType(ContentService.MimeType.JSON);
}
