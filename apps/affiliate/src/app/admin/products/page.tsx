import { AdminNotice } from "@/components/admin-notice"
import { ProductAdminList } from "@/components/product-admin-list"
import { ProductForm } from "@/components/product-form"
import { SiteShell } from "@/components/site-shell"
import { getAdminSnapshot } from "@/lib/repository"

export default async function AdminProducts() {
  const { site, categories, products, databaseReady } = await getAdminSnapshot()

  return (
    <SiteShell site={site} categories={categories}>
      <div className="section-head">
        <div>
          <h2>Affiliate Products</h2>
          <p>Product management will support manual creation and CSV imports.</p>
        </div>
      </div>
      <AdminNotice databaseReady={databaseReady} />
      <div className="admin-layout">
        <ProductForm
          site={site}
          categories={categories}
          databaseReady={databaseReady}
        />
        <ProductAdminList products={products} databaseReady={databaseReady} />
      </div>
    </SiteShell>
  )
}
