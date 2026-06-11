import { AdminNotice } from "@/components/admin-notice"
import { CcSourceCollectorForm } from "@/components/cc-source-collector-form"
import { CollectorRunList } from "@/components/collector-run-list"
import { CollectorRunSummary } from "@/components/collector-run-summary"
import { SiteShell } from "@/components/site-shell"
import { getAdminSnapshot, listCollectorRunsBySite } from "@/lib/repository"

export default async function AdminCollectorPage() {
  const { site, categories, databaseReady } = await getAdminSnapshot()
  const runs = databaseReady ? await listCollectorRunsBySite(site.id) : []

  return (
    <SiteShell site={site} categories={categories}>
      <div className="section-head">
        <div>
          <h2>CC Source Collector</h2>
          <p>
            Collect long-form CC BY, CC BY-SA, CC0, or public-domain articles
            into Blog drafts with attribution.
          </p>
        </div>
      </div>
      <AdminNotice databaseReady={databaseReady} />
      <div className="admin-layout">
        <CcSourceCollectorForm siteId={site.id} disabled={!databaseReady} />

        <aside className="admin-panel">
          <h3>Collector Rules</h3>
          <p>Allowed: CC BY, CC BY-SA, CC0, and public-domain dedication pages.</p>
          <p>Rejected: NC, ND, missing licenses, ordinary copyright pages, and short posts.</p>
          <p>Attribution is required: title, source URL, author, license, and license URL.</p>
          <p>Minimum length is locked to at least 1,800 words.</p>
        </aside>
      </div>
      <div className="section-head">
        <div>
          <h2>Collector History</h2>
          <p>Recent accepted and rejected source checks for this site.</p>
        </div>
      </div>
      <CollectorRunSummary runs={runs} />
      <CollectorRunList runs={runs} />
    </SiteShell>
  )
}
