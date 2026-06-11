import Link from "next/link"
import { siteImportKey } from "@/lib/import-keys"
import type { Site } from "@/lib/types"

export function SiteAdminList({ sites }: { sites: Site[] }) {
  return (
    <div className="admin-panel">
      <h3>Configured Sites</h3>
      <div className="product-admin-list">
        {sites.map((site) => (
          <article className="product-admin-item" key={site.id}>
            <div>
              <strong>{site.name}</strong>
              <span>
                {site.domain} · {site.country} · {site.currency}
                {site.aliasDomains.length
                  ? ` · ${site.aliasDomains.length} aliases`
                  : ""}
              </span>
              <span>
                Import site_key: <code>{siteImportKey(site)}</code>
              </span>
            </div>
            <div className="product-actions">
              <Link className="button secondary" href={`/admin/sites/${site.id}`}>
                Edit
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
