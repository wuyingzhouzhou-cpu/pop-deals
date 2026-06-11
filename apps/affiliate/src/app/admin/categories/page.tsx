import { AdminNotice } from "@/components/admin-notice"
import { CategoryAdminList } from "@/components/category-admin-list"
import { CategoryForm } from "@/components/category-form"
import { SiteShell } from "@/components/site-shell"
import { getAdminSnapshot } from "@/lib/repository"

export default async function AdminCategories() {
  const { site, categories, databaseReady } = await getAdminSnapshot()

  return (
    <SiteShell site={site} categories={categories}>
      <div className="section-head">
        <div>
          <h2>Categories</h2>
          <p>Configure navigation sections, parent categories, and SEO groups.</p>
        </div>
      </div>
      <AdminNotice databaseReady={databaseReady} />
      <div className="admin-layout">
        <CategoryForm
          site={site}
          categories={categories}
          databaseReady={databaseReady}
        />
        <CategoryAdminList
          categories={categories}
          databaseReady={databaseReady}
        />
      </div>
    </SiteShell>
  )
}
