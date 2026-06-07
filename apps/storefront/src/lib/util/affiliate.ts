export type AffiliateLink = {
  source: string
  label: string
  url: string
  country?: string
  affiliateId?: string
  accountUser?: string
  creatorUsername?: string
  priceText?: string
}

export const AFFILIATE_PLATFORMS = [
  "aliexpress",
  "shopee",
  "amazon",
  "tiktok_shop",
  "lazada",
  "shein",
  "trip",
]

export const AFFILIATE_PLATFORM_LABELS: Record<string, string> = {
  aliexpress: "AliExpress",
  shopee: "Shopee",
  amazon: "Amazon",
  tiktok_shop: "TikTok Shop",
  lazada: "Lazada",
  shein: "SHEIN",
  trip: "Trip.com",
  marketplace: "Marketplace",
}

const inferPlatformFromUrl = (url: string) => {
  const lowerUrl = url.toLowerCase()

  if (lowerUrl.includes("aliexpress")) return "aliexpress"
  if (lowerUrl.includes("shopee")) return "shopee"
  if (lowerUrl.includes("amazon")) return "amazon"
  if (lowerUrl.includes("tiktok")) return "tiktok_shop"
  if (lowerUrl.includes("lazada")) return "lazada"
  if (lowerUrl.includes("shein")) return "shein"
  if (lowerUrl.includes("trip.")) return "trip"

  return "marketplace"
}

const getString = (
  metadata: Record<string, unknown> | null | undefined,
  key: string
) => {
  const value = metadata?.[key]

  return typeof value === "string" ? value : ""
}

const getNumber = (
  metadata: Record<string, unknown> | null | undefined,
  key: string
) => {
  const value = metadata?.[key]

  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)

    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

export const getAffiliateLinks = (
  metadata: Record<string, unknown> | null | undefined
): AffiliateLink[] => {
  const links: AffiliateLink[] = []
  const primaryUrl = getString(metadata, "affiliate_url")

  if (primaryUrl) {
    const source =
      getString(metadata, "affiliate_platform") ||
      getString(metadata, "affiliate_source") ||
      inferPlatformFromUrl(primaryUrl)

    links.push({
      source,
      label:
        getString(metadata, "affiliate_platform_title") ||
        AFFILIATE_PLATFORM_LABELS[source] ||
        source,
      url: primaryUrl,
      country: getString(metadata, "affiliate_country"),
      affiliateId: getString(metadata, "affiliate_id"),
      accountUser:
        getString(metadata, "affiliate_account_user") ||
        getString(metadata, "affiliate_account"),
      creatorUsername: getString(metadata, "affiliate_creator_username"),
      priceText: getString(metadata, "affiliate_price_text"),
    })
  }

  for (const source of AFFILIATE_PLATFORMS) {
    const url = getString(metadata, `affiliate_${source}`)

    if (!url || links.some((link) => link.url === url)) {
      continue
    }

    links.push({
      source,
      label: AFFILIATE_PLATFORM_LABELS[source] || source,
      url,
    })
  }

  return links
}

export const getPrimaryAffiliateLink = (
  metadata: Record<string, unknown> | null | undefined
) => getAffiliateLinks(metadata)[0]

export const getProductViewCount = (product: {
  id?: string | null
  title?: string | null
  metadata?: Record<string, unknown> | null
}) => {
  const explicitViews =
    getNumber(product.metadata, "affiliate_view_count") ||
    getNumber(product.metadata, "view_count") ||
    getNumber(product.metadata, "views")

  if (explicitViews > 0) {
    return explicitViews
  }

  const seed = `${product.id || ""}${product.title || ""}`
  const stableCount =
    90 +
    (seed
      .split("")
      .reduce((total, character) => total + character.charCodeAt(0), 0) %
      1800)

  return stableCount
}

export const formatViewCount = (views: number) => {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`

  return String(views)
}
