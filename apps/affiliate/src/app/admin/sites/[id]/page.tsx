import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteForm } from "@/components/site-form"
import { SiteShell } from "@/components/site-shell"
import { getAdminSiteById } from "@/lib/repository"

export default async function EditSitePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { site, editableSite, categories, databaseReady } =
    await getAdminSiteById(id)

  if (!editableSite) {
    notFound()
  }

  return (
    <SiteShell site={site} categories={categories}>
      <div className="section-head">
        <div>
          <h2>Edit Site</h2>
          <p>Update domain, branding, locale, and default SEO settings.</p>
        </div>
        <Link className="button secondary" href="/admin/sites">
          Back
        </Link>
      </div>
      <div className="admin-layout single">
        <SiteForm databaseReady={databaseReady} site={editableSite} />
      </div>
    </SiteShell>
  )
}
