import type { Site } from "./types"

export function siteImportKey(site: Pick<Site, "domain">) {
  return site.domain.trim().toLowerCase()
}
