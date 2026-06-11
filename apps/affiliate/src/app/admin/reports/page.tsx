import Link from "next/link"
import { AdminNotice } from "@/components/admin-notice"
import { SiteShell } from "@/components/site-shell"
import { getAdminSnapshot, getReportSnapshot } from "@/lib/repository"

function percent(value: number) {
  return `${(value * 100).toFixed(2)}%`
}

function shortText(value: string | null, max = 70) {
  if (!value) {
    return "-"
  }

  return value.length > max ? `${value.slice(0, max)}...` : value
}

export default async function AdminReports() {
  const [snapshot, reports] = await Promise.all([
    getAdminSnapshot(),
    getReportSnapshot(),
  ])

  return (
    <SiteShell site={snapshot.site} categories={snapshot.categories}>
      <div className="section-head">
        <div>
          <h2>Reports</h2>
          <p>Track product views, outbound clicks, CTR, and recent click IDs.</p>
        </div>
      </div>
      <AdminNotice databaseReady={snapshot.databaseReady} />

      <div className="report-metrics">
        <div className="metric">
          <strong>{reports.totalViews.toLocaleString()}</strong>
          <span>Total views</span>
        </div>
        <div className="metric">
          <strong>{reports.totalClicks.toLocaleString()}</strong>
          <span>Total clicks</span>
        </div>
        <div className="metric">
          <strong>{percent(reports.ctr)}</strong>
          <span>Click-through rate</span>
        </div>
      </div>

      <div className="admin-layout">
        <section className="admin-panel">
          <h3>Top Products</h3>
          <div className="data-table">
            <div className="data-row header">
              <span>Product</span>
              <span>Views</span>
              <span>Clicks</span>
              <span>CTR</span>
            </div>
            {reports.topProducts.map((product) => (
              <div className="data-row" key={product.id}>
                <Link href={`/deals/${product.slug}`}>{product.title}</Link>
                <span>{product.viewCount.toLocaleString()}</span>
                <span>{product.clickCount.toLocaleString()}</span>
                <span>
                  {percent(
                    product.viewCount > 0
                      ? product.clickCount / product.viewCount
                      : 0
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <h3>Recent Clicks</h3>
          <div className="click-list">
            {reports.recentClicks.length > 0 ? (
              reports.recentClicks.map((event) => (
                <div className="click-item" key={event.id}>
                  <strong>{event.productTitle}</strong>
                  <span>click_id: {event.clickId}</span>
                  <span>ip: {event.ipAddress || "-"}</span>
                  <span>referrer: {shortText(event.referrer)}</span>
                  <span>{new Date(event.createdAt).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p>No clicks recorded yet.</p>
            )}
          </div>
        </section>
      </div>
    </SiteShell>
  )
}
