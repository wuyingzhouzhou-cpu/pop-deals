import Link from "next/link"
import { notFound } from "next/navigation"
import { CategoryForm } from "@/components/category-form"
import { SiteShell } from "@/components/site-shell"
import { getAdminCategoryById } from "@/lib/repository"

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { site, category, categories, databaseReady } =
    await getAdminCategoryById(id)

  if (!category) {
    notFound()
  }

  return (
    <SiteShell site={site} categories={categories}>
      <div className="section-head">
        <div>
          <h2>Edit Category</h2>
          <p>Update navigation placement, parent category, slug, and sort order.</p>
        </div>
        <Link className="button secondary" href="/admin/categories">
          Back
        </Link>
      </div>
      <div className="admin-layout single">
        <CategoryForm
          site={site}
          categories={categories}
          databaseReady={databaseReady}
          category={category}
        />
      </div>
    </SiteShell>
  )
}
