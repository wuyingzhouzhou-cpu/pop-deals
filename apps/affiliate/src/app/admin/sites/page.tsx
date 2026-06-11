import { AdminNotice } from "@/components/admin-notice"
import { SiteAdminList } from "@/components/site-admin-list"
import { SiteForm } from "@/components/site-form"
import { SiteShell } from "@/components/site-shell"
import { getAdminSnapshot } from "@/lib/repository"

export default async function AdminSites() {
  const { site, sites, categories, databaseReady } = await getAdminSnapshot()

  return (
    <SiteShell site={site} categories={categories}>
      <div className="section-head">
        <div>
          <h2>Sites</h2>
          <p>Each domain can become a separate affiliate SEO website.</p>
        </div>
      </div>
      <AdminNotice databaseReady={databaseReady} />
      <div className="admin-layout">
        <SiteForm databaseReady={databaseReady} />
        <SiteAdminList sites={sites} />
      </div>
    </SiteShell>
  )
}
