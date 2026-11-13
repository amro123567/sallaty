/* =========================================================
   SALLATY – LOAD PRODUCTS FROM A GOOGLE SHEET
   If CONFIG.PRODUCTS_SHEET_URL is set, products come from your
   Google Sheet. If it's empty (or the sheet can't be reached and
   nothing is cached), products.js is used instead.
   ========================================================= */
const loadProducts = (() => {
  const CACHE_KEY = "sallaty_sheet_cache_v1";

  /* --- Small CSV parser (handles quotes, commas and line breaks in cells) --- */
  function parseCSV(text) {
    const rows = []; let row = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += c;
    }
    if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(r => r.some(v => v.trim() !== ""));
  }

  const yes = v => /^(yes|y|true|1|نعم|✓|x)$/i.test(String(v).trim());
  const num = v => { const n = parseFloat(String(v).replace(/[^\d.]/g, "")); return isNaN(n) ? undefined : n; };
  const list = (v, sep = /[|\n]/) => String(v || "").split(sep).map(s => s.trim()).filter(Boolean);
  const slug = s => String(s).toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "other";

  // Accepts 2026-12-20, 20/12/2026, 12/20/2026 → returns YYYY-MM-DD
  function normDate(v) {
    v = String(v || "").trim();
    if (!v) return undefined;
    let m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
    m = v.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
    if (m) {
      let [a, b] = [+m[1], +m[2]];
      const [d, mo] = a > 12 ? [a, b] : b > 12 ? [b, a] : [a, b]; // ambiguous → day/month (Lebanon style)
      return `${m[3]}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
    const t = Date.parse(v);
    return isNaN(t) ? undefined : new Date(t).toISOString().slice(0, 10);
  }

  // Google Drive share links → direct image links. Plain file names → assets/products/
  function imageUrl(v) {
    v = v.trim();
    const drive = v.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);
    if (drive) return `https://drive.google.com/thumbnail?id=${drive[1]}&sz=w1000`;
    if (/^(https?:)?\/\//.test(v) || v.startsWith("assets/")) return v;
    return "assets/products/" + v;
  }

  function rowsToProducts(rows) {
    const head = rows[0].map(h => h.trim().toLowerCase().replace(/[^a-z_]/g, ""));
    const col = (r, name) => { const i = head.indexOf(name); return i < 0 ? "" : (r[i] || "").trim(); };
    const out = [];
    rows.slice(1).forEach((r, idx) => {
      const name = col(r, "name");
      const price = num(col(r, "price"));
      if (!name || price === undefined) return;            // skip incomplete rows
      if (col(r, "hide") && yes(col(r, "hide"))) return;   // hide = yes → not shown

      const variants = {};
      const sizes = list(col(r, "sizes"), /[,|]/), colors = list(col(r, "colors"), /[,|]/);
      if (sizes.length) variants.Size = sizes;
      if (colors.length) variants.Color = colors;

      const ar = {};
      if (col(r, "name_ar")) ar.name = col(r, "name_ar");
      if (col(r, "short_description_ar")) ar.shortDescription = col(r, "short_description_ar");
      if (col(r, "description_ar")) ar.description = col(r, "description_ar");
      if (col(r, "features_ar")) ar.features = list(col(r, "features_ar"));

      const images = list(col(r, "images"), /[|\n,]/).map(imageUrl);
      const stock = col(r, "in_stock");
      out.push({
        id: col(r, "id") || "row" + (idx + 2),
        name,
        category: col(r, "category") || "Other",
        price,
        oldPrice: num(col(r, "old_price")),
        offerEndsAt: normDate(col(r, "offer_ends")),
        images: images.length ? images : ["assets/favicon.png"],
        shortDescription: col(r, "short_description"),
        description: col(r, "description") || col(r, "short_description"),
        features: list(col(r, "features")),
        variants: Object.keys(variants).length ? variants : undefined,
        tags: list(col(r, "tags"), /[,|]/).map(t => t.toLowerCase()),
        inStock: stock === "" ? true : yes(stock),
        featured: yes(col(r, "featured")),
        ar: Object.keys(ar).length ? ar : undefined
      });
    });
    return out;
  }

  // Match sheet categories to CATEGORIES (by id or English/Arabic name); add new ones automatically
  function linkCategories(products) {
    products.forEach(p => {
      const raw = String(p.category).trim();
      let c = CATEGORIES.find(c => [c.id, c.name, c.nameAr].some(v => v && v.toLowerCase() === raw.toLowerCase()));
      if (!c) { c = { id: slug(raw), name: raw, nameAr: raw, icon: "🛍️" }; CATEGORIES.push(c); }
      p.category = c.id;
    });
    // hide categories that have no products
    const used = new Set(products.map(p => p.category));
    for (let i = CATEGORIES.length - 1; i >= 0; i--) if (!used.has(CATEGORIES[i].id)) CATEGORIES.splice(i, 1);
  }

  function apply(products) {
    PRODUCTS.length = 0;
    PRODUCTS.push(...products);
    linkCategories(PRODUCTS);
  }

  return async function load() {
    let url = (typeof CONFIG !== "undefined" && CONFIG.PRODUCTS_SHEET_URL || "").trim();
    if (!url) return "file";
    // FAST MODE: the normal sheet link (…/spreadsheets/d/<ID>/edit…) → live CSV that updates within seconds.
    // The sheet must be shared as "Anyone with the link – Viewer".
    const live = url.match(/docs\.google\.com\/spreadsheets\/d\/(?!e\/)([\w-]+)/);
    if (live) {
      const gid = (url.match(/[#&?]gid=(\d+)/) || [])[1];
      url = `https://docs.google.com/spreadsheets/d/${live[1]}/gviz/tq?tqx=out:csv&headers=1${gid ? "&gid=" + gid : ""}`;
    }
    // Accept the "web page" publish link too (pubhtml) and turn it into the CSV link
    else if (url.includes("docs.google.com") && !/output=csv/.test(url)) {
      url = url.replace("/pubhtml", "/pub").replace(/[?&]output=\w+/, "");
      url += (url.includes("?") ? "&" : "?") + "output=csv";
    }
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(url + (url.includes("?") ? "&" : "?") + "t=" + Date.now(), { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const text = await res.text();
      if (/^\s*<!doctype|<html/i.test(text)) throw new Error("Sheet is not published as CSV");
      const rows = parseCSV(text);
      const products = rowsToProducts(rows);
      if (!products.length) {
        // The sheet was reached but has no valid rows: show NO products (never old/sample ones)
        console.warn("[Sallaty] Sheet loaded but no valid products. Every row needs at least 'name' and 'price'. Headers found:", rows[0]);
        try { localStorage.removeItem(CACHE_KEY); } catch (e) { /* ignore */ }
        apply([]);
        return "sheet-empty";
      }
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(products)); } catch (e) { /* ignore */ }
      apply(products);
      return "sheet";
    } catch (err) {
      console.warn("[Sallaty] Could not load Google Sheet:", err.message);
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (Array.isArray(cached) && cached.length) { apply(cached); return "cache"; }
      } catch (e) { /* ignore */ }
      return "file"; // fall back to products.js
    }
  };
})();
