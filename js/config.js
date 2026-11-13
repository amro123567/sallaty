/* =========================================================
   SALLATY – SHOP SETTINGS
   Edit the values below. You don't need to touch any other file
   for everyday changes.
   ========================================================= */
const CONFIG = {
  SHOP_NAME: "Sallaty",

  // Your WhatsApp number: international format, NO "+", NO spaces.
  // Example for 03 123 456  ->  "9613123456"
  // Example for 70 123 456  ->  "96170123456"
  WHATSAPP_NUMBER: "96179449820",

  // "christmas" = festive design (snow, ribbons, countdown)
  // "default"   = clean navy/white brand design for the rest of the year
  THEME: "christmas",

  // GOOGLE SHEET (easiest way to manage products – see README)
  // Paste your "Publish to web → CSV" link here. Leave "" to use js/products.js.
  PRODUCTS_SHEET_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSy9WbhvJMW6QpP2t_qMgMuHuOWE_tf2BEpO32u0c0Aptzsrq6Ro2RwaT1yAx1u4APCZQopV1siCtpl/pubhtml?gid=0&single=true",

  CURRENCY: "$",

  INSTAGRAM: "https://instagram.com/",

  // "en" or "ar" – language shown on the first visit
  DEFAULT_LANG: "en",

  // Falling snow on the home page hero (visitors can still turn it off)
  SNOW_DEFAULT_ON: true,

  // Date the hero countdown counts to (Beirut time)
  CHRISTMAS_DATE: "2026-12-25T00:00:00+02:00",

  // Rotating messages in the top bar
  ANNOUNCEMENTS: {
    en: [
      "🚚 FREE delivery all over Lebanon",
      "🎄 Christmas offers up to 30% off",
      "💬 Order easily on WhatsApp",
      "💵 Cash on delivery"
    ],
    ar: [
      "🚚 توصيل مجاني لكل لبنان",
      "🎄 عروض الميلاد حتى 30% حسم",
      "💬 اطلب بسهولة عبر واتساب",
      "💵 الدفع عند الاستلام"
    ]
  },

  // FAQ answers that are specific to your shop
  DELIVERY_TIME: {
    en: "Orders are usually delivered within 1–3 working days, depending on your area.",
    ar: "يتم التوصيل عادة خلال 1–3 أيام عمل حسب منطقتك."
  },
  RETURN_POLICY: {
    en: "You can exchange any unused item in its original packaging within 3 days of delivery. Just message us on WhatsApp with your order number.",
    ar: "يمكنك استبدال أي منتج غير مستعمل وبتغليفه الأصلي خلال 3 أيام من التوصيل. راسلنا على واتساب مع رقم الطلب."
  }
};
