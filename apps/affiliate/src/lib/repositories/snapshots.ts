import "server-only"
import { hasDatabase } from "../db"
import { demoCategories, demoPosts, demoProducts, demoSite } from "../mock-data"
import type { Site, SiteSnapshot } from "../types"
import { listCategoriesBySite, getCategoryById } from "./categories"
import {
  getAdminPostByIdForSite,
  getPostBySlugForSite,
  listAdminPostsBySite,
  listPublishedPostsBySite,
} from "./posts"
import {
  getAdminProductByIdForSite,
  getProductBySlugForSite,
  listAdminProductsBySite,
  listPublishedProductsBySite,
} from "./products"
import { getCurrentSite, getSiteById, listSites } from "./sites"

export async function getSiteSnapshot(): Promise<SiteSnapshot> {
  const site = await getCurrentSite()

  if (!hasDatabase()) {
    return demoSnapshot(site)
  }

  const [categories, products, posts] = await Promise.all([
    listCategoriesBySite(site.id),
    listPublishedProductsBySite(site.id),
    listPublishedPostsBySite(site.id),
  ])

  return { site, categories, products, posts }
}

export async function getAdminSnapshot(): Promise<
  SiteSnapshot & { sites: Site[]; databaseReady: boolean }
> {
  const site = await getCurrentSite()

  if (!hasDatabase()) {
    return {
      ...demoSnapshot(site),
      sites: [{ ...demoSite, domain: site.domain }],
      databaseReady: false,
    }
  }

  const [sites, categories, products, posts] = await Promise.all([
    listSites(),
    listCategoriesBySite(site.id),
    listAdminProductsBySite(site.id),
    listAdminPostsBySite(site.id),
  ])

  return {
    site,
    sites,
    categories,
    products,
    posts,
    databaseReady: true,
  }
}

export async function getAdminSiteById(id: string) {
  const snapshot = await getAdminSnapshot()

  if (!hasDatabase()) {
    return {
      site: snapshot.site,
      editableSite: snapshot.sites.find((item) => item.id === id) || null,
      categories: snapshot.categories,
      databaseReady: false,
    }
  }

  return {
    site: snapshot.site,
    editableSite: await getSiteById(id),
    categories: snapshot.categories,
    databaseReady: true,
  }
}

export async function getProductBySlug(slug: string) {
  const snapshot = await getSiteSnapshot()

  if (!hasDatabase()) {
    return {
      site: snapshot.site,
      product: snapshot.products.find((product) => product.slug === slug) || null,
      categories: snapshot.categories,
    }
  }

  return {
    site: snapshot.site,
    product: await getProductBySlugForSite(snapshot.site.id, slug),
    categories: snapshot.categories,
  }
}

export async function getAdminProductById(id: string) {
  const snapshot = await getAdminSnapshot()

  if (!hasDatabase()) {
    return {
      site: snapshot.site,
      product: snapshot.products.find((product) => product.id === id) || null,
      categories: snapshot.categories,
      databaseReady: false,
    }
  }

  return {
    site: snapshot.site,
    product: await getAdminProductByIdForSite(snapshot.site.id, id),
    categories: snapshot.categories,
    databaseReady: true,
  }
}

export async function getPostBySlug(slug: string) {
  const snapshot = await getSiteSnapshot()

  if (!hasDatabase()) {
    return {
      site: snapshot.site,
      post: snapshot.posts.find((post) => post.slug === slug) || null,
    }
  }

  return {
    site: snapshot.site,
    post: await getPostBySlugForSite(snapshot.site.id, slug),
  }
}

export async function getAdminPostById(id: string) {
  const snapshot = await getAdminSnapshot()

  if (!hasDatabase()) {
    return {
      site: snapshot.site,
      post: snapshot.posts.find((post) => post.id === id) || null,
      categories: snapshot.categories,
      databaseReady: false,
    }
  }

  return {
    site: snapshot.site,
    post: await getAdminPostByIdForSite(snapshot.site.id, id),
    categories: snapshot.categories,
    databaseReady: true,
  }
}

export async function getAdminCategoryById(id: string) {
  const snapshot = await getAdminSnapshot()

  if (!hasDatabase()) {
    return {
      site: snapshot.site,
      category:
        snapshot.categories.find((category) => category.id === id) || null,
      categories: snapshot.categories,
      databaseReady: false,
    }
  }

  return {
    site: snapshot.site,
    category: await getCategoryById(snapshot.site.id, id),
    categories: snapshot.categories,
    databaseReady: true,
  }
}

function demoSnapshot(site: Site): SiteSnapshot {
  return {
    site,
    categories: demoCategories.map((category) => ({
      ...category,
      siteId: site.id,
    })),
    products: demoProducts.map((product) => ({ ...product, siteId: site.id })),
    posts: demoPosts.map((post) => ({ ...post, siteId: site.id })),
  }
}
