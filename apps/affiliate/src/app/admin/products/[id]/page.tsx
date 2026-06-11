import Link from "next/link"
import { notFound } from "next/navigation"
import { ProductForm } from "@/components/product-form"
import { SiteShell } from "@/components/site-shell"
import { getAdminProductById } from "@/lib/repository"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { site, product, categories, databaseReady } =
    await getAdminProductById(id)

  if (!product) {
    notFound()
  }

  return (
    <SiteShell site={site} categories={categories}>
      <div className="section-head">
        <div>
          <h2>Edit Product</h2>
          <p>Update title, category, affiliate URL, status, and tracking metadata.</p>
        </div>
        <Link className="button secondary" href="/admin/products">
          Back
        </Link>
      </div>
      <div className="admin-layout single">
        <ProductForm
          site={site}
          categories={categories}
          databaseReady={databaseReady}
          product={product}
        />
      </div>
    </SiteShell>
  )
}
