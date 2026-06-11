import "server-only"
import type {
  AffiliateProduct,
  BlogPost,
  Category,
  CollectorRun,
  Site,
} from "../types"

export function productFromRow(row: any): AffiliateProduct {
  return {
    id: row.id,
    siteId: row.site_id,
    categoryId: row.category_id,
    title: row.title,
    slug: row.slug,
    description: row.description || "",
    imageUrl: row.image_url,
    platform: row.platform,
    platformTitle: row.platform_title,
    country: row.country,
    priceText: row.price_text || "",
    affiliateUrl: row.affiliate_url,
    affiliateId: row.affiliate_id,
    accountUser: row.account_user,
    creatorUsername: row.creator_username,
    status: row.status,
    viewCount: Number(row.view_count || 0),
    clickCount: Number(row.click_count || 0),
  }
}

export function categoryFromRow(row: any): Category {
  return {
    id: row.id,
    siteId: row.site_id,
    parentId: row.parent_id,
    navSection: row.nav_section,
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    sortOrder: Number(row.sort_order || 0),
  }
}

export function postFromRow(row: any): BlogPost {
  return {
    id: row.id,
    siteId: row.site_id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || "",
    body: row.body || "",
    status: row.status,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    sourceTitle: row.source_title,
    sourceUrl: row.source_url,
    sourceAuthor: row.source_author,
    sourceLicense: row.source_license,
    sourceLicenseUrl: row.source_license_url,
    publishedAt: row.published_at
      ? new Date(row.published_at).toISOString()
      : new Date().toISOString(),
  }
}

export function siteFromRow(row: any): Site {
  return {
    id: row.id,
    name: row.name,
    domain: row.domain,
    aliasDomains: Array.isArray(row.alias_domains) ? row.alias_domains : [],
    locale: row.locale,
    country: row.country,
    currency: row.currency,
    description: row.description || "",
    logoUrl: row.logo_url,
    themeColor: row.theme_color,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
  }
}

export function collectorRunFromRow(row: any): CollectorRun {
  return {
    id: row.id,
    siteId: row.site_id,
    blogPostId: row.blog_post_id,
    blogPostSlug: row.blog_post_slug || null,
    sourceUrl: row.source_url,
    status: row.status,
    message: row.message || "",
    title: row.title || "",
    author: row.author || "",
    license: row.license || "",
    licenseUrl: row.license_url || "",
    wordCount: Number(row.word_count || 0),
    createdAt: row.created_at
      ? new Date(row.created_at).toISOString()
      : new Date().toISOString(),
  }
}
