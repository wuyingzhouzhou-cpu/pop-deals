export type NavSection =
  | "deals"
  | "categories"
  | "coupons"
  | "travel"
  | "digital_services"
  | "gaming"
  | "personal_finance"

export type Site = {
  id: string
  name: string
  domain: string
  aliasDomains: string[]
  locale: string
  country: string
  currency: string
  description: string
  logoUrl: string | null
  themeColor: string | null
  seoTitle: string | null
  seoDescription: string | null
}

export type Category = {
  id: string
  siteId: string
  parentId: string | null
  navSection: NavSection
  name: string
  slug: string
  description: string
  sortOrder: number
}

export type AffiliateProduct = {
  id: string
  siteId: string
  categoryId: string | null
  title: string
  slug: string
  description: string
  imageUrl: string | null
  platform: string
  platformTitle: string
  country: string
  priceText: string
  affiliateUrl: string
  affiliateId: string | null
  accountUser: string | null
  creatorUsername: string | null
  status: "draft" | "published" | "disabled"
  viewCount: number
  clickCount: number
}

export type BlogPost = {
  id: string
  siteId: string
  title: string
  slug: string
  excerpt: string
  body: string
  status: "draft" | "published"
  seoTitle: string | null
  seoDescription: string | null
  sourceTitle: string | null
  sourceUrl: string | null
  sourceAuthor: string | null
  sourceLicense: string | null
  sourceLicenseUrl: string | null
  publishedAt: string
}

export type SiteSnapshot = {
  site: Site
  categories: Category[]
  products: AffiliateProduct[]
  posts: BlogPost[]
}

export type ClickEvent = {
  id: string
  productId: string
  productTitle: string
  clickId: string
  ipAddress: string | null
  userAgent: string | null
  referrer: string | null
  createdAt: string
}

export type ReportSnapshot = {
  totalViews: number
  totalClicks: number
  ctr: number
  topProducts: AffiliateProduct[]
  recentClicks: ClickEvent[]
}

export type CollectorRun = {
  id: string
  siteId: string
  blogPostId: string | null
  blogPostSlug: string | null
  sourceUrl: string
  status: "collected" | "rejected"
  message: string
  title: string
  author: string
  license: string
  licenseUrl: string
  wordCount: number
  createdAt: string
}
