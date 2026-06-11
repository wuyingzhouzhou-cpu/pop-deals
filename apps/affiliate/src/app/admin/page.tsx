import Link from "next/link"
import { AdminNotice } from "@/components/admin-notice"
import { SiteShell } from "@/components/site-shell"
import { getAdminSnapshot } from "@/lib/repository"

export default async function AdminHome() {
  const { site, categories, products, posts, sites, databaseReady } =
    await getAdminSnapshot()

  return (
    <SiteShell site={site} categories={categories}>
      <div className="section-head">
        <div>
          <h2>Affiliate Admin 2.0</h2>
          <p>
            A Next.js-only control center for sites, affiliate products,
            categories, SEO posts, imports, and reporting.
          </p>
        </div>
      </div>
      <AdminNotice databaseReady={databaseReady} />
      <div className="admin-grid">
        <Link className="admin-panel" href="/admin/sites">
          <h2>Sites</h2>
          <p>{sites.length} configured site records.</p>
        </Link>
        <Link className="admin-panel" href="/admin/products">
          <h2>Affiliate Products</h2>
          <p>{products.length} products in the current site snapshot.</p>
        </Link>
        <Link className="admin-panel" href="/admin/blog">
          <h2>Blog & SEO</h2>
          <p>{posts.length} published content pages for this site.</p>
        </Link>
        <Link className="admin-panel" href="/admin/categories">
          <h2>Categories</h2>
          <p>{categories.length} navigation and product categories.</p>
        </Link>
        <Link className="admin-panel" href="/admin/import">
          <h2>Import Manager</h2>
          <p>CSV and Excel product imports will live here in the next pass.</p>
        </Link>
        <Link className="admin-panel" href="/admin/collector">
          <h2>CC Source Collector</h2>
          <p>Collect long licensed articles with attribution and license checks.</p>
        </Link>
        <Link className="admin-panel" href="/admin/reports">
          <h2>Reports</h2>
          <p>Clicks, views, CTR, click_id, and platform performance.</p>
        </Link>
      </div>
    </SiteShell>
  )
}
