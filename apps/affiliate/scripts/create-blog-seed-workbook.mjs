import fs from "node:fs/promises"
import path from "node:path"
import XLSX from "xlsx"

const outputDir = path.resolve(
  process.env.AFFILIATE_TEMPLATE_OUT || "apps/affiliate/import-templates"
)
const outputPath = path.join(outputDir, "affiliate_blog_seed_posts.xlsx")

const workbook = XLSX.utils.book_new()

function writeSheet(name, rows) {
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  XLSX.utils.book_append_sheet(workbook, sheet, name)
  return sheet
}

const headers = [
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
]

const rows = [
  [
    "",
    "how-to-build-a-deal-watchlist",
    "How to Build a Deal Watchlist Before You Buy",
    "how-to-build-a-deal-watchlist-before-you-buy",
    "How to Build a Deal Watchlist Before You Buy",
    "A practical shopping guide for tracking prices, coupons, stores, and product timing before purchasing.",
    "Use a simple watchlist system to avoid impulse buys and catch better marketplace deals.",
    `## Start with the product problem

A useful deal watchlist starts with the problem you want to solve, not with the first discount you see. Write down the product type, the must-have features, the stores you trust, and the maximum price you are willing to pay. This gives every future listing a standard to pass.

## Track stores and timing

Marketplace prices move around holidays, payday cycles, creator campaigns, and platform coupon events. Save the same product from two or three stores when possible. If the price difference is small, choose the store with better shipping, clearer returns, and stronger buyer protection.

## Compare the full cost

The lowest sticker price is not always the cheapest buy. Shipping, taxes, import fees, bundle rules, and coupon minimums can change the final cost. Add the total checkout price to your watchlist so the comparison is honest.

## Know when to buy

A watchlist is useful only if it has a trigger. Buy when the product meets your feature list, the total price fits your target, and the store terms are acceptable. Skip it when the discount looks big but the product does not match the original need.`,
    "",
    "",
    "",
    "Original",
    "",
    "published",
  ],
  [
    "",
    "marketplace-coupon-stack-guide",
    "Marketplace Coupon Stacking: What to Check Before Checkout",
    "marketplace-coupon-stacking-checkout-guide",
    "Marketplace Coupon Stacking Guide",
    "Learn how store coupons, platform vouchers, shipping discounts, and affiliate deals can combine at checkout.",
    "Coupon stacking can save money, but the real discount only matters after shipping and store restrictions.",
    `## Understand each discount layer

Most marketplace checkout pages can include several discount types: a platform voucher, a store coupon, a shipping coupon, a payment discount, and sometimes an affiliate or creator campaign price. These discounts do not always combine, so the final checkout page is the only number that matters.

## Watch minimum spend rules

Coupon minimums can push shoppers to buy unnecessary items. Before adding extra products, calculate whether the discount is larger than the added cost. A smaller order with no coupon can still be the better deal.

## Check return and warranty terms

Some deals are aggressive because the store is clearing inventory or shipping from another region. That can be fine for accessories, but it matters more for electronics, sizing-sensitive clothing, or products with warranties.

## Keep a checkout screenshot

For higher-value purchases, save the checkout summary before paying. It helps you compare later and gives you a record of the coupon, shipping method, and expected delivery date.`,
    "",
    "",
    "",
    "Original",
    "",
    "published",
  ],
  [
    "",
    "affiliate-product-review-template",
    "A Simple Affiliate Product Review Template That Does Not Feel Spammy",
    "affiliate-product-review-template-that-does-not-feel-spammy",
    "Affiliate Product Review Template",
    "A repeatable review structure for affiliate websites that emphasizes usefulness, comparison, and buyer fit.",
    "A good affiliate review helps the reader decide whether the product fits their situation.",
    `## Lead with buyer fit

The first question is not whether the product is good. It is who the product is good for. Start every review with the best-fit buyer, the use case, and the situations where the product is not ideal.

## Separate facts from opinion

List observable facts such as size, material, compatibility, price range, shipping region, and store policy. Then explain your opinion separately. Readers trust reviews more when they can see what is measured and what is judgment.

## Compare alternatives

Most buyers are choosing between several similar products. Add a short comparison section that explains when to pick the cheaper option, when to upgrade, and when to wait for a better deal.

## End with a clear buying decision

Close the review with a simple recommendation: buy now, wait for a coupon, choose an alternative, or skip. This makes the page useful even when the reader does not click immediately.`,
    "",
    "",
    "",
    "Original",
    "",
    "published",
  ],
  [
    "",
    "travel-accessories-buying-guide",
    "Travel Accessories Buying Guide: What Is Actually Worth Packing",
    "travel-accessories-buying-guide-worth-packing",
    "Travel Accessories Buying Guide",
    "A practical guide to choosing useful travel accessories without overpacking or buying low-value extras.",
    "The best travel accessories save space, protect essentials, or reduce repeated travel friction.",
    `## Choose by travel friction

Good travel accessories solve repeated problems: tangled cables, wet toiletries, lost documents, uncomfortable sleep, or limited outlet access. If an item does not solve a repeated problem, it probably does not deserve space in your bag.

## Favor lightweight multi-use items

Small organizers, compact chargers, and packing cubes work well because they are light and useful across many trips. Bulky single-purpose products need a stronger reason to earn a place.

## Check material and cleaning

Travel gear gets handled often. Water-resistant fabric, washable surfaces, sturdy zippers, and simple compartments usually matter more than decorative details.

## Buy around your route

A weekend city trip, long-haul flight, and beach vacation need different accessories. Build the list around the route and climate first, then shop for deals inside that list.`,
    "",
    "",
    "",
    "Original",
    "",
    "published",
  ],
  [
    "",
    "budget-gaming-accessories-comparison",
    "Budget Gaming Accessories Compared: Keyboard, Headset, Mouse, or Controller?",
    "budget-gaming-accessories-keyboard-headset-mouse-controller",
    "Budget Gaming Accessories Compared",
    "Compare budget gaming accessories by comfort, durability, compatibility, and upgrade impact.",
    "When the budget is limited, prioritize the accessory that improves the games you actually play.",
    `## Match the accessory to the game

Keyboard upgrades matter more for desk setups and PC games. Controllers matter more for platformers, racing games, and couch play. Headsets matter when communication or late-night volume control is important. The right first upgrade depends on the game type.

## Comfort beats flashy features

RGB lighting and aggressive styling are easy to market, but comfort and reliability usually create more value. Look for stable switches, adjustable headbands, sensible weight, and compatibility with your device.

## Watch for hidden compatibility issues

Some accessories need software, adapters, or region-specific layouts. Before buying, check whether the product works with your console, phone, PC, or tablet without extra parts.

## Upgrade in order

If you are starting from basic gear, upgrade the item you touch most. For many players that is the mouse or controller. For online games it may be the headset. For typing-heavy desktop use, the keyboard may have the biggest daily impact.`,
    "",
    "",
    "",
    "Original",
    "",
    "published",
  ],
  [
    "",
    "tiktok-shop-creator-deal-analysis",
    "TikTok Shop Creator Deals: How to Judge Whether a Viral Product Is Worth Buying",
    "tiktok-shop-creator-deals-viral-product-guide",
    "TikTok Shop Creator Deals Guide",
    "A buyer-friendly framework for judging creator-driven TikTok Shop products before purchasing.",
    "Creator videos can help discovery, but a buyer still needs price checks, store checks, and use-case checks.",
    `## Separate entertainment from evidence

Creator content is useful for seeing size, texture, packaging, and real-life use. It is less useful as proof that a product is the best option. Treat the video as discovery, then verify the product like any other marketplace listing.

## Check the store and listing

Look at store ratings, shipping region, return policy, product options, and recent buyer feedback. A viral product from a weak store can still create a poor buying experience.

## Compare price outside the video

Creator campaigns may include coupons or limited-time pricing. Compare the final checkout price with similar listings before assuming the deal is special.

## Buy for a real use case

Viral products often feel urgent. Slow the decision down by asking where the item will be used, how often, and whether it solves a real problem. If the answer is unclear, save it and revisit later.`,
    "",
    "",
    "",
    "Original",
    "",
    "published",
  ],
  [
    "",
    "seo-content-plan-for-affiliate-sites",
    "SEO Content Plan for Small Affiliate Sites",
    "seo-content-plan-for-small-affiliate-sites",
    "SEO Content Plan for Small Affiliate Sites",
    "A practical content structure for affiliate sites using buying guides, comparisons, deal pages, and tutorials.",
    "Small affiliate sites need focused topical clusters rather than random product posts.",
    `## Pick one commercial topic cluster

Start with a narrow cluster such as travel organizers, budget gaming gear, home office accessories, or creator-led marketplace finds. A focused cluster helps internal links, category pages, and product pages support one another.

## Build four article types

Use buying guides for broad searches, comparisons for decision searches, tutorials for problem searches, and deal roundups for fresh offers. Each article type should point readers toward relevant products without forcing every paragraph to sell.

## Keep product pages useful

A product page should include the product fit, store, price context, shipping notes, and alternatives. Thin pages with only a button rarely create long-term SEO value.

## Refresh on a schedule

Affiliate content gets stale quickly. Review price-sensitive posts monthly, evergreen tutorials quarterly, and high-traffic comparison pages whenever products change.`,
    "",
    "",
    "",
    "Original",
    "",
    "published",
  ],
  [
    "",
    "passive-income-affiliate-site-reality",
    "Affiliate Sites and Passive Income: What Is Realistic?",
    "affiliate-sites-passive-income-realistic-guide",
    "Affiliate Sites and Passive Income",
    "A grounded guide to affiliate websites, SEO timelines, content maintenance, and realistic passive income expectations.",
    "Affiliate websites can become semi-passive, but only after systems for content, tracking, and updates are working.",
    `## Passive does not mean unattended

Affiliate sites can reduce daily labor after the structure is built, but they still need content updates, broken-link checks, tracking reviews, and compliance work. The passive part comes from repeatable systems, not from ignoring the site.

## Traffic comes before revenue

Commission depends on qualified clicks. Qualified clicks depend on useful pages that match search intent, social intent, or ad intent. Early work should focus on page quality and distribution before judging revenue.

## Track the right numbers

Views, clicks, click-through rate, store conversion, commission, and content age all matter. A page with modest traffic but high buying intent can outperform a broad article with many casual readers.

## Build small repeatable systems

The best path is usually simple: choose a niche, publish useful articles, connect relevant products, track clicks, refresh winners, and cut weak pages. Repeatability is what turns a site into an asset.`,
    "",
    "",
    "",
    "Original",
    "",
    "published",
  ],
]

writeSheet("Blog Posts", [headers, ...rows])

await fs.mkdir(outputDir, { recursive: true })
XLSX.writeFile(workbook, outputPath)
console.log(outputPath)
