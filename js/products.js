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

// Products now come from your Google Sheet (see PRODUCTS_SHEET_URL in config.js).
// This list is only used if you leave PRODUCTS_SHEET_URL empty.
// Example of one product (remove the // to use it):
//  {
//    id: "p001", name: "Golden Ornament Set", category: "decor", price: 18, oldPrice: 25,
//    images: ["assets/products/p001-1.svg"], shortDescription: "One line",
//    description: "Full description", features: ["Feature 1"], tags: ["gift"],
//    inStock: true, featured: true
//  },
const PRODUCTS = [
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
