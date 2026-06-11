import "server-only"
import { query } from "./db"
import { siteImportKey } from "./import-keys"
import {
  createBlogPost,
  createCategory,
  createProduct,
  createSite,
} from "./repository"
import { slugify } from "./repositories/utils"
import type { NavSection, Site } from "./types"

type Row = Record<string, string>

type ImportResult = {
  sites: number
  categories: number
  products: number
  posts: number
  errors: string[]
  warnings: string[]
}

const validSections = new Set([
  "categories",
  "coupons",
  "travel",
  "digital_services",
  "gaming",
  "personal_finance",
])

const sectionAliases: Record<string, NavSection> = {
  finance: "personal_finance",
  "personal finance": "personal_finance",
}

function normalizeSection(value: string) {
  const normalized = value.trim().toLowerCase()
  return sectionAliases[normalized] || normalized
}

function siteCategoryKey(siteId: string, slug: string) {
  return `${siteId}:${slug}`
}

function mapSitesByImportKey(sites: Site[]) {
  return new Map(sites.map((site) => [siteImportKey(site), site]))
}

function databaseSiteForKey(
  siteKey: string,
  workbookSitesByKey: Map<string, Row>,
  databaseSitesByImportKey: Map<string, Site>,
  databaseSitesByDomain: Map<string, Site>
) {
  const workbookSite = workbookSitesByKey.get(siteKey)

  if (workbookSite) {
    return databaseSitesByDomain.get(workbookSite.domain.toLowerCase()) || null
  }

  return databaseSitesByImportKey.get(siteKey.toLowerCase()) || null
}

function sheetRows(workbook: any, name: string): Row[] {
  const sheet = workbook.Sheets[name]

  if (!sheet) {
    return []
  }

  const rows = workbook.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false,
  }) as Record<string, unknown>[]

  return rows
    .map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key.trim(),
          String(value ?? "").trim(),
        ])
      )
    )
    .filter((row) => Object.values(row).some((value) => value))
}

function missingFields(row: Row, fields: string[]) {
  return fields.filter((field) => !row[field])
}

function validateRows(
  label: string,
  rows: Row[],
  requiredFields: string[],
  errors: string[]
) {
  rows.forEach((row, index) => {
    const missing = missingFields(row, requiredFields)

    if (missing.length > 0) {
      errors.push(`${label} row ${index + 2}: missing ${missing.join(", ")}`)
    }
  })
}

