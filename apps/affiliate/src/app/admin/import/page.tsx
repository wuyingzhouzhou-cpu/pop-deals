import Link from "next/link"
import { AdminNotice } from "@/components/admin-notice"
import { ImportForm } from "@/components/import-form"
import { SiteShell } from "@/components/site-shell"
import { getAdminSnapshot } from "@/lib/repository"

export default async function AdminImport() {
  const { site, categories, databaseReady } = await getAdminSnapshot()

  return (
    <SiteShell site={site} categories={categories}>
      <div className="section-head">
        <div>
          <h2>Import Manager</h2>
          <p>Upload the v2 Excel template to import sites, categories, products, and SEO posts.</p>
        </div>
      </div>
      <AdminNotice databaseReady={databaseReady} />
      <div className="admin-layout">
        <ImportForm disabled={!databaseReady} />

        <aside className="admin-panel">
          <h3>Import Order</h3>
          <p>Use one workbook with these sheets: Sites, Categories, Affiliate Products, Blog Posts.</p>
          <p>Categories can use parent_key for child categories. Products use category_key to connect to categories.</p>
          <p>TikTok MCN products can fill creator_username. Other platforms can leave it blank.</p>
          <Link
            className="button secondary"
            href="/import-templates/affiliate_import_template_v2.xlsx"
          >
            Download Template
          </Link>
        </aside>
      </div>
    </SiteShell>
  )
}
