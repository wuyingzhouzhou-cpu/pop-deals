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
     )`,
  );

  if (!exists.rows[0]?.exists) {
    res.json({
      totals: { total_clicks: 0, unique_products: 0, unique_visitors: 0 },
      bySource: [],
      byDevice: [],
      byCountry: [],
      byProduct: [],
      timeline: [],
      recent: [],
    });
    return;
  }

  try {
    const [
      { rows: totals },
      { rows: bySource },
      { rows: byDevice },
      { rows: byCountry },
      { rows: byProduct },
      { rows: timeline },
      { rows: recent },
    ] = await Promise.all([
      pg.query(
        `SELECT
           COUNT(*)::int AS total_clicks,
           COUNT(DISTINCT product_id)::int AS unique_products,
           COUNT(DISTINCT ip_address)::int AS unique_visitors
         FROM affiliate_clicks
         WHERE created_at >= NOW() - INTERVAL '${days} days'`,
      ),
      pg.query(
        `SELECT source, COUNT(*)::int AS count
         FROM affiliate_clicks
         WHERE created_at >= NOW() - INTERVAL '${days} days'
         GROUP BY source
         ORDER BY count DESC`,
      ),
      pg.query(
        `SELECT device_type, COUNT(*)::int AS count
         FROM affiliate_clicks
         WHERE created_at >= NOW() - INTERVAL '${days} days'
         GROUP BY device_type
         ORDER BY count DESC`,
      ),
      pg.query(
        `SELECT country_code, COUNT(*)::int AS count
         FROM affiliate_clicks
         WHERE created_at >= NOW() - INTERVAL '${days} days'
         GROUP BY country_code
         ORDER BY count DESC
         LIMIT 10`,
      ),
      pg.query(
        `SELECT product_id, product_title, COUNT(*)::int AS count
         FROM affiliate_clicks
         WHERE created_at >= NOW() - INTERVAL '${days} days'
         GROUP BY product_id, product_title
         ORDER BY count DESC
         LIMIT 20`,
      ),
      pg.query(
        `SELECT
           DATE_TRUNC('${interval}', created_at)::date AS date,
           COUNT(*)::int AS count
         FROM affiliate_clicks
         WHERE created_at >= NOW() - INTERVAL '${days} days'
         GROUP BY date
         ORDER BY date ASC`,
      ),
      pg.query(
        `SELECT
           id, product_id, product_title, source, device_type,
           country_code, affiliate_url, created_at
         FROM affiliate_clicks
         ORDER BY created_at DESC
         LIMIT 50`,
      ),
    ]);

    res.json({
      totals: totals[0],
      bySource,
      byDevice,
      byCountry,
      byProduct,
      timeline,
      recent,
    });
  } catch {
    res.json({
      totals: { total_clicks: 0, unique_products: 0, unique_visitors: 0 },
      bySource: [],
      byDevice: [],
      byCountry: [],
      byProduct: [],
      timeline: [],
      recent: [],
    });
  }
}
