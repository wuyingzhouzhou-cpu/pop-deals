import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pg = req.scope.resolve<any>(ContainerRegistrationKeys.PG_CONNECTION);

  const range = (req.query.range as string) || "7d";
  const interval =
    range === "30d" ? "1 day" : range === "90d" ? "7 days" : "1 day";

  const days =
    range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 7;

  const exists = await pg.query(
    `SELECT EXISTS (
       SELECT FROM information_schema.tables
       WHERE table_name = 'affiliate_clicks'
     )`
  );
  const viewsExists = await pg.query(
    `SELECT EXISTS (
       SELECT FROM information_schema.tables
       WHERE table_name = 'affiliate_product_views'
     )`
  );

  if (!exists.rows[0]?.exists) {
    res.json({
      totals: {
        total_clicks: 0,
        total_views: viewsExists.rows[0]?.exists
          ? Number(
              (
                await pg.query(
                  `SELECT COUNT(*)::int AS count
                   FROM affiliate_product_views
                   WHERE created_at >= NOW() - INTERVAL '${days} days'`
                )
              ).rows[0]?.count || 0
            )
          : 0,
        unique_products: 0,
        unique_visitors: 0,
      },
      bySource: [],
      byAffiliate: [],
      byDevice: [],
      byCountry: [],
      byProduct: [],
      byViewedProduct: [],
      timeline: [],
      recent: [],
    });
    return;
  }

  await pg.query(`
    ALTER TABLE affiliate_clicks
      ADD COLUMN IF NOT EXISTS platform_title TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS affiliate_id TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS account_user TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS creator_username TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS click_id TEXT NOT NULL DEFAULT ''
  `);

  try {
    const results = await Promise.all([
      pg.query(
        `SELECT
           COUNT(*)::int AS total_clicks,
           ${
             viewsExists.rows[0]?.exists
               ? `(SELECT COUNT(*)::int FROM affiliate_product_views WHERE created_at >= NOW() - INTERVAL '${days} days')`
               : "0"
           } AS total_views,
           COUNT(DISTINCT product_id)::int AS unique_products,
           COUNT(DISTINCT ip_address)::int AS unique_visitors
         FROM affiliate_clicks
         WHERE created_at >= NOW() - INTERVAL '${days} days'`
      ),
      pg.query(
        `SELECT source, COUNT(*)::int AS count
         FROM affiliate_clicks
         WHERE created_at >= NOW() - INTERVAL '${days} days'
         GROUP BY source
         ORDER BY count DESC`
      ),
      pg.query(
        `SELECT
           COALESCE(NULLIF(account_user, ''), NULLIF(affiliate_id, ''), 'unknown') AS affiliate_account,
           MAX(affiliate_id) AS affiliate_id,
           MAX(platform_title) AS platform_title,
           MAX(creator_username) AS creator_username,
           COUNT(*)::int AS count
         FROM affiliate_clicks
         WHERE created_at >= NOW() - INTERVAL '${days} days'
         GROUP BY affiliate_account
         ORDER BY count DESC
         LIMIT 20`
      ),
      pg.query(
        `SELECT device_type, COUNT(*)::int AS count
         FROM affiliate_clicks
         WHERE created_at >= NOW() - INTERVAL '${days} days'
         GROUP BY device_type
         ORDER BY count DESC`
      ),
      pg.query(
        `SELECT country_code, COUNT(*)::int AS count
         FROM affiliate_clicks
         WHERE created_at >= NOW() - INTERVAL '${days} days'
         GROUP BY country_code
         ORDER BY count DESC
         LIMIT 10`
      ),
      pg.query(
        `SELECT product_id, product_title, COUNT(*)::int AS count
         FROM affiliate_clicks
         WHERE created_at >= NOW() - INTERVAL '${days} days'
         GROUP BY product_id, product_title
         ORDER BY count DESC
         LIMIT 20`
      ),
      pg.query(
        `SELECT
           DATE_TRUNC('${interval}', created_at)::date AS date,
           COUNT(*)::int AS count
         FROM affiliate_clicks
         WHERE created_at >= NOW() - INTERVAL '${days} days'
         GROUP BY date
         ORDER BY date ASC`
      ),
      pg.query(
        `SELECT
           id, product_id, product_title, source, platform_title,
           affiliate_id, account_user, creator_username, click_id, device_type,
           country_code, affiliate_url, created_at
         FROM affiliate_clicks
         ORDER BY created_at DESC
         LIMIT 50`
      ),
      viewsExists.rows[0]?.exists
        ? pg.query(
            `SELECT product_id, product_title, COUNT(*)::int AS count
             FROM affiliate_product_views
             WHERE created_at >= NOW() - INTERVAL '${days} days'
             GROUP BY product_id, product_title
             ORDER BY count DESC
             LIMIT 20`
          )
        : Promise.resolve({ rows: [] }),
    ]);
    const totals = results[0].rows;
    const bySource = results[1].rows;
    const byAffiliate = results[2].rows;
    const byDevice = results[3].rows;
    const byCountry = results[4].rows;
    const byProduct = results[5].rows;
    const timeline = results[6].rows;
    const recent = results[7].rows;
    const byViewedProduct = results[8].rows;

    res.json({
      totals: totals[0],
      bySource,
      byAffiliate,
      byDevice,
      byCountry,
      byProduct,
      byViewedProduct,
      timeline,
      recent,
    });
  } catch {
    res.json({
      totals: {
        total_clicks: 0,
        total_views: 0,
        unique_products: 0,
        unique_visitors: 0,
      },
      bySource: [],
      byAffiliate: [],
      byDevice: [],
      byCountry: [],
      byProduct: [],
      byViewedProduct: [],
      timeline: [],
      recent: [],
    });
  }
}