export async function importAffiliateWorkbook(file: File): Promise<ImportResult> {
  const XLSX = await import("xlsx")
  const buffer = Buffer.from(await file.arrayBuffer())
  const workbook = XLSX.read(buffer, { type: "buffer" })

  const sites = sheetRows({ ...workbook, utils: XLSX.utils }, "Sites")
  const categories = sheetRows(
    { ...workbook, utils: XLSX.utils },
    "Categories"
  )
  const products = sheetRows(
    { ...workbook, utils: XLSX.utils },
    "Affiliate Products"
  )
  const posts = sheetRows({ ...workbook, utils: XLSX.utils }, "Blog Posts")

  const errors: string[] = []
  const warnings: string[] = []
  const { getAdminSnapshot } = await import("./repository")
  const initialSnapshot = await getAdminSnapshot()
  const initialSiteByImportKey = mapSitesByImportKey(initialSnapshot.sites)

  validateRows(
    "Sites",
    sites,
    ["site_key", "name", "domain", "locale", "country", "currency"],
    errors
  )
  validateRows(
    "Categories",
    categories,
    ["site_key", "category_key", "nav_section", "name"],
    errors
  )
  validateRows(
    "Affiliate Products",
    products,
    [
      "site_key",
      "product_key",
      "category_key",
      "title",
      "platform",
      "platform_title",
      "country",
      "affiliate_url",
      "status",
    ],
    errors
  )

  const siteByKey = new Map(sites.map((site) => [site.site_key, site]))
  const categoryByKey = new Map(
    categories.map((category) => [category.category_key, category])
  )

  categories.forEach((category, index) => {
    const section = normalizeSection(category.nav_section)

    if (
      category.site_key &&
      !siteByKey.has(category.site_key) &&
      !initialSiteByImportKey.has(category.site_key.toLowerCase())
    ) {
      errors.push(
        `Categories row ${index + 2}: unknown site_key ${category.site_key}`
      )
    }

    if (category.parent_key && !categoryByKey.has(category.parent_key)) {
      errors.push(
        `Categories row ${index + 2}: unknown parent_key ${category.parent_key}`
      )
    }

    if (category.nav_section && !validSections.has(section)) {
      errors.push(
        `Categories row ${index + 2}: invalid nav_section ${category.nav_section}`
      )
    }
  })

  products.forEach((product, index) => {
    if (
      product.site_key &&
      !siteByKey.has(product.site_key) &&
      !initialSiteByImportKey.has(product.site_key.toLowerCase())
    ) {
      errors.push(
        `Affiliate Products row ${index + 2}: unknown site_key ${product.site_key}`
      )
    }

    if (product.category_key && !categoryByKey.has(product.category_key)) {
      errors.push(
        `Affiliate Products row ${index + 2}: unknown category_key ${product.category_key}`
      )
    }

    if (
      product.status &&
      !["draft", "published", "disabled"].includes(product.status.toLowerCase())
    ) {
      errors.push(
        `Affiliate Products row ${index + 2}: invalid status ${product.status}`
      )
    }

    if (
      product.platform !== "tiktok_shop" &&
      product.creator_username
    ) {
      warnings.push(
        `Affiliate Products row ${index + 2}: creator_username is filled but platform is ${product.platform}`
      )
    }
  })

  posts.forEach((post, index) => {
    if (!post.title && !post.slug && !post.post_key) {
      return
    }

    if (
      post.site_key &&
      !siteByKey.has(post.site_key) &&
      !initialSiteByImportKey.has(post.site_key.toLowerCase())
    ) {
      warnings.push(
        `Blog Posts row ${index + 2}: unknown site_key ${post.site_key}; imported into current site instead`
      )
    }

    if (post.status && !["draft", "published"].includes(post.status)) {
      errors.push(`Blog Posts row ${index + 2}: invalid status ${post.status}`)
    }
  })

  if (errors.length > 0) {
    return {
      sites: 0,
      categories: 0,
      products: 0,
      posts: 0,
      errors,
      warnings,
    }
  }

  for (const site of sites) {
    await createSite({
      name: site.name,
      domain: site.domain,
      aliasDomains: site.alias_domains
        ? site.alias_domains
            .split(/[,\n]/)
            .map((item) => item.trim().toLowerCase())
            .filter(Boolean)
        : [],
      locale: site.locale || "en-US",
      country: site.country || "US",
      currency: site.currency || "USD",
      description: site.description || "",
      logoUrl: site.logo_url || "",
      themeColor: site.theme_color || "",
      seoTitle: site.seo_title || "",
      seoDescription: site.seo_description || "",
    })
  }

  const snapshot = await getAdminSnapshot()
  const siteByDomain = new Map(
    snapshot.sites.map((site) => [site.domain.toLowerCase(), site])
  )
  const siteByImportKey = mapSitesByImportKey(snapshot.sites)

  for (const category of categories) {
    const databaseSite = databaseSiteForKey(
      category.site_key,
      siteByKey,
      siteByImportKey,
      siteByDomain
    )
    const parent = category.parent_key
      ? categoryByKey.get(category.parent_key)
      : null

    await createCategory({
      siteId: databaseSite?.id || snapshot.site.id,
      parentId: "",
      navSection: normalizeSection(category.nav_section) as NavSection,
      name: category.name,
      slug: slugify(category.slug || category.category_key || category.name),
      description: category.description || "",
      sortOrder: Number(category.sort_order || 0) || 0,
    })

    category._database_parent_slug = parent
      ? slugify(parent.slug || parent.category_key || parent.name)
      : ""
  }

  const importedSiteIds = Array.from(
    new Set(
      sites
        .map((site) => siteByDomain.get(site.domain.toLowerCase())?.id)
        .filter(Boolean)
        .concat(
          categories
            .map((category) =>
              databaseSiteForKey(
                category.site_key,
                siteByKey,
                siteByImportKey,
                siteByDomain
              )?.id
            )
            .filter(Boolean)
        )
    )
  ) as string[]

  const allCategories =
    importedSiteIds.length > 0
      ? await query<any>(
          `select id, site_id, slug from affiliate_categories where site_id = any($1::uuid[])`,
          [importedSiteIds]
        )
      : []

  const categoryBySiteAndSlug = new Map(
    allCategories.map((category) => [
      siteCategoryKey(category.site_id, category.slug),
      category,
    ])
  )

  for (const category of categories) {
    if (!category._database_parent_slug) {
      continue
    }

    const databaseSite = databaseSiteForKey(
      category.site_key,
      siteByKey,
      siteByImportKey,
      siteByDomain
    )
    const parent = databaseSite
      ? categoryBySiteAndSlug.get(
          siteCategoryKey(databaseSite.id, category._database_parent_slug)
        )
      : null

    await createCategory({
      siteId: databaseSite?.id || snapshot.site.id,
      parentId: parent?.id || "",
      navSection: normalizeSection(category.nav_section) as NavSection,
      name: category.name,
      slug: slugify(category.slug || category.category_key || category.name),
      description: category.description || "",
      sortOrder: Number(category.sort_order || 0) || 0,
    })
  }

  const finalCategories =
    importedSiteIds.length > 0
      ? await query<any>(
          `select id, site_id, slug from affiliate_categories where site_id = any($1::uuid[])`,
          [importedSiteIds]
        )
      : []
  const finalCategoryBySiteAndSlug = new Map(
    finalCategories.map((category) => [
      siteCategoryKey(category.site_id, category.slug),
      category,
    ])
  )

  for (const product of products) {
    const databaseSite = databaseSiteForKey(
      product.site_key,
      siteByKey,
      siteByImportKey,
      siteByDomain
    )
    const category = categoryByKey.get(product.category_key)
    const databaseCategory =
      category && databaseSite
        ? finalCategoryBySiteAndSlug.get(
            siteCategoryKey(
              databaseSite.id,
              slugify(category.slug || category.category_key || category.name)
            )
          )
        : null

    await createProduct({
      siteId: databaseSite?.id || snapshot.site.id,
      categoryId: databaseCategory?.id || "",
      title: product.title,
      slug: slugify(product.slug || product.product_key || product.title),
      description: product.description || "",
      imageUrl: product.image_url || "",
      platform: product.platform.toLowerCase(),
      platformTitle: product.platform_title,
      country: product.country || "US",
      priceText: product.price_text || "",
      affiliateUrl: product.affiliate_url,
      affiliateId: product.affiliate_id || "",
      accountUser: product.account_user || "",
      creatorUsername: product.creator_username || "",
      status: product.status.toLowerCase() as "draft" | "published" | "disabled",
    })
  }

  for (const post of posts) {
    if (!post.title && !post.slug && !post.post_key) {
      continue
    }

    const databaseSite = post.site_key
      ? databaseSiteForKey(
          post.site_key,
          siteByKey,
          siteByImportKey,
          siteByDomain
        )
      : null

    await createBlogPost({
      siteId: databaseSite?.id || snapshot.site.id,
      title: post.title,
      slug: slugify(post.slug || post.post_key || post.title),
      excerpt: post.excerpt || "",
      body: post.body || "",
      seoTitle: post.seo_title || "",
      seoDescription: post.seo_description || "",
      sourceTitle: post.source_title || "",
      sourceUrl: post.source_url || "",
      sourceAuthor: post.source_author || "",
      sourceLicense: post.source_license || "",
      sourceLicenseUrl: post.source_license_url || "",
      status: (post.status || "published").toLowerCase() as
        | "draft"
        | "published",
    })
  }

  return {
    sites: sites.length,
    categories: categories.length,
    products: products.length,
    posts: posts.filter((post) => post.title || post.slug || post.post_key)
      .length,
    errors,
    warnings,
  }
}
