import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const pg = req.scope.resolve<any>(ContainerRegistrationKeys.PG_CONNECTION);

  const { product_id, product_title, affiliate_url, source } = req.body as {
    product_id: string;
    product_title?: string;
    affiliate_url?: string;
    source?: string;
  };

  if (!product_id) {
    res.status(400).json({ message: "product_id is required" });
    return;
  }

  const exists = await pg.query(
    `SELECT EXISTS (
       SELECT FROM information_schema.tables
       WHERE table_name = 'affiliate_clicks'
     )`,
  );

  if (!exists.rows[0]?.exists) {
    await pg.query(`
      CREATE TABLE IF NOT EXISTS affiliate_clicks (
        id BIGSERIAL PRIMARY KEY,
        product_id TEXT NOT NULL,
        product_title TEXT NOT NULL DEFAULT '',
        affiliate_url TEXT NOT NULL DEFAULT '',
        source TEXT NOT NULL DEFAULT '',
        device_type TEXT NOT NULL DEFAULT '',
        country_code TEXT NOT NULL DEFAULT '',
        user_agent TEXT NOT NULL DEFAULT '',
        ip_address TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await pg.query(`
      CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created_at
      ON affiliate_clicks (created_at DESC)
    `);
    await pg.query(`
      CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_source
      ON affiliate_clicks (source)
    `);
    await pg.query(`
      CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product
      ON affiliate_clicks (product_id)
    `);
  }

  const ua = req.headers["user-agent"] || "";
  const uaLower = ua.toLowerCase();
  let device_type = "desktop";
  if (/mobile|android|iphone|ipad|ipod/i.test(uaLower)) {
    device_type = "mobile";
  } else if (/tablet|ipad/i.test(uaLower)) {
    device_type = "tablet";
  }

  const ip_address =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "";

  const country_code =
    (req.headers["x-vercel-ip-country"] as string) ||
    (req.headers["cf-ipcountry"] as string) ||
    "";

  await pg.query(
    `INSERT INTO affiliate_clicks
      (product_id, product_title, affiliate_url, source, device_type, country_code, user_agent, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      product_id,
      product_title || "",
      affiliate_url || "",
      source || "",
      device_type,
      country_code,
      ua,
      ip_address,
    ],
  );

  res.json({ success: true });
}
