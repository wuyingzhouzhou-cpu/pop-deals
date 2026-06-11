import fs from "node:fs/promises"
import path from "node:path"
import XLSX from "xlsx"

const outputDir = path.resolve(
  process.env.AFFILIATE_TEMPLATE_OUT || "apps/affiliate/import-templates"
)
const outputPath = path.join(outputDir, "affiliate_import_template_v2.xlsx")

const workbook = XLSX.utils.book_new()

function writeSheet(name, rows) {
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  XLSX.utils.book_append_sheet(workbook, sheet, name)
  return sheet
}

writeSheet("Instructions", [
  ["Step", "What to do", "Notes"],
  [
    "1",
    "Create or import Sites first",
    "Each domain is one affiliate website. Products and categories belong to a site_key.",
  ],
  [
    "2",
    "Import Categories second",
    "Use parent_key only when a category is a child category. Leave it blank for top level.",
  ],
  [
    "3",
    "Import Affiliate Products third",
    "Each product must include site_key, title, platform, platform_title, affiliate_url, and status.",
  ],
  [
    "4",
    "Import Blog Posts later",
    "Blog is for SEO. It should support the deal pages, not replace the deal feed.",
  ],
])

writeSheet("Sites", [
  [
    "site_key",
    "name",
    "domain",
    "alias_domains",
    "locale",
    "country",
    "currency",
    "description",
    "logo_url",
    "theme_color",
    "seo_title",
    "seo_description",
  ],
  [
    "pop_us",
    "Pop Deals",
    "deals.example.com",
    "www.deals.example.com",
    "en-US",
    "US",
    "USD",
    "Hand-picked marketplace deals, coupons, and shopping guides.",
    "",
    "#c83d2d",
    "Pop Deals",
    "Hand-picked marketplace deals, coupons, and shopping guides.",
  ],
])

writeSheet("Categories", [
  [
    "site_key",
    "category_key",
    "parent_key",
    "nav_section",
    "name",
    "slug",
    "description",
    "sort_order",
  ],
  [
    "pop_us",
    "electronics",
    "",
    "categories",
    "Electronics",
    "electronics",
    "Gadgets, accessories, and useful electronics.",
    "10",
  ],
  [
    "pop_us",
    "tiktok_shop",
    "",
    "coupons",
    "TikTok Shop",
    "tiktok-shop",
    "TikTok Shop coupons and creator picks.",
    "20",
  ],
  [
    "pop_us",
    "gaming_keyboards",
    "electronics",
    "gaming",
    "Gaming Keyboards",
    "gaming-keyboards",
    "Keyboard deals for gaming setups.",
    "30",
  ],
])

writeSheet("Affiliate Products", [
  [
    "site_key",
    "product_key",
    "category_key",
    "title",
    "slug",
    "description",
    "image_url",
    "platform",
    "platform_title",
    "country",
    "price_text",
    "affiliate_url",
    "affiliate_id",
    "account_user",
    "creator_username",
    "status",
  ],
  [
    "pop_us",
    "demo_keyboard",
    "gaming_keyboards",
    "Compact RGB Mechanical Keyboard Deal",
    "compact-rgb-mechanical-keyboard-deal",
    "A budget gaming keyboard deal for weekly roundup pages.",
    "https://example.com/image.jpg",
    "aliexpress",
    "AliExpress",
    "US",
    "$24.50",
    "https://example.com/affiliate/aliexpress",
    "your-affiliate-id",
    "your-account",
    "",
    "published",
  ],
  [
    "pop_us",
    "demo_tiktok",
    "tiktok_shop",
    "TikTok Shop Plush Bag Charm Deal",
    "tiktok-shop-plush-bag-charm-deal",
    "A creator-friendly TikTok Shop product for social traffic.",
    "",
    "tiktok_shop",
    "TikTok Shop",
    "MY",
    "$8.99",
    "https://example.com/affiliate/tiktok",
    "your-affiliate-id",
    "your-account",
    "@creator_name",
    "published",
  ],
])

writeSheet("Blog Posts", [
  [
    "site_key",
    "post_key",
    "title",
    "slug",
    "seo_title",
    "seo_description",
    "excerpt",
    "body",
    "source_title",
    "source_url",
    "source_author",
    "source_license",
    "source_license_url",
    "status",
  ],
  [
    "pop_us",
    "best-gaming-accessories",
    "Best Budget Gaming Accessories This Week",
    "best-budget-gaming-accessories-this-week",
    "Best Budget Gaming Accessories This Week",
    "A weekly guide to affordable gaming accessories and marketplace deals.",
    "A short SEO guide for gaming accessory deals.",
    "Write the article body here.",
    "",
    "",
    "",
    "Original",
    "",
    "published",
  ],
])

await fs.mkdir(outputDir, { recursive: true })
XLSX.writeFile(workbook, outputPath)
console.log(outputPath)
