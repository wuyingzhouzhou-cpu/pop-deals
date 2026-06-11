import type { MetadataRoute } from "next"
import { getSiteSnapshot } from "@/lib/repository"
import { siteBaseUrl } from "@/lib/site-url"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { site, products, posts } = await getSiteSnapshot()
  const baseUrl = siteBaseUrl(site)
  const staticPaths = [
    "",
    "/blog",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/affiliate-disclosure",
  ]

  return [
    ...staticPaths.map((path) => entry(`${baseUrl}${path}`)),
    ...products.map((product) => entry(`${baseUrl}/deals/${product.slug}`)),
    ...posts.map((post) => entry(`${baseUrl}/blog/${post.slug}`)),
  ]
}

function entry(url: string) {
  return {
    url,
    lastModified: new Date(),
  }
}
