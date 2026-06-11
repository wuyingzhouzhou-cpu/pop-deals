import type { MetadataRoute } from "next"
import { getSiteSnapshot } from "@/lib/repository"
import { siteBaseUrl } from "@/lib/site-url"

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { site } = await getSiteSnapshot()
  const baseUrl = siteBaseUrl(site)

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
