/* =========================================================
   SALLATY – MAIN SCRIPT
   Shared layout (header, footer, cart drawer, WhatsApp button)
   + page logic for home, product and checkout pages.
   ========================================================= */
(() => {
  "use strict";

  /* ---------- Helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };
  const LANG = store.get("sallaty_lang", CONFIG.DEFAULT_LANG) === "ar" ? "ar" : "en";
  const T = k => (I18N[LANG] && I18N[LANG][k]) || I18N.en[k] || k;
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = n => CONFIG.CURRENCY + (Number.isInteger(+n) ? (+n).toString() : (+n).toFixed(2));
  const money2 = n => CONFIG.CURRENCY + (+n).toFixed(2); // always 2 decimals (WhatsApp message)
  const P = (p, field) => (LANG === "ar" && p.ar && p.ar[field]) || p[field];
  const isOffer = p => typeof p.oldPrice === "number" && p.oldPrice > p.price;
  const discount = p => (isOffer(p) ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);
  const cat = id => CATEGORIES.find(c => c.id === id);
  const catName = id => { const c = cat(id); return c ? (LANG === "ar" && c.nameAr) || c.name : id; };
  const waUrl = msg => `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  const XMAS = CONFIG.THEME === "christmas";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page;
  const variantText = v => Object.keys(v || {}).map(k => `${k}: ${v[k]}`).join(", ");

  function openWhatsApp(url) {
    const w = window.open(url, "_blank", "noopener");
    if (!w) window.location.href = url; // popup blocked -> same tab
  }

  /* ---------- Icons (inline SVG) ---------- */
  const svg = (path, size = 22, extra = "") =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${path}</svg>`;
  const ICON = {
    cart: svg('<path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/>'),
    search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    menu: svg('<path d="M4 6h16M4 12h16M4 18h16"/>'),
    close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>', 16),
    minus: svg('<path d="M5 12h14"/>', 16),
    trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', 18),
    left: svg('<path d="m15 18-6-6 6-6"/>'),
    right: svg('<path d="m9 18 6-6-6-6"/>'),
    truck: svg('<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>', 26),
    cash: svg('<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9.5v5M18 9.5v5"/>', 26),
    chat: svg('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>', 26),
    shield: svg('<path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6l-8-3z"/><path d="m9 12 2 2 4-4"/>', 26),
    snow: svg('<path d="M12 2v20M4.9 4.9l14.2 14.2M2 12h20M4.9 19.1 19.1 4.9"/>', 18),
    globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>', 18),
    check: svg('<path d="m5 12 5 5L20 7"/>', 18),
    insta: svg('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>', 20),
    whatsapp: `<svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2 7L3 29l6.4-2c2 1.1 4.3 1.7 6.6 1.7 7.2 0 13-5.7 13-12.8S23.2 3 16 3zm0 23.4c-2.1 0-4.2-.6-5.9-1.7l-.4-.3-3.8 1.2 1.2-3.7-.3-.4a10.4 10.4 0 0 1-1.6-5.6C5.2 10 10 5.3 16 5.3S26.8 10 26.8 15.8 22 26.4 16 26.4zm6-7.9c-.3-.2-1.9-1-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6.3-.5c.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5 2.5 1 3 .8 3.6.8.5-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4z"/></svg>`
  };

  /* ---------- Language ---------- */
  document.documentElement.lang = LANG;
  document.documentElement.dir = LANG === "ar" ? "rtl" : "ltr";
  document.body.classList.add(XMAS ? "theme-christmas" : "theme-default");

  function applyStaticTranslations() {
    $$("[data-i18n]").forEach(el => { el.textContent = T(el.dataset.i18n); });
    $$("[data-i18n-ph]").forEach(el => { el.placeholder = T(el.dataset.i18nPh); });
    $$("[data-i18n-aria]").forEach(el => { el.setAttribute("aria-label", T(el.dataset.i18nAria)); });
  }

  /* =========================================================
     SHARED LAYOUT
     ========================================================= */
  function renderHeader() {
    const host = $("#app-header");
    if (!host) return;
    const msgs = CONFIG.ANNOUNCEMENTS[LANG] || CONFIG.ANNOUNCEMENTS.en;
    host.innerHTML = `
      <a class="skip-link" href="#main">${T("skip")}</a>
      <div class="announce" role="region" aria-label="${T("announcements")}">
        <div class="announce-track" aria-live="polite">
          ${msgs.map((m, i) => `<span class="announce-msg${i === 0 ? " is-active" : ""}">${esc(m)}</span>`).join("")}
        </div>
      </div>
      <header class="site-header">
        <div class="container header-inner">
          <button class="icon-btn menu-btn" aria-label="${T("menu")}" aria-expanded="false" aria-controls="main-nav">${ICON.menu}</button>
          <a class="brand" href="index.html" aria-label="Sallaty – ${T("home")}">
            <img src="assets/logo.png" alt="Sallaty" width="168" height="50">
          </a>
          <form class="header-search" role="search" action="index.html" id="header-search">
            <label class="sr-only" for="header-q">${T("searchPh")}</label>
            <input id="header-q" type="search" name="q" placeholder="${T("searchPh")}" autocomplete="off">
            <button type="submit" aria-label="${T("search")}">${ICON.search}</button>
          </form>
          <nav class="main-nav" id="main-nav" aria-label="${T("menu")}">
            <a href="index.html#offers">${T("navOffers")}</a>
            <a href="index.html#shop">${T("navShop")}</a>
            <a href="index.html#gifts">${T("navGifts")}</a>
            <a href="index.html#faq">${T("navFaq")}</a>
          </nav>
          <div class="header-actions">
            <button class="icon-btn search-toggle" aria-label="${T("search")}" aria-expanded="false">${ICON.search}</button>
            <button class="lang-btn" id="lang-btn" lang="${LANG === "ar" ? "en" : "ar"}">${ICON.globe}<span>${LANG === "ar" ? "EN" : "عربي"}</span></button>
            <button class="icon-btn cart-btn" id="cart-btn" aria-label="${T("openCart")}">
              ${ICON.cart}<span class="cart-badge" id="cart-badge">0</span>
            </button>
          </div>
        </div>
      </header>`;

    // Rotating announcements
    const els = $$(".announce-msg", host);
    if (els.length > 1 && !reducedMotion) {
      let i = 0;
      setInterval(() => {
        els[i].classList.remove("is-active");
        i = (i + 1) % els.length;
        els[i].classList.add("is-active");
      }, 3500);
    }

    // Mobile menu
    const menuBtn = $(".menu-btn", host), nav = $("#main-nav", host);
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", open);
      menuBtn.innerHTML = open ? ICON.close : ICON.menu;
    });
    $$("a", nav).forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.innerHTML = ICON.menu;
    }));

    // Mobile search toggle
    const sBtn = $(".search-toggle", host), sForm = $("#header-search", host);
    sBtn.addEventListener("click", () => {
      const open = sForm.classList.toggle("is-open");
      sBtn.setAttribute("aria-expanded", open);
      if (open) $("#header-q").focus();
    });

    // Language toggle
    $("#lang-btn").addEventListener("click", () => {
      store.set("sallaty_lang", LANG === "ar" ? "en" : "ar");
      location.reload();
    });

    $("#cart-btn").addEventListener("click", openDrawer);
  }

  function renderFooter() {
    const host = $("#app-footer");
    if (!host) return;
    host.innerHTML = `
      <footer class="site-footer">
        ${XMAS ? `<div class="footer-garland" aria-hidden="true"></div>` : ""}
        <div class="container footer-grid">
          <div class="footer-brand">
            <img src="assets/logo-white.png" alt="Sallaty" width="168" height="50" loading="lazy">
            <p>${T("footerAbout")}</p>
            <p class="footer-free">${ICON.truck}<span>${T("freeDelivery")}</span></p>
          </div>
          <div>
            <h3>${T("shop")}</h3>
            <ul>
              <li><a href="index.html#offers">${T("navOffers")}</a></li>
              <li><a href="index.html#shop">${T("allProducts")}</a></li>
              <li><a href="index.html#gifts">${T("navGifts")}</a></li>
              <li><a href="cart.html">${T("cart")}</a></li>
            </ul>
          </div>
          <div>
            <h3>${T("help")}</h3>
            <ul>
              <li><a href="index.html#faq">${T("navFaq")}</a></li>
              <li><a href="${waUrl(T("waHello"))}" target="_blank" rel="noopener">WhatsApp</a></li>
              <li><a href="${esc(CONFIG.INSTAGRAM)}" target="_blank" rel="noopener">Instagram</a></li>
            </ul>
          </div>
          <div>
            <h3>${T("contact")}</h3>
            <a class="btn btn-wa btn-sm" href="${waUrl(T("waHello"))}" target="_blank" rel="noopener">${ICON.whatsapp}<span>${T("chatWithUs")}</span></a>
            <a class="footer-social" href="${esc(CONFIG.INSTAGRAM)}" target="_blank" rel="noopener" aria-label="Instagram">${ICON.insta}</a>
          </div>
        </div>
        <div class="container footer-bottom">
          <span>© ${new Date().getFullYear()} Sallaty. ${T("rights")}</span>
          <span>${T("madeIn")}</span>
        </div>
      </footer>`;
  }

  function renderGlobals() {
    // Cart drawer
    document.body.insertAdjacentHTML("beforeend", `
      <div class="drawer-overlay" id="drawer-overlay" hidden></div>
      <aside class="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" aria-hidden="true" tabindex="-1">
        <div class="drawer-head">
          <h2 id="drawer-title">${T("yourCart")}</h2>
          <button class="icon-btn" id="drawer-close" aria-label="${T("close")}">${ICON.close}</button>
        </div>
        <div class="drawer-body" id="drawer-body"></div>
        <div class="drawer-foot" id="drawer-foot"></div>
      </aside>
      <a class="wa-fab" id="wa-fab" href="${waUrl(T("waHello"))}" target="_blank" rel="noopener" aria-label="${T("chatWithUs")} – WhatsApp">
        <span class="wa-fab-icon">${ICON.whatsapp}</span>
        <span class="wa-fab-label">${T("chatWithUs")}</span>
      </a>
      <div class="toast-wrap" id="toast-wrap" role="status" aria-live="polite"></div>
    `);
    $("#drawer-close").addEventListener("click", closeDrawer);
    $("#drawer-overlay").addEventListener("click", closeDrawer);
    $("#cart-drawer").addEventListener("keydown", trapFocus);
    document.addEventListener("keydown", e => { if (e.key === "Escape") { closeDrawer(); closeLightbox(); } });
  }

  function setFabMessage(msg) { const f = $("#wa-fab"); if (f) f.href = waUrl(msg); }

  /* ---------- Toast ---------- */
  function toast(msg, type = "ok") {
    const wrap = $("#toast-wrap");
    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.innerHTML = `${type === "ok" ? ICON.check : ""}<span>${esc(msg)}</span>`;
    wrap.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); }, 2600);
  }

  /* ---------- Cart drawer ---------- */
  let lastFocus = null;
  function openDrawer() {
    lastFocus = document.activeElement;
    renderDrawer();
    const d = $("#cart-drawer"), o = $("#drawer-overlay");
    o.hidden = false;
    requestAnimationFrame(() => { d.classList.add("is-open"); o.classList.add("is-open"); });
    d.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");
    setTimeout(() => $("#drawer-close").focus(), 50);
  }
  function closeDrawer() {
    const d = $("#cart-drawer"), o = $("#drawer-overlay");
    if (!d || !d.classList.contains("is-open")) return;
    d.classList.remove("is-open"); o.classList.remove("is-open");
    d.setAttribute("aria-hidden", "true");
    document.body.classList.remove("drawer-open");
    setTimeout(() => { o.hidden = true; }, 300);
    if (lastFocus) lastFocus.focus();
  }
  function trapFocus(e) {
    if (e.key !== "Tab") return;
    const f = $$('a[href], button:not([disabled]), input, select, textarea', $("#cart-drawer")).filter(el => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function lineHTML(l, compact) {
    const p = l.product;
    return `
      <li class="line" data-key="${esc(l.key)}">
        <a href="product.html?id=${encodeURIComponent(p.id)}" class="line-img"><img src="${esc(p.images[0])}" alt="" width="72" height="72" loading="lazy"></a>
        <div class="line-info">
          <a href="product.html?id=${encodeURIComponent(p.id)}" class="line-name">${esc(P(p, "name"))}</a>
          ${l.variants && Object.keys(l.variants).length ? `<span class="line-var">${esc(variantText(l.variants))}</span>` : ""}
          <span class="line-price">${money(p.price)}${isOffer(p) ? ` <s>${money(p.oldPrice)}</s>` : ""}</span>
          <div class="line-actions">
            <div class="qty qty-sm" role="group" aria-label="${T("quantity")}">
              <button type="button" data-act="dec" aria-label="${T("decrease")}">${ICON.minus}</button>
              <span aria-live="polite">${l.qty}</span>
              <button type="button" data-act="inc" aria-label="${T("increase")}">${ICON.plus}</button>
            </div>
            <button type="button" class="line-remove" data-act="remove" aria-label="${T("remove")} ${esc(P(p, "name"))}">${ICON.trash}${compact ? "" : `<span>${T("remove")}</span>`}</button>
          </div>
        </div>
        <strong class="line-total">${money(l.lineTotal)}</strong>
      </li>`;
  }

  function bindLineActions(root) {
    root.addEventListener("click", e => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const key = btn.closest(".line").dataset.key;
      const line = Cart.lines().find(l => l.key === key);
      if (!line) return;
      if (btn.dataset.act === "inc") Cart.setQty(key, line.qty + 1);
      if (btn.dataset.act === "dec") Cart.setQty(key, line.qty - 1);
      if (btn.dataset.act === "remove") Cart.remove(key);
    });
  }

  function totalsHTML() {
    const sub = Cart.subtotal(), save = Cart.savings();
    return `
      <dl class="totals">
        <div><dt>${T("subtotal")}</dt><dd>${money(sub)}</dd></div>
        ${save > 0 ? `<div class="totals-save"><dt>${T("youSave")}</dt><dd>−${money(save)}</dd></div>` : ""}
        <div><dt>${T("delivery")}</dt><dd class="free">${T("free")} 🚚</dd></div>
        <div class="totals-grand"><dt>${T("total")}</dt><dd>${money(sub)}</dd></div>
      </dl>`;
  }

  function emptyCartHTML() {
    return `
      <div class="empty">
        <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="56" fill="var(--soft)"/>
          <path d="M36 46h48l-4 40H40z" fill="var(--navy)"/>
          <path d="M48 46a12 12 0 0 1 24 0" fill="none" stroke="var(--navy)" stroke-width="4"/>
          <path d="M60 58c-6 0-9 3-9 6 0 7 15 4 15 11 0 3-3 6-8 6" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
          <circle cx="92" cy="30" r="4" fill="var(--gold)"/><circle cx="26" cy="40" r="3" fill="var(--gold)"/>
        </svg>
        <h3>${T("cartEmpty")}</h3>
        <p>${T("cartEmptySub")}</p>
        <a class="btn btn-primary" href="index.html#shop">${T("continueShopping")}</a>
      </div>`;
  }

  function renderDrawer() {
    const body = $("#drawer-body"), foot = $("#drawer-foot");
    if (!body) return;
    const lines = Cart.lines();
    if (!lines.length) { body.innerHTML = emptyCartHTML(); foot.innerHTML = ""; return; }
    body.innerHTML = `<ul class="lines">${lines.map(l => lineHTML(l, true)).join("")}</ul>`;
    foot.innerHTML = `${totalsHTML()}
      <a class="btn btn-primary btn-block" href="cart.html">${T("checkout")}</a>
      <button class="btn btn-link btn-block" type="button" id="drawer-continue">${T("continueShopping")}</button>`;
    $("#drawer-continue").addEventListener("click", closeDrawer);
  }

  function updateBadge(bump) {
    const b = $("#cart-badge");
    if (!b) return;
    const n = Cart.count();
    b.textContent = n > 99 ? "99+" : n;
    b.classList.toggle("is-empty", n === 0);
    $("#cart-btn").setAttribute("aria-label", `${T("openCart")} (${n})`);
    if (bump && !reducedMotion) { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
  }

  let lastCount = 0;
  document.addEventListener("cart:change", () => {
    const n = Cart.count();
    updateBadge(n > lastCount);
    lastCount = n;
    if ($("#cart-drawer")?.classList.contains("is-open")) renderDrawer();
    if (page === "cart") renderCheckout();
  });

  /* =========================================================
     PRODUCT CARDS
     ========================================================= */
  function badgesHTML(p) {
    const out = [];
    if (!p.inStock) out.push(`<span class="badge badge-out">${T("outOfStock")}</span>`);
    else if (isOffer(p)) out.push(`<span class="badge badge-sale">−${discount(p)}%</span>`);
    if (p.tags?.includes("new")) out.push(`<span class="badge badge-new">${T("new")}</span>`);
    if (p.tags?.includes("bestseller")) out.push(`<span class="badge badge-best">${T("bestseller")}</span>`);
    return `<div class="badges">${out.join("")}</div>`;
  }

  function priceHTML(p, big) {
    return `<div class="price${big ? " price-lg" : ""}">
      <span class="price-now${isOffer(p) ? " is-sale" : ""}">${money(p.price)}</span>
      ${isOffer(p) ? `<s class="price-old" aria-label="${T("was")} ${money(p.oldPrice)}">${money(p.oldPrice)}</s>` : ""}
    </div>`;
  }

  function cardHTML(p, opts = {}) {
    const hasVariants = p.variants && Object.keys(p.variants).length;
    const url = `product.html?id=${encodeURIComponent(p.id)}`;
    let action;
    if (!p.inStock) action = `<a class="btn btn-ghost btn-sm" href="${url}">${T("viewDetails")}</a>`;
    else if (hasVariants) action = `<a class="btn btn-outline btn-sm" href="${url}">${T("chooseOptions")}</a>`;
    else action = `<button class="btn btn-primary btn-sm" type="button" data-add="${esc(p.id)}">${ICON.cart}<span>${T("addToCart")}</span></button>`;
    return `
      <article class="card${p.inStock ? "" : " is-out"}">
        <a class="card-link" href="${url}" aria-label="${esc(P(p, "name"))}"></a>
        <div class="card-media">
          <img src="${esc(p.images[0])}" alt="${esc(P(p, "name"))}" loading="lazy" width="500" height="500">
          ${badgesHTML(p)}
          ${XMAS && isOffer(p) && p.inStock ? `<span class="ribbon">🎄 ${T("xmasDeal")}</span>` : ""}
        </div>
        <div class="card-body">
          <span class="card-cat">${esc(catName(p.category))}</span>
          <h3 class="card-title">${esc(P(p, "name"))}</h3>
          ${priceHTML(p)}
          ${opts.timer && p.offerEndsAt ? `<div class="offer-timer"><span>⏳ ${T("endsIn")}</span> <b data-ends="${esc(p.offerEndsAt)}T23:59:59+02:00"></b></div>` : ""}
          <div class="card-action">${action}</div>
        </div>
      </article>`;
  }

  // Quick add from any grid
  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    e.preventDefault();
    Cart.add(btn.dataset.add, 1, {});
    toast(T("added"));
  });

  /* ---------- Countdown timers ---------- */
  function formatLeft(ms, long) {
    if (ms <= 0) return T("ended");
    const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
    if (long) return { d, h, m, s };
    return d > 0 ? `${d}${T("d")} ${h}${T("h")} ${m}${T("m")}` : `${h}${T("h")} ${m}${T("m")} ${s}${T("s")}`;
  }
  function tick() {
    const now = Date.now();
    $$("[data-ends]").forEach(el => { el.textContent = formatLeft(new Date(el.dataset.ends).getTime() - now); });
    $$("[data-countdown]").forEach(el => {
      const left = new Date(el.dataset.countdown).getTime() - now;
      if (left <= 0) { el.innerHTML = `<span class="cd-done">🎄 ${T("merryXmas")}</span>`; return; }
      const t = formatLeft(left, true);
      ["d", "h", "m", "s"].forEach(k => { const n = $(`[data-u="${k}"]`, el); if (n) n.textContent = String(t[k]).padStart(2, "0"); });
    });
  }

  /* ---------- Snow ---------- */
  function initSnow() {
    const canvas = $("#snow");
    const toggle = $("#snow-toggle");
    if (!canvas) return;
    if (!XMAS || reducedMotion) { canvas.remove(); toggle?.remove(); return; }
    const ctx = canvas.getContext("2d");
    let flakes = [], raf = null, w, h;
    let on = store.get("sallaty_snow", CONFIG.SNOW_DEFAULT_ON ? "1" : "0") === "1";

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(110, w / 9));
      flakes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2.6 + 0.8,
        s: Math.random() * 0.6 + 0.3, d: Math.random() * Math.PI * 2, o: Math.random() * 0.5 + 0.35
      }));
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        f.y += f.s; f.d += 0.01; f.x += Math.sin(f.d) * 0.35;
        if (f.y > h + 5) { f.y = -5; f.x = Math.random() * w; }
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${f.o})`; ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    function set(state) {
      on = state; store.set("sallaty_snow", on ? "1" : "0");
      toggle.setAttribute("aria-pressed", on);
      toggle.querySelector("span").textContent = on ? T("snowOff") : T("snowOn");
      if (on && !raf) { canvas.style.opacity = 1; frame(); }
      if (!on && raf) { cancelAnimationFrame(raf); raf = null; ctx.clearRect(0, 0, w, h); }
    }
    resize();
    window.addEventListener("resize", resize);
    // Pause when hero is off-screen (saves battery)
    new IntersectionObserver(([en]) => {
      if (!on) return;
      if (en.isIntersecting && !raf) frame();
      if (!en.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
    }).observe(canvas);
    toggle.addEventListener("click", () => set(!on));
    set(on);
  }

  /* ---------- Horizontal carousels ---------- */
  function initCarousel(wrap) {
    const track = $(".carousel-track", wrap);
    const prev = $(".car-prev", wrap), next = $(".car-next", wrap);
    const rtl = document.dir === "rtl";
    const step = () => (track.firstElementChild?.getBoundingClientRect().width || 260) + 16;
    prev.addEventListener("click", () => track.scrollBy({ left: (rtl ? 1 : -1) * step(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: (rtl ? -1 : 1) * step(), behavior: "smooth" }));
    track.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") { e.preventDefault(); track.scrollBy({ left: step(), behavior: "smooth" }); }
      if (e.key === "ArrowLeft") { e.preventDefault(); track.scrollBy({ left: -step(), behavior: "smooth" }); }
    });
  }

  /* =========================================================
     HOME PAGE
     ========================================================= */
  function initHome() {
    const params = new URLSearchParams(location.search);
    const state = { q: params.get("q") || "", cat: params.get("cat") || "all", sort: "featured" };

    // Hero countdown target
    $$("[data-countdown]").forEach(el => { el.dataset.countdown = CONFIG.CHRISTMAS_DATE; });
    $("#hero-wa").href = waUrl(T("waHello"));

    // Offers carousel
    const offers = PRODUCTS.filter(p => isOffer(p) && p.inStock);
    const maxOff = Math.max(0, ...offers.map(discount));
    $("#offers-max").textContent = maxOff ? `${T("upTo")} ${maxOff}% ${T("off")}` : "";
    $("#offers-track").innerHTML = offers.length
      ? offers.map(p => `<div class="carousel-item">${cardHTML(p, { timer: true })}</div>`).join("")
      : `<p class="muted">${T("noOffers")}</p>`;
    initCarousel($("#offers-carousel"));

    // Promo banners
    $("#promo-banners").innerHTML = OFFER_BANNERS.map(b => `
      <a class="promo promo-${esc(b.style || "navy")}" href="${esc(b.link)}" ${b.image ? `style="background-image:linear-gradient(90deg,rgba(11,33,73,.85),rgba(11,33,73,.2)),url('${esc(b.image)}')"` : ""}>
        <span class="promo-deco" aria-hidden="true">${XMAS ? "🎁" : ""}</span>
        <span class="promo-text">
          <strong>${esc(LANG === "ar" && b.titleAr || b.title)}</strong>
          <span>${esc(LANG === "ar" && b.subtitleAr || b.subtitle)}</span>
        </span>
        <span class="btn btn-gold btn-sm">${esc(LANG === "ar" && b.ctaAr || b.cta)} →</span>
      </a>`).join("");

    // Categories
    const catBox = $("#category-list");
    const catBtn = (id, label, icon, count) =>
      `<button type="button" class="cat-chip" data-cat="${id}" aria-pressed="${state.cat === id}"><span class="cat-icon" aria-hidden="true">${icon}</span><span>${esc(label)}</span><small>${count}</small></button>`;
    catBox.innerHTML = catBtn("all", T("all"), "✨", PRODUCTS.length) +
      CATEGORIES.filter(c => PRODUCTS.some(p => p.category === c.id)).map(c => catBtn(c.id, catName(c.id), c.icon, PRODUCTS.filter(p => p.category === c.id).length)).join("");
    catBox.addEventListener("click", e => {
      const b = e.target.closest("[data-cat]"); if (!b) return;
      state.cat = b.dataset.cat; render();
    });

    // Toolbar
    const qInput = $("#shop-q"), sortSel = $("#shop-sort"), headerQ = $("#header-q");
    qInput.value = state.q; if (headerQ) headerQ.value = state.q;
    qInput.addEventListener("input", () => { state.q = qInput.value; if (headerQ) headerQ.value = state.q; render(); });
    sortSel.addEventListener("change", () => { state.sort = sortSel.value; render(); });
    $("#header-search")?.addEventListener("submit", e => {
      e.preventDefault();
      state.q = headerQ.value; qInput.value = state.q; render();
      $("#header-search").classList.remove("is-open");
      $("#shop").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    });
    headerQ?.addEventListener("input", () => { state.q = headerQ.value; qInput.value = state.q; render(); });
    $("#clear-filters").addEventListener("click", () => { state.q = ""; state.cat = "all"; qInput.value = ""; if (headerQ) headerQ.value = ""; render(); });

    const norm = s => String(s || "").toLowerCase();
    function render() {
      const q = norm(state.q.trim());
      let list = PRODUCTS.filter(p =>
        (state.cat === "all" || p.category === state.cat) &&
        (!q || [p.name, p.ar?.name, p.shortDescription, catName(p.category), ...(p.tags || [])].some(t => norm(t).includes(q))));
      const idx = p => PRODUCTS.indexOf(p);
      const sorters = {
        featured: (a, b) => (b.inStock - a.inStock) || (b.featured - a.featured) || idx(a) - idx(b),
        "price-asc": (a, b) => a.price - b.price,
        "price-desc": (a, b) => b.price - a.price,
        discount: (a, b) => discount(b) - discount(a),
        newest: (a, b) => ((b.tags?.includes("new") ? 1 : 0) - (a.tags?.includes("new") ? 1 : 0)) || idx(b) - idx(a)
      };
      list = list.slice().sort(sorters[state.sort]);
      $("#product-grid").innerHTML = list.map(p => cardHTML(p)).join("");
      $("#shop-empty").hidden = list.length > 0;
      $("#shop-count").textContent = `${list.length} ${list.length === 1 ? T("product") : T("products")}`;
      $$(".cat-chip", catBox).forEach(b => b.setAttribute("aria-pressed", b.dataset.cat === state.cat));
    }
    render();

    // Gifts
    const gifts = PRODUCTS.filter(p => p.tags?.includes("gift") && p.inStock).slice(0, 8);
    $("#gift-grid").innerHTML = gifts.map(p => cardHTML(p)).join("");
    $("#gifts").hidden = gifts.length === 0;

    // FAQ dynamic answers
    $("#faq-delivery-time").textContent = CONFIG.DELIVERY_TIME[LANG] || CONFIG.DELIVERY_TIME.en;
    $("#faq-returns").textContent = CONFIG.RETURN_POLICY[LANG] || CONFIG.RETURN_POLICY.en;

    initSnow();
  }

  /* =========================================================
     PRODUCT PAGE
     ========================================================= */
  let lightboxImgs = [], lbIndex = 0;
  function openLightbox(i) {
    lbIndex = i;
    let lb = $("#lightbox");
    if (!lb) {
      document.body.insertAdjacentHTML("beforeend", `
        <div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="${T("zoom")}">
          <button class="icon-btn lb-close" aria-label="${T("close")}">${ICON.close}</button>
          <button class="icon-btn lb-prev" aria-label="${T("prev")}">${ICON.left}</button>
          <img alt="">
          <button class="icon-btn lb-next" aria-label="${T("next")}">${ICON.right}</button>
        </div>`);
      lb = $("#lightbox");
      $(".lb-close", lb).onclick = closeLightbox;
      lb.onclick = e => { if (e.target === lb) closeLightbox(); };
      $(".lb-prev", lb).onclick = () => showLb(lbIndex - 1);
      $(".lb-next", lb).onclick = () => showLb(lbIndex + 1);
    }
    lb.classList.add("is-open");
    showLb(i);
    $(".lb-close", lb).focus();
  }
  function showLb(i) {
    lbIndex = (i + lightboxImgs.length) % lightboxImgs.length;
    $("#lightbox img").src = lightboxImgs[lbIndex];
    $$("#lightbox .lb-prev, #lightbox .lb-next").forEach(b => { b.hidden = lightboxImgs.length < 2; });
  }
  function closeLightbox() { $("#lightbox")?.classList.remove("is-open"); }

  function initProduct() {
    const root = $("#product-root");
    const id = new URLSearchParams(location.search).get("id");
    const p = PRODUCTS.find(x => x.id === id);

    if (!p) {
      document.title = `${T("notFound")} – Sallaty`;
      root.innerHTML = `
        <div class="empty empty-page">
          <div class="empty-emoji" aria-hidden="true">🎁❓</div>
          <h1>${T("notFound")}</h1>
          <p>${T("notFoundSub")}</p>
          <a class="btn btn-primary" href="index.html#shop">${T("backToShop")}</a>
        </div>`;
      return;
    }

    const name = P(p, "name");
    document.title = `${name} – Sallaty`;
    $('meta[name="description"]')?.setAttribute("content", P(p, "shortDescription"));
    $('meta[property="og:title"]')?.setAttribute("content", `${name} – Sallaty`);
    $('meta[property="og:description"]')?.setAttribute("content", P(p, "shortDescription"));
    setFabMessage(`${T("waAskProduct")} "${p.name}" (${money(p.price)})`);

    lightboxImgs = p.images;
    const variants = p.variants || {};
    const chosen = {};
    let qty = 1;
    const features = P(p, "features") || [];

    root.innerHTML = `
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="index.html">${T("home")}</a><span aria-hidden="true">/</span>
        <a href="index.html?cat=${encodeURIComponent(p.category)}#shop">${esc(catName(p.category))}</a><span aria-hidden="true">/</span>
        <span aria-current="page">${esc(name)}</span>
      </nav>
      <div class="pd">
        <div class="gallery">
          <div class="gallery-main" id="gallery-main" tabindex="0" aria-label="${T("gallery")}">
            ${p.images.map((src, i) => `<button type="button" class="gallery-slide" data-i="${i}" aria-label="${T("zoom")} ${i + 1}"><img src="${esc(src)}" alt="${esc(name)} – ${i + 1}" width="800" height="800" ${i ? 'loading="lazy"' : ""}></button>`).join("")}
          </div>
          ${badgesHTML(p)}
          ${XMAS && isOffer(p) ? `<span class="ribbon ribbon-lg">🎄 ${T("xmasDeal")}</span>` : ""}
          ${p.images.length > 1 ? `<div class="thumbs" role="tablist">${p.images.map((src, i) => `<button type="button" class="thumb${i ? "" : " is-active"}" data-i="${i}" role="tab" aria-selected="${!i}" aria-label="${T("image")} ${i + 1}"><img src="${esc(src)}" alt="" width="80" height="80" loading="lazy"></button>`).join("")}</div>` : ""}
        </div>

        <div class="pd-info">
          <a class="card-cat" href="index.html?cat=${encodeURIComponent(p.category)}#shop">${esc(catName(p.category))}</a>
          <h1 class="pd-title">${esc(name)}</h1>
          <div class="pd-price">
            ${priceHTML(p, true)}
            ${isOffer(p) ? `<span class="save-pill">${T("save")} ${money(p.oldPrice - p.price)} (−${discount(p)}%)</span>` : ""}
          </div>
          ${p.offerEndsAt && isOffer(p) ? `<div class="offer-timer offer-timer-lg"><span>⏳ ${T("offerEndsIn")}</span> <b data-ends="${esc(p.offerEndsAt)}T23:59:59+02:00"></b></div>` : ""}
          <p class="pd-short">${esc(P(p, "shortDescription"))}</p>

          ${Object.keys(variants).map(k => `
            <fieldset class="variant" data-variant="${esc(k)}">
              <legend>${esc(k)}: <span class="variant-chosen" data-chosen="${esc(k)}">${T("choose")}</span></legend>
              <div class="pills">
                ${variants[k].map(v => `<button type="button" class="pill" data-k="${esc(k)}" data-v="${esc(v)}" aria-pressed="false"${p.inStock ? "" : " disabled"}>${esc(v)}</button>`).join("")}
              </div>
            </fieldset>`).join("")}
          <p class="form-error" id="variant-error" role="alert" hidden></p>

          ${p.inStock ? `
            <div class="buy-row">
              <div class="qty" role="group" aria-label="${T("quantity")}">
                <button type="button" id="qty-dec" aria-label="${T("decrease")}">${ICON.minus}</button>
                <span id="qty-val" aria-live="polite">1</span>
                <button type="button" id="qty-inc" aria-label="${T("increase")}">${ICON.plus}</button>
              </div>
              <button class="btn btn-primary btn-lg" id="add-btn" type="button">${ICON.cart}<span>${T("addToCart")}</span></button>
            </div>
            <button class="btn btn-wa btn-lg btn-block" id="buy-wa" type="button">${ICON.whatsapp}<span>${T("buyNowWa")}</span></button>
          ` : `
            <div class="out-box">
              <strong>${T("outOfStock")}</strong>
              <p>${T("outOfStockSub")}</p>
              <button class="btn btn-primary btn-lg btn-block" disabled>${T("outOfStock")}</button>
              <a class="btn btn-wa btn-lg btn-block" href="${waUrl(`${T("waAskStock")} "${p.name}"`)}" target="_blank" rel="noopener">${ICON.whatsapp}<span>${T("askOnWa")}</span></a>
            </div>`}

          <ul class="pd-perks">
            <li>${ICON.truck}<span><b>${T("freeDelivery")}</b><small>${T("freeDeliverySub")}</small></span></li>
            <li>${ICON.cash}<span><b>${T("cod")}</b><small>${T("codSub")}</small></span></li>
          </ul>

          <details class="pd-details" open>
            <summary>${T("description")}</summary>
            <p>${esc(P(p, "description"))}</p>
            ${features.length ? `<ul class="features">${features.map(f => `<li>${ICON.check}<span>${esc(f)}</span></li>`).join("")}</ul>` : ""}
          </details>
        </div>
      </div>`;

    // Gallery: swipe (scroll-snap) + thumbnails + zoom
    const main = $("#gallery-main");
    const thumbs = $$(".thumb", root);
    const goTo = i => {
      const slide = main.children[i];
      main.scrollTo({ left: slide.offsetLeft - main.offsetLeft, behavior: reducedMotion ? "auto" : "smooth" });
    };
    thumbs.forEach(t => t.addEventListener("click", () => goTo(+t.dataset.i)));
    main.addEventListener("scroll", () => {
      const i = Math.round(Math.abs(main.scrollLeft) / main.clientWidth);
      thumbs.forEach((t, j) => { t.classList.toggle("is-active", j === i); t.setAttribute("aria-selected", j === i); });
    }, { passive: true });
    $$(".gallery-slide", root).forEach(s => s.addEventListener("click", () => openLightbox(+s.dataset.i)));

    // Variants
    $$(".pill", root).forEach(b => b.addEventListener("click", () => {
      const k = b.dataset.k;
      chosen[k] = b.dataset.v;
      $$(`.pill[data-k="${CSS.escape(k)}"]`, root).forEach(x => x.setAttribute("aria-pressed", x === b));
      $(`[data-chosen="${CSS.escape(k)}"]`, root).textContent = b.dataset.v;
      $(`.variant[data-variant="${CSS.escape(k)}"]`, root).classList.remove("has-error");
      if (Object.keys(variants).every(v => chosen[v])) $("#variant-error").hidden = true;
    }));

    function validVariants() {
      const missing = Object.keys(variants).filter(k => !chosen[k]);
      if (!missing.length) return true;
      missing.forEach(k => $(`.variant[data-variant="${CSS.escape(k)}"]`, root).classList.add("has-error"));
      const err = $("#variant-error");
      err.textContent = `${T("pleaseChoose")} ${missing.join(" & ")}`;
      err.hidden = false;
      $(`.variant[data-variant="${CSS.escape(missing[0])}"]`, root).scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }

    if (p.inStock) {
      const qv = $("#qty-val");
      $("#qty-dec").onclick = () => { qty = Math.max(1, qty - 1); qv.textContent = qty; };
      $("#qty-inc").onclick = () => { qty = Math.min(99, qty + 1); qv.textContent = qty; };
      $("#add-btn").onclick = () => {
        if (!validVariants()) return;
        Cart.add(p.id, qty, { ...chosen });
        toast(T("added"));
      };
      $("#buy-wa").onclick = () => {
        if (!validVariants()) return;
        const v = variantText(chosen);
        const msg = [
          `🎄 *Quick Order – Sallaty* 🎄`,
          "",
          `${p.name}${v ? ` (${v})` : ""} × ${qty} = ${money2(p.price * qty)}`,
          "",
          `*Delivery:* FREE 🚚`,
          `*Payment:* Cash on delivery`,
          "",
          "Please confirm my order. My name and address:"
        ].join("\n");
        openWhatsApp(waUrl(msg));
      };
    }

    // Related
    const related = PRODUCTS.filter(x => x.id !== p.id && x.category === p.category);
    const more = related.length < 4 ? PRODUCTS.filter(x => x.id !== p.id && x.category !== p.category && isOffer(x)) : [];
    const list = [...related, ...more].slice(0, 4);
    if (list.length) {
      root.insertAdjacentHTML("beforeend", `
        <section class="section related" aria-labelledby="related-title">
          <h2 class="section-title" id="related-title">${T("youMayLike")}</h2>
          <div class="grid">${list.map(x => cardHTML(x)).join("")}</div>
        </section>`);
    }
  }

  /* =========================================================
     CART / CHECKOUT PAGE
     ========================================================= */
  const GOVERNORATES = [
    ["Beirut", "بيروت"], ["Mount Lebanon", "جبل لبنان"], ["North", "الشمال"], ["Akkar", "عكار"],
    ["Bekaa", "البقاع"], ["Baalbek-Hermel", "بعلبك الهرمل"], ["South", "الجنوب"], ["Nabatieh", "النبطية"]
  ];
  const formState = { name: "", phone: "", gov: "", city: "", address: "", notes: "" };
  let checkoutBuilt = false;

  function normalizePhone(raw) {
    let d = String(raw).replace(/\D/g, "");
    if (d.startsWith("00961")) d = d.slice(5);
    else if (d.startsWith("961")) d = d.slice(3);
    if (d.length === 7 && d.startsWith("3")) d = "0" + d; // 3xxxxxx -> 03xxxxxx
    return d;
  }
  const validPhone = raw => /^(0[1-9]|7[016-9]|81)\d{6}$/.test(normalizePhone(raw));

  function renderCheckout() {
    const root = $("#checkout-root");
    const lines = Cart.lines();
    if (!lines.length) {
      checkoutBuilt = false;
      if (!$("#order-sent")) root.innerHTML = emptyCartHTML();
      return;
    }
    if (!checkoutBuilt) {
      root.innerHTML = `
        <div class="checkout">
          <section class="summary" aria-labelledby="sum-title">
            <h2 id="sum-title">${T("orderSummary")} <small id="sum-count"></small></h2>
            <ul class="lines" id="sum-lines"></ul>
            <div id="sum-totals"></div>
          </section>
          <section class="form-card" aria-labelledby="form-title">
            <h2 id="form-title">${T("deliveryDetails")}</h2>
            <p class="muted">${T("deliveryDetailsSub")}</p>
            <form id="checkout-form" novalidate>
              <div class="field">
                <label for="f-name">${T("fullName")} <span aria-hidden="true">*</span></label>
                <input id="f-name" name="name" autocomplete="name" required>
                <p class="field-error" id="e-name"></p>
              </div>
              <div class="field">
                <label for="f-phone">${T("phone")} <span aria-hidden="true">*</span></label>
                <input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="70 123 456" required dir="ltr">
                <p class="field-error" id="e-phone"></p>
              </div>
              <div class="field-row">
                <div class="field">
                  <label for="f-gov">${T("governorate")} <span aria-hidden="true">*</span></label>
                  <select id="f-gov" name="gov" required>
                    <option value="">${T("select")}</option>
                    ${GOVERNORATES.map(([en, ar]) => `<option value="${en}">${LANG === "ar" ? ar : en}</option>`).join("")}
                  </select>
                  <p class="field-error" id="e-gov"></p>
                </div>
                <div class="field">
                  <label for="f-city">${T("city")} <span aria-hidden="true">*</span></label>
                  <input id="f-city" name="city" autocomplete="address-level2" required>
                  <p class="field-error" id="e-city"></p>
                </div>
              </div>
              <div class="field">
                <label for="f-address">${T("address")} <span aria-hidden="true">*</span></label>
                <textarea id="f-address" name="address" rows="2" autocomplete="street-address" placeholder="${T("addressPh")}" required></textarea>
                <p class="field-error" id="e-address"></p>
              </div>
              <div class="field">
                <label for="f-notes">${T("notes")} <span class="muted">(${T("optional")})</span></label>
                <textarea id="f-notes" name="notes" rows="2" placeholder="${T("notesPh")}"></textarea>
              </div>
              <ul class="pd-perks pd-perks-sm">
                <li>${ICON.truck}<span><b>${T("freeDelivery")}</b></span></li>
                <li>${ICON.cash}<span><b>${T("cod")}</b></span></li>
              </ul>
              <button class="btn btn-wa btn-xl btn-block" type="submit">${ICON.whatsapp}<span>${T("sendOrderWa")}</span></button>
              <p class="tiny muted center">${T("sendOrderNote")}</p>
            </form>
          </section>
        </div>`;
      const form = $("#checkout-form");
      Object.keys(formState).forEach(k => { const el = form.elements[k]; if (el) el.value = formState[k]; });
      form.addEventListener("input", e => {
        if (e.target.name) formState[e.target.name] = e.target.value;
        if (e.target.closest(".field.has-error")) validateField(e.target.name);
      });
      form.addEventListener("focusout", e => { if (e.target.name && e.target.value) validateField(e.target.name); });
      form.addEventListener("submit", submitOrder);
      checkoutBuilt = true;
      bindLineActions($("#sum-lines"));
    }
    $("#sum-lines").innerHTML = lines.map(l => lineHTML(l, false)).join("");
    $("#sum-totals").innerHTML = totalsHTML();
    $("#sum-count").textContent = `(${Cart.count()} ${Cart.count() === 1 ? T("item") : T("items")})`;
  }

  function validateField(name) {
    const v = (formState[name] || "").trim();
    let msg = "";
    if (name === "name" && v.length < 2) msg = T("errName");
    if (name === "phone") msg = !v ? T("errPhoneEmpty") : !validPhone(v) ? T("errPhone") : "";
    if (name === "gov" && !v) msg = T("errGov");
    if (name === "city" && v.length < 2) msg = T("errCity");
    if (name === "address" && v.length < 5) msg = T("errAddress");
    const input = $(`#checkout-form [name="${name}"]`);
    const err = $(`#e-${name}`);
    if (!input || !err) return true;
    input.closest(".field").classList.toggle("has-error", !!msg);
    input.setAttribute("aria-invalid", !!msg);
    if (msg) input.setAttribute("aria-describedby", `e-${name}`); else input.removeAttribute("aria-describedby");
    err.textContent = msg;
    return !msg;
  }

  function submitOrder(e) {
    e.preventDefault();
    const fields = ["name", "phone", "gov", "city", "address"];
    const results = fields.map(validateField);
    const firstBad = fields[results.indexOf(false)];
    if (firstBad) { $(`#checkout-form [name="${firstBad}"]`).focus(); toast(T("fixErrors"), "err"); return; }

    const lines = Cart.lines();
    const orderNo = "SLT-" + Date.now().toString(36).slice(-6).toUpperCase();
    const sub = Cart.subtotal();
    const phone = normalizePhone(formState.phone);
    const msg = [
      "🎄 *New Order – Sallaty* 🎄",
      `Order #: ${orderNo}`,
      "",
      `*Customer:* ${formState.name.trim()}`,
      `*Phone:* ${phone.replace(/^(\d{2})(\d{3})(\d{3})$/, "$1 $2 $3")}`,
      `*Address:* ${formState.gov}, ${formState.city.trim()} – ${formState.address.trim()}`,
      `*Notes:* ${formState.notes.trim() || "—"}`,
      "",
      "*Items:*",
      ...lines.map((l, i) => `${i + 1}. ${l.product.name}${Object.keys(l.variants || {}).length ? ` (${variantText(l.variants)})` : ""} × ${l.qty} = ${money2(l.lineTotal)}`),
      "",
      `*Subtotal:* ${money2(sub)}`,
      "*Delivery:* FREE 🚚",
      `*Total:* ${money2(sub)}`,
      "*Payment:* Cash on delivery"
    ].join("\n");

    openWhatsApp(waUrl(msg));

    $("#checkout-root").innerHTML = `
      <div class="empty empty-page" id="order-sent">
        <div class="empty-emoji" aria-hidden="true">🎄✅</div>
        <h1>${T("thankYou")}</h1>
        <p>${T("thankYouSub")}</p>
        <p class="order-no">${T("orderNo")}: <b>${orderNo}</b></p>
        <div class="btn-stack">
          <a class="btn btn-wa btn-lg" href="${waUrl(msg)}" target="_blank" rel="noopener">${ICON.whatsapp}<span>${T("reopenWa")}</span></a>
          <button class="btn btn-primary" type="button" id="clear-cart">${T("clearCart")}</button>
          <a class="btn btn-link" href="index.html">${T("continueShopping")}</a>
        </div>
      </div>`;
    checkoutBuilt = false;
    $("#clear-cart").addEventListener("click", () => {
      Cart.clear();
      toast(T("cartCleared"));
      setTimeout(() => { location.href = "index.html"; }, 900);
    });
    window.scrollTo({ top: 0 });
  }

  function initCartPage() {
    renderCheckout();
  }

  /* =========================================================
     INIT
     ========================================================= */
  renderHeader();
  renderFooter();
  renderGlobals();
  applyStaticTranslations();
  bindLineActions($("#drawer-body"));

  // Loading placeholders while products load from the Google Sheet
  const skeletonCards = n => Array.from({ length: n }, () =>
    `<div class="card card-skeleton" aria-hidden="true"><div class="skeleton" style="aspect-ratio:1;border-radius:0"></div><div class="card-body"><div class="skeleton sk-line w40"></div><div class="skeleton sk-line w90"></div><div class="skeleton sk-line w30"></div></div></div>`).join("");
  if (page === "home" && CONFIG.PRODUCTS_SHEET_URL) {
    $("#product-grid").innerHTML = skeletonCards(8);
    $("#offers-track").innerHTML = Array.from({ length: 4 }, () => `<div class="carousel-item">${skeletonCards(1)}</div>`).join("");
  }

  (typeof loadProducts === "function" ? loadProducts() : Promise.resolve("file")).then(() => {
    Cart.prune();
    lastCount = Cart.count();
    updateBadge(false);
    if (page === "home") initHome();
    if (page === "product") initProduct();
    if (page === "cart") initCartPage();
    tick();
  });

  tick();
  setInterval(tick, 1000);

  // Scroll-reveal for sections
  if (!reducedMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -60px 0px" });
    $$(".reveal").forEach(el => io.observe(el));
  } else {
    $$(".reveal").forEach(el => el.classList.add("is-visible"));
  }
})();
