import "server-only"
import { hasDatabase, query } from "../db"
import type { ReportSnapshot } from "../types"
import { getAdminSnapshot } from "./snapshots"

export async function getReportSnapshot(): Promise<ReportSnapshot> {
  const snapshot = await getAdminSnapshot()

  if (!hasDatabase()) {
    const totalViews = snapshot.products.reduce(
      (sum, product) => sum + product.viewCount,
      0
    )
    const totalClicks = snapshot.products.reduce(
      (sum, product) => sum + product.clickCount,
      0
    )

    return {
      totalViews,
      totalClicks,
      ctr: totalViews > 0 ? totalClicks / totalViews : 0,
      topProducts: snapshot.products
        .slice()
        .sort((a, b) => b.clickCount - a.clickCount)
        .slice(0, 10),
      recentClicks: [],
    }
  }

  const [totals, recentClicks] = await Promise.all([
    query<any>(
      `select
         coalesce(sum(view_count), 0)::int as total_views,
         coalesce(sum(click_count), 0)::int as total_clicks
       from affiliate_products
       where site_id = $1`,
      [snapshot.site.id]
    ),
    query<any>(
      `select
         e.id,
         e.product_id,
         p.title as product_title,
         e.click_id,
         e.ip_address,
         e.user_agent,
         e.referrer,
         e.created_at
       from affiliate_click_events e
       join affiliate_products p on p.id = e.product_id
       where p.site_id = $1
       order by e.created_at desc
       limit 25`,
      [snapshot.site.id]
    ),
  ])

  const totalViews = Number(totals[0]?.total_views || 0)
  const totalClicks = Number(totals[0]?.total_clicks || 0)

  return {
    totalViews,
    totalClicks,
    ctr: totalViews > 0 ? totalClicks / totalViews : 0,
    topProducts: snapshot.products
      .slice()
      .sort((a, b) => b.clickCount - a.clickCount || b.viewCount - a.viewCount)
      .slice(0, 10),
    recentClicks: recentClicks.map((row) => ({
      id: row.id,
      productId: row.product_id,
      productTitle: row.product_title,
      clickId: row.click_id,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      referrer: row.referrer,
      createdAt: row.created_at
        ? new Date(row.created_at).toISOString()
        : new Date().toISOString(),
    })),
  }
}
