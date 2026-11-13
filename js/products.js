/* =========================================================
   SALLATY – PRODUCTS, CATEGORIES & OFFERS
   ---------------------------------------------------------
   HOW TO ADD A PRODUCT: copy one { ... } block, paste it at the
   end of the list, give it a NEW id, and change the details.

   Fields:
     id               unique code, used in the page link (no spaces)
     name             product name
     category         one of the category ids below
     price            current price (number, no $)
     oldPrice         OPTIONAL – if higher than price, the product
                      becomes an OFFER (shows -% badge automatically)
     offerEndsAt      OPTIONAL – "YYYY-MM-DD", shows an "ends in" timer
     images           list of image paths (first one is the main image)
     shortDescription one line
     description      full text
     features         list of bullet points
     variants         OPTIONAL – e.g. { Size: ["S","M"], Color: ["Red"] }
     tags             any of: "gift", "new", "bestseller"
     inStock          true / false
     featured         true = shown first when sorting by "Featured"
     ar               OPTIONAL – Arabic versions of name / shortDescription /
                      description / features
   ========================================================= */

const CATEGORIES = [
  { id: "decor",   name: "Christmas Decor", nameAr: "زينة الميلاد", icon: "🎄" },
  { id: "gifts",   name: "Gifts",           nameAr: "هدايا",        icon: "🎁" },
  { id: "fashion", name: "Fashion",         nameAr: "أزياء",        icon: "🧣" },
  { id: "beauty",  name: "Beauty",          nameAr: "جمال وعناية",  icon: "🌹" }
];

