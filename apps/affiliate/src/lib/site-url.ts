import type { Site } from "./types"

export function siteBaseUrl(site: Site) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (configured) {
    return configured.replace(/\/$/, "")
  }

  const domain = site.domain || "localhost:8100"
  const protocol = domain.includes("localhost") ? "http" : "https"

  return `${protocol}://${domain}`.replace(/\/$/, "")
}
