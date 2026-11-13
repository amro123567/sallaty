/* =========================================================
   SALLATY – CART (saved in the browser with localStorage)
   ========================================================= */
const Cart = (() => {
  const KEY = "sallaty_cart_v1";
  let items = load();

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* private mode */ }
    document.dispatchEvent(new CustomEvent("cart:change"));
  }

  const findProduct = id => PRODUCTS.find(p => p.id === id);

  function makeKey(id, variants) {
    const v = Object.keys(variants || {}).sort().map(k => `${k}:${variants[k]}`).join(",");
    return `${id}|${v}`;
  }


  // Keep several open tabs in sync
  window.addEventListener("storage", e => {
    if (e.key === KEY) { items = load(); document.dispatchEvent(new CustomEvent("cart:change")); }
  });

  return {
    // Remove items whose product no longer exists (called after products load)
    prune() {
      const before = items.length;
      items = items.filter(i => findProduct(i.id) && i.qty > 0);
      if (items.length !== before) persist();
    },
    add(id, qty = 1, variants = {}) {
      const key = makeKey(id, variants);
      const existing = items.find(i => i.key === key);
      if (existing) existing.qty = Math.min(99, existing.qty + qty);
      else items.push({ key, id, qty: Math.min(99, qty), variants });
      persist();
    },
    setQty(key, qty) {
      const it = items.find(i => i.key === key);
      if (!it) return;
      if (qty <= 0) items = items.filter(i => i.key !== key);
      else it.qty = Math.min(99, qty);
      persist();
    },
    remove(key) { items = items.filter(i => i.key !== key); persist(); },
    clear() { items = []; persist(); },
    count() { return items.reduce((s, i) => s + i.qty, 0); },
    lines() {
      return items
        .map(i => {
          const product = findProduct(i.id);
          return product ? { ...i, product, lineTotal: product.price * i.qty } : null;
        })
        .filter(Boolean);
    },
    subtotal() { return this.lines().reduce((s, l) => s + l.lineTotal, 0); },
    savings() {
      return this.lines().reduce((s, l) =>
        s + (l.product.oldPrice > l.product.price ? (l.product.oldPrice - l.product.price) * l.qty : 0), 0);
    }
  };
})();