const PRODUCTS = [
  {
    id: "p001",
    name: "Golden Ornament Set (24 pcs)",
    category: "decor",
    price: 18,
    oldPrice: 25,
    offerEndsAt: "2026-12-20",
    images: ["assets/products/p001-1.svg", "assets/products/p001-2.svg"],
    shortDescription: "Shatter-proof gold & navy baubles for a tree that shines.",
    description: "A complete set of 24 shatter-proof ornaments in matte gold, glossy navy and glitter finishes. Lightweight, safe around kids and pets, and ready to hang with gold string included.",
    features: ["24 pieces in 3 finishes", "Shatter-proof material", "6 cm diameter", "Hanging string included"],
    tags: ["gift", "bestseller"],
    inStock: true,
    featured: true,
    ar: { name: "طقم كرات ذهبية للشجرة (24 قطعة)", shortDescription: "كرات ذهبية وكحلية غير قابلة للكسر لشجرة تلمع." }
  },
  {
    id: "p002",
    name: "Warm LED Fairy Lights – 10m",
    category: "decor",
    price: 12,
    oldPrice: 16,
    images: ["assets/products/p002-1.svg", "assets/products/p002-2.svg"],
    shortDescription: "100 warm-white LEDs with 8 light modes.",
    description: "Turn any corner into a cozy Christmas spot. 10 meters of copper wire with 100 warm-white LEDs, 8 light modes and a timer. Works with USB or batteries — perfect during power cuts.",
    features: ["10 m / 100 LEDs", "8 modes + 6h timer", "USB or AA batteries", "Indoor & covered outdoor use"],
    tags: ["bestseller"],
    inStock: true,
    featured: false,
    ar: { name: "أضواء LED دافئة – 10 متر", shortDescription: "100 لمبة LED بإضاءة دافئة و8 أوضاع." }
  },
  {
    id: "p003",
    name: "Pre-lit Christmas Wreath",
    category: "decor",
    price: 35,
    images: ["assets/products/p003-1.svg", "assets/products/p003-2.svg"],
    shortDescription: "Lush pine wreath with pinecones and built-in lights.",
    description: "A full, natural-looking pine wreath decorated with pinecones, red berries and built-in warm lights. Hang it on your door or above the fireplace.",
    features: ["Built-in warm LEDs", "Battery operated", "Reusable every year"],
    variants: { Size: ["40 cm", "50 cm"] },
    tags: ["new"],
    inStock: true,
    featured: false,
    ar: { name: "إكليل ميلادي مضاء", shortDescription: "إكليل صنوبر مع أكواز وأضواء مدمجة." }
  },
  {
    id: "p004",
    name: "Luxury Gift Box – Chocolate & Candle",
    category: "gifts",
    price: 45,
    oldPrice: 60,
    offerEndsAt: "2026-12-24",
    images: ["assets/products/p004-1.svg", "assets/products/p004-2.svg"],
    shortDescription: "Ready-to-gift box with chocolates, a candle and a card.",
    description: "Our best-selling Christmas box: premium chocolates, a hand-poured winter spice candle, a mini ornament and a handwritten card with your message. Wrapped and ready to give.",
    features: ["Premium chocolates", "Scented candle", "Free handwritten card", "Gift wrapped"],
    tags: ["gift", "bestseller"],
    inStock: true,
    featured: true,
    ar: { name: "علبة هدايا فاخرة – شوكولا وشمعة", shortDescription: "علبة جاهزة للإهداء مع شوكولا وشمعة وبطاقة." }
  },
  {
    id: "p005",
    name: "Personalized Name Mug",
    category: "gifts",
    price: 14,
    images: ["assets/products/p005-1.svg", "assets/products/p005-2.svg"],
    shortDescription: "Ceramic mug printed with any name you choose.",
    description: "A 350 ml ceramic mug printed with a name of your choice and a festive design. Write the name in the order notes at checkout.",
    features: ["350 ml ceramic", "Dishwasher safe", "Any name (write it in notes)"],
    variants: { Color: ["White", "Red", "Navy"] },
    tags: ["gift"],
    inStock: true,
    featured: false,
    ar: { name: "كوب مطبوع بالاسم", shortDescription: "كوب سيراميك مطبوع بالاسم الذي تختاره." }
  },
  {
    id: "p006",
    name: "Scented Candle Trio – Winter Spice",
    category: "gifts",
    price: 22,
    oldPrice: 28,
    images: ["assets/products/p006-1.svg", "assets/products/p006-2.svg"],
    shortDescription: "Cinnamon, vanilla & pine – the smell of Christmas.",
    description: "Three soy-wax candles in glass jars: Cinnamon Stick, Vanilla Snow and Fresh Pine. About 25 hours of burn time each.",
    features: ["3 × 120 g soy wax", "~25 h burn time each", "Reusable glass jars"],
    tags: ["gift"],
    inStock: true,
    featured: false,
    ar: { name: "ثلاث شموع معطّرة – توابل الشتاء", shortDescription: "قرفة وفانيلا وصنوبر – رائحة الميلاد." }
  },
  {
    id: "p007",
    name: "Cozy Knit Christmas Sweater",
    category: "fashion",
    price: 32,
    oldPrice: 42,
    images: ["assets/products/p007-1.svg", "assets/products/p007-2.svg"],
    shortDescription: "Soft knit sweater with a classic snowflake pattern.",
    description: "Warm, soft and festive. A relaxed-fit knit sweater with a classic snowflake and reindeer pattern — perfect for family dinners and Christmas photos.",
    features: ["Soft acrylic-wool blend", "Relaxed fit", "Unisex sizing"],
    variants: { Size: ["S", "M", "L", "XL"], Color: ["Red", "Navy"] },
    tags: ["gift"],
    inStock: true,
    featured: true,
    ar: { name: "كنزة ميلادية محاكة", shortDescription: "كنزة ناعمة بنقشة ندف الثلج الكلاسيكية." }
  },
  {
    id: "p008",
    name: "Fleece Pajama Set",
    category: "fashion",
    price: 27,
    images: ["assets/products/p008-1.svg", "assets/products/p008-2.svg"],
    shortDescription: "Super-soft two-piece fleece pajamas.",
    description: "Ultra-soft fleece top and pants for cold winter nights. Elastic waist, cuffed ankles and a festive print.",
    features: ["Two-piece set", "Warm fleece", "Elastic waist"],
    variants: { Size: ["S", "M", "L"] },
    tags: ["new"],
    inStock: true,
    featured: false,
    ar: { name: "بيجاما فليس", shortDescription: "بيجاما فليس ناعمة جداً من قطعتين." }
  },
  {
    id: "p009",
    name: "Wool Scarf & Beanie Set",
    category: "fashion",
    price: 24,
    images: ["assets/products/p009-1.svg", "assets/products/p009-2.svg"],
    shortDescription: "Matching scarf and beanie in soft wool.",
    description: "A matching scarf and beanie set in soft, warm wool. Comes in a gift box.",
    features: ["Scarf 180 × 30 cm", "One-size beanie", "Gift box included"],
    tags: ["gift"],
    inStock: false,
    featured: false,
    ar: { name: "طقم شال وقبعة صوف", shortDescription: "شال وقبعة متناسقان من الصوف الناعم." }
  },
  {
    id: "p010",
    name: "Rose Perfume 50ml",
    category: "beauty",
    price: 39,
    oldPrice: 52,
    offerEndsAt: "2026-12-31",
    images: ["assets/products/p010-1.svg", "assets/products/p010-2.svg"],
    shortDescription: "Elegant rose & amber eau de parfum.",
    description: "A long-lasting eau de parfum with notes of Damascus rose, amber and soft musk. Presented in an elegant gift box.",
    features: ["50 ml eau de parfum", "Long-lasting", "Gift box"],
    tags: ["gift", "bestseller"],
    inStock: true,
    featured: true,
    ar: { name: "عطر الورد 50 مل", shortDescription: "عطر أنيق بالورد والعنبر." }
  },
  {
    id: "p011",
    name: "Skincare Gift Kit",
    category: "beauty",
    price: 29,
    images: ["assets/products/p011-1.svg", "assets/products/p011-2.svg"],
    shortDescription: "Cleanser, serum & moisturizer in a festive pouch.",
    description: "A complete 3-step routine — gentle cleanser, hydrating serum and daily moisturizer — packed in a reusable festive pouch.",
    features: ["3 full-size products", "Suitable for all skin types", "Reusable pouch"],
    tags: ["gift", "bestseller"],
    inStock: true,
    featured: false,
    ar: { name: "طقم عناية بالبشرة", shortDescription: "غسول وسيروم ومرطب في حقيبة ميلادية." }
  },
  {
    id: "p012",
    name: "Vanilla Body Mist",
    category: "beauty",
    price: 15,
    images: ["assets/products/p012-1.svg", "assets/products/p012-2.svg"],
    shortDescription: "Light, sweet vanilla mist for everyday.",
    description: "A light body mist with sweet vanilla, pear and white flowers. Perfect for everyday use or as a stocking filler.",
    features: ["250 ml", "Light everyday scent"],
    tags: ["new"],
    inStock: true,
    featured: false,
    ar: { name: "معطر جسم بالفانيلا", shortDescription: "رذاذ فانيلا خفيف ولطيف لكل يوم." }
  }
];

/* Big promotional banners shown in the Offers section.
   image is optional – leave it "" to use the festive background. */
const OFFER_BANNERS = [
  {
    title: "Buy 2 Gift Boxes, Get 1 Free",
    titleAr: "اشترِ علبتي هدايا واحصل على الثالثة مجاناً",
    subtitle: "On all Christmas gift sets – until Dec 24",
    subtitleAr: "على كل علب هدايا الميلاد – حتى 24 كانون الأول",
    cta: "Shop gifts",
    ctaAr: "تسوّق الهدايا",
    link: "#gifts",
    image: "",
    style: "red"
  },
  {
    title: "Free Gift Wrapping 🎀",
    titleAr: "تغليف هدايا مجاني 🎀",
    subtitle: "Just tell us in the order notes",
    subtitleAr: "فقط أخبرنا في ملاحظات الطلب",
    cta: "Start shopping",
    ctaAr: "ابدأ التسوق",
    link: "#shop",
    image: "",
    style: "navy"
  }
];
