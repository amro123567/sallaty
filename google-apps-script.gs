/* =========================================================
   SALLATY – GOOGLE APPS SCRIPT (paste this into your Google Sheet)
   Extensions → Apps Script → paste → Save → Deploy → New deployment
   → Type: Web app → Execute as: Me → Who has access: Anyone → Deploy
   ========================================================= */

// 1) CHANGE THIS PASSWORD. You'll type the same one in admin.html.
const ADMIN_PASSWORD = "change-this-password";

// 2) Name of the Google Drive folder where product photos are saved
const PHOTOS_FOLDER = "Sallaty Photos";

// 3) Leave "" to use the first tab of the sheet
const SHEET_NAME = "";

/* --------- no need to change anything below --------- */

const DEFAULT_HEADERS = ["id", "name", "name_ar", "category", "price", "old_price", "offer_ends", "images",
  "short_description", "short_description_ar", "description", "description_ar",
  "features", "features_ar", "sizes", "colors", "tags", "in_stock", "featured", "hide", "rating", "reviews"];

function doGet() {
  return json({ ok: true, message: "Sallaty admin API is running." });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.key !== ADMIN_PASSWORD) return json({ ok: false, error: "Wrong password" });

    switch (data.action) {
      case "ping":   return json({ ok: true });
      case "list":   return json({ ok: true, ...listProducts() });
      case "upload": return json({ ok: true, url: uploadPhoto(data) });
      case "add":    return json({ ok: true, ...addProduct(data.product || {}) });
      case "hide":   return json({ ok: true, ...setHidden(data.id, data.hidden) });
      case "update": return json({ ok: true, ...updateProduct(data.id, data.product || {}) });
      case "delete": return json({ ok: true, ...deleteProduct(data.id) });
      default:       return json({ ok: false, error: "Unknown action" });
    }
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) });
  }
}

function sheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
  if (!sh) throw new Error("Sheet tab not found: " + SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(DEFAULT_HEADERS); // empty sheet → add headers
  return sh;
}

function headersOf(sh) {
  return sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0]
    .map(h => String(h).trim().toLowerCase());
}

function nextId(sh, headers) {
  const col = headers.indexOf("id");
  if (col < 0 || sh.getLastRow() < 2) return "p001";
  const ids = sh.getRange(2, col + 1, sh.getLastRow() - 1, 1).getValues().flat();
  let max = 0;
  ids.forEach(v => { const m = String(v).match(/(\d+)/); if (m) max = Math.max(max, +m[1]); });
  return "p" + String(max + 1).padStart(3, "0");
}

function addProduct(p) {
  if (!p.name || p.price === "" || p.price == null) throw new Error("Name and price are required");
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet();
    const headers = headersOf(sh);
    // add any missing column headers automatically
    Object.keys(p).forEach(k => {
      if (!headers.includes(k)) { headers.push(k); sh.getRange(1, headers.length).setValue(k); }
    });
    if (!headers.includes("id")) { headers.push("id"); sh.getRange(1, headers.length).setValue("id"); }
    p.id = p.id || nextId(sh, headers);

    const row = headers.map(h => cellValue(h, p[h]));
    sh.appendRow(row);
    return { id: p.id, row: sh.getLastRow() };
  } finally {
    lock.releaseLock();
  }
}

function cellValue(h, v) {
  if (v === undefined || v === null) return "";
  if (h === "price" || h === "old_price" || h === "rating" || h === "reviews") return v === "" ? "" : Number(v);
  v = String(v);
  if (h === "offer_ends" && v) return "'" + v;      // keep dates as plain text (2026-12-24)
  if (/^[=+\-@]/.test(v)) return "'" + v;            // never treat text as a formula
  return v;
}

function findRow(sh, headers, id) {
  const idCol = headers.indexOf("id");
  if (idCol < 0 || sh.getLastRow() < 2) throw new Error("Product not found: " + id);
  const ids = sh.getRange(2, idCol + 1, sh.getLastRow() - 1, 1).getValues().flat().map(String);
  const i = ids.indexOf(String(id));
  if (i < 0) throw new Error("Product not found: " + id);
  return i + 2;
}

function updateProduct(id, p) {
  if (!id) throw new Error("Missing product id");
  if ("name" in p && !p.name) throw new Error("Name is required");
  if ("price" in p && (p.price === "" || p.price == null)) throw new Error("Price is required");
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet();
    const headers = headersOf(sh);
    const row = findRow(sh, headers, id);
    Object.keys(p).forEach(k => {
      if (k === "id") return;
      let col = headers.indexOf(k);
      if (col < 0) { headers.push(k); col = headers.length - 1; sh.getRange(1, col + 1).setValue(k); }
      sh.getRange(row, col + 1).setValue(cellValue(k, p[k]));
    });
    return { id, row };
  } finally {
    lock.releaseLock();
  }
}

function deleteProduct(id) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet();
    sh.deleteRow(findRow(sh, headersOf(sh), id));
    return { id, deleted: true };
  } finally {
    lock.releaseLock();
  }
}

function uploadPhoto(d) {
  if (!d.data) throw new Error("No image data");
  const folders = DriveApp.getFoldersByName(PHOTOS_FOLDER);
  const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(PHOTOS_FOLDER);
  const bytes = Utilities.base64Decode(d.data);
  const name = (d.name || "photo").replace(/[^\w.\-]+/g, "-").slice(0, 80);
  const file = folder.createFile(Utilities.newBlob(bytes, d.mime || "image/jpeg", name));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return "https://drive.google.com/file/d/" + file.getId() + "/view";
}

function listProducts() {
  const sh = sheet();
  const headers = headersOf(sh);
  const last = sh.getLastRow();
  if (last < 2) return { headers, products: [] };
  const values = sh.getRange(2, 1, last - 1, headers.length).getDisplayValues();
  const products = values.map(r => {
    const o = {}; headers.forEach((h, i) => { o[h] = r[i]; }); return o;
  }).filter(o => o.name);
  return { headers, products };
}

function setHidden(id, hidden) {
  const sh = sheet();
  const headers = headersOf(sh);
  const idCol = headers.indexOf("id");
  if (idCol < 0) throw new Error("No id column");
  let hideCol = headers.indexOf("hide");
  if (hideCol < 0) { headers.push("hide"); hideCol = headers.length - 1; sh.getRange(1, hideCol + 1).setValue("hide"); }
  const ids = sh.getRange(2, idCol + 1, Math.max(1, sh.getLastRow() - 1), 1).getValues().flat().map(String);
  const i = ids.indexOf(String(id));
  if (i < 0) throw new Error("Product not found: " + id);
  sh.getRange(i + 2, hideCol + 1).setValue(hidden ? "yes" : "");
  return { id, hidden: !!hidden };
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
