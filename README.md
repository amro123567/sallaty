# Sallaty – Online Shop 🎄

A static online shop for GitHub Pages. You don't need a server or a database, and orders arrive on WhatsApp.

## ⚡ First thing to do
Open `js/config.js` and set your WhatsApp number:
```js
WHATSAPP_NUMBER: "96170000000",   // 961 + your number, no +, no spaces, no leading 0
```
Examples: `70 123 456` → `"96170123456"` · `03 123 456` → `"9613123456"`

## 📁 Files
| File | What it's for |
|---|---|
| `js/config.js` | WhatsApp number, theme, Instagram, top-bar messages, delivery time, return policy |
| `js/products.js` | **All products, categories and offer banners** |
| `js/i18n.js` | All website text in English + Arabic |
| `js/cart.js` / `js/main.js` | Site logic (no need to edit) |
| `css/style.css` | Design (colours are at the top) |
| `assets/` | Logo, favicon, product images |

## 📊 Easiest way: manage products from a Google Sheet (recommended)
With this set up, you add, edit, discount or hide products in a Google Sheet, even from your phone, and the website updates by itself. You don't need to touch code or GitHub again.

**One-time setup (5 minutes):**
1. Go to [sheets.google.com](https://sheets.google.com) and create a blank sheet.
2. Click **File → Import → Upload** and choose `sallaty-products-template.csv`, then select **Replace current sheet**. Your 12 products appear as rows.
3. Click **File → Share → Publish to web**. Choose your sheet tab (not "Entire document") and **Comma-separated values (.csv)**, then click **Publish**.
4. Copy the link (it looks like `https://docs.google.com/spreadsheets/d/e/2PACX-…/pub?output=csv`).
5. Paste it into `js/config.js`:
   ```js
   PRODUCTS_SHEET_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-…/pub?output=csv",
   ```
   Then upload `config.js` to GitHub one last time.

**Columns** (one row = one product; only `name` and `price` are required):
| Column | Example | Notes |
|---|---|---|
| id | p013 | Unique. Don't change it after customers have shared the link |
| name / name_ar | Santa Hat / قبعة بابا نويل | |
| category | Gifts | Use an existing one, or write a new name and it's created automatically |
| price | 18 | |
| old_price | 25 | Fill it in to put the product **on offer**. Clear it to end the offer |
| offer_ends | 2026-12-20 | Optional countdown |
| images | p013-1.jpg \| p013-2.jpg | File names in `assets/products/`, **or** Google Drive / any image links, separated by `\|` |
| short_description / short_description_ar | | One line |
| description | | Full text |
| features | Soft \| Warm \| Gift box | Separated by `\|` |
| sizes | S, M, L | Leave empty if none |
| colors | Red, Navy | Leave empty if none |
| tags | gift, new, bestseller | `gift` puts it in the Gifts section |
| in_stock | yes / no | |
| featured | yes / no | Shown first |
| hide | yes | Hides the product without deleting the row |

**Photos from your phone:** upload them to Google Drive, right-click → **Share** → "Anyone with the link", copy the link and paste it in the `images` column. Use square photos.

⏱️ Google takes about **5 minutes** to show changes on the published sheet. If the sheet ever can't be reached, the site uses the last version it loaded, and if there isn't one it falls back to `products.js`.

---

## 📱 Admin page: add products with a form (no typing in the sheet)
`admin.html` is a private page on your site where you fill in a form, pick photos from your phone or computer, and press **Add product**. The photos go to your Google Drive and the product is added to your Google Sheet automatically. Open it at `https://your-site/admin.html`.

### Admin page setup (one time, about 5 minutes)
1. Open your **Google Sheet** and click **Extensions → Apps Script**.
2. Delete any code you see, paste in everything from **`google-apps-script.gs`**, and click 💾 **Save**.
3. On line 8, change `change-this-password` to your own password (keep the quotes), then **Save**.
4. Click **Deploy → New deployment**, then click ⚙️ → **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**

   Click **Deploy**.
5. Google asks for permission. Click **Authorize access** and choose your account. If you see *"Google hasn't verified this app"*, click **Advanced → Go to (unsafe)**. It's your own script, so it's safe. Then click **Allow**.
6. Copy the **Web app URL** (it starts with `https://script.google.com/macros/s/…/exec`).
7. Open `https://your-site/admin.html`, paste the URL and your password, and click **Save & test**.

You do this once per device (phone, laptop). Tip: on your phone, use **Share → Add to Home Screen** so the admin page opens like an app.

**Security:** only someone with your password can add or hide products. The password is saved only on your own devices, never on GitHub. The admin page is hidden from Google search.

**What the admin page does:**
- **Add product:** photos (auto-resized), name, Arabic name, category, price, offer, description, features, sizes, colors, labels, stock and featured, with a live preview.
- **My products:** search your products and **Hide/Show** them with one tap.
- Editing details or deleting products is still done directly in the Google Sheet.

**If you edit the script later**, go to **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**. The URL stays the same.

---

## 🛍️ Add or edit a product (without Google Sheets)
1. Put the photos in `assets/products/` (e.g. `p013-1.jpg`, `p013-2.jpg`).
2. In `js/products.js`, copy an existing `{ ... },` block, paste it at the end of the list, and edit it:
```js
{
  id: "p013",                        // must be unique
  name: "Red Velvet Gift Box",
  category: "gifts",                 // decor | gifts | fashion | beauty (or add your own in CATEGORIES)
  price: 30,
  oldPrice: 40,                      // optional → makes it an OFFER (−25% badge, shows in Christmas Deals)
  offerEndsAt: "2026-12-24",         // optional → "Ends in" timer
  images: ["assets/products/p013-1.jpg", "assets/products/p013-2.jpg"],
  shortDescription: "One short line",
  description: "Full description…",
  features: ["Feature 1", "Feature 2"],
  variants: { Size: ["S", "M"], Color: ["Red", "Navy"] },   // optional; delete the line if not needed
  tags: ["gift", "new"],             // gift → "Perfect Christmas Gifts" section · new · bestseller
  inStock: true,                     // false → "Out of stock" + "Ask on WhatsApp"
  featured: true,                    // shown first
  ar: { name: "علبة هدايا", shortDescription: "سطر قصير" }   // optional Arabic text
},
```
- **To put something on offer**, add `oldPrice` higher than `price`. To end the offer, delete `oldPrice`.
- **To change the big offer banners**, edit `OFFER_BANNERS` at the bottom of `products.js`.

**Photos:** square, 1000×1000 px, under 200 KB, JPG or WebP, plain light background. You can use [squoosh.app](https://squoosh.app) to shrink them.


## ⭐ Ratings & customer reviews (only real ones)
**Star ratings on products:** add two columns to your Google Sheet, `rating` (for example `4.8`) and `reviews` (for example `23`), or fill in the Rating fields in the admin page. Stars only appear on products that have a rating. Only enter numbers that come from real customer feedback.

**Reviews section on the home page:** open `js/reviews.js` and add real reviews from your customers, such as nice WhatsApp messages (ask them first). The section stays hidden until you add at least one. Set `verified: true` only for people who actually bought from you.

**Hover photo:** if a product has two or more photos, the second one appears when a customer hovers over the card.

## 🎅 After Christmas
In `js/config.js`, change:
```js
THEME: "default",
```
That removes the snow, ribbons, countdown and decorations, leaving the clean navy and white brand look. Also update the top-bar messages (`ANNOUNCEMENTS`) and the hero text in `js/i18n.js` (`heroEyebrow`, `heroTitle`, `heroSub`).

## 🚀 Publish on GitHub Pages
1. Create a free account at github.com, then click **New repository** and name it, e.g. `sallaty`. Set it to **Public**.
2. Click **Add file → Upload files** and drag in **everything inside this folder** (index.html, css, js, assets…), then click **Commit changes**.
3. Go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, then **main**, then **/(root)**, then **Save**.
4. After 1–2 minutes your shop is live at `https://YOUR-USERNAME.github.io/sallaty/`.

To update it later, upload the changed files again (same names) and commit.

**Custom domain (optional):** buy a domain such as `sallaty.shop`, add it under Settings → Pages → Custom domain, and follow GitHub's DNS instructions.

## How ordering works
Customer adds to cart → fills in name, phone, governorate, area and address → presses **Send order on WhatsApp** → WhatsApp opens with the full order (items, variants, totals, order number) → they press send → you confirm the order and deliver it, cash on delivery.

The language (EN/عربي), snow on/off, and cart are saved in the visitor's browser.
