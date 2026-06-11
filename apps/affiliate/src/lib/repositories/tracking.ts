import "server-only"
import { hasDatabase, query } from "../db"

export async function recordProductView(productId: string) {
  if (!hasDatabase()) {
    return
  }

  await query(
    `update affiliate_products
     set view_count = view_count + 1, updated_at = now()
     where id = $1`,
    [productId]
  )
}

export async function recordProductClick(
  productId: string,
  clickId: string,
  context: {
    ipAddress?: string | null
    userAgent?: string | null
    referrer?: string | null
  } = {}
) {
  if (!hasDatabase()) {
    return
  }

  await query(
    `insert into affiliate_click_events
       (product_id, click_id, ip_address, user_agent, referrer)
     values ($1, $2, $3, $4, $5)`,
    [
      productId,
      clickId,
      context.ipAddress || null,
      context.userAgent || null,
      context.referrer || null,
    ]
  )

  await query(
    `update affiliate_products
     set click_count = click_count + 1, updated_at = now()
     where id = $1`,
    [productId]
  )
}
